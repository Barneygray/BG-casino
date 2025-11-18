export class Player {
    name;
    hand;
    constructor() {
        this.money = 1000;
        this.moneyLeft = 1000;
        this.isStillActive = true;
        this.didSplit = false;
        this.isFolded = false;
        this.isSmallBlind = false;
        this.isBigBlind = false
        this.bet = 0;
        this.contributionMainPot = 0;
        this.contributionSidePot = 0;
    }

    win(bet) {
        this.moneyLeft += bet;
    }

    lose(bet) {
        this.moneyLeft -= bet;
    }

    makeBigBlind() {
        this.isBigBlind = true;
    }

    makeSmallBlind() {
        this.isSmallBlind = true;
    }
}