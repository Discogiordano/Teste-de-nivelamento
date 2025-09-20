<template>
  <nav class="menu">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/cadastrar-ficha">Cadastrar Ficha</RouterLink>
    <RouterLink to="/visualizar-fichas">Visualizar Fichas</RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.menu {
  width: 100%;
  font-size: 14px;
  text-align: center;
  margin-top: 2rem;
}
.menu a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}
.menu a:first-of-type {
  border: 0;
}
.menu a.router-link-exact-active {
  color: var(--color-text);
}
</style>
