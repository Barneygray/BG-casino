const actionBoxDiv = document.querySelector('.action-box')
const pokerPlayerDiv = document.querySelector('.player-area')

const playerHand = document.querySelector('.player-hand')
const opp1Hand = document.querySelector('.opponent1')
const opp2Hand = document.querySelector('.opponent2')
const opp3Hand = document.querySelector('.opponent3')

const playerNameBox = document.getElementById('p-name')


const btn = document.querySelector('.dropdown-btn');
const content = document.querySelector('.dropdown-content');

btn.addEventListener('click', () => {
    content.classList.toggle('show');
});



import { Hand as PokerHand } from 'https://cdn.skypack.dev/pokersolver'


import { Deck } from './Deck.js'

import { Hand } from './Hand.js'

import { Player } from './Player.js'

import { PokerOpponent } from './PokerOpponent.js'

export class Poker {
    numOpponents;
    deck;
    bettingComplete;
    communityCards;
    constructor() {
        this.opponents = [];
        this.activePlayers = [];
        this.nonFoldedPlayers = [];
        this.turnOrder = [];
        this.player = new Player()
        this.smallBlind = 20;
        this.bigBlind = 40;
        this.whosTurn = 0;
        this.pot = 0;
        this.roundPot = 0;
        this.currentBet = 0;
    }
    async createPromptNumResponse(prompt, type) {
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
                    if (type === 1) {
                        if (/^\d+$/.test(value) && value >= 1 && value <= 3) {
                            resolve(input)
                        } else {
                            actionBoxDiv.classList.add("shake")
                            setTimeout(() => {
                                actionBoxDiv.classList.remove("shake")
                            }, 300)
                        }
                    } else {
                        if (/^\d+$/.test(value) && value > 0 && value <= type.money) {
                            resolve(input)
                        } else {
                            actionBoxDiv.classList.add("shake")
                            setTimeout(() => {
                                actionBoxDiv.classList.remove("shake")
                            }, 300)
                        }
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
        this.numOpponents = await this.createPromptNumResponse("How many Opponents? (1-3):", 1);
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
        this.communityCards = new Hand()
    }

    establishTurnOrder() {
        this.turnOrder.push(this.turnOrder.shift())
        console.log(this.turnOrder)
        this.turnOrder = this.turnOrder.filter(player => player.isStillActive);

    }

    updateBigBlind(player) {
        player.bet = Math.min(this.bigBlind,player.money)
        const playerBet = document.getElementById(player.name)
        playerBet.textContent = 'Current Bet: £' + player.bet
        player.money -= player.bet
        this.roundPot += player.bet

        this.updatePot(player.bet)
        this.updatePlayerHTML(player, player.name)
    }

    updateSmallBlind(player) {
        player.bet = Math.min(this.smallBlind, player.money)
        const playerBet = document.getElementById(player.name)
        playerBet.textContent = 'Current Bet: £' + player.bet
        player.money -= player.bet
        this.roundPot += player.bet
        
        this.updatePot(player.bet)
        this.updatePlayerHTML(player, player.name)
    }

    removeInactivePlayers() {
        this.activePlayers = this.activePlayers.filter(player => player.isStillActive);
        this.turnOrder = this.turnOrder.filter(player => player.isStillActive);
    }

    initializeRound() {
        this.removeInactivePlayers()
        this.establishTurnOrder()

        for (let player of this.turnOrder) {
            player.isBigBlind = false;
            player.isSmallBlind = false;
            player.isFolded = false;
        }
        this.updateFoldedPlayers();

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
            if (!opponent.isStillActive) continue
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

    zeroBets() {
        for (let player of this.activePlayers) {
            player.bet = 0;
            this.updatePlayerHTML(player, player.name)
        }
        this.currentBet = 0;
    }

    updatePot(amount) {
        this.pot += amount

        const potText = document.getElementById("pot-text")
        potText.innerHTML = "Pot: £" + String(this.pot)
    }

    updatePlayerHTML(player, id) {
        const betText = document.getElementById(id)
        betText.textContent = "Current Bet: £" + String(player.bet)


        const totalText = document.getElementById(player.name + "-balance")
        totalText.textContent = player.name + ': £' + String(player.money)

        const potText = document.getElementById("pot-text")
        potText.textContent = "Pot: £" + String(this.pot)
    }

    updateFoldedPlayers() {
        this.nonFoldedPlayers = this.turnOrder.filter(player => !player.isFolded);
    }

    async playerCall(currentPlayer) {
        await this.displayText("Call")
        const callDifference = this.currentBet - currentPlayer.bet
        currentPlayer.bet = this.currentBet;
        currentPlayer.money -= callDifference
        this.updatePot(callDifference)
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async playerRaise(currentPlayer) {
        const raiseAmount = Number(await this.createPromptNumResponse("Raise Amount:", currentPlayer));
        await this.displayText("Raise £" + String(raiseAmount))

        this.currentBet = raiseAmount + this.currentBet;
        this.bettingComplete = false;
        currentPlayer.money -= this.currentBet - currentPlayer.bet
        this.updatePot(this.currentBet - currentPlayer.bet)
        currentPlayer.bet = this.currentBet;  

        this.updatePlayerHTML(currentPlayer, currentPlayer.name)

        this.raiseOccurred = true;
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
        this.updatePot(callDifference)
        this.updatePlayerHTML(currentPlayer, currentPlayer.name)
    }

    async cpuRaise(currentPlayer, oppAction) {
        const raiseAmount = parseInt(oppAction.match(/\d+/g))
        await this.displayText(currentPlayer.name + " raises " + String(raiseAmount))
        this.currentBet = raiseAmount + this.currentBet

        this.bettingComplete = false;
        currentPlayer.money -= this.currentBet  - currentPlayer.bet
        this.updatePot(this.currentBet - currentPlayer.bet)
        currentPlayer.bet = this.currentBet

        this.updatePlayerHTML(currentPlayer, currentPlayer.name)

        this.raiseOccurred = true;
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

    async executeCPUAction(oppAction, currentPlayer) {
        if (oppAction === "Check" ||oppAction === "Raise0.00" && currentPlayer.bet === this.currentBet|| oppAction === "Call" && currentPlayer.bet === this.currentBet) {
            await this.cpuCheck(currentPlayer)
            this.pendingPlayers = this.pendingPlayers.filter(p => p !== currentPlayer);
        } else if (oppAction === "Call" || oppAction === "Raise0.00") {
            await this.cpuCall(currentPlayer)
            this.pendingPlayers = this.pendingPlayers.filter(p => p !== currentPlayer);
        } else if (oppAction.includes("Raise")) {
            await this.cpuRaise(currentPlayer, oppAction)
            this.pendingPlayers = this.nonFoldedPlayers.filter(p => p !== currentPlayer);
            this.restartLoop = true;
        } else if (oppAction === "Fold") {
            await this.cpuFold(currentPlayer)
            this.pendingPlayers = this.pendingPlayers.filter(p => p !== currentPlayer);
        }
    }

    async executePlayerAction(action, currentPlayer) {
        if (action === "Call") {
            await this.playerCall(currentPlayer)
            this.pendingPlayers = this.pendingPlayers.filter(p => p !== currentPlayer);
        } else if (action === "Raise") {
            await this.playerRaise(currentPlayer)
            this.pendingPlayers = this.nonFoldedPlayers.filter(p => p !== currentPlayer);
            this.restartLoop = true;
        } else if (action === "Fold") {
            await this.playerFold(currentPlayer)
            this.pendingPlayers = this.pendingPlayers.filter(p => p !== currentPlayer);
        }
    }

    resetRaiseCount() {
        for (let opponent of this.opponents) {
            opponent.raiseCount = 0;
        }
    }

    async bettingRound() {
        this.bettingComplete = false;
        this.lastAggressorIndex = null;

        this.pendingPlayers = this.nonFoldedPlayers.slice()

        while (!this.bettingComplete) {
            this.raiseOccurred = false;
            this.restartLoop = false;

            for (let i = 0; i < this.turnOrder.length; i++) {
                const currentPlayer = this.turnOrder[i]

                if (currentPlayer.isFolded) continue
                if (!this.pendingPlayers.includes(currentPlayer)) continue

                if(currentPlayer === this.player) {
                    
                    let action;
                    if (currentPlayer.bet !== this.currentBet) {
                        action = await this.createPromptButtonResponse("Your turn:", "Call", "Raise", "Fold");
                    } else {
                        action = await this.createPromptButtonResponse("Your turn:", "Check", "Raise", "Fold");
                    }

                    await this.executePlayerAction(action, currentPlayer, i)

                } else {
                    const oppAction = await currentPlayer.takeAction(this.currentBet, this.communityCards, this.nonFoldedPlayers.length - 1, this.pot, this.smallBlind)
                    await this.executeCPUAction(oppAction, currentPlayer, i)
                }

                this.updateFoldedPlayers()

                if (this.nonFoldedPlayers.length <= 1) {
                    this.bettingComplete = true;
                    break;
                }
                

                if (this.pendingPlayers.length === 0) {
                    this.bettingComplete = true; // Everyone acted after last raise
                    break;
                }
            }

        if (!this.raiseOccurred) {
            this.bettingComplete = true;
        }


        if (this.restartLoop && !this.bettingComplete) {
            continue; // Restart while loop for new betting cycle
        }

        this.resetRaiseCount();
        }
        this.zeroBets();
    }

    async dealFlop() {
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker", 0)
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker", 1)
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker", 2)
    }

    async dealTurn() {
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker", 3)
    }

    async dealRiver() {
        await this.communityCards.addCard(this.deck.drawCard(), "community", 1, "poker", 4)
    }

    checkForPlayerOut() {
        for (let player of this.activePlayers) {
            if (player.money === 0) {
                player.isStillActive = false;
            }
        }
    }

    checkForAutoWin() {
        this.checkForPlayerOut()
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
        this.checkForPlayerOut()
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
            console.log(solvedHand.descr)
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

    showCards() {
        const cardBacks = document.querySelectorAll('#dealer-card-back');
        cardBacks.forEach(card => card.remove())
    }

    async revealWinner(winners, winningPlayers) {
        const winningHandDescription = winners[0].descr

        this.showCards()

        if (winningPlayers.length > 1) {
            await this.displayText("Tie! " + winningHandDescription)
        } else {
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
        }
    };

    emptyPlayerHTML() {
        const playerBalance = document.getElementById(this.player.name + "-balance")
        playerBalance.remove()

        const playerBet = document.getElementById(this.player.name)
        playerBet.remove()

        for (let opponent of this.opponents) {
            const oppBalance = document.getElementById(opponent.name + "-balance")
            oppBalance.remove()

            const oppBet = document.getElementById(opponent.name)
            oppBet.remove()
        }
    }

    async restartGame() {
        this.emptyPlayerHTML() 
        let restartGame = await this.createPromptButtonResponse("Restart Game?", "Yes", "No");
        this.emptyHTML();

        if (restartGame === "Yes") {
            this.opponents = [];
            this.activePlayers = [];
            this.nonFoldedPlayers = [];
            this.turnOrder = [];
            this.player = new Player()
            this.pot = 0;
            this.roundPot = 0;
            this.currentBet = 0;
            await this.gameSetUp();
            await this.play();
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
        
        if (!this.player.isStllActive)
        await this.playAgain()

        this.restartGame()
    }
}

const newpokerGame = new Poker()

await newpokerGame.gameSetUp()
await newpokerGame.play()