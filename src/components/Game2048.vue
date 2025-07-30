<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';

// --- Konfigurasi Game ---
const GRID_SIZE = 4;

// --- State Game ---
const board = ref([]);
const score = ref(0);
const isGameOver = ref(false);
const gameWon = ref(false);

// --- State Leaderboard ---
const leaderboard = ref([]);
const isLoading = ref(true);
const medals = ['🥇', '🥈', '🥉'];

// --- Fungsi Inisialisasi ---

function createEmptyBoard() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function startGame() {
  board.value = createEmptyBoard();
  score.value = 0;
  isGameOver.value = false;
  gameWon.value = false;
  addRandomTile();
  addRandomTile();
  fetchLeaderboard();
}

// --- Logika Game ---

function addRandomTile() {
  const emptyTiles = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board.value[r][c] === 0) {
        emptyTiles.push({ r, c });
      }
    }
  }
  if (emptyTiles.length > 0) {
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    board.value[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function slideAndCombine(row) {
  let filteredRow = row.filter(tile => tile !== 0);
  for (let i = 0; i < filteredRow.length - 1; i++) {
    if (filteredRow[i] === filteredRow[i + 1]) {
      filteredRow[i] *= 2;
      score.value += filteredRow[i];
      if (filteredRow[i] === 2048) gameWon.value = true;
      filteredRow[i + 1] = 0;
    }
  }
  let newRow = filteredRow.filter(tile => tile !== 0);
  while (newRow.length < GRID_SIZE) {
    newRow.push(0);
  }
  return newRow;
}

function rotateBoard(boardToRotate) {
  const newBoard = createEmptyBoard();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newBoard[r][c] = boardToRotate[GRID_SIZE - 1 - c][r];
    }
  }
  return newBoard;
}

function move(direction) {
  if (isGameOver.value) return;
  const originalBoard = JSON.stringify(board.value);
  let currentBoard = JSON.parse(JSON.stringify(board.value));

  if (direction === 'up') currentBoard = rotateBoard(currentBoard);
  if (direction === 'right') {
    currentBoard = rotateBoard(currentBoard);
    currentBoard = rotateBoard(currentBoard);
  }
  if (direction === 'down') {
    currentBoard = rotateBoard(currentBoard);
    currentBoard = rotateBoard(currentBoard);
    currentBoard = rotateBoard(currentBoard);
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    currentBoard[r] = slideAndCombine(currentBoard[r]);
  }

  if (direction === 'up') {
    currentBoard = rotateBoard(currentBoard);
    currentBoard = rotateBoard(currentBoard);
    currentBoard = rotateBoard(currentBoard);
  }
  if (direction === 'right') {
    currentBoard = rotateBoard(currentBoard);
    currentBoard = rotateBoard(currentBoard);
  }
  if (direction === 'down') currentBoard = rotateBoard(currentBoard);
  
  board.value = currentBoard;

  if (JSON.stringify(board.value) !== originalBoard) {
    addRandomTile();
    checkGameOver();
  }
}

function checkGameOver() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board.value[r][c] === 0) return;
      if (r < GRID_SIZE - 1 && board.value[r][c] === board.value[r + 1][c]) return;
      if (c < GRID_SIZE - 1 && board.value[r][c] === board.value[r][c + 1]) return;
    }
  }
  isGameOver.value = true;
  saveScore(); // Simpan skor saat game over
}

// --- Fungsi Leaderboard ---
async function saveScore() {
  if (score.value === 0) return;
  try {
    const playerName = prompt("Game Over! Masukkan nama Anda:", `Pemain-${Date.now().toString().slice(-4)}`);
    if (!playerName) return;
    
    await axios.post('https://api.sainzlab.site/api/scores', {
      player_name: playerName,
      game_name: '2048',
      score: score.value
    });
    fetchLeaderboard();
  } catch (error) { console.error("Gagal menyimpan skor:", error); }
}

async function fetchLeaderboard() {
  isLoading.value = true;
  try {
    const response = await axios.get('https://api.sainzlab.site/api/scores/2048');
    leaderboard.value = response.data;
  } catch (error) { console.error("Gagal mengambil leaderboard:", error); }
  finally { isLoading.value = false; }
}

// --- Kontrol Keyboard ---
function handleKeyDown(event) {
  if (isGameOver.value) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
  switch (event.key) {
    case 'ArrowUp': move('up'); break;
    case 'ArrowDown': move('down'); break;
    case 'ArrowLeft': move('left'); break;
    case 'ArrowRight': move('right'); break;
  }
}

onMounted(() => {
  startGame();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const tileColorClass = (value) => {
  if (value === 0) return 'tile-0';
  return `tile-${value > 2048 ? 'super' : value}`;
};
</script>

<template>
  <div class="card game-2048-card">
    <div class="game-main">
      <div class="header">
        <h1>2048</h1>
        <div class="score-container">
          <div class="score-box">
            <span class="label">SKOR</span>
            <span class="value">{{ score }}</span>
          </div>
        </div>
      </div>
      
      <div class="board-container">
        <div class="board">
          <div v-for="(row, r) in board" :key="r" class="board-row">
            <div v-for="(tile, c) in row" :key="c" class="tile-container">
              <div class="tile" :class="tileColorClass(tile)">
                {{ tile > 0 ? tile : '' }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="isGameOver || gameWon" class="overlay">
          <h2>{{ gameWon ? 'Anda Menang!' : 'Game Over!' }}</h2>
          <button @click="startGame" class="reset-button">Main Lagi</button>
        </div>
      </div>

      <div class="controls-info">Gunakan tombol panah untuk bermain.</div>

      <div class="mobile-controls">
        <div class="d-pad">
          <div class="d-pad-cell"></div>
          <button @click="move('up')" class="control-btn">↑</button>
          <div class="d-pad-cell"></div>
          <button @click="move('left')" class="control-btn">←</button>
          <div class="d-pad-cell center"></div>
          <button @click="move('right')" class="control-btn">→</button>
          <div class="d-pad-cell"></div>
          <button @click="move('down')" class="control-btn">↓</button>
          <div class="d-pad-cell"></div>
        </div>
      </div>
    </div>
    
    <div class="leaderboard-section">
      <h3>🏆 Leaderboard</h3>
      <div v-if="isLoading" class="loading-text">Memuat...</div>
      <ul v-else-if="leaderboard.length > 0" class="leaderboard-list">
        <li v-for="(item, index) in leaderboard" :key="item.id" class="leaderboard-item">
          <div class="player-info">
            <span class="rank">{{ medals[index] || `#${index + 1}` }}</span>
            <span class="player-name">{{ item.player_name }}</span>
          </div>
          <strong class="score-value">{{ item.score }}</strong>
        </li>
      </ul>
      <div v-else class="loading-text">Belum ada skor.</div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 450px;
  background: #faf8ef;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  font-family: 'Poppins', sans-serif;
  color: #776e65;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.game-main { flex: 1; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 2.8rem;
  font-weight: 900;
  color: #776e65;
}

.score-box {
  background-color: #bbada0;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  text-align: center;
  color: white;
}
.score-box .label { font-size: 0.8rem; font-weight: 600; }
.score-box .value { font-size: 1.8rem; font-weight: 700; }

.board-container {
  position: relative;
}

.board {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  gap: 15px;
  background: #bbada0;
  border-radius: 8px;
  padding: 15px;
  aspect-ratio: 1 / 1;
}

.board-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.tile-container {
  background: rgba(238, 228, 218, 0.35);
  border-radius: 4px;
}

.tile {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-radius: 4px;
  font-size: clamp(1.2rem, 5vw, 2.2rem);
}

.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  text-align: center;
}
.overlay h2 {
  font-size: clamp(2rem, 12vw, 3rem); 
  color: #776e65;
}
.reset-button {
  background: #8f7a66;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.controls-info {
  text-align: center;
  margin-top: 1.5rem;
  color: #776e65;
  font-weight: 600;
}

.mobile-controls {
  display: none;
  margin-top: 1.5rem;
}
.d-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  max-width: 240px;
  margin: 0 auto;
}
.control-btn {
  background-color: #cdc1b4;
  border: none;
  border-radius: 8px;
  font-size: 2rem;
  font-weight: bold;
  color: #776e65;
  width: 100%;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.control-btn:active {
  background-color: #bbada0;
}

.leaderboard-section { text-align: left; }
.leaderboard-section h3 { font-size: 1.5rem; font-weight: 600; margin-top: 0; margin-bottom: 1.5rem; text-align: center; color: #34495e; }
.leaderboard-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.leaderboard-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1rem; background: #f9fafb; border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06); border: 1px solid #f0f0f0;
}
.player-info { display: flex; align-items: center; gap: 0.75rem; }
.rank { font-size: 1rem; font-weight: 600; color: #7f8c8d; width: 35px; text-align: center; }
.player-name { font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
.score-value { font-weight: 700; font-size: 1.1rem; color: #3498db; }
.loading-text { font-size: 0.9rem; color: #7f8c8d; text-align: center; padding: 2rem 0; }

@media (max-width: 768px) {
  .controls-info { display: none; }
  .mobile-controls { display: block; }
}

@media (min-width: 900px) {
  .card {
    flex-direction: row;
    align-items: flex-start;
    max-width: 900px;
  }
  .leaderboard-section { flex-basis: 280px; flex-shrink: 0; }
}

/* Warna untuk setiap nilai tile */
.tile-0 { background-color: transparent; }
.tile-2 { background-color: #eee4da; color: #776e65; }
.tile-4 { background-color: #ede0c8; color: #776e65; }
.tile-8 { background-color: #f2b179; color: #f9f6f2; }
.tile-16 { background-color: #f59563; color: #f9f6f2; }
.tile-32 { background-color: #f67c5f; color: #f9f6f2; }
.tile-64 { background-color: #f65e3b; color: #f9f6f2; }
.tile-128 { background-color: #edcf72; color: #f9f6f2; }
.tile-256 { background-color: #edcc61; color: #f9f6f2; }
.tile-512 { background-color: #edc850; color: #f9f6f2; }
.tile-1024 { background-color: #edc53f; color: #f9f6f2; }
.tile-2048 { background-color: #edc22e; color: #f9f6f2; }
.tile-super { background-color: #3c3a32; color: #f9f6f2; }
</style>
