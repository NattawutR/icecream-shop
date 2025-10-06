<template>
  <div class="p-4 max-w-sm mx-auto">
    <h1 class="text-2xl font-bold mb-4">Admin Login</h1>
    <form @submit.prevent="login">
      <input
        v-model="email"
        type="text"
        placeholder="email"
        class="mb-2 w-full p-2 border rounded"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="mb-2 w-full p-2 border rounded"
      />
      <button class="bg-blue-500 text-white px-4 py-2 rounded w-full">เข้าสู่ระบบ</button>
    </form>
    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
    <div class="mt-4 text-center">
      <router-link to="/admin/reset-password" class="text-blue-600 hover:underline">
        ลืมรหัสผ่าน / เปลี่ยนรหัสผ่าน
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function login() {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('admin_token', res.data.token)
    router.push('/admin/orders')
  } catch (err) {
    error.value = 'เข้าสู่ระบบไม่สำเร็จ'
  }
}
</script>
