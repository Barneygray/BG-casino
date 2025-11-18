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
        this.aggressionFactor = Math.random();
        this.raiseCount = 0;
        this.contributionMainPot = 0;
        this.contributionSidePot = 0;
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
            let solvedHands = []
            console.log(numOpponents)
            for (let i = 0; i < numOpponents; i++) {
                const opponentHand = new Hand()
                opponentHand.addCard(simDeck.drawCard())
                opponentHand.addCard(simDeck.drawCard())
            
                const solvedHand = opponentHand.solveHand(simCommunity)
                solvedOpponentsHands.push(solvedHand)
            }
            const solvedSimHand = this.hand.solveHand(simCommunity)
            solvedHands = [solvedSimHand, ...solvedOpponentsHands]
            const winners = PokerHand.winners(solvedHands)
            
            if (winners.includes(solvedSimHand)) {
                wins++
            }
        }

        return (wins / iterations)
    }

    
    calculateRaiseAmount(position, bigBlind, stackSize, potSize, currentBet, winProb, callCost) {
        const positionFactor = position === "late" ? 1.3 : position === "middle" ? 1.1 : 1.0;
        const aggressionFactor = 1 + Math.random() * 0.4; // adds unpredictability (10–40%)
        
        // Base raise: 1.5–2.5x big blind, scaled by position and aggression
        let raise = bigBlind * (1.5 + Math.random()) * positionFactor * aggressionFactor;

        // Add pot influence (bigger pots → bigger raises)
        raise += potSize * winProb * 0.25;

        // If facing a bet, raise relative to current bet
        if (currentBet > 0) {
            raise = currentBet * (2 + Math.random()); // 2x–3x the bet
        }

        // Cap raise to avoid all-in unless stack is short
        raise = Math.min(raise, stackSize * 0.6); // max 60% of stack
        return Math.round(raise - callCost);
    }

    // Helper: Decide if bluffing
    shouldBluff(stackSize, potSize, position) {
        if (stackSize > potSize * 2 && position === "late") {
            return Math.random() < 0.15; // 15% chance to bluff in late position
        }
        return false;
    }


    calculatePotOdds(currentBet, potSize) {
        return currentBet / (potSize + currentBet);
    }
 
    async takeAction(currentBet, communityCards, numOpponents, potSize, bigBlind, position) {
        const winProb = this.monteCarloWinProbability(communityCards, numOpponents, 5000);
        const callCost = currentBet - this.bet;
        const stackSize = this.money;

        if (position === 0) {
            position = "early";
        } else if (position === 1 || position === 2) {
            position = "middle";
        } else {
            position = "late";
        }

        console.log(`Win Probability: ${(winProb * 100).toFixed(2)}%`);
        console.log(this.hand.toString())


        
        const potOdds = this.calculatePotOdds(currentBet, potSize);
        const aggressiveFactor = position === "late" ? 0.05 : 0; // late position bias
        const effectiveWinProb = winProb + aggressiveFactor + (this.aggressionFactor * 0.1);

        console.log(`Pot Odds: ${(potOdds * 100).toFixed(2)}%`);
        console.log(`Effective Win Probability: ${(effectiveWinProb * 100).toFixed(2)}%`);

        // Decision logic
        if (currentBet === 0) {
            // No bet yet: check or raise
            if (effectiveWinProb > 0.55 || this.shouldBluff(stackSize, potSize, position)) {
                const raiseAmount = this.calculateRaiseAmount(position, bigBlind, stackSize, potSize, currentBet, winProb, callCost);
                console.log('Strong hand, raise')
                return `Raise${raiseAmount}`;
            }
            console.log('Check')
            return "Check";
        } else {
            // Facing a bet: call, raise, or fold

            const lowCallCost = callCost <= (stackSize * 0.05) ; // cheap call threshold

            if (effectiveWinProb > potOdds + 0.15) {
                // Strong hand: raise or call
                if (effectiveWinProb > 0.65 && stackSize > currentBet * 4) {
                    const raiseAmount = this.calculateRaiseAmount(position, bigBlind, stackSize, potSize, currentBet, winProb, callCost);
                    console.log('Stronger hand, raise')
                    return `Raise${raiseAmount}`;
                }
                console.log('Call')
                return "Call";
            } else if (lowCallCost && Math.random() <= 0.95 || callCost <= stackSize * 0.15 && winProb > 0.3 && Math.random() <= 0.8) {
                console.log('Cheap Call')
                return "Call"
            } else if (this.shouldBluff(stackSize, potSize, position)) {
                const raiseAmount = this.calculateRaiseAmount(position, bigBlind, stackSize, potSize, currentBet, winProb, callCost);
                console.log('Bluff raise')
                return `Raise${raiseAmount}`;
            } else {
                console.log('Fold')
                return "Fold";
            }
        }

    }


    makeBigBlind() {
        this.isBigBlind = true;
    }

    makeSmallBlind() {
        this.isSmallBlind = true;
    }

}