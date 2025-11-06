export class Hand {
    constructor() {
        this.cards = [];
    }

    createMovingCard(newCardDiv) {
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

        return movingCard, cardBack, deckRect
    }
    cardAnimation(newCardDiv, playerID, handNumber) {

        let movingCard, cardBack, deckRect = this.createMovingCard(newCardDiv)

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

    moveCard(handDiv, movingCard, deckRect, isPlayer=false) {
        const handRect = handDiv.getBoundingClientRect();
        const handRectCenter = handRect.left + handRect.width / 2
        if (isPlayer) {
            movingCard.style.transform = `translate(${handRect.left - deckRect.left + 50}px, ${handRect.top - deckRect.top+ 100}px)`;
        } else {
            movingCard.style.transform = `translate(${handRectCenter - deckRect.left}px, ${handRect.top - deckRect.top}px)`;
        }
    }


    addCardHTML(card, playerID, hand) {
        const newCardDiv = document.createElement('div')
        newCardDiv.classList.add('card')
        if (['♣', '♠'].includes(card.suit)) {
            newCardDiv.classList.add('black-card')
        } else {
            newCardDiv.classList.add('red-card')
        }
        newCardDiv.id = card.toString()

        const cardText1 = document.createElement('p')
        cardText1.textContent = card.toString()
        cardText1.className = "top-left"
        newCardDiv.appendChild(cardText1)
        
        const cardText2 = document.createElement('p')
        cardText2.textContent = card.toString()
        cardText2.className = "bottom-right"
        newCardDiv.appendChild(cardText2)

        const cardImg = document.createElement('img')
        cardImg.src = 'Ernst-Young-Logo.png'
        cardImg.className = 'card-image'
        newCardDiv.appendChild(cardImg)

        this.cardAnimation(newCardDiv, playerID, hand)
    }

    async addCard(card, playerID, hand) {
        this.cards.push(card)
        
        this.addCardHTML(card, playerID, hand)
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