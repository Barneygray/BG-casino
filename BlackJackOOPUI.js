const dealerHandDiv = document.querySelector('.dealers-hand')
const playersDiv = document.querySelector('.players-hands')
const actionPromptBox = document.querySelector('.action-prompt-box')
const deckHTML = document.querySelector('.deck')
const DEALER_HAND = "dealers-hand"
const DEALER_HAND_BACK = "dealers-hand-back"

import { Card } from '.classes/Card.js'

import { Deck } from '.classes/Deck.js'

import { Hand } from '.classes/Hand.js'

import { Player } from '.classes/Player.js'

import { Game } from '.classes/Game.js'


const game = new Game();
game.start()