<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios'; // Pastikan axios terinstal

// --- Konfigurasi Game ---
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOES = {
  'I': { shape: [[1, 1, 1, 1]], color: 'cyan' },
  'L': { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' },
  'J': { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
  'O': { shape: [[1, 1], [1, 1]], color: 'yellow' },
  'S': { shape: [[0, 1, 1], [1, 1, 0]], color: 'lime' },
  'T': { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
  'Z': { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }
};
const TETROMINO_KEYS = Object.keys(TETROMINOES);

// --- State Game ---
const board = ref([]);
const currentPiece = ref(null);
const nextPiece = ref(null);
const currentPosition = ref({ x: 0, y: 0 });
const score = ref(0);
const gameOver = ref(false);
const gameStarted = ref(false);
const gameInterval = ref(null);

// --- State Leaderboard ---
const leaderboard = ref([]);
const isLoading = ref(true);

// --- Fungsi Utama Game ---
function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill({ value: 0, color: null }));
}

function getRandomPiece() {
  const randomKey = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  return TETROMINOES[randomKey];
}

function startGame() {
  board.value = createEmptyBoard();
  score.value = 0;
  gameOver.value = false;
  gameStarted.value = true;
  
  nextPiece.value = getRandomPiece();
  spawnNewPiece();
  
  if (gameInterval.value) clearInterval(gameInterval.value);
  gameInterval.value = setInterval(moveDown, 800);
}

function spawnNewPiece() {
  currentPiece.value = nextPiece.value;
  nextPiece.value = getRandomPiece();

  currentPosition.value = { 
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.value.shape[0].length / 2),
    y: 0 
  };
  
  if (checkCollision(currentPiece.value.shape, currentPosition.value)) {
    gameOver.value = true;
    gameStarted.value = false;
    clearInterval(gameInterval.value);
    saveScore();
  }
}

function moveDown() {
  if (gameOver.value || !gameStarted.value) return;
  const newPosition = { ...currentPosition.value, y: currentPosition.value.y + 1 };
  if (!checkCollision(currentPiece.value.shape, newPosition)) {
    currentPosition.value = newPosition;
  } else {
    mergePiece();
    clearLines();
    spawnNewPiece();
  }
}

function mergePiece() {
  currentPiece.value.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardX = currentPosition.value.x + x;
        const boardY = currentPosition.value.y + y;
        if (board.value[boardY]) {
          board.value[boardY][boardX] = { value: 1, color: currentPiece.value.color };
        }
      }
    });
  });
  score.value += 5;
}

function clearLines() {
  let linesCleared = 0;
  const scorePoints = [0, 40, 100, 300, 1200];

  board.value = board.value.filter(row => {
    if (row.every(cell => cell.value === 1)) {
      linesCleared++;
      return false;
    }
    return true;
  });

  for (let i = 0; i < linesCleared; i++) {
    board.value.unshift(Array(BOARD_WIDTH).fill({ value: 0, color: null }));
  }
  
  if (linesCleared > 0) {
    score.value += scorePoints[linesCleared];
  }
}

function checkCollision(pieceShape, piecePosition) {
  for (let y = 0; y < pieceShape.length; y++) {
    for (let x = 0; x < pieceShape[y].length; x++) {
      if (pieceShape[y][x] !== 0) {
        const boardX = piecePosition.x + x;
        const boardY = piecePosition.y + y;
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return true;
        }
        if (board.value[boardY] && board.value[boardY][boardX] && board.value[boardY][boardX].value !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

function moveHorizontal(direction) {
  if (gameOver.value || !gameStarted.value) return;
  const newPosition = { ...currentPosition.value, x: currentPosition.value.x + direction };
  if (!checkCollision(currentPiece.value.shape, newPosition)) {
    currentPosition.value = newPosition;
  }
}

function rotate() {
  if (gameOver.value || !gameStarted.value) return;
  const shape = currentPiece.value.shape;
  const newShape = shape[0].map((_, colIndex) => shape.map(row => row[colIndex]).reverse());
  const tempPosition = { ...currentPosition.value };
  if (checkCollision(newShape, tempPosition)) {
      tempPosition.x -= 1;
      if (checkCollision(newShape, tempPosition)) {
          tempPosition.x += 2;
          if (checkCollision(newShape, tempPosition)) {
              return;
          }
      }
  }
  currentPiece.value.shape = newShape;
  currentPosition.value = tempPosition;
}

// --- Fungsi Leaderboard ---
async function saveScore() {
  if (score.value === 0) return;
  try {
    const playerName = prompt("Game Over! Masukkan nama Anda untuk leaderboard:", `Player-${Date.now().toString().slice(-4)}`);
    if (!playerName) return;
    
    await axios.post('http://192.168.8.207/api/scores', {
      player_name: playerName,
      game_name: 'Tetris',
      score: score.value
    });
    fetchLeaderboard();
  } catch (error) {
    console.error("Gagal menyimpan skor:", error);
    alert("Gagal menyimpan skor. Cek koneksi ke server API.");
  }
}

async function fetchLeaderboard() {
  isLoading.value = true;
  try {
    const response = await axios.get('http://192.168.8.207/api/scores');
    leaderboard.value = response.data
      .filter(s => s.game_name === 'Tetris')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  } catch (error) {
    console.error("Gagal mengambil leaderboard:", error);
  } finally {
    isLoading.value = false;
  }
}

// --- Kontrol Keyboard & Lifecycle ---
function handleKeyDown(event) {
  // Mencegah aksi default browser (seperti scrolling)
  event.preventDefault(); 

  if (!gameStarted.value) return;
  switch (event.key) {
    case 'ArrowLeft': moveHorizontal(-1); break;
    case 'ArrowRight': moveHorizontal(1); break;
    case 'ArrowDown': moveDown(); break;
    case 'ArrowUp': rotate(); break;
  }
}

onMounted(() => {
  board.value = createEmptyBoard();
  window.addEventListener('keydown', handleKeyDown);
  fetchLeaderboard();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (gameInterval.value) clearInterval(gameInterval.value);
});

// --- Computed Properties untuk Rendering ---
const renderedBoard = computed(() => {
  const newBoard = JSON.parse(JSON.stringify(board.value));
  if (currentPiece.value && !gameOver.value) {
    currentPiece.value.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = currentPosition.value.y + y;
          const boardX = currentPosition.value.x + x;
          if (newBoard[boardY]) {
            newBoard[boardY][boardX] = { value: 1, color: currentPiece.value.color };
          }
        }
      });
    });
  }
  return newBoard;
});

const nextPieceBoard = computed(() => {
  const grid = Array.from({ length: 4 }, () => Array(4).fill({ value: 0, color: null }));
  if (nextPiece.value) {
    const shape = nextPiece.value.shape;
    const yOffset = Math.floor((4 - shape.length) / 2);
    const xOffset = Math.floor((4 - shape[0].length) / 2);
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          grid[y + yOffset][x + xOffset] = { value: 1, color: nextPiece.value.color };
        }
      });
    });
  }
  return grid;
});
</script>

<template>
  <div class="tetris-container">
    <div class="tetris-card">
      <div class="game-area">
        <h1 class="title">Tetris</h1>
        <div class="board-container">
          <div class="board">
            <div v-for="(row, y) in renderedBoard" :key="`row-${y}`" class="row">
              <div 
                v-for="(cell, x) in row" 
                :key="`cell-${y}-${x}`" 
                class="cell"
                :class="`color-${cell.color}`"
                :data-filled="cell.value === 1"
              ></div>
            </div>
          </div>
          <div v-if="!gameStarted" class="overlay">
            <h2 v-if="gameOver">Game Over</h2>
            <button @click="startGame" class="action-button">
              {{ gameOver ? 'Main Lagi' : 'Mulai Bermain' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="info-area">
        <div class="info-box mobile-controls">
           <h3>KONTROL MOBILE</h3>
           <div class="d-pad-row">
             <button @click="moveHorizontal(-1)" class="mobile-btn">←</button>
             <button @click="moveDown()" class="mobile-btn">↓</button>
             <button @click="moveHorizontal(1)" class="mobile-btn">→</button>
           </div>
           <div class="d-pad-row">
             <button @click="rotate()" class="mobile-btn rotate-btn">↻ Rotasi</button>
           </div>
        </div>
        
        <div class="info-box score-box">
          <h3>SKOR</h3>
          <p>{{ score }}</p>
        </div>
        
        <div class="info-box next-piece-box">
          <h3>BERIKUTNYA</h3>
          <div class="next-piece-grid">
             <div v-for="(row, y) in nextPieceBoard" :key="`next-row-${y}`" class="row">
                <div 
                  v-for="(cell, x) in row" 
                  :key="`next-cell-${y}-${x}`" 
                  class="cell"
                  :class="`color-${cell.color}`"
                  :data-filled="cell.value === 1"
                ></div>
              </div>
          </div>
        </div>

        <div class="info-box leaderboard-box">
          <h3>🏆 LEADERBOARD</h3>
          <div v-if="isLoading" class="loading-text">Memuat...</div>
          <ul v-else-if="leaderboard.length > 0">
            <li v-for="(item, index) in leaderboard" :key="item.id">
              <span>#{{ index + 1 }} {{ item.player_name }}</span>
              <strong>{{ item.score }}</strong>
            </li>
          </ul>
          <div v-else class="loading-text">Belum ada data.</div>
        </div>
        
        <div class="info-box desktop-controls">
         <h3>KONTROL MOBILE</h3>
           <div class="d-pad-row">
             <button @click="moveHorizontal(-1)" class="mobile-btn">←</button>
             <button @click="moveDown()" class="mobile-btn">↓</button>
             <button @click="moveHorizontal(1)" class="mobile-btn">→</button>
           </div>
           <div class="d-pad-row">
             <button @click="rotate()" class="mobile-btn rotate-btn">↻ Rotasi</button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Global styles for background and font */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

:root {
  --bg-color: #1a1a2e;
  --card-bg: rgba(22, 22, 40, 0.75);
  --board-bg: #161625;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0c0;
  --accent-color: #6a82fb;
  --border-color: rgba(128, 128, 150, 0.3);

  /* Tetromino Colors */
  --color-null: transparent;
  --color-cyan: #00e5ff;
  --color-blue: #2979ff;
  --color-orange: #ff9100;
  --color-yellow: #ffea00;
  --color-lime: #00e676;
  --color-purple: #d500f9;
  --color-red: #ff1744;
}

body {
  background: linear-gradient(45deg, #1a1a2e, #16213e, #0f3460);
  color: var(--text-primary);
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 2rem;
  display: grid;
  place-items: center;
  min-height: 100vh;

}
</style>

<style scoped>
/* === STYLE PENENGAHAN === */
.tetris-container {
  display: grid;
  place-items: center;
  width: 100%;
}

/* === Main Card Layout === */
.tetris-card {
  display: flex;
  gap: 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  width: 100%;
  max-width: 850px; /* Sedikit lebih lebar untuk PC */
}

.game-area {
  flex: 2;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.info-area {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* === Title === */
.title {
  font-size: 2.8rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 0 10px var(--accent-color);
  text-align: center;
}

/* === Game Board === */
.board-container {
  position: relative;
  width: 100%;
  max-width: 300px; /* Lebar board = 10 * 30px */
  aspect-ratio: 10 / 20;
}
.board {
  display: grid;
  grid-template-rows: repeat(20, 1fr);
  background: var(--board-bg);
  border: 3px solid var(--border-color);
  border-radius: 8px;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
  overflow: hidden;
  height: 100%;
}
.row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  width: 100%;
}
.cell {
  width: 100%;
  height: 100%;
  background-color: var(--color-null);
  transition: background-color 0.1s;
}
.cell[data-filled="true"] {
  border-radius: 3px;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* === Overlay === */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 25, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.overlay h2 {
  font-size: 2rem;
  color: white;
  margin-bottom: 1rem;
}
.action-button {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(106, 130, 251, 0.4);
}

/* === Info Boxes === */
.info-box {
  background: var(--board-bg);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
}
.info-box h3 {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}
.info-box p {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1;
}

/* Next Piece Box */
.next-piece-grid {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  width: 80px; /* 4 * 20px */
  height: 80px;
  margin: 0.5rem auto 0;
}
.next-piece-grid .row {
  grid-template-columns: repeat(4, 1fr);
}

/* Leaderboard Box */
.leaderboard-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.95rem;
}
.leaderboard-box li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-color);
}
.leaderboard-box li:last-child { border-bottom: none; }
.leaderboard-box span { color: var(--text-primary); }
.leaderboard-box strong { color: var(--accent-color); font-weight: 700; }
.loading-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 1rem 0;
}

/* === Kontrol Spesifik Perangkat (Desktop & Mobile) === */

/* Kontrol Mobile (Default disembunyikan) */
.mobile-controls {
  display: none; /* Sembunyikan di PC */
  text-align: center;
}
.d-pad-row {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.d-pad-row:last-child { margin-bottom: 0; }
.mobile-btn {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 1.5rem;
  width: 60px; /* Sedikit lebih besar agar mudah disentuh */
  height: 60px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background-color 0.2s;
  -webkit-tap-highlight-color: transparent; /* Hilangkan highlight biru saat disentuh */
}
.mobile-btn:active { background-color: var(--accent-color); }
.rotate-btn {
  width: 100%;
  max-width: 200px;
  font-size: 1.2rem;
}

/* Kontrol PC (Default ditampilkan) */
.desktop-controls {
  text-align: center;
}
.controls-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0.5rem 0 0 0;
}
.controls-text strong {
  color: var(--text-primary);
  background: rgba(255,255,255,0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}


/* === MEDIA QUERY UNTUK RESPONSIVE === */
/* Terapkan gaya ini jika lebar layar 768px atau kurang (Tablet & Mobile) */
@media (max-width: 768px) {
  body {
    padding: 1rem; /* Kurangi padding body di mobile */
  }
  .tetris-card {
    flex-direction: column; /* Susun area game & info secara vertikal */
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2.2rem; /* Kecilkan judul */
    margin-bottom: 1rem;
  }

  /* Tukar visibilitas kontrol */
  .desktop-controls {
    display: none; /* Sembunyikan info kontrol PC */
  }
  .mobile-controls {
    display: block; /* Tampilkan tombol kontrol mobile */
  }
  
  .game-area, .info-area {
    min-width: 100%; /* Pastikan mengisi lebar card */
  }
}

/* Gaya untuk layar mobile yang sangat kecil */
@media (max-width: 360px) {
  .tetris-card {
    padding: 1rem;
  }
  .title {
    font-size: 1.8rem;
  }
}


/* Cell Colors (using CSS variables) */
.color-cyan    { background-color: var(--color-cyan); }
.color-blue    { background-color: var(--color-blue); }
.color-orange  { background-color: var(--color-orange); }
.color-yellow  { background-color: var(--color-yellow); }
.color-lime    { background-color: var(--color-lime); }
.color-purple  { background-color: var(--color-purple); }
.color-red     { background-color: var(--color-red); }
</style>