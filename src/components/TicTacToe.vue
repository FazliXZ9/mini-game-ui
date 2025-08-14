<script setup>
import { ref, computed } from 'vue';

const board = ref(Array(9).fill(null));
const currentPlayer = ref('X');
const winner = ref(null);

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

const statusMessage = computed(() => {
  if (winner.value) {
    return winner.value === 'Seri' ? `Permainan Seri!` : `Pemenangnya ${winner.value}! 🎉`;
  }
  return `Giliran Pemain: ${currentPlayer.value}`;
});

function makeMove(index) {
  if (board.value[index] || winner.value) {
    return;
  }
  board.value[index] = currentPlayer.value;
  checkWinner();
  if (!winner.value) {
    currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';
  }
}

function checkWinner() {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
      winner.value = board.value[a];
      return;
    }
  }

  if (board.value.every(square => square !== null)) {
    winner.value = 'Seri';
  }
}

function resetGame() {
  board.value = Array(9).fill(null);
  currentPlayer.value = 'X';
  winner.value = null;
}
</script>

<template>
  <div class="page-container">
    <router-link to="/" class="back-button">← Kembali</router-link>

    <div class="card ttt-card">
      <h1>Tic-Tac-Toe</h1>
      <p class="status">
        {{ statusMessage }}
      </p>

      <div class="board">
        <div
          v-for="(square, index) in board"
          :key="index"
          class="square"
          @click="makeMove(index)"
          :class="{
            'x': square === 'X',
            'o': square === 'O'
          }"
        >
          <span>{{ square }}</span>
        </div>
      </div>

      <button @click="resetGame" class="reset-button">Mulai Ulang</button>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  font-family: 'Poppins', sans-serif;
  text-align: center;
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
}

.back-button:hover {
  background-color: #2c3e50;
  color: #fff;
}

.ttt-card {
  width: 100%;
  max-width: 500px; 
  padding: 2rem;
}

h1 {
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--accent-color, #e94560);
}

.status {
  font-size: clamp(1rem, 4vw, 1.25rem);
  font-weight: 600;
  margin-bottom: 2rem;
  height: 1.5em;
  color: var(--text-secondary, #a0a0a0);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 2rem auto;
}

.square {
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-card, #16213e);
  border: 2px solid var(--border-color, rgba(224, 224, 224, 0.2));
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.square:hover {
  background-color: #2c3e50;
  border-color: var(--accent-color, #e94560);
}

.square span {
  font-size: clamp(3rem, 15vw, 5rem);
  font-weight: 700;
  line-height: 1;
  user-select: none;
  transform: scale(0.5);
  opacity: 0;
  animation: appear 0.3s forwards;
}

.square.x span { color: #33ff33; }
.square.o span { color: #00ffff; }

@keyframes appear {
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.reset-button {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background-color: var(--accent-color, #e94560);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.reset-button:hover {
  background-color: var(--accent-hover, #ff6e87);
}

@media (max-width: 480px) {
  .back-button {
    top: 1rem;
    left: 1rem;
    padding: 0.5rem 0.8rem;
  }
  .ttt-card {
    padding: 1rem;
  }
}

</style>