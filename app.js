const cards = [];
const names = ['Asso', 'Due', 'Tre', 'Quattro', 'Cinque', 'Sei', 'Sette', 'Fante', 'Cavallo', 'Re'];
const suits = ['Coppe', 'Denara', 'Spade', 'Bastoni'];
const base_path = 'assets/cards/';
const values = [11, 0, 10, 0, 0, 0, 0, 2, 3, 4];
let isPlayerTurn = true;
let firstCardPlayed = null;

// Create deck
for (let i = 1; i < 11; i++) {
    for (let j = 0; j < 4; j++) {
        cards.push({
            name: names[i - 1],
            suit: suits[j],
            value: values[i - 1],
            image: base_path + suits[j].toLowerCase() + i + '.png'
        });
    }
}

let playerHand = [];
let opponentHand = [];
let briscolaCard = null;
let briscolaSuit = '';
let playerScore = 0;
let opponentScore = 0;

// Rules popup functionality
const rulesBtn = document.getElementById('rules-btn');
const rulesPopup = document.getElementById('rules-popup');
const closeBtn = document.querySelector('.close-btn');

rulesBtn.addEventListener('click', () => {
    rulesPopup.classList.add('show');
});

closeBtn.addEventListener('click', () => {
    rulesPopup.classList.remove('show');
});

rulesPopup.addEventListener('click', (e) => {
    if (e.target === rulesPopup) {
        rulesPopup.classList.remove('show');
    }
});

function startGame() {
    shuffleDeck();
    dealCards();
    briscolaCard = drawBriscolaCard();
    briscolaSuit = briscolaCard.suit;
    isPlayerTurn = true;
    firstCardPlayed = null;
    updateUI();
}

function handleCardClick(index) {
    if (!isPlayerTurn) return;
    
    const playerCard = playerHand.splice(index, 1)[0];
    
    if (!firstCardPlayed) {
        // Player plays first
        updatePlayedCards(playerCard, null);
        updateUI();
        isPlayerTurn = false;
        
        // Opponent responds
        setTimeout(() => {
            const opponentCard = opponentPlaysCard();
            updatePlayedCards(playerCard, opponentCard);
            updateUI();

            setTimeout(() => {
                resolveRound(playerCard, opponentCard);
            }, 1000);
        }, 1000);
    } else {
        // Player responds to opponent's card
        const opponentCard = firstCardPlayed;
        firstCardPlayed = null;
        updatePlayedCards(playerCard, opponentCard);
        updateUI();

        setTimeout(() => {
            resolveRound(playerCard, opponentCard);
        }, 1000);
    }
}

function opponentPlaysCard() {
    if (opponentHand.length === 0) {
        console.error("Opponent has no cards left!");
        return null;
    }
    return opponentHand.shift();
}

function resolveRound(playerCard, opponentCard) {
    if (!playerCard || !opponentCard) {
        console.error("Error: Missing card in resolveRound!");
        return;
    }

    const winner = determineWinner(playerCard, opponentCard);
    allocatePoints(winner, playerCard, opponentCard);
    updateScores();
    console.log(`Round winner: ${winner}`);

    // Deal new cards
    if (cards.length > 0) {
        if (winner === 'player') {
            playerHand.push(cards.pop());
            if (cards.length > 0) opponentHand.push(cards.pop());
        } else {
            opponentHand.push(cards.pop());
            if (cards.length > 0) playerHand.push(cards.pop());
        }
    }

    // Clear played cards
    updatePlayedCards(null, null);
    
    if (playerHand.length === 0 && cards.length === 0) {
        endGame();
        return;
    }

    // Set up next turn based on winner
    if (winner === 'opponent') {
        // Opponent won, they play first next round
        isPlayerTurn = false;
        firstCardPlayed = null;
        
        setTimeout(() => {
            const opponentCard = opponentPlaysCard();
            firstCardPlayed = opponentCard; // Store opponent's card
            updatePlayedCards(null, opponentCard);
            isPlayerTurn = true; // Now player can respond
            updateUI();
        }, 1000);
    } else {
        // Player won, they play first next round
        isPlayerTurn = true;
        firstCardPlayed = null;
    }
    
    updateUI();
}

function updateUI() {
    const playerHandDiv = document.getElementById('player-hand');
    const opponentHandDiv = document.getElementById('opponent-hand');
    const briscolaCardDiv = document.getElementById('briscola-card');

    playerHandDiv.innerHTML = '';
    opponentHandDiv.innerHTML = '';
    briscolaCardDiv.innerHTML = '';

    // Display player's hand
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.backgroundImage = `url(${card.image})`;
        
        if (isPlayerTurn) {
            cardElement.addEventListener('click', () => handleCardClick(index));
            cardElement.style.cursor = 'pointer';
        }

        playerHandDiv.appendChild(cardElement);
    });

    // Display opponent's hand
    opponentHand.forEach(() => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.backgroundImage = `url('assets/cards/back.png')`;
        opponentHandDiv.appendChild(cardElement);
    });

    // Display briscola card
    if (briscolaCard) {
        const briscolaElement = document.createElement('div');
        briscolaElement.className = 'card';
        briscolaElement.style.backgroundImage = `url(${briscolaCard.image})`;
        briscolaCardDiv.appendChild(briscolaElement);
    }
}

function determineWinner(playerCard, opponentCard) {
    if (playerCard.suit === briscolaSuit && opponentCard.suit === briscolaSuit) {
        return playerCard.value > opponentCard.value ? 'player' : 'opponent';
    }
    if (playerCard.suit === briscolaSuit) return 'player';
    if (opponentCard.suit === briscolaSuit) return 'opponent';
    if (playerCard.suit === opponentCard.suit) {
        return playerCard.value > opponentCard.value ? 'player' : 'opponent';
    }
    return firstCardPlayed ? 'opponent' : 'player'; // First player wins if suits are different
}

function allocatePoints(winner, playerCard, opponentCard) {
    const totalPoints = playerCard.value + opponentCard.value;
    if (winner === 'player') {
        playerScore += totalPoints;
    } else {
        opponentScore += totalPoints;
    }
}

function updatePlayedCards(playerCard, opponentCard) {
    const playerPlayedDiv = document.getElementById('player-played');
    const opponentPlayedDiv = document.getElementById('opponent-played');

    playerPlayedDiv.innerHTML = '';
    opponentPlayedDiv.innerHTML = '';

    if (playerCard) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.backgroundImage = `url(${playerCard.image})`;
        playerPlayedDiv.appendChild(cardElement);
    }

    if (opponentCard) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.backgroundImage = `url(${opponentCard.image})`;
        opponentPlayedDiv.appendChild(cardElement);
    }
}

function updateScores() {
    document.getElementById('player-score').textContent = 'Your score: ' + playerScore;
    document.getElementById('opponent-score').textContent = "Opponent's score: " + opponentScore;
}

function endGame() {
    const winner = playerScore > opponentScore ? 'Player' : 'Opponent';
    alert(`${winner} wins! Final Score: Player ${playerScore}, Opponent ${opponentScore}`);
}

function shuffleDeck() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

function dealCards() {
    playerHand = cards.slice(0, 3);
    opponentHand = cards.slice(3, 6);
    cards.splice(0, 6);
}

function drawBriscolaCard() {
    return cards.pop();
}

document.addEventListener('DOMContentLoaded', startGame);