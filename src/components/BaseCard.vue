<template>
  <div class="card">
    <slot />
  </div>
</template>

<script>


export default {

  name: "BaseCard",
};
</script>

<style scoped>
.card {
  background: #011F35;
  border-radius: 16px;
  padding: 20px 32px; /* top‑bottom 20px, left‑right 32px */
   color: #fff;
}
</style>