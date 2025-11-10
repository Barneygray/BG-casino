const opponentsHandsDiv = document.querySelector('.opponents-hands')
const communityCardsDiv = document.querySelector('.community-cards')
const actionBoxDiv = document.querySelector('.action-box')
const potDiv = document.querySelector('.pot')
const pokerPlayerDiv = document.querySelector('.player-area')

const playerHand = document.querySelector('.player-hand')
const opp1Hand = document.querySelector('.opponent1')
const opp2Hand = document.querySelector('.opponent2')
const opp3Hand = document.querySelector('.opponent3')

const playerNameBox = document.querySelector('.p')

import { Hand as PokerHand } from 'https://cdn.skypack.dev/pokersolver'


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

    async createPromptTextResponse(prompt) {
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

                    if (value !== "") {
                        resolve(input)
                    } else {
                        actionPromptBox.classList.add("shake")
                        setTimeout(() => {
                            actionPromptBox.classList.remove("shake")
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

    async displayText(prompt) {
        const promptText = document.createElement('p')
        promptText.textContent = prompt
        promptText.className = "prompt-text"

        actionBoxDiv.innerHTML = ""
        actionBoxDiv.appendChild(promptText)

        await new Promise (resolve => setTimeout(resolve, 1000))
    }

    async askPlayerName() {
        this.player.name = await this.createPromptTextResponse("What is your name?: ")
    }

    async askNumberOfPlayers() {
        this.numOpponents = await this.createPromptNumResponse("How many Opponents? (1-3):");
        this.opponentsSetUp()
    }

    async opponentsSetUp() {
        for (let i=0; i < this.numOpponents; i++) {
            let newOpp = new PokerOpponent()
            await newOpp.init()
            this.opponents.push(newOpp)

            newOpp.id = "opponent" + String(i+1)
            const oppNameBox = document.getElementById('o' +String(i+1))
            const oppBalance = document.createElement('p')
            oppBalance.textContent = newOpp.name + ': £' + String(newOpp.money)
            //oppBalance.className = "opp"+String(i+1)+"-balance"
            oppNameBox.appendChild(oppBalance)

        }

        this.activePlayers = [...this.opponents, this.player];
        this.nonFoldedPlayers = this.activePlayers
        this.turnOrder = this.activePlayers
    }

    playerSetUp() {
        const playerBalance = document.createElement('p')
        playerBalance.textContent = this.player.name + ': £' + this.player.moneyLeft
        playerBalance.className = "player-balance"
        playerNameBox.appendChild(playerBalance)
        //add this to player div
    }

    emptyHands() {
        playerHand.innerHTML = ""
        opp1Hand.innerHTML = ""
        opp2Hand.innerHTML = ""
        opp3Hand.innerHTML = ""
    }

    gameSetUp() {
        this.deck = new Deck();
        this.deck.shuffle();
    }

    establishTurnOrder() {
        this.turnOrder.push(this.turnOrder.shift())
        console.log(this.turnOrder)
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
    
    async dealOpponentsHands() {
        for (let opponent of this.opponents) {
            await opponent.hand.addCard(this.deck.drawCard(), opponent.id, 1, "poker")
            await opponent.hand.addCard(this.deck.drawCard(), opponent.id, 1, "poker")
        }
    }

    async dealPlayersHand() {
        this.player.hand = new Hand();

        const handDiv = document.createElement('div')
        handDiv.className = "player-hand"
        pokerPlayerDiv.appendChild(handDiv)

        await this.player.hand.addCard(this.deck.drawCard(), "p", 1, "poker")
        await this.player.hand.addCard(this.deck.drawCard(), "p", 1, "poker")
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
                const oppAction = await currentPlayer.takeAction(this.currentBet, this.communityCards, this.nonFoldedPlayers.length - 1)
                if (oppAction === "Call") {
                    currentPlayer.bet = this.currentBet;
                    await this.displayText(currentPlayer.name + " calls.")
                } else if (oppAction.includes("Raise")) {
                    this.currentBet += parseInt(oppAction.match(/\d+/g))
                    currentPlayer.bet = this.currentBet
                    await this.displayText(currentPlayer.name + " raises " + String(parseInt(oppAction.match(/\d+/g))))
                } else if (oppAction === "Fold") {
                    currentPlayer.isFolded = true;
                    await this.displayText(currentPlayer.name + " folds.")
                } else {
                    await this.displayText(currentPlayer.name + " checks.")
                }
            }
        }
    }

    async dealFlop() {
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
    }

    async dealTurn() {
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
    }

    async dealRiver() {
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker")
    }

    revealWinner() {
        // show all players cards

        const remainingHands = this.nonFoldedPlayers.map(player => player.hand.mapToPokerSolver())
        console.log(remainingHands)
        let winningHand = PokerHand.winners(remainingHands)
        const winningHandDescription = winningHand.descr
    }
    async play() {
        await this.askPlayerName()
        await this.askNumberOfPlayers()
        this.playerSetUp()
        this.gameSetUp()
        this.initializeRound()

        await this.dealOpponentsHands()
        await this.dealPlayersHand()

        await this.bettingRound(); //Pre-flop
        await this.dealFlop()
        await this.bettingRound(); //Post-flop
        await this.dealTurn()
        await this.bettingRound(); //After Turn
        await this.dealRiver()
        await this.bettingRound(); //After River

        this.revealWinner()
        //this.playAgain()
    }
}

const newpokerGame = new Poker()
newpokerGame.play()