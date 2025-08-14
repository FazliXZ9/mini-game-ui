<script setup>
import { ref, computed } from 'vue';

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
    name: 'Tebak Angka',
    path: '/guess-the-number',
    emoji: '🤔',
    description: 'Tebak angka rahasia komputer.',
  },
  {
    name: 'Puzzle Geser',
    path: '/SlidingPuzzle',
    emoji: '🧩',
    description: 'Susun ulang gambar yang teracak.',
  },
  {
    name: 'Snake',
    path: '/SnakeGame',
    emoji: '🐍',
    description: 'Pandu ular untuk memakan makanan.',
  },
  {
    name: 'Breakout',
    path: '/BreakoutGame',
    emoji: '🧱',
    description: 'Hancurkan balok dengan bola pantul.',
  },
  // Kategori Beta
  {
    name: 'Minesweeper',
    path: '/MinesweeperGame',
    isBeta: true,
    description: 'Cari semua bom tanpa meledakkannya.',
  },
  {
    name: '2048',
    path: '/Game2048',
    isBeta: true,
    description: 'Gabungkan ubin untuk mencapai angka 2048.',
  },
  {
    name: 'Catur',
    path: '/ChessGame',
    isBeta: true,
    description: 'Permainan catur klasik melawan komputer.',
  },
]);

const readyGames = computed(() => games.value.filter(game => !game.isBeta));
const betaGames = computed(() => games.value.filter(game => game.isBeta));

</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">Pilih Game 🎮</h1>
      <p class="subtitle">Koleksi mini game oleh Sainz</p>
    </div>

    <div class="category-section">
      <h2 class="category-title">Siap Dimainkan</h2>
      <div class="game-grid">
        <router-link v-for="game in readyGames" :key="game.name" :to="game.path" class="game-card-link">
          <div class="game-card">
            <div class="game-icon">{{ game.emoji }}</div>
            <h3 class="game-name">{{ game.name }}</h3>
            <p class="game-description">{{ game.description }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <div class="category-section" v-if="betaGames.length > 0">
      <h2 class="category-title">Uji Coba (Beta)</h2>
      <div class="game-grid">
        <router-link v-for="game in betaGames" :key="game.name" :to="game.path" class="game-card-link">
          <div class="game-card beta">
            <div class="beta-badge">BETA</div>
            <h3 class="game-name">{{ game.name }}</h3>
            <p class="game-description">{{ game.description }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <footer class="footer">
      <p>&copy; 2025 Muhammad Fazli M</p>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 40px 24px;
  background-color: #f8fafc; 
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

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

.category-section {
  width: 100%;
  max-width: 1024px;
  margin-bottom: 48px;
}

.category-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.game-card-link {
  text-decoration: none;
}

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
  position: relative; 
  overflow: hidden; 
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.beta-badge {
  position: absolute;
  top: 12px;
  right: -35px;
  transform: rotate(45deg);
  background-color: #3b82f6; 
  color: white;
  padding: 2px 40px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.game-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  line-height: 1;
}

.game-card.beta .game-name {
  margin-top: 16px;
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

.footer {
  width: 100%;
  max-width: 1024px;
  margin-top: auto;
  padding: 24px 0; 
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
}

/* Responsive */
@media (max-width: 480px) {
  .home-container { padding: 32px 20px; }
  .header { margin-bottom: 32px; }
  .title { font-size: 2.25rem; }
  .subtitle { font-size: 1rem; }
  .game-grid { grid-template-columns: 1fr; gap: 20px; }
  .game-card { padding: 20px; }
}
</style>