<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';

// --- Konfigurasi Game ---
const BOARD_SIZE = 20;
const INITIAL_SPEED = 200; // ms per gerakan

// --- State Game ---
const snake = ref([]);
const food = ref({});
const direction = ref({ x: 0, y: -1 });
const pendingDirection = ref({ x: 0, y: -1 });
const score = ref(0);
const isGameOver = ref(false);
const gameActive = ref(false);
const gameInterval = ref(null);

// --- State Leaderboard ---
const leaderboard = ref([]);
const isLoading = ref(true);

// --- Fungsi Inisialisasi & Utama Game ---

// Menyiapkan state awal tanpa memulai game loop
function initializeGame() {
  snake.value = [{ x: 10, y: 10 }];
  direction.value = { x: 0, y: -1 };
  pendingDirection.value = { x: 0, y: -1 };
  score.value = 0;
  isGameOver.value = false;
  gameActive.value = false;
  generateFood();
  if (gameInterval.value) clearInterval(gameInterval.value);
}

// Memulai game loop
function startGame() {
  initializeGame(); // Reset semuanya
  gameActive.value = true;
  gameInterval.value = setInterval(gameLoop, INITIAL_SPEED);
}

function gameLoop() {
  if (!gameActive.value) return;

  direction.value = pendingDirection.value;
  const newHead = {
    x: snake.value[0].x + direction.value.x,
    y: snake.value[0].y + direction.value.y
  };

  if (
    newHead.x < 0 || newHead.x >= BOARD_SIZE ||
    newHead.y < 0 || newHead.y >= BOARD_SIZE ||
    isPositionOnSnake(newHead, true)
  ) {
    endGame();
    return;
  }

  snake.value.unshift(newHead);

  if (newHead.x === food.value.x && newHead.y === food.value.y) {
    score.value += 10;
    generateFood();
  } else {
    snake.value.pop();
  }
}

function generateFood() {
  let newFoodPosition;
  do {
    newFoodPosition = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
  } while (isPositionOnSnake(newFoodPosition));
  food.value = newFoodPosition;
}

function isPositionOnSnake(position, ignoreHead = false) {
  const body = ignoreHead ? snake.value.slice(1) : snake.value;
  return body.some(segment => segment.x === position.x && segment.y === position.y);
}

function endGame() {
  gameActive.value = false;
  isGameOver.value = true;
  clearInterval(gameInterval.value);
  saveScore(); // Panggil simpan skor saat game berakhir
}

// --- Fungsi Leaderboard ---
async function saveScore() {
  if (score.value === 0) return;
  try {
    const playerName = prompt("Game Over! Masukkan nama Anda:", `Pemain-${Date.now().toString().slice(-4)}`);
    if (!playerName) return;
    
    await axios.post('https://api.sainzlab.site/api/scores', {
      player_name: playerName,
      game_name: 'Snake',
      score: score.value
    });
    fetchLeaderboard();
  } catch (error) {
    console.error("Gagal menyimpan skor:", error);
  }
}

async function fetchLeaderboard() {
  isLoading.value = true;
  try {
    const response = await axios.get('https://api.sainzlab.site/api/scores/Snake');
    leaderboard.value = response.data;
  } catch (error) {
    console.error("Gagal mengambil leaderboard Snake:", error);
  } finally {
    isLoading.value = false;
  }
}

// --- Kontrol & Lifecycle ---
function handleKeyDown(event) {
  event.preventDefault();
  const key = event.key;
  let newDirection = { ...pendingDirection.value };

  if ((key === 'ArrowUp' || key.toLowerCase() === 'w') && direction.value.y === 0) newDirection = { x: 0, y: -1 };
  else if ((key === 'ArrowDown' || key.toLowerCase() === 's') && direction.value.y === 0) newDirection = { x: 0, y: 1 };
  else if ((key === 'ArrowLeft' || key.toLowerCase() === 'a') && direction.value.x === 0) newDirection = { x: -1, y: 0 };
  else if ((key === 'ArrowRight' || key.toLowerCase() === 'd') && direction.value.x === 0) newDirection = { x: 1, y: 0 };
  
  pendingDirection.value = newDirection;
}

onMounted(() => {
  initializeGame(); // Siapkan game saat komponen dimuat
  fetchLeaderboard();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (gameInterval.value) clearInterval(gameInterval.value);
});

const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
  gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
}));
</script>

<template>
  <div class="card snake-card">
    <div class="game-area">
      <h1>Snake</h1>
      <div class="board" :style="boardStyle">
        <div 
          v-for="(segment, index) in snake" 
          :key="`snake-${index}`" 
          class="snake-segment" 
          :class="{ 'head': index === 0 }"
          :style="{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }"
        ></div>
        <div 
          class="food" 
          :style="{ gridColumn: food.x + 1, gridRow: food.y + 1 }"
        ></div>
        <div v-if="!gameActive" class="overlay">
          <h2 v-if="isGameOver">Game Over!</h2>
          <button @click="startGame" class="action-button">
            {{ isGameOver ? 'Main Lagi' : 'Mulai Bermain' }}
          </button>
        </div>
      </div>
    </div>
    <div class="info-area">
      <div class="info-box mobile-controls">
         <h3>KONTROL</h3>
         <div class="d-pad">
            <div class="d-pad-cell"></div>
            <button @click="pendingDirection = {x: 0, y: -1}" class="mobile-btn">↑</button>
            <div class="d-pad-cell"></div>

            <button @click="pendingDirection = {x: -1, y: 0}" class="mobile-btn">←</button>
            <div class="d-pad-cell center"></div>
            <button @click="pendingDirection = {x: 1, y: 0}" class="mobile-btn">→</button>
            
            <div class="d-pad-cell"></div>
            <button @click="pendingDirection = {x: 0, y: 1}" class="mobile-btn">↓</button>
            <div class="d-pad-cell"></div>
         </div>
      </div>
      <div class="info-box">
        <h3>SKOR</h3>
        <p class="score-value">{{ score }}</p>
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
        <h3>KONTROL</h3>
        <p class="controls-text">Gunakan tombol panah atau W, A, S, D untuk bergerak.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 700px;
  background: #1a1a2e;
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(128, 128, 150, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  font-family: 'Poppins', sans-serif;
  color: #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.game-area {
  flex: 2;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.info-area {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

h1 {
  font-size: 2.8rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 0 10px #00e676;
  text-align: center;
}

.board {
  display: grid;
  background: #161625;
  border: 3px solid rgba(128, 128, 150, 0.3);
  border-radius: 8px;
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
}

.snake-segment {
  background-color: #00e676;
  border-radius: 25%;
  box-shadow: 0 0 8px #00e676;
}
.snake-segment.head {
  background-color: #69f0ae;
  box-shadow: 0 0 12px #69f0ae;
}

.food {
  background-color: #ff1744;
  border-radius: 50%;
  box-shadow: 0 0 10px #ff1744;
}

.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 15, 25, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.overlay h2 { font-size: 2rem; color: #ff1744; margin-bottom: 1rem; }
.action-button {
  background: #6a82fb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.info-box {
  background: #161625;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(128, 128, 150, 0.3);
}
.info-box h3 {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: #a0a0c0;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}
/* PERBAIKAN: Buat style skor lebih spesifik */
.info-box p.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1;
}

.leaderboard-box ul { list-style: none; padding: 0; margin: 0; font-size: 0.95rem; }
.leaderboard-box li {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(128, 128, 150, 0.3);
}
.leaderboard-box li:last-child { border-bottom: none; }
.leaderboard-box strong { color: #6a82fb; font-weight: 700; }
.loading-text { font-size: 0.9rem; color: #a0a0c0; text-align: center; padding: 1rem 0; }

.mobile-controls { text-align: center; }
.d-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  max-width: 180px;
  margin: 0.5rem auto 0;
}
.mobile-btn {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(128, 128, 150, 0.3);
  color: #e0e0e0;
  border-radius: 12px;
  font-size: 1.5rem;
  width: 100%;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.mobile-btn:active { background-color: #6a82fb; }

.desktop-controls {
  display: none; /* Sembunyikan di mobile secara default */
}
.controls-text {
  font-size: 0.9rem;
  color: #a0a0c0;
  line-height: 1.6;
}
.controls-text strong {
  color: #e0e0e0;
  background: rgba(255,255,255,0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .mobile-controls {
    display: none; /* Sembunyikan kontrol mobile di desktop */
  }
  .desktop-controls {
    display: block; /* Tampilkan info kontrol desktop */
  }
}
</style>
