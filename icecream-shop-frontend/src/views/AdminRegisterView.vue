<template>
  <div class="p-4 max-w-sm mx-auto">
    <h1 class="text-2xl font-bold mb-4">สมัครพนักงาน</h1>
    <form @submit.prevent="register">
      <input
        v-model="fullName"
        type="text"
        placeholder="ชื่อ-นามสกุล"
        class="mb-2 w-full p-2 border rounded"
      />
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="mb-2 w-full p-2 border rounded"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="mb-2 w-full p-2 border rounded"
      />
      <select v-model="role" class="mb-2 w-full p-2 border rounded">
        <option value="waiter">พนักงานเสิร์ฟ</option>
        <option value="admin">แอดมิน</option>
      </select>
      <button class="bg-green-500 text-white px-4 py-2 rounded w-full">สมัคร</button>
    </form>
    <div v-if="success" class="text-green-600 mt-2">สมัครสำเร็จ!</div>
    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const fullName = ref('')
const email = ref('')
const password = ref('')
const role = ref('waiter')
const success = ref(false)
const error = ref('')

async function register() {
  try {
    await axios.post('http://localhost:3000/api/v1/auth/add-staff', {
      fullName: fullName.value,
      email: email.value,
      password: password.value,
      role: role.value,
    })
    success.value = true
    error.value = ''
    //redirect to login page after 2 seconds
  } catch (err) {
    error.value = 'สมัครไม่สำเร็จ'
    success.value = false
  }
}
</script>
