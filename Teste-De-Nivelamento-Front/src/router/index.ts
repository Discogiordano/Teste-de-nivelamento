import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
      {
        path: '/cadastrar-ficha',
        name: 'CadastrarFicha',
        component: () => import('../views/GerenciarFicha/CadastrarFicha.vue'),
      },
      {
        path: '/visualizar-fichas',
        name: 'VisualizarFichas',
        component: () => import('../views/GerenciarFicha/VisualizarFichas.vue'),
      },
  ],
})

export default router
