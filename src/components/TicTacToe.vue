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
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 1rem;
}

body {
  background-color: #e4eefc;
  background-image: linear-gradient(to top right, #e4eefc, #d3e3fd);
  font-family: 'Poppins', sans-serif;
  margin: 0;
}
</style>

<style scoped>
.card {
  width: 100%;
  max-width: 340px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 30px;
  padding: 2.5rem 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  color: #3f5177;
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #3f5177;
}

.status {
  min-height: 28px;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7a99;
  margin-bottom: 2rem;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 2.5rem;
}

.square {
  aspect-ratio: 1 / 1;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  line-height: 1;
}

.square:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
}

.square.x { 
  color: #4a6dcc;
  text-shadow: 0 0 10px rgba(74, 109, 204, 0.3);
}
.square.o { 
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
}

.reset-button {
  background-color: #4a6dcc;
  border: none;
  color: white;
  width: 100%;
  padding: 1rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 109, 204, 0.3);
}

.reset-button:hover {
  background-color: #3f5db0;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 109, 204, 0.4);
}

@media (max-width: 520px) {
  .card {
    /* Ini adalah baris kunci untuk perbaikan */
    max-width: none;
    
    padding: 2rem 1.5rem;
  }
  h1 {
    font-size: 2rem;
  }
  .board {
    gap: 10px;
  }
  .square {
    font-size: 3rem;
    border-radius: 12px;
  }
}
</style>