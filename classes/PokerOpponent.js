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

    calcPotOdds(callCost, potSize) {
        return callCost / (potSize + callCost)
    }

    calcExpectedValue(winProb, potSize, callCost) {
        return (winProb * potSize) - ((1 - winProb) * callCost)
    }

    calcExpectedValueRaise(winProb, potSize, raiseAmount) {
        return (winProb * (potSize+raiseAmount)) - ((1 - winProb) * raiseAmount)
    }

    aggressionFactor() {
        return 1.0
    }

    positionFactor(position) {
        if (position === 3) return 1.2;
        if (position === 0) return 0.8;
        return 1;
    }

    shortStack(stackSize, potSize) {
        return stackSize < potSize * 0.5;
    }

    deepStack(stackSize, potSize) {
        return stackSize > potSize * 3;
    }

    multiWayPenalty(opponentCount) {
        return opponentCount > 2 ? 0.85 : 1.0
    }

    bluffChance(winProb) {
        return (1-winProb) * this.aggressionFactor() * 0.3
    }

    shouldBluff(stackSize, raiseAmount, winProb) {
        return Math.random() < this.bluffChance(winProb) && stackSize > raiseAmount;
    }

    aggressionThreshold(opponentCount) {
        return 0.55 * this.positionFactor() * this.multiWayPenalty(opponentCount)
    }

    calcOptimalRaiseAmount(winProb, stackSize, potSize) {
        let bestRaise = potSize * 0.25;;
        let bestScore = -Infinity;

        const minRaise = potSize * 0.25;
        const maxRaise = Math.min(stackSize, potSize * (1 + this.aggressionFactor() * 0.5));
        const step = (maxRaise - minRaise) / 1000;

        for (let raise = minRaise; raise <= maxRaise; raise += step) {
            const ev = this.calcExpectedValueRaise(winProb, potSize, raise);
            const riskPenalty = (raise / stackSize) * 0.3;
            const score = ev - riskPenalty;
            if (score > bestScore) {
                bestScore = score;
                bestRaise = raise;
            }
        }
        return bestRaise;
    }
 
    async takeAction(currentBet, communityCards, numOpponents, potSize, position) {
        const winProb = this.monteCarloWinProbability(communityCards, numOpponents, 5000);
        const callCost = currentBet - this.bet;
        const stackSize = this.money;
        const raiseAmount = parseInt(this.calcOptimalRaiseAmount(winProb, stackSize, potSize));
        console.log(raiseAmount)
        console.log(`Win Probability: ${(winProb * 100).toFixed(2)}%`);

        /*
        // ✅ 1. If no cost to call, consider checking
        if (callCost <= 0) {
            // Check if strong enough to raise instead of check
            if (winProb > this.aggressionThreshold(numOpponents) && stackSize > raiseAmount) {
                console.log("Strong Hand, Raise")
                return `Raise${raiseAmount.toFixed(2)}`;
            }
            return 'Check';
        }
        */

        // ✅ 2. All-in logic for short stack or very strong hand
        if (this.shortStack(stackSize, potSize) && winProb > 0.65) {
            console.log("Strong hand / Short Stack, All in")
            return `Raise${stackSize}`;
        }

        // ✅ 3. Fold if EV is negative and bluff unlikely
        if (
            winProb < this.calcPotOdds(callCost, potSize) &&
            this.calcExpectedValue(winProb, potSize, callCost) < 0 &&
            !this.shouldBluff(stackSize, raiseAmount, winProb)
        ) {
            console.log("Negative EV, No Bluff, Fold")
            return 'Fold';
        }

        // ✅ 4. Bluff raise if conditions met
        if (this.shouldBluff(stackSize, raiseAmount, winProb) && this.shortStack(stackSize, potSize)) {
            console.log("Bluff Raise")
            return `Raise${raiseAmount}`;
        }

        // ✅ 5. Aggressive raise if EV is strong or threshold exceeded
        if (
            (this.calcExpectedValueRaise(winProb, potSize, raiseAmount) >
                this.calcExpectedValue(winProb, potSize, callCost) * this.positionFactor(position) &&
                stackSize > raiseAmount) ||
            winProb > this.aggressionThreshold(numOpponents)
        ) {
            // Consider all-in for deep stack and very strong hand
            if (this.deepStack(stackSize, potSize) && winProb > 0.75) {
                console.log("Very Strong Hand, Deep Stack, All in")
                return `Raise${stackSize}`;
            }
            console.log("Strong Hand, Raise")
            return `Raise${raiseAmount}`;
        }

        // ✅ 6. Call if EV is positive or pot odds justify it
        if (this.calcExpectedValue(winProb, potSize, callCost) >= 0 || winProb > this.calcPotOdds(callCost, potSize)) {
            console.log("Positive EV or Justified Call")
            return 'Call';
        }

        // ✅ 7. Default fallback
        return 'Fold';
    }


    makeBigBlind() {
        this.isBigBlind = true;
    }

    makeSmallBlind() {
        this.isSmallBlind = true;
    }

}