import { Hand } from './Hand.js'

export class PokerOpponent {
    money;
    name;
    id;
    constructor() {
        this.hand = new Hand()
        this.isStillActive = true;
        this.isSmallBlind = false;
        this.isBigBlind = false;
        // add api call for random name
    }
 
    preBet() {
        //pre-bet computer logic
    }

    checkCallOrRaise() {
        // check / call / raise logic
    }

    makeBigBlind() {
        this.isBigBlind = true;
    }

    makeSmallBlind() {
        this.isSmallBlind = true;
    }

}