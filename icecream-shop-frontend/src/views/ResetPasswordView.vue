<template>
  <div class="p-4 max-w-sm mx-auto">
    <h1 class="text-2xl font-bold mb-4">เปลี่ยนรหัสผ่าน</h1>
    <form @submit.prevent="resetPassword">
      <input
        v-model="email"
        type="text"
        placeholder="Email"
        class="mb-2 w-full p-2 border rounded"
      />
      <input
        v-model="newPassword"
        type="password"
        placeholder="รหัสผ่านใหม่"
        class="mb-2 w-full p-2 border rounded"
      />
      <button class="bg-green-500 text-white px-4 py-2 rounded w-full">เปลี่ยนรหัสผ่าน</button>
    </form>
    <div v-if="msg" class="text-green-600 mt-2">{{ msg }}</div>
    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const newPassword = ref('')
const msg = ref('')
const error = ref('')

async function resetPassword() {
  try {
    await axios.post('http://localhost:3000/api/v1/auth/reset-password', {
      email: email.value,
      newPassword: newPassword.value,
    })
    msg.value = 'เปลี่ยนรหัสผ่านสำเร็จ'
    error.value = ''
    setTimeout(() => {
      window.location.href = '/admin/login'
    }, 500)
  } catch (err) {
    error.value = 'เปลี่ยนรหัสผ่านไม่สำเร็จ'
    msg.value = ''
  }
}
</script>
