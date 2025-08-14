<script setup>
import { ref, onMounted } from 'vue';

const board = ref([]);
const currentPlayer = ref('white');
const selectedPiece = ref(null);
const validMoves = ref([]);
const statusMessage = ref("Giliran Bidak Putih");
const gameOverMessage = ref('');
const capturedPieces = ref({ white: [], black: [] });

const PIECES = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

function initializeBoard() {
  const initialSetup = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];

  board.value = initialSetup.map((row, r) => 
    row.map((piece, c) => ({
      piece: piece,
      isWhite: piece ? piece === piece.toUpperCase() : null,
      row: r,
      col: c
    }))
  );

  currentPlayer.value = 'white';
  selectedPiece.value = null;
  validMoves.value = [];
  statusMessage.value = "Giliran Bidak Putih";
  gameOverMessage.value = '';
  capturedPieces.value = { white: [], black: [] };
}

function getPieceMoves(piece, row, col) {
  const moves = [];
  const type = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();
  const direction = isWhite ? -1 : 1;

  if (type === 'p') { 
    if (row + direction >= 0 && row + direction < 8) {
      const oneStepForward = board.value[row + direction][col];
      if (!oneStepForward.piece) {
        moves.push({ r: row + direction, c: col });

        const startRow = isWhite ? 6 : 1;
        if (row === startRow) {
          const twoStepsForward = board.value[row + 2 * direction][col];
          if (!twoStepsForward.piece) {
            moves.push({ r: row + 2 * direction, c: col });
          }
        }
      }

      [-1, 1].forEach(dCol => {
        const newCol = col + dCol;
        if (newCol >= 0 && newCol < 8) {
          const target = board.value[row + direction][newCol];
          if (target && target.piece && target.isWhite !== isWhite) {
            moves.push({ r: row + direction, c: newCol });
          }
        }
      });
    }
  }

  const movePatterns = {
    'n': [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
    'b': [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    'r': [[-1, 0], [1, 0], [0, -1], [0, 1]],
    'q': [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
    'k': [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]
  };

  if (['b', 'r', 'q'].includes(type)) { 
    movePatterns[type].forEach(([dr, dc]) => {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetSquare = board.value[r][c];
        if (targetSquare.piece) {
          if (targetSquare.isWhite !== isWhite) moves.push({ r, c });
          break;
        }
        moves.push({ r, c });
        r += dr; c += dc;
      }
    });
  } else if (['n', 'k'].includes(type)) { 
    movePatterns[type].forEach(([dr, dc]) => {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetSquare = board.value[r][c];
        if (!targetSquare.piece || targetSquare.isWhite !== isWhite) {
          moves.push({ r, c });
        }
      }
    });
  }
  
  return moves;
}

function handleSquareClick(row, col) {
  if (gameOverMessage.value) return;

  const clickedSquare = board.value[row][col];
  const isWhiteTurn = currentPlayer.value === 'white';

  if (validMoves.value.some(move => move.r === row && move.c === col)) {
    movePiece(selectedPiece.value.row, selectedPiece.value.col, row, col);
    return;
  }

  selectedPiece.value = null;
  validMoves.value = [];

  if (clickedSquare.piece && clickedSquare.isWhite === isWhiteTurn) {
    selectedPiece.value = { row, col, piece: clickedSquare.piece };
    validMoves.value = getPieceMoves(clickedSquare.piece, row, col);
  }
}

function movePiece(fromRow, fromCol, toRow, toCol) {
  const pieceToMove = board.value[fromRow][fromCol].piece;
  const targetSquare = board.value[toRow][toCol];
  const capturedPiece = targetSquare.piece;

  if (capturedPiece) {
    const capturedSide = targetSquare.isWhite ? 'white' : 'black';
    capturedPieces.value[capturedSide].push(capturedPiece);
  }

  board.value[toRow][toCol].piece = pieceToMove;
  board.value[toRow][toCol].isWhite = board.value[fromRow][fromCol].isWhite;
  board.value[fromRow][fromCol].piece = null;
  board.value[fromRow][fromCol].isWhite = null;
  
  if (pieceToMove.toLowerCase() === 'p') {
    if ((board.value[toRow][toCol].isWhite && toRow === 0) || (!board.value[toRow][toCol].isWhite && toRow === 7)) {
      board.value[toRow][toCol].piece = board.value[toRow][toCol].isWhite ? 'Q' : 'q';
    }
  }
  
  if (capturedPiece && capturedPiece.toLowerCase() === 'k') {
    const winner = currentPlayer.value === 'white' ? 'Putih' : 'Hitam';
    gameOverMessage.value = `Pemain ${winner} Menang!`;
    statusMessage.value = "Permainan Selesai";
  } else {

    currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white';
    statusMessage.value = `Giliran Bidak ${currentPlayer.value === 'white' ? 'Putih' : 'Hitam'}`;
  }

  selectedPiece.value = null;
  validMoves.value = [];
}

function isSquareValidMove(row, col) {
  return validMoves.value.some(move => move.r === row && move.c === col);
}

onMounted(initializeBoard);
</script>

<template>
  <div class="page-container">
    <router-link to="/" class="back-button">← Kembali</router-link>

    <div class="chess-container">
      <div class="game-main">
        <div class="header">
          <h1>Catur Klasik</h1>
          <p class="status" :class="currentPlayer">{{ gameOverMessage || statusMessage }}</p>
        </div>
        
        <div class="board">
          <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
            <div 
              v-for="(square, colIndex) in row" 
              :key="colIndex"
              class="square"
              :class="{ 
                'light': (rowIndex + colIndex) % 2 === 0, 
                'dark': (rowIndex + colIndex) % 2 !== 0,
                'selected': selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex,
              }"
              @click="handleSquareClick(rowIndex, colIndex)"
            >
              <span v-if="square.piece" class="piece">{{ PIECES[square.piece] }}</span>
              <div v-if="isSquareValidMove(rowIndex, colIndex)" class="valid-move-indicator"></div>
            </div>
          </div>
        </div>

        <button @click="initializeBoard" class="reset-button">Mulai Ulang Permainan</button>
      </div>

      <div class="info-section">
        <div class="captured-box">
          <h3>Bidak Putih Ditangkap</h3>
          <div class="captured-list">
            <span v-for="(p, i) in capturedPieces.black" :key="'b'+i" class="piece">{{ PIECES[p] }}</span>
          </div>
        </div>
        <div class="captured-box">
          <h3>Bidak Hitam Ditangkap</h3>
          <div class="captured-list">
            <span v-for="(p, i) in capturedPieces.white" :key="'w'+i" class="piece">{{ PIECES[p] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 6rem 1.5rem 1.5rem 1.5rem;
  font-family: 'Poppins', sans-serif;
  color: var(--text-primary, #e0e0e0);
}

.back-button {
  position: absolute; top: 1.5rem; left: 1.5rem;
  padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 600;
  color: var(--text-secondary, #a0a0a0);
  background-color: var(--bg-card, #16213e);
  border: 1px solid var(--border-color, rgba(224, 224, 224, 0.2));
  border-radius: 8px; text-decoration: none;
  transition: all 0.2s ease-in-out; z-index: 10;
}
.back-button:hover { background-color: #2c3e50; color: #fff; }

.chess-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  align-items: center;
}

.game-main {
  width: 100%;
  max-width: 70vh;
}
.header { text-align: center; margin-bottom: 1rem; }
h1 { font-size: 2.5rem; color: var(--accent-color, #e94560); }
.status { font-size: 1.2rem; font-weight: 600; color: var(--text-secondary); }
.status.white { color: #fff; }
.status.black { color: #fff; }

.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr); 
  aspect-ratio: 1/1;
  border: 4px solid #4a2311;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.board-row {
  display: contents;
}

.square {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.square.light { background-color: #f0d9b5; }
.square.dark { background-color: #b58863; }
.square.selected {
  background-color: #6a82fb !important;
}

.piece {
  font-size: clamp(24px, 5vh, 48px);
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
  line-height: 1;
}

.valid-move-indicator {
  width: 30%;
  height: 30%;
  background-color: rgba(44, 62, 80, 0.5);
  border-radius: 50%;
  position: absolute;
}
.square:hover .valid-move-indicator {
  background-color: rgba(44, 62, 80, 0.7);
}

.reset-button {
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
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

.info-section {
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 70vh;
}
.captured-box {
  flex: 1;
  background-color: var(--bg-card, #16213e);
  border: 1px solid var(--border-color, rgba(224, 224, 224, 0.2));
  border-radius: 12px;
  padding: 1rem;
}
.captured-box h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border-color, rgba(224, 224, 224, 0.2));
  color: var(--accent-color, #e94560);
}
.captured-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 40px;
}
.captured-list .piece {
  font-size: 1.8rem;
  color: var(--text-secondary);
}

@media (min-width: 1024px) {
  .chess-container {
    flex-direction: row;
    align-items: flex-start;
  }
  .game-main {
    max-width: 600px;
  }
  .info-section {
    flex-direction: column;
    max-width: 300px;
  }
}
</style>