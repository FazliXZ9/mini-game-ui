<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';

const SIZE = 3;
const tiles = ref([]);
const emptyTile = ref({ row: 0, col: 0 });
const moves = ref(0);
const isSolved = ref(false);
const timeElapsed = ref(0);
const timer = ref(null);
const gameActive = ref(false);

const leaderboard = ref([]);
const isLoading = ref(true);
const medals = ['🥇', '🥈', '🥉']; 

function createSolvedBoard() {
  const newTiles = [];
  let count = 1;
  for (let i = 0; i < SIZE; i++) {
    newTiles[i] = [];
    for (let j = 0; j < SIZE; j++) {
      newTiles[i][j] = count++;
    }
  }
  newTiles[SIZE - 1][SIZE - 1] = null;
  return newTiles;
}

function shuffleBoard() {
  let board = createSolvedBoard();
  let empty = { row: SIZE - 1, col: SIZE - 1 };

  for (let i = 0; i < 1000; i++) {
    const neighbors = [];
    if (empty.row > 0) neighbors.push({ row: empty.row - 1, col: empty.col });
    if (empty.row < SIZE - 1) neighbors.push({ row: empty.row + 1, col: empty.col });
    if (empty.col > 0) neighbors.push({ row: empty.row, col: empty.col - 1 });
    if (empty.col < SIZE - 1) neighbors.push({ row: empty.row, col: empty.col + 1 });
    
    const randomMove = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    board[empty.row][empty.col] = board[randomMove.row][randomMove.col];
    board[randomMove.row][randomMove.col] = null;
    empty = randomMove;
  }

  tiles.value = board;
  emptyTile.value = empty;
}

function startGame() {
  shuffleBoard();
  moves.value = 0;
  isSolved.value = false;
  gameActive.value = false;
  
  timeElapsed.value = 0;
  if (timer.value) clearInterval(timer.value);
  timer.value = null;
}

async function saveScore() {
  if (timeElapsed.value === 0) return;
  try {
    const playerName = prompt("Puzzle Selesai! Masukkan nama Anda:", `Pemain-${Date.now().toString().slice(-4)}`);
    if (!playerName) return;
    
    await axios.post('https://api.sainzlab.site/api/scores', {
      player_name: playerName,
      game_name: 'Puzzle Geser',
      score: timeElapsed.value
    });
    fetchLeaderboard();
  } catch (error) {
    console.error("Gagal menyimpan skor:", error);
  }
}

async function fetchLeaderboard() {
  isLoading.value = true;
  try {
    const response = await axios.get('https://api.sainzlab.site/api/scores/Puzzle Geser');
    // PERBAIKAN: Urutkan data dari skor terendah ke tertinggi
    leaderboard.value = response.data.sort((a, b) => a.score - b.score);
  } catch (error) {
    console.error("Gagal mengambil leaderboard:", error);
  } finally {
    isLoading.value = false;
  }
}

function checkWin() {
  const solvedBoard = createSolvedBoard();
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (tiles.value[i][j] !== solvedBoard[i][j]) {
        return false;
      }
    }
  }
  isSolved.value = true;
  gameActive.value = false;
  clearInterval(timer.value);
  saveScore();
  return true;
}

function handleTileClick(row, col) {
  if (isSolved.value) return;

  if (!gameActive.value) {
    gameActive.value = true;
    timer.value = setInterval(() => {
      timeElapsed.value++;
    }, 1000);
  }

  const dx = Math.abs(row - emptyTile.value.row);
  const dy = Math.abs(col - emptyTile.value.col);

  if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
    tiles.value[emptyTile.value.row][emptyTile.value.col] = tiles.value[row][col];
    tiles.value[row][col] = null;
    emptyTile.value = { row, col };
    moves.value++;
    checkWin();
  }
}

onMounted(() => {
  startGame();
  fetchLeaderboard();
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});

const formattedTime = computed(() => {
  const minutes = Math.floor(timeElapsed.value / 60);
  const seconds = timeElapsed.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});
</script>

<template>
  <div class="card puzzle-card">
    <div class="puzzle-main">
      <h1>Puzzle Geser</h1>
      
      <div class="stats-container">
        <div class="stat-box">
          <span class="stat-label">Langkah</span>
          <span class="stat-value">{{ moves }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Waktu</span>
          <span class="stat-value">{{ formattedTime }}</span>
        </div>
      </div>
      
      <p v-if="isSolved" class="status solved">Selesai!</p>

      <div class="board">
        <div v-for="(row, rowIndex) in tiles" :key="rowIndex" class="puzzle-row">
          <div 
            v-for="(tile, colIndex) in row" 
            :key="colIndex"
            class="tile"
            :class="{ 'empty': tile === null }"
            @click="handleTileClick(rowIndex, colIndex)"
          >
            {{ tile }}
          </div>
        </div>
      </div>

      <button @click="startGame" class="reset-button">Acak Ulang</button>
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
  max-width: 420px; /* Max-width untuk mobile */
  background: #ffffff;
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  border: 1px solid #e8e8e8;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  font-family: 'Poppins', sans-serif;
  color: #2c3e50;
  display: flex;
  flex-direction: column; /* Susun vertikal di mobile */
  gap: 2rem;
}

.puzzle-main {
  width: 100%;
}

.leaderboard-section {
  width: 100%;
  text-align: left;
}
.leaderboard-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #34495e;
}
.leaderboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* Jarak antar kartu */
}
.leaderboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.leaderboard-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}
.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.rank {
  font-size: 1rem;
  font-weight: 600;
  color: #7f8c8d;
  width: 35px;
  text-align: center;
}
.player-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}
.score-info {
  text-align: right;
}
.score-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: #3498db;
}
.score-label {
  display: block;
  font-size: 0.7rem;
  color: #95a5a6;
  text-transform: uppercase;
}
.loading-text { font-size: 0.9rem; color: #7f8c8d; text-align: center; padding: 2rem 0; }

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #34495e;
}

.status.solved {
  min-height: 28px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #27ae60;
}

.board {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  margin: 0 auto 1.5rem auto;
  aspect-ratio: 1 / 1;
  max-width: 320px;
}

.puzzle-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.tile {
  background: #3498db;
  color: white;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tile:hover {
  transform: scale(1.05);
}

.tile.empty {
  background: #ecf0f1;
  cursor: default;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.tile.empty:hover {
  transform: none;
}

.reset-button {
  background: #34495e;
  border: none;
  color: white;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background: #2c3e50;
}

.desktop-controls {
  display: none; /* Sembunyikan di mobile secara default */
}

/* --- PERUBAHAN UNTUK DESKTOP --- */
@media (min-width: 800px) {
  .card {
    flex-direction: row; /* Susun berdampingan di desktop */
    align-items: flex-start;
    max-width: 800px; /* Lebarkan kartu utama */
  }

  .puzzle-main {
    flex: 1; /* Biarkan game mengambil ruang yang dibutuhkan */
  }

  .leaderboard-section {
    flex-basis: 250px; /* Beri lebar tetap untuk leaderboard */
    flex-shrink: 0; /* Jangan biarkan leaderboard menyusut */
  }
}
</style>