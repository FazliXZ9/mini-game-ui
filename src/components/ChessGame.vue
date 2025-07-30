<script setup>
import { ref, onMounted } from 'vue';

// --- Konfigurasi & State Awal ---
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
  // --- PERUBAHAN 1: Posisi Awal Dibalik (Putih di atas) ---
  const initialSetup = [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
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

// --- Logika Gerakan Bidak ---

function getPieceMoves(piece, row, col) {
  const moves = [];
  const type = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();
  // --- PERUBAHAN 2: Arah Pion Dibalik ---
  // Putih (di atas) bergerak ke bawah (+1), Hitam (di bawah) bergerak ke atas (-1)
  const direction = isWhite ? 1 : -1;

  if (type === 'p') { // Pawn
    // Gerakan maju
    if (row + direction >= 0 && row + direction < 8) {
      const nextRow = board.value[row + direction];
      if (nextRow && !nextRow[col].piece) {
        moves.push({ r: row + direction, c: col });
        // Gerakan dua langkah dari awal
        // --- PERUBAHAN 3: Kondisi Baris Awal Pion Disesuaikan ---
        if ((isWhite && row === 1) || (!isWhite && row === 6)) {
           if (row + 2 * direction >= 0 && row + 2 * direction < 8) {
            const twoRowsForward = board.value[row + 2 * direction];
            if (twoRowsForward && !twoRowsForward[col].piece) {
              moves.push({ r: row + 2 * direction, c: col });
            }
          }
        }
      }
      // Menangkap bidak lawan
      [-1, 1].forEach(dCol => {
        if (col + dCol >= 0 && col + dCol < 8) {
            const target = nextRow[col + dCol];
            if (target && target.piece && target.isWhite !== isWhite) {
              moves.push({ r: row + direction, c: col + dCol });
            }
        }
      });
    }
  }
  
  const movePatterns = {
    'n': [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
    'b': [[-1,-1],[-1,1],[1,-1],[1,1]],
    'r': [[-1,0],[1,0],[0,-1],[0,1]],
    'q': [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]],
    'k': [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]
  };

  if (['b', 'r', 'q'].includes(type)) { // Bidak yang bisa meluncur
    movePatterns[type].forEach(([dr, dc]) => {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board.value[r][c].piece) {
          if (board.value[r][c].isWhite !== isWhite) moves.push({r, c});
          break;
        }
        moves.push({r, c});
        r += dr; c += dc;
      }
    });
  } else if (['n', 'k'].includes(type)) { // Bidak yang melompat/satu langkah
    movePatterns[type].forEach(([dr, dc]) => {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (!board.value[r][c].piece || board.value[r][c].isWhite !== isWhite) {
          moves.push({r, c});
        }
      }
    });
  }
  
  return moves;
}

// --- Interaksi Pemain ---

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
  
  if (targetSquare.piece) {
    const capturedSide = targetSquare.isWhite ? 'black' : 'white';
    capturedPieces.value[capturedSide].push(targetSquare.piece);
  }

  board.value[toRow][toCol].piece = pieceToMove;
  board.value[toRow][toCol].isWhite = board.value[fromRow][fromCol].isWhite;
  board.value[fromRow][fromCol].piece = null;
  board.value[fromRow][fromCol].isWhite = null;
  
  if (targetSquare.piece && targetSquare.piece.toLowerCase() === 'k') {
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
  <div class="chess-container">
    <div class="game-main">
      <div class="header">
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
              'valid-move': isSquareValidMove(rowIndex, colIndex)
            }"
            @click="handleSquareClick(rowIndex, colIndex)"
          >
            <span v-if="square.piece" class="piece">{{ PIECES[square.piece] }}</span>
          </div>
        </div>
      </div>

       <button @click="initializeBoard" class="reset-button">Mulai Ulang Permainan</button>
    </div>

    <div class="info-section">
      <div class="captured-box">
        <h3>Bidak Hitam Ditangkap</h3>
        <div class="captured-list">
          <span v-for="(p, i) in capturedPieces.white" :key="'w'+i" class="piece">{{ PIECES[p] }}</span>
        </div>
      </div>
      <div class="captured-box">
        <h3>Bidak Putih Ditangkap</h3>
        <div class="captured-list">
          <span v-for="(p, i) in capturedPieces.black" :key="'b'+i" class="piece">{{ PIECES[p] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* --- Font & Layout Dasar --- */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
  background-color: #312e2b;
  color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.chess-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
}

.game-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

.status {
  font-size: 1.2rem;
  font-weight: bold;
  min-height: 1.5em;
  transition: color 0.3s;
}
.status.white { color: #e8b562; }
.status.black { color: #2c2727; }

/* --- Papan Catur --- */
.board {
  width: clamp(320px, 90vw, 600px);
  height: clamp(320px, 90vw, 600px);
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  border: 5px solid #4a4a4a;
  box-shadow: 0 10px 20px rgba(0,0,0,0.4);
}

.square {
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
}

/* Warna petak sesuai gambar */
.light { background-color: #f0d9b5; }
.dark { background-color: #b58863; }

.piece {
  font-size: clamp(28px, 10vmin, 60px);
  text-shadow: 0 2px 4px rgba(0,0,0,0.25);
  line-height: 1;
  pointer-events: none; /* Agar klik tidak terganggu oleh span */
}

/* --- Styling Interaksi --- */
.selected {
  background-color: #6a994e !important; /* Warna hijau untuk menandai */
}

.valid-move::after {
  content: '';
  position: absolute;
  width: 30%;
  height: 30%;
  background-color: rgba(40, 40, 40, 0.4);
  border-radius: 50%;
  pointer-events: none; /* Agar tidak mengganggu klik */
}
.valid-move:has(.piece)::after {
  background-color: transparent;
  border: 5px solid rgba(40, 40, 40, 0.5);
  width: 85%;
  height: 85%;
  box-sizing: border-box;
}

/* --- Tombol & Info Section --- */
.reset-button {
  margin-top: 1.5rem;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #5a8c45;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}
.reset-button:hover {
  background-color: #6a994e;
}

.info-section {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.captured-box {
  background-color: #3c3a37;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.captured-box h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-align: center;
  color: #c0c0c0;
}

.captured-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-height: 40px;
  align-content: flex-start;
}

.captured-list .piece {
  font-size: 30px;
}
</style>    