const deckHTML = document.querySelector('.deck')
const DEALER_HAND = "dealers-hand"
const DEALER_HAND_BACK = "dealers-hand-back"

import { Hand as PokerHand } from 'https://cdn.skypack.dev/pokersolver'


export class Hand {
    constructor() {
        this.cards = [];
    }

    cardAnimationBlackJack(newCardDiv, playerID, handNumber, card) {
        const cardBack = document.createElement('div')
        const movingCard = newCardDiv.cloneNode(true);

        cardBack.classList.add('card-back')
        cardBack.id = "dealer-card-back"
        movingCard.appendChild(cardBack)
        document.body.appendChild(movingCard);

        const deckRect = deckHTML.getBoundingClientRect();
        
        movingCard.style.position = 'absolute';
        movingCard.style.left = `${deckRect.left-100}px`;
        movingCard.style.top = `${deckRect.top}px`;            
        movingCard.style.margin = '0'; // override margin
        movingCard.style.transform = 'none'; // reset transform
        movingCard.style.transition = 'transform 0.8s ease-in-out';

        if (playerID !== DEALER_HAND && playerID !== DEALER_HAND_BACK) {
            const playerHandDiv = document.getElementById(playerID + "-hand-" + String(handNumber))
            setTimeout(() => this.moveCard(playerHandDiv, movingCard, deckRect, true), 100)
            setTimeout (() => {
                movingCard.remove();
                playerHandDiv.appendChild(newCardDiv)
            }, 800)
        } else if (playerID !== DEALER_HAND) {
            const dealerHandDiv = document.querySelector('.' + DEALER_HAND)
            setTimeout(() => this.moveCard(dealerHandDiv, movingCard, deckRect), 100)
            setTimeout(() => {
                movingCard.remove()
                cardBack.classList.add('card-back')
                cardBack.id = "dealer-card-back"
                newCardDiv.appendChild(cardBack)
                dealerHandDiv.appendChild(newCardDiv)
            }, 800)
        } else {
            const dealerHandDiv = document.querySelector('.dealers-hand')
            setTimeout(() => this.moveCard(dealerHandDiv, movingCard, deckRect), 100)
            setTimeout(() => {
                movingCard.remove()
                dealerHandDiv.appendChild(newCardDiv)
            }, 800)
        }

    }

    moveCard(handDiv, movingCard, deckRect, isPlayer=false, isCC = false, cardIndex = 0) {
        const handRect = handDiv.getBoundingClientRect();
        const handRectCenter = handRect.left + handRect.width / 2
        if (isPlayer) {
            movingCard.style.transform = `translate(${handRect.left - deckRect.left + 50}px, ${handRect.top - deckRect.top+ 100}px)`;
        } else if (isCC) {
            if (cardIndex === 0) {
                movingCard.style.transform = `translate(${handRectCenter - deckRect.left - 100}px, ${handRect.top - deckRect.top + 30}px)`;
            } else {
                movingCard.style.transform = `translate(${handRectCenter - deckRect.left - 100 + cardIndex*60}px, ${handRect.top - deckRect.top + 20}px)`;
            }
        } else {
            movingCard.style.transform = `translate(${handRectCenter - deckRect.left}px, ${handRect.top - deckRect.top}px)`;
        }
    }


    async cardAnimationPoker(newCardDiv, playerID, i=0) {
        return new Promise((resolve) => {
            const cardBack = document.createElement('div')
            const movingCard = newCardDiv.cloneNode(true);

            cardBack.classList.add('card-back')
            cardBack.id = "dealer-card-back"
            movingCard.appendChild(cardBack)
            document.body.appendChild(movingCard);

            const deckRect = deckHTML.getBoundingClientRect();
            
            movingCard.style.position = 'absolute';
            movingCard.style.left = `${deckRect.left-100}px`;
            movingCard.style.top = `${deckRect.top}px`;            
            movingCard.style.margin = '0'; // override margin
            movingCard.style.transform = 'none'; // reset transform
            movingCard.style.transition = 'transform 0.8s ease-in-out';

            if (["opponent1", "opponent2", "opponent3"].includes(playerID)) {
                const opponentHandDiv = document.getElementById(playerID)
                setTimeout(() => this.moveCard(opponentHandDiv, movingCard, deckRect), 100)
                setTimeout (() => {
                    movingCard.remove();
                    cardBack.classList.add('card-back')
                    cardBack.id = "dealer-card-back"
                    newCardDiv.appendChild(cardBack)
                    opponentHandDiv.appendChild(newCardDiv);
                    resolve()
                }, 800)
            } else if (playerID === "community") {
            const communityCardDiv = document.querySelector('.community-cards') 
            setTimeout(() => this.moveCard(communityCardDiv, movingCard, deckRect, false, true, i), 100)
                setTimeout(() => {
                    movingCard.remove()
                    communityCardDiv.appendChild(newCardDiv)
                    resolve()
                }, 800)
            } else {
                const playerHandDiv = document.querySelector('.player-hand')
                setTimeout(() => this.moveCard(playerHandDiv, movingCard, deckRect, true), 100)
                setTimeout(() => {
                    movingCard.remove()
                    playerHandDiv.appendChild(newCardDiv)
                    resolve()
                }, 800)
            } 
        });
    }

    async addCardHTML(card, playerID, hand, game, i) {
        const newCardDiv = document.createElement('div')
        newCardDiv.classList.add('card')
        if (['♣', '♠'].includes(card.suit)) {
            newCardDiv.classList.add('black-card')
        } else {
            newCardDiv.classList.add('red-card')
        }
        newCardDiv.id = card.toString()

        newCardDiv.setAttribute('role', 'img')
        newCardDiv.setAttribute('aria-label', `${playerID} is dealt: ${card.toString()}`)

        const cardText1 = document.createElement('p')
        cardText1.textContent = card.toString()
        cardText1.className = "top-left"
        newCardDiv.appendChild(cardText1)
        
        const cardText2 = document.createElement('p')
        cardText2.textContent = card.toString()
        cardText2.className = "bottom-right"
        newCardDiv.appendChild(cardText2)

        const cardImg = document.createElement('img')
        cardImg.src = './images/Ernst-Young-Logo.png'
        cardImg.alt = ""
        cardImg.className = 'card-image'
        newCardDiv.appendChild(cardImg)

        if (game === "blackjack") { 
            this.cardAnimationBlackJack(newCardDiv, playerID, hand, card)
        } else if (game === "poker") {
            await this.cardAnimationPoker(newCardDiv, playerID, i)
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    async addCard(card, playerID, hand, game, i) {
        this.cards.push(card)
        
        await this.addCardHTML(card, playerID, hand, game, i)
    }

    getPlayerTotal() {
        let t = 0;
        let a = 0;

        for (let card of this.cards) {
            t += card.getvalue();
            if (card.rank === 'A') {
                a++;
            }
        };

        while (t > 21 && a > 0) {
            t -= 10;
            a--;
        }
        return t;
    }

    getDealerTotal() {
        let t = 0;
        let a = 0;

        for (let card of this.cards) {
            t += card.getvalue();
            if (card.rank === 'A') {
                a++;
            }
        };

        
        while (t > 21 && a > 0) {
            t -= 10;
            a--;
        }

        if (t > 17 && a > 0) {
            return t;
        }

        while (t > 21 && a > 0) {
            t -= 10;
            a--;
        }

        return t;
    }

    mapToPokerSolver(cardsArray) {
        const suitMap = {
        '❤': 'h', // hearts
        '♦': 'd', // diamonds
        '♣': 'c', // clubs
        '♠': 's'  // spades
        };
        const rankMap = {
            '10' : 'T'
        };

        
        return cardsArray.map(card => {
            
            const suitSymbol = card.suit; // last character
            const rankPart = card.rank; // everything except last character

            const newRank = rankMap[rankPart] || rankPart;
            const newSuit = suitMap[suitSymbol];

            return newRank + newSuit;
        });

    }

    solveHand(communityCards) {
        let totalHand = [...this.cards, ...communityCards.cards]

        let convertedHand = this.mapToPokerSolver(totalHand)

        return PokerHand.solve(convertedHand)
    }

    isBust() {
        return(this.getPlayerTotal() > 21)
    }

    toString() {
        let str = ""
        for (let card of this.cards) {
            str += card.toString() + ", ";
        }
        return str
    }

}