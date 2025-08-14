<script setup>
import { ref } from 'vue';

const games = ref([
  {
    name: 'Tetris',
    path: '/tetris',
    emoji: '🕹️',
    description: 'Susun balok yang jatuh untuk membersihkan baris.',
  },
  {
    name: 'Tic Tac Toe',
    path: '/tic-tac-toe',
    emoji: '⚔️',
    description: 'Dapatkan tiga simbol dalam satu baris.',
  },
  {
    name: 'Batu Gunting Kertas',
    path: '/rock-paper-scissors',
    emoji: '🤘',
    description: 'Adu pilihanmu melawan komputer.',
  },
  {
    name: 'Tebang Angka',
    path: '/guess-the-number',
    emoji: '🤔',
    description: 'Tebak angka rahasia komputer.',
  },
  {
    name: 'Puzzle',
    path: '/SlidingPuzzle',
    emoji: '',
    description: 'Puzzle Geser.',
  },
  {
    name: 'Snake',
    path: '/SnakeGame',
    emoji: '',
    description: 'Mini Game Snake.',
  },
  {
    name: 'Breakout Game',
    path: '/BreakoutGame',
    emoji: '',
    description: 'Memantulkan Bola ke balok-balok.',
  },
  {
    name: 'Mine Sweeper',
    path: '/MinesweeperGame',
    emoji: 'Beta Tes',
    description: 'Beta Tes.',
  },
  {
    name: '2048',
    path: '/Game2048',
    emoji: 'Beta Tes',
    description: 'Beta Tes.',
  },
  {
    name: 'Chess',
    path: '/ChessGame',
    emoji: 'Beta Tes',
    description: 'Beta Tes.',
  },
]);
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">Pilih Game 🎮</h1>
      <p class="subtitle">Mini game by Sainz</p>
    </div>
    <div class="game-grid">
      <router-link
        v-for="game in games"
        :key="game.name"
        :to="game.path"
        class="game-card-link"
      >
        <div class="game-card">
          <div class="game-icon">{{ game.emoji }}</div>
          <h2 class="game-name">{{ game.name }}</h2>
          <p class="game-description">{{ game.description }}</p>
        </div>
      </router-link>
    </div>
      <footer class="footer">
        <p>&copy; 2025 Muhammad Fazli M</p>
      </footer>
    </div>
</template>

<style scoped>
/* Latar belakang dan font dasar */
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 40px 24px;
  /* background-color: #f0f4f8; */
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

.footer {
  width: 100%;
  max-width: 1024px;
  margin-top: auto;
  padding: 48px 0 32px 0; 
  text-align: center;
  box-sizing: border-box;
}

.footer p {
  margin: 0;
  padding-top: 16px;
  font-size: 0.9rem;
  color: #64748b;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 48px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin-top: 8px;
}

/* Grid untuk Game */
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1024px;
}

/* Link Kartu */
.game-card-link {
  text-decoration: none;
}

/* Desain Kartu Game */
.game-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* Konten Kartu */
.game-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  line-height: 1;
}

.game-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
}

.game-description {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}


/* -- KODE PERBAIKAN RESPONSIVE FINAL -- */
@media (max-width: 480px) {
  .home-container {
    padding: 32px 20px;
  }

  .header {
    margin-bottom: 32px;
  }

  .title {
    font-size: 2.25rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .game-grid {
    /* UBAH BARIS INI: Paksa grid menjadi satu kolom */
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .game-card {
    padding: 20px;
  }

  .footer {
    /* Mengatur ulang padding agar ada ruang di kiri dan kanan */
    padding-left: 0px;
    padding-right: 0px;
  }
}

</style>