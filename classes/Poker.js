const opponentsHandsDiv = document.querySelector('.opponents-hands')
const communityCardsDiv = document.querySelector('.community-cards')
const actionBoxDiv = document.querySelector('.action-box')
const potDiv = document.querySelector('.pot')
const pokerPlayerDiv = document.querySelector('.player-area')

const playerHand = document.querySelector('.player-hand')
const opp1Hand = document.querySelector('.opponent1')
const opp2Hand = document.querySelector('.opponent2')
const opp3Hand = document.querySelector('.opponent3')

const playerNameBox = document.getElementById('p-name')

import { Hand as PokerHand } from 'https://cdn.skypack.dev/pokersolver'


import { Deck } from './Deck.js'

import { Hand } from './Hand.js'

import { Player } from './Player.js'

import { PokerOpponent } from './PokerOpponent.js'

export class Poker {
    numOpponents;
    deck;
    bettingComplete;
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
        this.pot = 0;
        this.currentBet = 0;
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
        await this.opponentsSetUp()
    }

    async opponentsSetUp() {
        for (let i=0; i < this.numOpponents; i++) {
            let newOpp = new PokerOpponent()
            await newOpp.init()
            this.opponents.push(newOpp)

            newOpp.id = "opponent" + String(i+1)
            const oppNameBox = document.getElementById('o' +String(i+1))
            const oppBalance = document.createElement('p')
            oppBalance.id = newOpp.name + "-balance"
            oppBalance.textContent = newOpp.name + ': £' + String(newOpp.money)
            oppNameBox.appendChild(oppBalance)

            const oppBet = document.createElement('p')
            oppBet.textContent = 'Current Bet: £0'
            oppBet.id = newOpp.name
            oppNameBox.appendChild(oppBet)
        }

        this.activePlayers = [...this.opponents, this.player];
        console.log(this.activePlayers)
        this.nonFoldedPlayers = this.activePlayers
        this.turnOrder = this.activePlayers
    }

    playerSetUp() {
        const playerBalance = document.createElement('p')
        playerBalance.textContent = this.player.name + ': £' + this.player.moneyLeft
        playerBalance.className = "player-balance"
        playerBalance.id = this.player.name + "-balance"
        console.log(playerNameBox)
        console.log(playerBalance)
        playerNameBox.appendChild(playerBalance)

        const playerBet = document.createElement('p')
        playerBet.textContent = 'Current Bet: £0' 
        playerBet.id = this.player.name
        playerNameBox.appendChild(playerBet)
    }

    emptyHands() {
        playerHand.innerHTML = ""
        opp1Hand.innerHTML = ""
        opp2Hand.innerHTML = ""
        opp3Hand.innerHTML = ""
    }

    roundSetUp() {
        this.deck = new Deck();
        this.deck.shuffle();
    }

    establishTurnOrder() {
        this.turnOrder.push(this.turnOrder.shift())
        console.log(this.turnOrder)
        this.turnOrder = this.turnOrder.filter(player => player.isStillActive);
    }

    updateBigBlind(player) {
        player.bet = this.bigBlind
        const playerBet = document.getElementById(player.name)
        playerBet.textContent = 'Current Bet: £' + player.bet
    }

    updateSmallBlind(player) {
        player.bet = this.smallBlind
        const playerBet = document.getElementById(player.name)
        playerBet.textContent = 'Current Bet: £' + player.bet
    }
    initializeRound() {
        this.establishTurnOrder()

        for (let player of this.turnOrder) {
            player.isBigBlind = false;
            player.isSmallBlind = false;
        }
        this.turnOrder.at(-1).makeBigBlind()
        this.turnOrder.at(-2).makeSmallBlind()

        for (let player of this.turnOrder) {
            if (player.isBigBlind === true) {
                this.updateBigBlind(player)
            } else if (player.isSmallBlind === true) {
                this.updateSmallBlind(player)
            }
        }

        this.currentBet = this.bigBlind
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

    updatePot() {
        for (let player of this.activePlayers) {
            this.pot += player.bet 
            player.bet = 0;
            this.updatePlayerHTML(player, player.name)
        }
        const potText = document.getElementById("pot-text")
        potText.innerHTML = "Pot: £" + String(this.pot)
    }

    updatePlayerHTML(player, id) {
        const betText = document.getElementById(id)
        betText.textContent = "Current Bet: " + String(player.bet)

        const totalText = document.getElementById(id + "-balance")
        totalText.textContent = player.name + ': £' + String(player.money)
    }

    updateFoldedPlayers() {
        this.nonFoldedPlayers = this.nonFoldedPlayers.filter(player => !player.folded);
    }

    playerCall(currentPlayer) {
        currentPlayer.bet = this.currentBet;
        currentPlayer.money -= currentPlayer.bet
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async playerRaise(currentPlayer) {
        const raiseAmount = Number(await this.createPromptNumResponse("Raise Amount:"));
        this.currentBet += raiseAmount;
        this.bettingComplete = false;
        currentPlayer.bet = this.currentBet;
        currentPlayer.money -= currentPlayer.bet
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
}

    playerFold(currentPlayer) {
        currentPlayer.isFolded = true;
    }

    playerCheck(currentPlayer) {
        currentPlayer.money -= currentPlayer.bet
    }

    async cpuCall(currentPlayer) {
        currentPlayer.bet = this.currentBet;
        await this.displayText(currentPlayer.name + " calls.")
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
        currentPlayer.money -= currentPlayer.bet
    }

    async cpuRaise(currentPlayer, oppAction) {
        this.currentBet += parseInt(oppAction.match(/\d+/g))
        currentPlayer.bet = this.currentBet
        this.bettingComplete = false;
        await this.displayText(currentPlayer.name + " raises " + String(parseInt(oppAction.match(/\d+/g))))
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
        currentPlayer.money -= currentPlayer.bet
    }

    async cpuCheck(currentPlayer) {
        await this.displayText(currentPlayer.name + " checks.")
        currentPlayer.money -= currentPlayer.bet
    }

    async cpuFold(currentPlayer) {
        currentPlayer.isFolded = true;
        await this.displayText(currentPlayer.name + " folds.")
    }
    async bettingRound() {
        this.bettingComplete = false;

        while (!this.bettingComplete || this.nonFoldedPlayers.length === 1) {
            this.bettingComplete = true;

            for (let i = 0; i < this.nonFoldedPlayers.length; i++) {
                const currentPlayer = this.nonFoldedPlayers[i]

                if (currentPlayer.isFolded) continue

                if(currentPlayer === this.player) {
                    
                    let action;
                    if (currentPlayer.bet !== this.currentBet) {
                        action = await this.createPromptButtonResponse("Your turn:", "Call", "Raise", "Fold");
                    } else {
                        action = await this.createPromptButtonResponse("Your turn:", "Check", "Raise", "Fold");
                    }

                    if (action === "Call") {
                        this.playerCall(currentPlayer)
                    } else if (action === "Raise") {
                        await this.playerRaise(currentPlayer)
                    } else if (action === "Fold") {
                        this.playerFold(currentPlayer)
                    }
                } else {
                    const oppAction = await currentPlayer.takeAction(this.currentBet, this.communityCards, this.nonFoldedPlayers.length - 1)
                    if (oppAction === "Call") {
                        await this.cpuCall(currentPlayer)
                    } else if (oppAction.includes("Raise")) {
                        await this.cpuRaise(currentPlayer, oppAction)
                    } else if (oppAction === "Fold") {
                        await this.cpuFold(currentPlayer)
                    } else {
                        await this.cpuCheck(currentPlayer)
                    }
                }
                this.updateFoldedPlayers()
                this.bettingComplete = this.bettingComplete && this.nonFoldedPlayers.every(p => p.isFolded || p.bet === this.currentBet)
            }
        }
        this.updatePot()
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

    determineWinner() {
        // show all players cards
        let remainingHandsSolved = []
        for (let player of this.nonFoldedPlayers) {
            const solvedHand = player.hand.solveHand(this.communityCards)
            remainingHandsSolved.push(solvedHand)
        }

        const winners = PokerHand.winners(remainingHandsSolved)
        let winningPlayers = []

        for (let player of this.nonFoldedPlayers) {
            const solvedHand = player.hand.solveHand(this.communityCards)
            if (winners.includes(solvedHand)) {
                winningPlayers.push(player)
                player.money += this.pot / winners.length
            }
        }

        this.revealWinner(winningPlayers)
    }

    async revealWinner(winningPlayers) {
        const winningHandDescription = winningHand.descr

        if (winningPlayers.length > 1) {
            await this.displayText("Tie! " + winningHandDescription)
        } else {
            await this.displayText(winningPlayers[0].name + " wins with a " + winningHandDescription)
        }

    }

    async playAgain() {
        let playAgain = await this.createPromptButtonResponse("Play Again?", "Yes", "No")
        
        if (playAgain === "Yes") {
            await this.play();
        } else {
            this.restartGame()
        }
    }

    async gameSetUp() {
        await this.askPlayerName()
        await this.askNumberOfPlayers()
        this.playerSetUp()
    }

    async play() {
        this.roundSetUp()
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

        this.determineWinner()
        this.playAgain()
    }
}

const newpokerGame = new Poker()
newpokerGame.gameSetUp()
newpokerGame.play()