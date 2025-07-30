import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../../views/HomeView.vue';
import GuessTheNumber from '../GuessTheNumber.vue';
import RockPaperScissors from '../RockPaperScissors.vue';
import TetrisGame from '../TetrisGame.vue';
import TicTacToe from '../TicTacToe.vue';
import SlidingPuzzle from '../SlidingPuzzle.vue';
import SnakeGame from '../SnakeGame.vue';
import MinesweeperGame from '../MinesweeperGame.vue';
import BreakoutGame from '../BreakoutGame.vue';
import Game2048 from '../Game2048.vue';
import ChessGame from '../ChessGame.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/guess-the-number',
    name: 'GuessTheNumber',
    component: GuessTheNumber,
  },
  {
    path: '/rock-paper-scissors',
    name: 'RockPaperScissors',
    component: RockPaperScissors,
  },
  {
    path: '/tetris',
    name: 'Tetris',
    component: TetrisGame,
  },
  {
    path: '/tic-tac-toe',
    name: 'TicTacToe',
    component: TicTacToe,
  },
  {
    path: '/SlidingPuzzle',
    name: 'SlidingPuzzle',
    component: SlidingPuzzle,
  },
  {
    path: '/SlidingPuzzle',
    name: 'SlidingPuzzle',
    component: SlidingPuzzle,
  },
  {
    path: '/SnakeGame',
    name: 'SnakeGame',
    component: SnakeGame,
  },
  {
    path: '/MinesweeperGame',
    name: 'MinesweeperGame',
    component: MinesweeperGame,
  },
  {
    path: '/BreakoutGame',
    name: 'BreakoutGame',
    component: BreakoutGame,
  },
  {
    path: '/Game2048',
    name: 'Game2048',
    component: Game2048,
  },
  {
    path: '/ChessGame',
    name: 'ChessGame',
    component: ChessGame,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;