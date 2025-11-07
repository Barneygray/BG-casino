const opponentsHandsDiv = document.querySelector('.opponents-hands')
const communityCardsDiv = document.querySelector('.community-cards')
const actionBoxDiv = document.querySelector('.action-box')
const potDiv = document.querySelector('.pot')
const pokerPlayerDiv = document.querySelector('.player-area')
import { Hand as PokerHand } from 'pokersolver'


import { Deck } from './Deck.js'

import { Hand } from './Hand.js'

import { Player } from './Player.js'

import { PokerOpponent } from './PokerOpponent.js'

export class Poker {
    numOpponents;
    deck;
    currentBet;
    pot;
    constructor() {
        this.opponents = [];
        this.activePlayers = [];
        this.nonFoldedPlayers = [];
        this.turnOrder = [];
        this.player = new Player()
        this.communityCards = new Hand()
        this.smallBlind = 20;
        this.bigBlind = 40;
        this.whosTurn = 0;
    }
    async createPromptNumResponse(prompt) {
        const promptText = document.createElement('p')
        promptText.textContent = prompt
        promptText.className = "prompt-text"

        const inputBox = document.createElement('input')
        inputBox.className = "input-box"
        inputBox.type = "text"

        actionBoxDiv.innerHTML = ""
        actionBoxDiv.appendChild(promptText)
        actionBoxDiv.appendChild(inputBox)
        inputBox.focus();

        return new Promise((resolve) => {
            inputBox.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    const input = e.target.value;
                    const i = e.target;
                    const value = i.value.trim();

                    if (/^\d+$/.test(value)) {
                        resolve(input)
                    } else {
                        actionBoxDiv.classList.add("shake")
                        setTimeout(() => {
                            actionBoxDiv.classList.remove("shake")
                        }, 300)
                    }
                }
            })
        })
    } 

    async createPromptButtonResponse(prompt, input1, input2, input3) {
        const promptText = document.createElement('p')
        promptText.textContent = prompt
        promptText.className = "prompt-text"

        const button1 = document.createElement('button')
        button1.className = "first-button"
        button1.textContent = input1

        const button2 = document.createElement('button')
        button2.className = "second-button"
        button2.textContent = input2

        actionBoxDiv.innerHTML = ""
        actionBoxDiv.appendChild(promptText)
        actionBoxDiv.appendChild(button1)
        actionBoxDiv.appendChild(button2)

        return new Promise((resolve) => {
            button1.addEventListener("click", () => {
                resolve(input1)
            })
            button2.addEventListener("click", () => {
                resolve(input2)
            })
            if (input3) {
                const button3 = document.createElement('button')
                button3.className = "third-button"
                button3.textContent = input3
                actionBoxDiv.appendChild(button3)
                button3.addEventListener("click", () => {
                resolve(input3)
            })
            }
            document.addEventListener('keydown', (event) => {
                if (event.key === input1[0].toLowerCase()) {
                    resolve(input1)
                } else if (event.key === input2[0].toLowerCase()) {
                    resolve(input2)
                }
            })
        })

    }

    askNumberOfPlayers() {
        this.numOpponents = this.createPromptNumResponse("How many Opponents? (1-3):");
    }

    opponentsSetUp() {
        for (let i=0; i < this.numOpponents; i++) {
            let newOpp = new PokerOpponent()
            this.opponents.push(newOpp)

            const oppDiv = document.createElement('div')
            oppDiv.id = newOpp.name
            oppDiv.className = "opponent-" + String(i) + "-hand"
            opponentsHandsDiv.appendChild(oppDiv)
        }

        this.activeplayers = [...this.opponents, this.player];
    }

    playerSetUp() {
        const playerBalance = document.createElement('p')
        playerBalance.textContent = '£' + this.player.moneyLeft
        playerBalance.className = "player-balance"
        //add this to player div
    }

    gameSetUp() {
        this.deck = new Deck();
        this.deck.shuffle();
        

        //empty opponents hands in html
    }

    establishTurnOrder() {
        this.turnOrder.push(this.turnOrder.shift())

        this.turnOrder = this.turnOrder.filter(player => player.isStillActive);
    }
    initializeRound() {
        this.establishTurnOrder()

        for (let player of this.turnOrder) {
            player.isBigBlind = false;
            player.isSmallBlind = false;
        }
        this.turnOrder.at(-1).makeBigBlind()
        this.turnOrder.at(-2).makeSmallBlind()
    }
    
    dealOpponentsHands() {
        for (let opponent of this.opponents) {
            opponent.hand.addCard(this.deck.drawCard(), opponent.name, 1, "poker")
            opponent.hand.addCard(this.deck.drawCard(), opponent.name, 1, "poker")
        }
    }

    dealPlayersHand() {
        this.player.hand = new Hand();

        const handDiv = document.createElement('div')
        handDiv.className = "player-hand"
        pokerPlayerDiv.appendChild(handDiv)

        this.player.hand.addCard(this.deck.drawCard(), "p", 1, "poker")
        this.player.hand.addCard(this.deck.drawCard(), "p", 1, "poker")
    }

    async bettingRound() {
        for (let i = 0; i < this.nonFoldedPlayers.length; i++) {
            const currentPlayer = this.nonFoldedPlayers[i]

            if (currentPlayer.isFolded) continue

            if(currentPlayer === this.player) {

                const action = await this.createPromptButtonResponse("Your turn:", "Call", "Raise", "Fold");

                if (action === "Call") {
                    currentPlayer.bet = this.currentBet;
                } else if (action === "Raise") {
                    const raiseAmount = parseInt (await this.createPromptNumResponse("Raise Amount:"));
                    this.currentBet += raiseAmount;
                    currentPlayer.bet = this.currentBet;
                } else {
                    currentPlayer.isFolded = true;
                }
            } else {
                await currentPlayer.takeAction(this.currentBet)
            }
        }
    }

    dealFlop() {
        this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
        this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
        this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
    }

    dealTurn() {
        this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
    }

    dealRiver() {
        this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
    }

    revealWinner() {
        // show all players cards

        const remainingHands = this.nonFoldedPlayers.map(player => player.hand.mapToPokerSolver())
        let winningHand = PokerHand.winners([remainingHands])
        const winningHandDescription = winningHand.descr
    }
    async play() {
        this.askNumberOfPlayers()
        this.opponentsSetUp()
        this.playerSetUp()
        this.gameSetUp()
        this.initializeRound()

        this.dealOpponentsHands()
        this.dealPlayersHand()

        await this.bettingRound(); //Pre-flop
        this.dealFlop()
        await this.bettingRound(); //Post-flop
        this.dealTurn()
        await this.bettingRound(); //After Turn
        this.dealRiver()
        await this.bettingRound(); //After River

        this.revealWinner()
        this.playAgain()
    }
}