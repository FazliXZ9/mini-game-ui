<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// State untuk Game
const randomNumber = ref(Math.floor(Math.random() * 100) + 1);
const guess = ref('');
const message = ref('Tebak angka antara 1 dan 100');
const attempts = ref(0);
const gameOver = ref(false);
// State untuk animasi feedback
const feedbackClass = ref('');

// State untuk Leaderboard
const leaderboard = ref([]);
const isLoading = ref(true);

// Computed property untuk pesan selamat
const successMessage = computed(() => {
  return `🎉 Selamat! Anda menebak dengan benar dalam <strong>${attempts.value}</strong> percobaan.`;
});

// Fungsi untuk memberikan feedback animasi
function triggerFeedbackAnimation() {
  feedbackClass.value = 'shake';
  setTimeout(() => {
    feedbackClass.value = '';
  }, 500); // Durasi animasi
}

// Fungsi untuk mengecek tebakan
function checkGuess() {
  if (gameOver.value || !guess.value) return;

  const userGuess = parseInt(guess.value);

  // Validasi input
  if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
    message.value = 'Masukkan angka antara 1 dan 100.';
    triggerFeedbackAnimation();
    guess.value = '';
    return;
  }
  
  attempts.value++;

  if (userGuess === randomNumber.value) {
    message.value = successMessage.value;
    gameOver.value = true;
    saveScore();
  } else if (userGuess > randomNumber.value) {
    message.value = 'Terlalu tinggi! Coba lagi.';
    triggerFeedbackAnimation();
  } else {
    message.value = 'Terlalu rendah! Coba lagi.';
    triggerFeedbackAnimation();
  }
  guess.value = '';
}

// Fungsi untuk memulai ulang game
function resetGame() {
  randomNumber.value = Math.floor(Math.random() * 100) + 1;
  guess.value = '';
  message.value = 'Tebak angka antara 1 dan 100';
  attempts.value = 0;
  gameOver.value = false;
  feedbackClass.value = '';
}

// Fungsi untuk menyimpan skor ke API Laravel
async function saveScore() {
  try {
    const playerName = prompt("Selamat! Masukkan nama Anda untuk leaderboard:", `Pemain-${Date.now().toString().slice(-4)}`);
    if (!playerName) return;

    await axios.post('http://192.168.8.207/api/scores', {
      player_name: playerName.trim(),
      game_name: 'Tebak Angka',
      score: attempts.value
    });
    fetchLeaderboard();
  } catch (error) {
    console.error("Gagal menyimpan skor:", error);
    alert("Gagal menyimpan skor. Pastikan API server berjalan.");
  }
}

// Fungsi untuk mengambil data leaderboard dari API Laravel
async function fetchLeaderboard() {
  isLoading.value = true;
  try {
    const response = await axios.get('http://192.168.8.207/api/scores');
    leaderboard.value = response.data
      .filter(s => s.game_name === 'Tebak Angka')
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  } catch (error) {
    console.error("Gagal mengambil leaderboard:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchLeaderboard();
});
</script>

<template>
  <div class="main-container">
    <div class="card game-card">
      <h1>Tebak Angka</h1>
      
      <template v-if="!gameOver">
        <p class="message" :class="feedbackClass" v-html="message"></p>
        <form @submit.prevent="checkGuess">
          <input 
            type="number" 
            v-model="guess" 
            placeholder="0" 
            class="guess-input" 
            autofocus
            min="1"
            max="100"
            :disabled="gameOver"
          >
          <button type="submit" class="action-button">Tebak</button>
        </form>
      </template>
      
      <div v-else class="game-over-container">
        <p class="message success-message" v-html="message"></p>
        <button @click="resetGame" class="action-button play-again-button">Main Lagi</button>
      </div>
    </div>

    <div class="card leaderboard-card">
      <h2>🏆 Leaderboard</h2>
      <div v-if="isLoading" class="loading-text">Memuat data...</div>
      <ul v-else-if="leaderboard.length > 0" class="leaderboard-list">
        <li v-for="(score, index) in leaderboard" :key="score.id">
          <span :class="['rank', `rank-${index + 1}`]">#{{ index + 1 }}</span>
          <span class="player">{{ score.player_name }}</span>
          <span class="score">{{ score.score }} <span class="tries">langkah</span></span>
        </li>
      </ul>
      <div v-else class="loading-text">Belum ada skor tercatat. Jadilah yang pertama!</div>
    </div>
  </div>
</template>

<style>
/* Font dan Body */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/* PERBAIKAN UTAMA ADA DI SINI */
body {
  display: flex; /* Gunakan flexbox untuk centering */
  justify-content: center; /* Pusatkan secara horizontal */
  align-items: flex-start; /* Ratakan dari atas */
  min-height: 100vh; /* Pastikan body setidaknya setinggi layar */
  background-color: #e9f0f8;
  background-image: linear-gradient(to top right, #e9f0f8, #d8e2ef);
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 2rem 1rem; /* Beri padding atas-bawah dan samping */
  box-sizing: border-box;
}

/* Kita tidak perlu lagi styling khusus di #app */
#app {
  width: 100%;
  /* max-width dari .main-container akan membatasi lebar */
}
</style>

<style scoped>
/* === ANIMASI === */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-6px); }
  40%, 60% { transform: translateX(6px); }
}

.shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

/* === LAYOUT UTAMA === */
.main-container {
  display: flex;
  /* (Mobile-first) defaultnya kolom */
  flex-direction: column;
  align-items: center; /* Pusatkan item di mobile */
  gap: 2rem;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

/* === CARD STYLING === */
.card {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(45, 75, 128, 0.1);
  animation: fadeIn 0.5s ease-out forwards;
}

.game-card {
  animation-delay: 0.1s;
}

.leaderboard-card {
  animation-delay: 0.2s;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.message {
  color: #5a6a7a;
  margin: 0 0 2rem 0;
  min-height: 48px; /* Beri ruang agar layout tidak "loncat" */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: color 0.3s ease;
}

.success-message {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.8rem;
  color: #34495e;
  margin: 0 0 1.5rem 0;
}

/* === FORM & BUTTON === */
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.guess-input {
  width: 100px;
  height: 80px;
  background: #f0f4f8;
  border: 2px solid transparent;
  color: #34495e;
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  border-radius: 15px;
  transition: all 0.3s ease;
  -moz-appearance: textfield; /* Firefox */
}
.guess-input::-webkit-outer-spin-button,
.guess-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.guess-input:focus {
  outline: none;
  border-color: #3498db;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2);
}

.action-button {
  width: 180px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 50px; /* Lebih modern */
  background-image: linear-gradient(45deg, #3498db 0%, #2980b9 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
}
.action-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}
.action-button:active {
  transform: translateY(-1px);
}

.game-over-container {
  animation: fadeIn 0.5s ease;
}

.play-again-button {
   margin-top: 1rem;
}

/* === LEADERBOARD LIST === */
.loading-text {
  color: #7f8c8d;
  font-style: italic;
}

.leaderboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.leaderboard-list li {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background-color: rgba(236, 240, 241, 0.6);
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}
.leaderboard-list li:hover {
  transform: scale(1.02);
  border-color: #bdc3c7;
}

/* Medali untuk Top 3 */
li .rank-1::before { content: '🥇 '; }
li .rank-2::before { content: '🥈 '; }
li .rank-3::before { content: '🥉 '; }

.rank {
  font-weight: 700;
  color: #34495e;
  flex-basis: 20%;
  text-align: left;
}
.player {
  color: #2c3e50;
  font-weight: 500;
  flex-basis: 55%;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 1rem;
}
.score {
  flex-basis: 25%;
  text-align: right;
  font-weight: 700;
  color: #3498db;
}
.tries {
  font-size: 0.8rem;
  color: #95a5a6;
  font-weight: 400;
}

/* === MEDIA QUERY UNTUK DESKTOP === */
@media (min-width: 768px) {
  body {
    padding: 2rem;
  }
  .main-container {
    /* Ubah menjadi baris di layar lebar */
    flex-direction: row;
    align-items: flex-start; /* Ratakan ke atas */
    justify-content: center;
  }
  .card {
    padding: 2.5rem;
  }
  .game-card, .leaderboard-card {
    /* Atur agar fleksibel tapi punya basis ukuran */
    flex: 1 1 400px;
  }
  form {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
  .action-button {
    width: auto;
  }
}
</style>