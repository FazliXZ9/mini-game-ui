import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../../views/HomeView.vue';
import GuessTheNumber from '../GuessTheNumber.vue';
import RockPaperScissors from '../RockPaperScissors.vue';
import TetrisGame from '../TetrisGame.vue';
import TicTacToe from '../TicTacToe.vue';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;