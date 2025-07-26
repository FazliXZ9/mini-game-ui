<script setup>
import { ref, computed } from 'vue';

const choices = ['batu', 'gunting', 'kertas'];
const playerChoice = ref(null);
const computerChoice = ref(null);
const result = ref('Pilih salah satu untuk memulai!');
const score = ref({ wins: 0, losses: 0, ties: 0 });

const choiceIcons = {
  batu: '✊',
  gunting: '✌️',
  kertas: '🖐️'
};

function play(choice) {
  playerChoice.value = choice;
  computerChoice.value = choices[Math.floor(Math.random() * choices.length)];

  if (playerChoice.value === computerChoice.value) {
    result.value = "Hasilnya Seri!";
    score.value.ties++;
  } else if (
    (playerChoice.value === 'batu' && computerChoice.value === 'gunting') ||
    (playerChoice.value === 'gunting' && computerChoice.value === 'kertas') ||
    (playerChoice.value === 'kertas' && computerChoice.value === 'batu')
  ) {
    result.value = "Anda Menang! 🎉";
    score.value.wins++;
  } else {
    result.value = "Anda Kalah! 😥";
    score.value.losses++;
  }
}

function resetGame() {
  playerChoice.value = null;
  computerChoice.value = null;
  result.value = 'Pilih salah satu untuk memulai!';
  score.value = { wins: 0, losses: 0, ties: 0 };
}

const resultClass = computed(() => {
  if (result.value.includes('Menang')) return 'win';
  if (result.value.includes('Kalah')) return 'loss';
  if (result.value.includes('Seri')) return 'tie';
  return '';
});
</script>

<template>
  <div class="card rps-card">
    <h1>Batu Gunting Kertas</h1>

    <div class="score-board">
      <div>🏆 Menang: <strong>{{ score.wins }}</strong></div>
      <div>😐 Seri: <strong>{{ score.ties }}</strong></div>
      <div>❌ Kalah: <strong>{{ score.losses }}</strong></div>
    </div>

    <div class="choices">
      <div class="choice player">
        <span class="label">Anda</span>
        <div class="icon" :class="{ 'placeholder': !playerChoice }">
          {{ playerChoice ? choiceIcons[playerChoice] : '?' }}
        </div>
      </div>
      <div class="vs">vs</div>
      <div class="choice computer">
        <span class="label">Komputer</span>
        <div class="icon" :class="{ 'placeholder': !computerChoice }">
          {{ computerChoice ? choiceIcons[computerChoice] : '?' }}
        </div>
      </div>
    </div>

    <p class="result" :class="resultClass">{{ result }}</p>

    <div class="buttons">
      <button v-for="choice in choices" :key="choice" @click="play(choice)" class="choice-button" :title="choice">
        {{ choiceIcons[choice] }}
      </button>
    </div>

    <button @click="resetGame" class="reset-button">Reset Skor</button>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

#app {
  display: flex;
  justify-content: center;
  align-items: center; /* Center Vertically */
  width: 100%;
  min-height: 100vh;
  padding: 1rem;
}

body {
  background-color: #e0eafc;
  background-image: linear-gradient(to top right, #e0eafc, #cfdef3);
  font-family: 'Poppins', sans-serif;
  margin: 0;
  box-sizing: border-box;
}
</style>

<style scoped>
/* Card Style Utama (Glassmorphism) */
.card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 25px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 40px rgba(45, 75, 128, 0.15);
  color: #2c3e50;
}

/* Judul dengan Gradient */
h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

/* Papan Skor */
.score-board {
  display: flex;
  justify-content: space-around;
  background-color: rgba(228, 235, 245, 0.7);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 2rem;
  font-weight: 500;
  color: #34495e;
}
.score-board strong {
  font-weight: 700;
  color: #2c3e50;
}

/* Area Pilihan Pemain & Komputer */
.choices {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.choice .label {
  font-size: 1rem;
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  display: block;
}

.choice .icon {
  font-size: 4rem;
  line-height: 1;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.choice .icon.placeholder {
  background: rgba(228, 235, 245, 0.7);
  color: #95a5a6;
  box-shadow: none;
}

.vs {
  font-size: 2rem;
  font-weight: 700;
  color: #bdc3c7;
}

/* Teks Hasil Pertandingan */
.result {
  min-height: 28px;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  transition: color 0.3s ease;
}

.result.win { color: #27ae60; }
.result.loss { color: #e74c3c; }
.result.tie { color: #34495e; }

/* Tombol Pilihan (Batu, Gunting, Kertas) */
.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.choice-button {
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  color: #3498db;
}

.choice-button:hover {
  background-image: linear-gradient(45deg, #3498db 0%, #2980b9 100%);
  color: #fff;
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
}

/* Tombol Reset */
.reset-button {
  background-color: transparent;
  border: 2px solid #bdc3c7;
  color: #7f8c8d;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background-color: #34495e;
  border-color: #34495e;
  color: #fff;
}

@media (max-width: 400px) {
  .card {
    padding: 1.5rem;
  }
  .choice .icon {
    width: 80px;
    height: 80px;
    font-size: 3rem;
  }
  .choice-button {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }
}
</style>