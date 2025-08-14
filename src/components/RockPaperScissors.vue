<script setup>
import { ref, computed } from 'vue';

const choices = ['batu', 'gunting', 'kertas'];
const playerChoice = ref(null);
const computerChoice = ref(null);
const result = ref('Pilih salah satu untuk memulai!');
const score = ref({ wins: 0, losses: 0, ties: 0 });
const isAnimating = ref(false);

const choiceIcons = {
  batu: '✊',
  gunting: '✌️',
  kertas: '🖐️'
};

function play(choice) {
  if (isAnimating.value) return;

  isAnimating.value = true;
  playerChoice.value = null;
  computerChoice.value = null;
  result.value = '...';

  setTimeout(() => {
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
    isAnimating.value = false;
  }, 500); 
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
  <div class="page-container">
    <router-link to="/" class="back-button">← Kembali</router-link>

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
          <div class="icon" :class="{ 'placeholder': !playerChoice, 'animating': isAnimating }">
            {{ playerChoice ? choiceIcons[playerChoice] : '?' }}
          </div>
        </div>
        <div class="vs">vs</div>
        <div class="choice computer">
          <span class="label">Komputer</span>
          <div class="icon" :class="{ 'placeholder': !computerChoice, 'animating': isAnimating }">
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
  </div>
</template>

<style scoped>

.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  color: var(--text-primary, #e0e0e0);
  align-items: flex-start;
  padding-top: 6rem;
}

.back-button {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary, #a0a0a0);
  background-color: var(--bg-card, #16213e);
  border: 1px solid var(--border-color, rgba(224, 224, 224, 0.2));
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  z-index: 10;
}
.back-button:hover {
  background-color: #2c3e50;
  color: #fff;
}

.rps-card {
  width: 100%;
  max-width: 600px;
  background-color: rgba(15, 23, 42, 0.5); 
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--border-color, rgba(224, 224, 224, 0.2));
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-color, #e94560);
  margin-bottom: 1rem;
}

.score-board {
  display: flex;
  justify-content: space-around;
  background-color: var(--bg-card, #16213e);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  font-size: 1rem;
}
.score-board strong {
  color: #fff;
  font-size: 1.2rem;
}

.choices {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}
.choice {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-secondary, #a0a0a0);
}
.icon {
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 4px solid var(--border-color, rgba(224, 224, 224, 0.2));
  border-radius: 50%;
  font-size: 4rem;
  transition: all 0.3s ease;
}
.icon.placeholder {
  color: var(--text-secondary, #a0a0a0);
  border-style: dashed;
}
.vs {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color, #e94560);
}

.icon.animating {
  animation: shake 0.5s ease;
}
@keyframes shake {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  75% { transform: translateY(10px); }
}

.result {
  font-size: 1.5rem;
  font-weight: 700;
  height: 2em; 
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}
.result.win { color: #33ff33; }
.result.loss { color: #ff3333; }
.result.tie { color: #facc15; }

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.choice-button {
  width: 80px;
  height: 80px;
  font-size: 2.5rem;
  border: 2px solid var(--border-color, rgba(224, 224, 224, 0.2));
  border-radius: 50%;
  background-color: var(--bg-card, #16213e);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.choice-button:hover {
  background-color: #2c3e50;
  transform: translateY(-5px);
  border-color: var(--accent-color, #e94560);
}

.reset-button {
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary, #a0a0a0);
  background-color: transparent;
  border: 1px solid var(--border-color, rgba(224, 224, 224, 0.2));
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.reset-button:hover {
  background-color: var(--bg-card, #16213e);
  color: #fff;
}

@media (max-width: 480px) {
  .rps-card { padding: 1.5rem; }
  h1 { font-size: 2rem; }
  .score-board { flex-direction: column; gap: 0.5rem; }
  .icon { width: 80px; height: 80px; font-size: 2.5rem; }
  .vs { font-size: 1.5rem; }
  .choice-button { width: 60px; height: 60px; font-size: 2rem; }
}

@media (min-width: 992px) {
  .page-container {
    align-items: center;
    padding-top: 1.5rem;
  }
}
</style>