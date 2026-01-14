/* ===============================
   SOUND SETUP (ADD ONCE ONLY)
================================ */
const clickSound = document.getElementById('clickSound');
const winSound   = document.getElementById('winSound');
const loseSound  = document.getElementById('loseSound');
const drawSound  = document.getElementById('drawSound');

// 🔓 Unlock audio on first user interaction (IMPORTANT)
document.body.addEventListener('click', () => {
    clickSound.play().catch(() => {});
}, { once: true });

const playSound = (sound) => {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
};

/* ===============================
   GAME ELEMENTS
================================ */
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const aiToggle = document.getElementById('aiToggle');
const labelPvp = document.getElementById('label-pvp');
const labelAi = document.getElementById('label-ai');

/* ===============================
   GAME STATE
================================ */
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let isVsAI = true;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

/* ===============================
   STATUS UPDATE
================================ */
const updateStatus = () => {
    if (!gameActive) return;

    const color =
        currentPlayer === 'X'
            ? 'var(--primary-purple)'
            : 'var(--primary-cyan)';

    if (isVsAI && currentPlayer === 'O') {
        statusText.innerHTML = `Computer is thinking...`;
    } else {
        statusText.innerHTML =
            `Player <span style="color:${color}">${currentPlayer}</span>'s Turn`;
    }
};

/* ===============================
   CELL CLICK
================================ */
const handleCellClick = (e) => {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (
        gameState[clickedCellIndex] !== "" ||
        !gameActive ||
        (isVsAI && currentPlayer === 'O')
    ) {
        return;
    }

    // ✅ CLICK SOUND
    playSound(clickSound);

    handleCellPlayed(clickedCell, clickedCellIndex);

    if (handleResultValidation()) return;

    if (isVsAI && gameActive) {
        setTimeout(makeComputerMove, 500);
    }
};

/* ===============================
   PLAY MOVE
================================ */
const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase(), 'pop-in');
};

/* ===============================
   CHECK WIN / DRAW
================================ */
const handleResultValidation = () => {
    let roundWon = false;
    let winningIndices = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];

        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            winningIndices = winningConditions[i];
            break;
        }
    }

    if (roundWon) {
        const color =
            currentPlayer === 'X'
                ? 'var(--primary-purple)'
                : 'var(--primary-cyan)';

        const winnerName =
            isVsAI && currentPlayer === 'O'
                ? 'Computer'
                : `Player ${currentPlayer}`;

        statusText.innerHTML =
            `<span style="color:${color}">${winnerName}</span> Wins!`;

        winningIndices.forEach(i => cells[i].classList.add('win'));

        // ✅ WIN / LOSE SOUND
        playSound(isVsAI && currentPlayer === 'O' ? loseSound : winSound);

        gameActive = false;
        return true;
    }

    if (!gameState.includes("")) {
        statusText.innerHTML = `Game Draw!`;

        // ✅ DRAW SOUND
        playSound(drawSound);

        gameActive = false;
        return true;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
    return false;
};

/* ===============================
   RESTART GAME
================================ */
const handleRestartGame = () => {
    // ✅ CLICK SOUND
    playSound(clickSound);

    gameActive = true;
    currentPlayer = 'X';
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusText.style.color = "#ddd";
    updateStatus();

    cells.forEach(cell => {
        cell.innerText = "";
        cell.className = "cell";
    });
};

/* ===============================
   AI LOGIC
================================ */
const makeComputerMove = () => {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    const cell = document.querySelector(`.cell[data-index='${move}']`);
    handleCellPlayed(cell, move);
    handleResultValidation();
};

const scores = { X: -10, O: 10, tie: 0 };

const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner();
    if (result !== null) return scores[result];

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = '';
            }
        }
        return best;
    }
};

const checkWinner = () => {
    for (let [a, b, c] of winningConditions) {
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    if (!gameState.includes("")) return 'tie';
    return null;
};

/* ===============================
   EVENTS
================================ */
aiToggle.addEventListener('change', () => {
    isVsAI = aiToggle.checked;
    labelAi.classList.toggle('active', isVsAI);
    labelPvp.classList.toggle('active', !isVsAI);
    handleRestartGame();
});

labelPvp.addEventListener('click', () => {
    aiToggle.checked = false;
    aiToggle.dispatchEvent(new Event('change'));
});

labelAi.addEventListener('click', () => {
    aiToggle.checked = true;
    aiToggle.dispatchEvent(new Event('change'));
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', handleRestartGame);
