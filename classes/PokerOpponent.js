import { Hand } from './Hand.js'

import { Deck } from './Deck.js'

import { Hand as PokerHand } from 'https://cdn.skypack.dev/pokersolver'

export class PokerOpponent {
    id;
    hand;
    constructor() {
        this.bet = 0;
        this.isFolded = false;
        this.isStillActive = true;
        this.isSmallBlind = false;
        this.isBigBlind = false;
        this.money=1000;
        this.name = '';
    }

    async init() {
        this.name = await this.getName();
    }
    async getName() {
        try {
            const response = await fetch ("https://randomuser.me/api/", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.results[0].name.first;
        } catch (error) {
            console.error('Error fetching data:', error)
            return 'Unknown'
        }
    }
    monteCarloWinProbability(communityCards, numOpponents, iterations) {
        let wins = 0

        for (let i = 0; i < iterations; i++) {
            const simDeck = new Deck();
            simDeck.shuffle()
            simDeck.removeCards(this.hand.cards)
            simDeck.removeCards(communityCards.cards)

            const simCommunity = new Hand()
            for (let card of communityCards.cards) {
                simCommunity.addCard(card)
            }

            while (simCommunity.cards.length < 5) {
                simCommunity.addCard(simDeck.drawCard())
            }
            let solvedOpponentsHands = []
            for (let i = 0; i < numOpponents; i++) {
                const opponentHand = new Hand()
                opponentHand.addCard(simDeck.drawCard())
                opponentHand.addCard(simDeck.drawCard())
            
                const solvedHand = opponentHand.solveHand(simCommunity)
                solvedOpponentsHands.push(solvedHand)
            }
            const solvedSimHand = this.hand.solveHand(simCommunity)
            const solvedHands = [solvedSimHand, ...solvedOpponentsHands]
            const winners = PokerHand.winners(solvedHands)
            
            if (winners.includes(solvedSimHand)) {
                wins++
            }
        }

        return (wins / iterations) * 100
    }
 
    async takeAction(currentBet, communityCards, numOpponents) {
        const winProb = this.monteCarloWinProbability(communityCards, numOpponents, 10000);
        console.log(`Win Probability: ${winProb}%`);
        const rand = Math.random();

        // If current bet equals player's bet, they can check
        if (currentBet === this.bet) {
            return "Check";
        }

        // If player doesn't have enough money to call, fold
        if (currentBet > this.money) {
            return "Fold";
        }

        // Calculate how significant the current bet is compared to player's money
        const betRatio = currentBet / this.money;

        if (winProb > 70) {
            // Strong hand: prefer raising if affordable
            if (betRatio < 0.5) {
                const raiseAmount = Math.floor((this.money - currentBet) * (0.3 + 0.7 * rand)); // 30%-100% of remaining money
                return rand < 0.8 ? `Raise ${raiseAmount}` : "Call";
            } else {
                return "Call"; // Too expensive to raise
            }
        } else if (winProb > 40) {
            // Medium hand: call if bet isn't too big, else check/fold
            if (betRatio < 0.3) {
                return rand < 0.7 ? "Call" : "Fold";
            } else {
                return "Fold";
            }
        } else {
            // Weak hand: mostly fold, occasional bluff call
            return rand < 0.2 && betRatio < 0.2 ? "Call" : "Fold";
        }
    }

    makeBigBlind() {
        this.isBigBlind = true;
    }

    makeSmallBlind() {
        this.isSmallBlind = true;
    }

}