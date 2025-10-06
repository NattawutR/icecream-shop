<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <h1 class="text-3xl font-bold mb-6">หน้าเจอ</h1>
    <router-link to="/order/1" class="bg-green-500 text-white px-6 py-3 rounded shadow"
      >ไปสั่งอาหาร</router-link
    >
  </div>
</template>

<script>
export default {
  name: 'MeetView',
}
</script>

<style scoped>
@media (max-width: 640px) {
  h1 {
    font-size: 2rem;
  }
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
