<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';

// --- Konfigurasi Dasar (untuk rasio viewBox) ---
const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 600;

// --- State Game ---
const score = ref(0);
const lives = ref(3);
const gameState = ref('initial'); // 'initial', 'playing', 'paused', 'gameOver'
const gameArea = ref(null);

// --- State Elemen Game ---
const paddle = reactive({ x: VIEWBOX_WIDTH / 2 - 60, y: VIEWBOX_HEIGHT - 40, width: 120, height: 20, speed: 10 });
const ball = reactive({ x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2, radius: 10, dx: 4, dy: -4 });
const bricks = ref([]);

// --- State Kontrol Keyboard ---
const keysPressed = reactive({
  ArrowLeft: false,
  ArrowRight: false,
});

// --- State Leaderboard ---
const leaderboard = ref([]);
const isLoading = ref(true);
const medals = ['🥇', '🥈', '🥉'];

let animationFrameId = null;
let brickMoveInterval = null;

// --- Inisialisasi Game ---
const createBricks = () => {
  bricks.value = [];
  const brickConfig = { rows: 5, cols: 10, width: 75, height: 20, padding: 5, offsetTop: 50 };
  brickConfig.offsetLeft = (VIEWBOX_WIDTH - (brickConfig.cols * brickConfig.width + (brickConfig.cols - 1) * brickConfig.padding)) / 2;
  const colors = ["#ff1744", "#d500f9", "#6a82fb", "#00e676", "#ffea00"];

  for (let c = 0; c < brickConfig.cols; c++) {
    for (let r = 0; r < brickConfig.rows; r++) {
      bricks.value.push({
        x: c * (brickConfig.width + brickConfig.padding) + brickConfig.offsetLeft,
        y: r * (brickConfig.height + brickConfig.padding) + brickConfig.offsetTop,
        width: brickConfig.width,
        height: brickConfig.height,
        color: colors[r % colors.length],
        visible: true,
      });
    }
  }
};

const resetBallAndPaddle = () => {
  paddle.x = VIEWBOX_WIDTH / 2 - paddle.width / 2;
  ball.x = VIEWBOX_WIDTH / 2;
  ball.y = paddle.y - 50;
  ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = -4;
};

const resetGame = (isNewGame = false) => {
  if (isNewGame) {
    score.value = 0;
    lives.value = 3;
    fetchLeaderboard();
  }
  resetBallAndPaddle();
  createBricks();
  gameState.value = 'initial';
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (brickMoveInterval) clearInterval(brickMoveInterval);
};

const startGame = () => {
  if (gameState.value === 'playing') return;
  if (gameState.value === 'initial' || gameState.value === 'gameOver') {
    resetGame(true);
  }
  gameState.value = 'playing';
  
  // PERUBAHAN: Tempo diperlambat menjadi 12 detik
  brickMoveInterval = setInterval(moveBricksDown, 12000); // Turun setiap 12 detik
  
  gameLoop();
};

// --- Logika Utama Game (Game Loop) ---
const gameLoop = () => {
  if (gameState.value !== 'playing') return;
  
  movePaddleWithKeys();
  ball.x += ball.dx;
  ball.y += ball.dy;
  handleCollisions();
  
  animationFrameId = requestAnimationFrame(gameLoop);
};

const moveBricksDown = () => {
  if (gameState.value !== 'playing') return;
  
  let shouldEndGame = false;
  bricks.value.forEach(brick => {
    if (brick.visible) {
      brick.y += brick.height + 5; // Turun sejauh satu baris
      if (brick.y + brick.height >= paddle.y) {
        shouldEndGame = true;
      }
    }
  });

  if (shouldEndGame) {
    gameState.value = 'gameOver';
    saveScore();
  }
};

// --- Deteksi Tabrakan ---
const handleCollisions = () => {
  // Dinding
  if (ball.x + ball.radius > VIEWBOX_WIDTH || ball.x - ball.radius < 0) ball.dx *= -1;
  if (ball.y - ball.radius < 0) ball.dy *= -1;
  
  // Bola jatuh
  if (ball.y + ball.radius > VIEWBOX_HEIGHT) {
    lives.value--;
    gameState.value = 'paused';
    if (lives.value <= 0) {
      gameState.value = 'gameOver';
      saveScore();
    } else {
      resetBallAndPaddle();
    }
  }

  // Papan
  if (
    ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height &&
    ball.x > paddle.x && ball.x < paddle.x + paddle.width
  ) {
    ball.dy = -Math.abs(ball.dy);
  }

  // Balok
  bricks.value.forEach(brick => {
    if (brick.visible) {
      if (
        ball.x + ball.radius > brick.x && ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y && ball.y - ball.radius < brick.y + brick.height
      ) {
        brick.visible = false;
        ball.dy *= -1;
        score.value += 10;
        checkAllBricksCleared();
      }
    }
  });
};

const checkAllBricksCleared = () => {
  if (bricks.value.every(b => !b.visible)) {
    score.value += 100;
    createBricks();
    resetBallAndPaddle();
    gameState.value = 'paused';
  }
};

// --- Fungsi Leaderboard ---
async function saveScore() {
  if (score.value === 0) return;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (brickMoveInterval) clearInterval(brickMoveInterval);

  try {
    const playerName = prompt("Game Over! Masukkan nama Anda:", `Pemain-${Date.now().toString().slice(-4)}`);
    if (!playerName) return;
    
    await axios.post('https://api.sainzlab.site/api/scores', {
      player_name: playerName,
      game_name: 'Breakout',
      score: score.value
    });
    fetchLeaderboard();
  } catch (error) { console.error("Gagal menyimpan skor:", error); }
}

async function fetchLeaderboard() {
  isLoading.value = true;
  try {
    const response = await axios.get('https://api.sainzlab.site/api/scores/Breakout');
    leaderboard.value = response.data;
  } catch (error) { console.error("Gagal mengambil leaderboard:", error); }
  finally { isLoading.value = false; }
}

// --- Kontrol Paddle ---
const updatePaddlePosition = (clientX, targetElement) => {
  if (!targetElement || gameState.value !== 'playing') return;
  const rect = targetElement.getBoundingClientRect();
  const scaleX = VIEWBOX_WIDTH / rect.width;
  let newPaddleX = (clientX - rect.left) * scaleX - paddle.width / 2;

  if (newPaddleX < 0) newPaddleX = 0;
  if (newPaddleX + paddle.width > VIEWBOX_WIDTH) newPaddleX = VIEWBOX_WIDTH - paddle.width;
  
  paddle.x = newPaddleX;
};

const movePaddleWithKeys = () => {
  if (keysPressed.ArrowLeft) {
    paddle.x -= paddle.speed;
  }
  if (keysPressed.ArrowRight) {
    paddle.x += paddle.speed;
  }

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > VIEWBOX_WIDTH) {
    paddle.x = VIEWBOX_WIDTH - paddle.width;
  }
};

// --- Event Handlers ---
const handleMouseMove = (e) => updatePaddlePosition(e.clientX, gameArea.value);
const handleTouchMove = (e) => {
  e.preventDefault();
  updatePaddlePosition(e.touches[0].clientX, e.currentTarget);
};

const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    keysPressed[e.key] = true;
  }
};
const handleKeyUp = (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    keysPressed[e.key] = false;
  }
};

// --- Lifecycle & Event Listeners ---
onMounted(() => {
  resetGame(true);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  cancelAnimationFrame(animationFrameId);
  if (brickMoveInterval) clearInterval(brickMoveInterval);
});

const gameMessage = computed(() => {
  if (gameState.value === 'gameOver') return 'Game Over!';
  if (gameState.value === 'paused') return 'Klik untuk Lanjut';
  return 'Klik untuk Mulai';
});

const sliderThumbStyle = computed(() => {
  const thumbWidthPercent = (paddle.width / VIEWBOX_WIDTH) * 100;
  const maxLeftPercent = 100 - thumbWidthPercent;
  const paddlePositionFraction = paddle.x / (VIEWBOX_WIDTH - paddle.width);
  const leftPercent = paddlePositionFraction * maxLeftPercent;

  return {
    left: `${leftPercent}%`,
    width: `${thumbWidthPercent}%`
  };
});
</script>

<template>
  <div class="card breakout-card">
    <div class="game-main">
      <h1>Breakout</h1>
      <div class="stats">
        <span>Skor: {{ score }}</span>
        <span>Nyawa: {{ '❤️'.repeat(lives) }}</span>
      </div>
      <div 
        class="game-area" 
        ref="gameArea"
        @click="startGame"
        @mousemove="handleMouseMove"
      >
        <svg
          :viewBox="`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`"
          class="game-board"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect :width="VIEWBOX_WIDTH" :height="VIEWBOX_HEIGHT" fill="#161625" />
          <rect :x="paddle.x" :y="paddle.y" :width="paddle.width" :height="paddle.height" fill="#e0e0e0" rx="8" />
          <circle :cx="ball.x" :cy="ball.y" :r="ball.radius" fill="#ff1744" />
          <template v-for="(brick, index) in bricks" :key="index">
            <rect v-if="brick.visible" :x="brick.x" :y="brick.y" :width="brick.width" :height="brick.height" :fill="brick.color" rx="3" />
          </template>
          <g v-if="gameState !== 'playing'">
            <rect x="0" y="0" :width="VIEWBOX_WIDTH" :height="VIEWBOX_HEIGHT" fill="rgba(15, 15, 25, 0.7)" />
            <text :x="VIEWBOX_WIDTH / 2" :y="VIEWBOX_HEIGHT / 2" class="game-message" text-anchor="middle" fill="#ffffff">
              {{ gameMessage }}
            </text>
          </g>
        </svg>
      </div>
      <!-- Kontrol Slider Mobile -->
      <div 
        class="mobile-slider-control"
        @touchstart.prevent="handleTouchMove"
        @touchmove.prevent="handleTouchMove"
      >
        <div class="slider-track">
          <div class="slider-thumb" :style="sliderThumbStyle"></div>
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
  max-width: 500px;
  background: #1a1a2e;
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(128, 128, 150, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  font-family: 'Poppins', sans-serif;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.game-main { text-align: center; }
h1 { font-size: 2.5rem; font-weight: 700; color: white; margin: 0 0 1rem 0; text-shadow: 0 0 10px #6a82fb; }
.stats { display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; padding: 0 0.5rem; }

.game-area {
  width: 100%;
  position: relative;
  cursor: pointer;
}
.game-board {
  width: 100%;
  display: block;
  border-radius: 8px;
  border: 3px solid rgba(128, 128, 150, 0.3);
}

.game-message {
  font-size: 60px;
  font-weight: bold;
}

.leaderboard-section { text-align: left; }
.leaderboard-section h3 { font-size: 1.5rem; font-weight: 600; margin-top: 0; margin-bottom: 1.5rem; text-align: center; color: #e0e0e0; }
.leaderboard-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.leaderboard-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1rem; background: #161625; border-radius: 12px;
  border: 1px solid rgba(128, 128, 150, 0.3);
}
.player-info { display: flex; align-items: center; gap: 0.75rem; }
.rank { font-size: 1rem; font-weight: 600; color: #a0a0c0; width: 35px; text-align: center; }
.player-name { font-weight: 600; color: #e0e0e0; font-size: 0.9rem; }
.score-value { font-weight: 700; font-size: 1.1rem; color: #6a82fb; }
.loading-text { font-size: 0.9rem; color: #a0a0c0; text-align: center; padding: 2rem 0; }

.mobile-slider-control {
  display: block;
  width: 100%;
  padding: 15px 0;
  margin-top: 1rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.slider-track {
  width: 100%;
  height: 10px;
  background-color: rgba(128, 128, 150, 0.3);
  border-radius: 5px;
  position: relative;
}
.slider-thumb {
  position: absolute;
  height: 24px;
  background-color: #e0e0e0;
  border-radius: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: 3px solid #1a1a2e;
}

@media (min-width: 900px) {
  .mobile-slider-control {
    display: none;
  }
  .card {
    flex-direction: row;
    align-items: flex-start;
    max-width: 900px;
  }
  .game-main { flex: 2; }
  .leaderboard-section { flex-basis: 280px; flex-shrink: 0; }
}
</style>