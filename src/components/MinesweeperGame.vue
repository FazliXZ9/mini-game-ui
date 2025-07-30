<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios'; // Impor axios

// --- Konfigurasi Game ---
const ROWS = 10;
const COLS = 10;
const MINES = 15;

// --- State Game ---
const board = ref([]);
const isGameOver = ref(false);
const gameWon = ref(false);
const gameActive = ref(false);
const minesFlagged = ref(0);
const timer = ref(null);
const timeElapsed = ref(0);

// --- State Leaderboard ---
const leaderboard = ref([]);
const isLoading = ref(true);
const medals = ['🥇', '🥈', '🥉'];

// --- Fungsi Inisialisasi ---

function createBoard() {
  const newBoard = Array.from({ length: ROWS }, (_, r) => 
    Array.from({ length: COLS }, (_, c) => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
      row: r,
      col: c
    }))
  );
  board.value = newBoard;
}

function placeMines(firstClickRow, firstClickCol) {
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);
    
    if (!board.value[row][col].isMine && !(row === firstClickRow && col === firstClickCol)) {
      board.value[row][col].isMine = true;
      minesPlaced++;
    }
  }
}

function calculateAdjacentMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board.value[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board.value[nr][nc].isMine) {
              count++;
            }
          }
        }
        board.value[r][c].adjacentMines = count;
      }
    }
  }
}

// --- Fungsi Utama Game ---

function startGame() {
  createBoard();
  isGameOver.value = false;
  gameWon.value = false;
  gameActive.value = false;
  minesFlagged.value = 0;
  timeElapsed.value = 0;
  if (timer.value) clearInterval(timer.value);
  timer.value = null;
  fetchLeaderboard(); // Muat leaderboard setiap game baru dimulai
}

function handleLeftClick(cell) {
  if (isGameOver.value || cell.isRevealed || cell.isFlagged) return;

  if (!gameActive.value) {
    gameActive.value = true;
    placeMines(cell.row, cell.col);
    calculateAdjacentMines();
    timer.value = setInterval(() => timeElapsed.value++, 1000);
  }

  if (cell.isMine) {
    endGame(false);
    return;
  }

  revealCell(cell.row, cell.col);
  checkWinCondition();
}

function revealCell(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board.value[r][c].isRevealed) {
    return;
  }

  const cell = board.value[r][c];
  cell.isRevealed = true;

  if (cell.adjacentMines === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        revealCell(r + dr, c + dc);
      }
    }
  }
}

function handleRightClick(cell) {
  if (isGameOver.value || cell.isRevealed) return;
  
  cell.isFlagged = !cell.isFlagged;
  minesFlagged.value += cell.isFlagged ? 1 : -1;
}

function checkWinCondition() {
  const revealedCount = board.value.flat().filter(cell => cell.isRevealed).length;
  if (revealedCount === ROWS * COLS - MINES) {
    endGame(true);
  }
}

function endGame(won) {
  isGameOver.value = true;
  gameActive.value = false;
  gameWon.value = won;
  clearInterval(timer.value);

  if (won) {
    saveScore(); // Hanya simpan skor jika menang
  } else {
    board.value.flat().forEach(cell => {
      if (cell.isMine) cell.isRevealed = true;
    });
  }
}

// --- Fungsi Leaderboard ---
async function saveScore() {
  if (timeElapsed.value === 0) return;
  try {
    const playerName = prompt("Selamat! Masukkan nama Anda:", `Pemain-${Date.now().toString().slice(-4)}`);
    if (!playerName) return;
    
    await axios.post('https://api.sainzlab.site/api/scores', {
      player_name: playerName,
      game_name: 'Minesweeper',
      score: timeElapsed.value // Skor adalah waktu dalam detik (lebih kecil lebih baik)
    });
    fetchLeaderboard();
  } catch (error) {
    console.error("Gagal menyimpan skor:", error);
  }
}

async function fetchLeaderboard() {
  isLoading.value = true;
  try {
    const response = await axios.get('https://api.sainzlab.site/api/scores/Minesweeper');
    leaderboard.value = response.data; // Asumsi backend sudah mengurutkan (asc)
  } catch (error) {
    console.error("Gagal mengambil leaderboard:", error);
  } finally {
    isLoading.value = false;
  }
}


onMounted(startGame);
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});

const formattedTime = computed(() => {
  const minutes = Math.floor(timeElapsed.value / 60);
  const seconds = timeElapsed.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const adjacentMinesClass = (cell) => {
  return cell.adjacentMines > 0 ? `color-${cell.adjacentMines}` : '';
};
</script>

<template>
  <div class="card minesweeper-card">
    <div class="game-main">
      <h1>Minesweeper</h1>
      
      <div class="stats-container">
        <div class="stat-box">
          <span class="stat-label">Ranjau</span>
          <span class="stat-value">💣 {{ MINES - minesFlagged }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Waktu</span>
          <span class="stat-value">⏱️ {{ formattedTime }}</span>
        </div>
      </div>

      <div class="board">
        <div 
          v-for="(cell, index) in board.flat()" 
          :key="index"
          class="cell"
          :class="{ 
            revealed: cell.isRevealed, 
            flagged: cell.isFlagged,
            mine: cell.isRevealed && cell.isMine 
          }"
          @click="handleLeftClick(cell)"
          @contextmenu.prevent="handleRightClick(cell)"
        >
          <span v-if="cell.isRevealed && !cell.isMine && cell.adjacentMines > 0" :class="adjacentMinesClass(cell)">
            {{ cell.adjacentMines }}
          </span>
          <span v-if="cell.isRevealed && cell.isMine">💥</span>
          <span v-if="cell.isFlagged">🚩</span>
        </div>
      </div>

      <div class="status-message-container">
        <div class="status-message" :class="{ 'win': gameWon, 'loss': !gameWon, 'visible': isGameOver }">
          {{ gameWon ? 'Selamat, Anda Menang!' : 'Anda Kalah!' }}
        </div>
      </div>

      <button @click="startGame" class="reset-button">Mulai Ulang</button>
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
          <div class="score-info">
            <span class="score-value">{{ Math.floor(item.score / 60) }}:{{ String(item.score % 60).padStart(2, '0') }}</span>
            <span class="score-label">waktu</span>
          </div>
        </li>
      </ul>
      <div v-else class="loading-text">Belum ada skor.</div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 24px;
  padding: 1.5rem; /* PENYESUAIAN MOBILE: Mengurangi padding utama */
  text-align: center;
  border: 1px solid #e8e8e8;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  font-family: 'Poppins', sans-serif;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* PENYESUAIAN MOBILE: Mengurangi jarak antar bagian */
}

.game-main {
  width: 100%;
}

.leaderboard-section {
  width: 100%;
  text-align: left;
}
.leaderboard-section h3 {
  font-size: 1.3rem; /* PENYESUAIAN MOBILE: Ukuran font judul leaderboard */
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem; /* PENYESUAIAN MOBILE: Jarak bawah judul */
  text-align: center;
  color: #34495e;
}
.leaderboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* PENYESUAIAN MOBILE: Jarak antar item leaderboard */
}
.leaderboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.8rem; /* PENYESUAIAN MOBILE: Padding item leaderboard */
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}
.player-info { display: flex; align-items: center; gap: 0.75rem; }
.rank { font-size: 1rem; font-weight: 600; color: #7f8c8d; width: 35px; text-align: center; }
.player-name { font-weight: 600; color: #2c3e50; font-size: 0.85rem; } /* PENYESUAIAN MOBILE */
.score-info { text-align: right; }
.score-value { font-weight: 700; font-size: 1rem; color: #3498db; } /* PENYESUAIAN MOBILE */
.score-label { display: block; font-size: 0.7rem; color: #95a5a6; text-transform: uppercase; }
.loading-text { font-size: 0.9rem; color: #7f8c8d; text-align: center; padding: 2rem 0; }

h1 { 
  font-size: 1.8rem; /* PENYESUAIAN MOBILE: Mengurangi ukuran font judul utama */
  font-weight: 700; 
  margin-bottom: 1rem; 
}

.stats-container {
  display: flex;
  justify-content: space-around;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 1rem; /* PENYESUAIAN MOBILE: Mengurangi margin bawah */
}
.stat-box { display: flex; flex-direction: column; }
.stat-label { font-size: 0.75rem; color: #7f8c8d; font-weight: 600; } /* PENYESUAIAN MOBILE */
.stat-value { font-size: 1.3rem; font-weight: 700; color: #34495e; } /* PENYESUAIAN MOBILE */

.board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 2px; /* PENYESUAIAN MOBILE: Mengurangi jarak antar sel */
  background: #bdc3c7;
  padding: 4px; /* PENYESUAIAN MOBILE: Mengurangi padding papan */
  border-radius: 8px;
  margin-bottom: 0;
}

.cell {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #ecf0f1;
  border-radius: 3px; /* PENYESUAIAN MOBILE */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem; /* PENYESUAIAN MOBILE */
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
.cell:not(.revealed):hover { background: #dfe6e9; }
.cell.revealed { background: #dcdde1; cursor: default; }
.cell.flagged { font-size: 1rem; } /* PENYESUAIAN MOBILE */
.cell.mine { background-color: #e74c3c; font-size: 1.2rem; } /* PENYESUAIAN MOBILE */

.status-message-container {
  height: 40px; /* Beri tinggi tetap */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.75rem;
}
.status-message {
  font-size: 1.2rem; /* PENYESUAIAN MOBILE */
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.status-message.visible {
  opacity: 1;
}
.status-message.win { color: #27ae60; }
.status-message.loss { color: #c0392b; }

.reset-button {
  background: #34495e;
  border: none;
  color: white;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.25rem; /* PENYESUAIAN MOBILE: Beri sedikit jarak dari pesan status */
}

.color-1 { color: #3498db; }
.color-2 { color: #2ecc71; }
.color-3 { color: #e74c3c; }
.color-4 { color: #9b59b6; }
.color-5 { color: #f1c40f; }
.color-6 { color: #1abc9c; }
.color-7 { color: #34495e; }
.color-8 { color: #7f8c8d; }

/* Media Query untuk Desktop (Tidak diubah) */
@media (min-width: 800px) {
  .card {
    flex-direction: row;
    align-items: flex-start;
    max-width: 850px;
    padding: 2rem; /* Kembalikan padding untuk desktop */
    gap: 2rem; /* Kembalikan gap untuk desktop */
  }
  h1 {
    font-size: 2.2rem; /* Kembalikan ukuran font untuk desktop */
  }
   .stat-value {
    font-size: 1.5rem; /* Kembalikan ukuran font untuk desktop */
  }
  .game-main { flex: 1; }
  .leaderboard-section { flex-basis: 280px; flex-shrink: 0; }
}
</style>
