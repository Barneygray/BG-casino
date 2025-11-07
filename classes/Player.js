export class Player {
    name;
    bet;
    hand;
    constructor() {
        this.moneyLeft = 1000;
        this.isStillActive = true;
        this.didSplit = false;
        this.isFolded = false;
        this.isSmallBlind = false;
        this.isBigBlind = false
    }

    win(bet) {
        this.moneyLeft += bet;
    }

    lose(bet) {
        this.moneyLeft -= bet;
    }
}