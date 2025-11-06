const actionPromptBox = document.querySelector('.action-prompt-box')

import { Deck } from './classes/Deck.js'

import { Hand } from './classes/Hand.js'

import { Player } from './classes/Player.js'

export class Game {
    deck;
    dealerHand;
    userHandSplit1;
    userHandSplit2;
    highestScore;
    whosTurn;
    constructor() {
        this.isSplit = false;
        this.numPlayers;
        this.players = [];
    }

    async start() {
        await this.playerSetup();
        this.play()
    }

    async createPromptNumResponse(prompt) {
        const promptText = document.createElement('p')
        promptText.textContent = prompt
        promptText.className = "prompt-text"

        const inputBox = document.createElement('input')
        inputBox.className = "input-box"
        inputBox.type = "text"

        actionPromptBox.innerHTML = ""
        actionPromptBox.appendChild(promptText)
        actionPromptBox.appendChild(inputBox)
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
                        actionPromptBox.classList.add("shake")
                        setTimeout(() => {
                            actionPromptBox.classList.remove("shake")
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


        actionPromptBox.innerHTML = ""
        actionPromptBox.appendChild(promptText)
        actionPromptBox.appendChild(inputBox)
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

    async createPromptButtonResponse(prompt, input1, input2) {
        const promptText = document.createElement('p')
        promptText.textContent = prompt
        promptText.className = "prompt-text"

        const button1 = document.createElement('button')
        button1.className = "first-button"
        button1.textContent = input1

        const button2 = document.createElement('button')
        button2.className = "second-button"
        button2.textContent = input2

        actionPromptBox.innerHTML = ""
        actionPromptBox.appendChild(promptText)
        actionPromptBox.appendChild(button1)
        actionPromptBox.appendChild(button2)

        return new Promise((resolve) => {
            button1.addEventListener("click", () => {
                resolve(input1)
            })
            button2.addEventListener("click", () => {
                resolve(input2)
            })
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

        actionPromptBox.innerHTML = ""
        actionPromptBox.appendChild(promptText)

        await new Promise (resolve => setTimeout(resolve, 1000))
    }

    async playerSetup() {
        this.players = [];
        const numPlayers = await this.createPromptNumResponse("How many players? (1-4):")
        this.numPlayers = parseInt(numPlayers)

        if (!isNaN(Number(this.numPlayers)) && this.numPlayers >= 1 && this.numPlayers <= 4) {
            for (let i = 0; i < this.numPlayers; i++) {
                let p = new Player()
                const playerName = await this.createPromptTextResponse("Player " + String(i+1) + " name:")
                p.name = playerName
                this.players.push(p)
                const newPlayerDiv = document.createElement('div')
                newPlayerDiv.classList.add('player')
                newPlayerDiv.id = p.name

                const playerBalance = document.createElement('p')
                playerBalance.textContent = p.name + ': £' + p.moneyLeft
                playerBalance.id = String(p.name + 'balance')
                playerBalance.className = "player-balance"
                newPlayerDiv.appendChild(playerBalance)

                playersDiv.appendChild(newPlayerDiv)

            }
        } else {
            this.playerSetup()
        }
    }

    gameSetup() {
        this.deck = new Deck();
        this.deck.shuffle();
        this.highestScore = 0;
        this.whosTurn = 0;
        dealerHandDiv.innerHTML = "";
    }

    async betting(player) {
        const response = await this.createPromptNumResponse(player.name + ", input bet:")
        if (isNaN(Number(response)) || response <= 0 || response > player.moneyLeft) {
            this.displayText("Bet must be a number between 0 and " + String(player.moneyLeft))
            await this.betting(player);
        } else {
            player.bet = parseInt(response)
        }
    }

    async replay() {
        let playAgain = await this.createPromptButtonResponse("Play Again?", "Yes", "No")
        
        if (playAgain === "Yes") {
            await this.play();
        } else {
            this.restartGame()
        }
    }

    endGame() {
        let string = "Final Balance: "
        this.players.forEach(player => {
            string += player.name + ": £" + player.moneyLeft + " ";
        });
        this.displayText(string)
    }

    updateScoreBoard(player) {
        let id = String(player.name) + 'balance'
        const playerBalanceP = document.getElementById(id)
        playerBalanceP.textContent = String(player.name) + ': £' + String(player.moneyLeft)
    }

    async displayBetOutcome(player, outcome) {
        let id = String(player.name) + 'balance'
        const playerBalanceP = document.getElementById(id)

        playerBalanceP.className = String("player-balance " + outcome)

        if (outcome === "win") {
            playerBalanceP.textContent = '+£' + String(player.bet)
        } else if (outcome === "lose") {
            playerBalanceP.textContent = '-£' + String(player.bet)
        } else {
            playerBalanceP.textContent = '+£0'
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
        playerBalanceP.textContent = ""
        playerBalanceP.textContent = String(player.name) + ': £' + String(player.moneyLeft)
    }

    async playerWin(player) {
        player.win(player.bet);

        await this.displayBetOutcome(player, "win")

        if (this.isSplit) {
            return;
        }
    }

    async playerLose(player) {
        player.lose(player.bet)

        await this.displayBetOutcome(player, "lose")

        if (this.isSplit) {
            return;
        }
        if (player.moneyLeft === 0) {
            player.isStillActive = false;
        }
    }

    async draw(player) {
        this.displayText(String(player.name) + " and the Dealer got BlackJack - Tie!")
        
        
        await this.displayBetOutcome(player, "draw")
        if (this.isSplit) {
            return;
        }
    }

    async playerDeal(player) {
        player.hand = new Hand();

        const handDiv = document.createElement('div')
        handDiv.id = String(player.name) + "-hand-1"
        handDiv.className = "hand"
        document.getElementById(player.name).appendChild(handDiv)

        player.hand.addCard(this.deck.drawCard(), player.name, 1);
        setTimeout(() => {
            player.hand.addCard(this.deck.drawCard(), player.name, 1);
        }, 500)

        if (this.isBlackJack(player)) {
            this.displayText('BlackJack!')
            this.delay(1000)
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    async splitPair(player) {
        player.didSplit = true;

        this.userHandSplit1 = new Hand();
        this.userHandSplit2 = new Hand();

        const handDiv = document.createElement('div')
        handDiv.id = String(player.name) + "-hand-2"
        handDiv.className = "hand"
        document.getElementById(String(player.name)).appendChild(handDiv)

        this.userHandSplit1.addCard(player.hand.cards[0], player.name, 1);
        this.userHandSplit2.addCard(player.hand.cards[1], player.name, 2);

        const lastChild = document.getElementById(String(player.name) + "-hand-1").lastElementChild
        document.getElementById(String(player.name) + "-hand-1").removeChild(lastChild)

        const lastChild2 = document.getElementById(String(player.name) + "-hand-1").lastElementChild
        document.getElementById(String(player.name) + "-hand-1").removeChild(lastChild2)

        await this.displayText("Playing Hand 1:")
        player.hand = this.userHandSplit1
        await this.playerTurn(player)
        this.userHandSplit1 = player.hand

        this.isSplit = false;

        await this.displayText("Playing Hand 2: ")
        player.hand = this.userHandSplit2
        await this.playerTurn(player, 2)
        this.userHandSplit2 = player.hand
    }

    async doubleDown(player) {
        const choice = await this.createPromptButtonResponse(String(player.name) + ", Double Down?", "Yes", "No")
        if (choice === "Yes") {
            player.bet*=2;
            player.hand.addCard(this.deck.drawCard(), player.name, 1)
            return true
        } 
    }

    async dealerDeal() {
        this.dealerHand = new Hand()
        setTimeout(() => {
            this.dealerHand.addCard(this.deck.drawCard(), "dealers-hand");
            setTimeout(() => {
                this.dealerHand.addCard(this.deck.drawCard(), "dealers-hand-back")
            }, 500);
        }, 500);

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    isBlackJack(player) {
        return (player.hand.getPlayerTotal() === 21)
    }

    async userChoice(player) {
        if (this.isSplittableHand(player) && player.moneyLeft >= player.bet*2) {
            const choice = await this.createPromptButtonResponse(String(player.name) + ", Split?", "Yes", "No")
            if (choice === "Yes") {
                this.isSplit = true;
                await this.splitPair(player)
            }
        } else if ([9, 10, 11].includes(player.hand.getPlayerTotal()) && player.moneyLeft >= player.bet*2) {
            const dd = await this.doubleDown(player)
            if (dd) {
                this.calcBestHand(player)
                return Promise.resolve();
            }
        } 
        
        await this.playerTurn(player)

        if (player.hand.isBust()) {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.displayText("Bust!")
        }
    }

    isSplittableHand(player) {
        return (player.hand.cards[0].rank === player.hand.cards[1].rank)
    }

    async playerTurn(player, hand=1) {
        if (this.isBlackJack(player)) {
            await this.displayText('Blackjack!')
            await new Promise(resolve => setTimeout(resolve, 1000))
            return;
        }

        while (!player.hand.isBust()) {
        const choice = await this.createPromptButtonResponse(String(player.name) +", Hit or Stand?", "Hit", "Stand");

            if (choice === "Hit") {
                await player.hand.addCard(this.deck.drawCard(), player.name, hand)
            } else if (choice === "Stand") {
                break;
            }
        }

        this.calcBestHand(player)
        
        this.whosTurn++;
    }

    calcBestHand(player) {
        if (player.hand.getPlayerTotal() > this.highestScore && player.hand.getPlayerTotal() <= 21) {
            this.highestScore = player.hand.getPlayerTotal()
        }

    }

    async dealerTurn() {
        const cardBack = document.getElementById("dealer-card-back");
        cardBack.remove();
        await new Promise(resolve => setTimeout(resolve, 300));
        while (this.dealerHand.getDealerTotal() < 17 && this.dealerHand.getDealerTotal() < this.highestScore) {
            await new Promise(resolve => setTimeout(resolve, 500));
            this.dealerHand.addCard(this.deck.drawCard(), "dealers-hand");
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    whoWinsSplit(player) {
        let hand1;
        let hand2;

        if (this.dealerHand.getDealerTotal() > 21 && !this.userHandSplit1.isBust()|| this.userHandSplit1.getPlayerTotal() > this.dealerHand.getDealerTotal() && !this.userHandSplit1.isBust()) {
            hand1 = "w";
        } else if (this.userHandSplit1.getPlayerTotal() === this.dealerHand.getDealerTotal()) {
            hand1 = "d";
        } else if (this.userHandSplit1.getPlayerTotal() === 21 && this.userHandSplit1.length === 2 && this.dealerHand.getDealerTotal() === 21 && this.dealerHand.cards.length > 2) {
            hand1 = "w";
        }
        else {
            hand1 = "l";
        }

        if (this.dealerHand.getDealerTotal() > 21 && !this.userHandSplit2.isBust()|| this.userHandSplit2.getPlayerTotal() > this.dealerHand.getDealerTotal() && !this.userHandSplit2.isBust()) {
            hand2 = "w";
        } else if (this.userHandSplit2.getPlayerTotal() === this.dealerHand.getDealerTotal()) {
            hand2 = "d";
        } else if (this.userHandSplit2.getPlayerTotal() === 21 && this.userHandSplit2.cards.length === 2  && this.dealerHand.getDealerTotal() === 21 && this.dealerHand.cards.length > 2) {
            hand2 = "w";
        }
        else {
            hand2 = "l";
        }

        if (hand1 === "w" && hand2 === "w") {
            player.bet *= 2;
            this.playerWin(player);
        } else if (hand1 === "w" && hand2 === "d" || hand1 === "d" && hand1 === "w") {
            this.playerWin(player)
        } else if (hand1 === "w" && hand2 === "l"  || hand1 === "l" && hand2 === "w") {
            this.draw(player)
        } else if (hand1 === "d" && hand2 === "l" || hand1 === "l" && hand2 === "d") {
            this.playerLose(player)
        } else if (hand1 === "l" && hand2 === "l") {
            player.bet *= 2;
            this.playerLose(player)
        }
    }

    whoWins(player) {
        const dealerBlackjack = this.dealerHand.getDealerTotal() === 21
        const dealerBust = this.dealerHand.getDealerTotal() > 21
        const playerScoreHigherThanDealerScore = player.hand.getPlayerTotal() > this.dealerHand.getDealerTotal()
        if (!player.hand.isBust() && (dealerBust || playerScoreHigherThanDealerScore)) {
            this.playerWin(player);
        } else if (dealerBlackjack && this.dealerHand.cards.length == 2 && !this.isBlackJack(player) || player.hand.isBust()) {
            this.playerLose(player)
        }  else if (this.isBlackJack(player) && this.dealerHand.getDealerTotal() === 21 && this.dealerHand.cards.length > 2) {
            this.playerWin(player)
        } else if (player.hand.getPlayerTotal() === this.dealerHand.getDealerTotal()) {
            this.draw(player)
        } else {
            this.playerLose(player);
        }
    }

    async checkActivePlayer() {
        let totalBalance = 0;
         for (let i in this.players) {
            console.log(totalBalance)
            totalBalance += this.players[i].moneyLeft
        }

        if (totalBalance > 0) {
            return true;
        } else {
            return false;
        }
    }

    async restartGame() {
        const restart = await this.createPromptButtonResponse("Restart?", "Yes", "No")

        if (restart === "Yes") {
            document.getElementById("dealers-hand").innerHTML = ""
            document.getElementById("players-hands").innerHTML = ""
            this.start()
        } else {
            this.endGame()
        }
    }


    async play() {
        this.gameSetup()

        for (let i in this.players){
            let player = this.players[i];
            document.getElementById(player.name).innerHTML = ""
            const playerBalance = document.createElement('p')
            playerBalance.textContent = player.name + ': £' + player.moneyLeft
            playerBalance.id = String(player.name + 'balance')
            playerBalance.className = "player-balance"
            document.getElementById(player.name).appendChild(playerBalance)
        }
        for (let i in this.players) {
            let player = this.players[i];
            if (player.isStillActive) {
                await this.betting(player);
            }
        }

        this.players.forEach(async player => {
            if (player.isStillActive) {
                await this.playerDeal(player);
            }
        })

        await this.dealerDeal()

        for (let i in this.players) {
            let player = this.players[i];
            if (player.isStillActive) {
                await this.userChoice(player)
            }
        }

        await this.dealerTurn()

        for (let i in this.players) {
            let player = this.players[i]
            if (player.isStillActive && !player.didSplit) {
                this.whoWins(player);
            } else if (player.isStillActive && player.didSplit) {
                this.whoWinsSplit(player);
                player.didSplit = false;
            }
        }
        
        if (await this.checkActivePlayer()) {
            await this.replay();
        } else {
            await this.displayText("All players out of money! Game over")
            await this.restartGame()
        }
    }
}
