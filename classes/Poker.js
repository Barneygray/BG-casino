const actionBoxDiv = document.querySelector('.action-box')
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

    async displayText(prompt) {
        const promptText = document.createElement('p')
        promptText.textContent = prompt
        promptText.className = "prompt-text"

        actionBoxDiv.innerHTML = ""
        actionBoxDiv.appendChild(promptText)

        await new Promise (resolve => setTimeout(resolve, 500))
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
        playerBalance.textContent = this.player.name + ': £' + this.player.money
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

    async emptyHands() {
        playerHand.innerHTML = ""
        opp1Hand.innerHTML = ""
        opp2Hand.innerHTML = ""
        opp3Hand.innerHTML = ""
    }

    async roundSetUp() {
        this.deck = new Deck();
        this.deck.shuffle();

        for (let opponent of this.opponents) {
            opponent.hand = new Hand()
        }
        this.player.hand = new Hand()
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
        player.money -= player.bet
        this.updatePlayerHTML(player, player.name)
    }

    updateSmallBlind(player) {
        player.bet = this.smallBlind
        const playerBet = document.getElementById(player.name)
        playerBet.textContent = 'Current Bet: £' + player.bet
        player.money -= player.bet
        this.updatePlayerHTML(player, player.name)
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
        this.currentBet = 0;
    }

    updatePlayerHTML(player, id) {
        const betText = document.getElementById(id)
        betText.textContent = "Current Bet: " + String(player.bet)


        const totalText = document.getElementById(player.name + "-balance")
        totalText.textContent = player.name + ': £' + String(player.money)

        const potText = document.getElementById("pot-text")
        potText.textContent = "Pot: £" + String(this.pot)
    }

    updateFoldedPlayers() {
        this.nonFoldedPlayers = this.nonFoldedPlayers.filter(player => !player.isFolded);
    }

    async playerCall(currentPlayer) {
        await this.displayText("Call")
        const callDifference = this.currentBet - currentPlayer.bet
        currentPlayer.bet = this.currentBet;
        currentPlayer.money -= callDifference
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async playerRaise(currentPlayer) {
        const raiseAmount = Number(await this.createPromptNumResponse("Raise Amount:"));
        await this.displayText("Raise £" + String(raiseAmount))
        this.currentBet = raiseAmount + currentPlayer.bet;
        this.bettingComplete = false;
        currentPlayer.bet = this.currentBet;
        currentPlayer.money -= raiseAmount ;
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
}

    async playerFold(currentPlayer) {
        await this.displayText("Fold")
        currentPlayer.isFolded = true;

        const totalText = document.getElementById(currentPlayer.name + "-balance")
        totalText.textContent = "Folded"

        const pHand = document.querySelector(".player-hand")
        const cards = pHand.querySelectorAll('.card');
        cards.forEach(card => card.remove())
        if (this.checkForAutoWin()) return;
    }

    async playerCheck(currentPlayer) {
        await this.displayText("Check")
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async cpuCall(currentPlayer) {
        const callDifference = this.currentBet - currentPlayer.bet
        currentPlayer.bet = this.currentBet;
        await this.displayText(currentPlayer.name + " calls.")
        currentPlayer.money -= callDifference
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async cpuRaise(currentPlayer, oppAction) {
        this.currentBet += parseInt(oppAction.match(/\d+/g))
        currentPlayer.bet = this.currentBet
        this.bettingComplete = false;
        await this.displayText(currentPlayer.name + " raises " + String(parseInt(oppAction.match(/\d+/g))))
        currentPlayer.money -= parseInt(oppAction.match(/\d+/g));
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async cpuCheck(currentPlayer) {
        await this.displayText(currentPlayer.name + " checks.")
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async cpuFold(currentPlayer) {
        currentPlayer.isFolded = true;
        await this.displayText(currentPlayer.name + " folds.")

        const totalText = document.getElementById(currentPlayer.name + "-balance")
        totalText.textContent = "Folded"

        const cpuHand = document.getElementById(currentPlayer.id)
        const cards = cpuHand.querySelectorAll('.card');
        cards.forEach(card => card.remove())
        if (this.checkForAutoWin()) return;
    }

    onePlayerNotFolded() {
        return this.nonFoldedPlayers.length === 1
    }

    async bettingRound() {
        console.log(this.turnOrder)
        this.bettingComplete = false;
        while (!this.bettingComplete) {
            this.bettingComplete = true;

            for (let i = 0; i < this.turnOrder.length; i++) {
                const currentPlayer = this.turnOrder[i]

                if (currentPlayer.isFolded) continue

                if(currentPlayer === this.player) {
                    
                    let action;
                    if (currentPlayer.bet !== this.currentBet) {
                        action = await this.createPromptButtonResponse("Your turn:", "Call", "Raise", "Fold");
                    } else {
                        action = await this.createPromptButtonResponse("Your turn:", "Check", "Raise", "Fold");
                    }

                    if (action === "Call") {
                        await this.playerCall(currentPlayer)
                    } else if (action === "Raise") {
                        await this.playerRaise(currentPlayer)
                    } else if (action === "Fold") {
                        await this.playerFold(currentPlayer)
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
                this.bettingComplete = this.nonFoldedPlayers.every(p => p.isFolded || p.bet === this.currentBet)
            }
        }
        this.updateFoldedPlayers()
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

    checkForAutoWin() {
        if (this.nonFoldedPlayers.length === 1) {
            const winner = this.nonFoldedPlayers[0];
            winner.money += this.pot;
            this.pot = 0;
            this.displayText(winner.name + " wins!")
            this.updatePlayerHTML(winner, winner.name)
            return true
        }
        return false
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
            if (winners.some(w => w.descr === solvedHand.descr)) {
                winningPlayers.push(player)
                console.log(player.name)
                player.money += this.pot / winners.length
                this.pot = 0;
                this.updatePlayerHTML(player, player.name)
            }
        }

        this.revealWinner(winners, winningPlayers)
    }

    async revealWinner(winners, winningPlayers) {
        const winningHandDescription = winners[0].descr

        if (winningPlayers.length > 1) {
            await this.displayText("Tie! " + winningHandDescription)
        } else {
            console.log(winningPlayers)
            await this.displayText(winningPlayers[0].name + " wins with a " + winningHandDescription)
        }

    }

    emptyHTML() {
        const pHand = document.querySelector(".player-hand")
        const cards = pHand.querySelectorAll('.card');
        cards.forEach(card => card.remove())

        const comCards = document.querySelector(".community-cards")
        const cCards = comCards.querySelectorAll('.card');
        cCards.forEach(card => card.remove())

        for (let player of this.opponents) {
                const cpuHand = document.getElementById(player.id)
                const cards = cpuHand.querySelectorAll('.card');
                cards.forEach(card => card.remove())
            }
    }

    async playAgain() {
        let playAgain = await this.createPromptButtonResponse("Play Again?", "Yes", "No")
        
        this.emptyHTML()
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

    async playRound() {
        await this.bettingRound();
        if (this.checkForAutoWin()) return;

        await this.dealFlop()
        await this.bettingRound(); 
        if (this.checkForAutoWin()) return;

        await this.dealTurn()
        await this.bettingRound(); 
        if (this.checkForAutoWin()) return;

        await this.dealRiver()
        await this.bettingRound(); 
        if (this.checkForAutoWin()) return;

        this.determineWinner()
    }

    async play() {
        await this.roundSetUp()
        this.initializeRound()

        await this.dealOpponentsHands()
        await this.dealPlayersHand()

        await this.playRound()

        this.playAgain()
    }
}

const newpokerGame = new Poker()

await newpokerGame.gameSetUp()
await newpokerGame.play()