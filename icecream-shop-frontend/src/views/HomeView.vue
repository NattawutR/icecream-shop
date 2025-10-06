<!-- filepath: d:\lab\x\src\views\TablesView.vue -->
<template>
  <div class="p-4 max-w-lg mx-auto">
    <h1 class="text-2xl font-bold mb-4">เลือกโต๊ะ</h1>
    <ul v-if="tables.length">
      <li
        v-for="table in availableTables"
        :key="table.table_id"
        class="border rounded p-3 mb-4 shadow-sm bg-white flex justify-between items-center"
      >
        <span>โต๊ะ {{ table.table_id }}</span>
        <button
          class="bg-blue-500 text-white px-3 py-1 rounded"
          v-if="table.status === 'available'"
          @click="goToTable(table.table_id)"
        >
          ไปที่โต๊ะ
        </button>
      </li>
    </ul>
    <div v-else class="text-gray-500 text-center">ไม่มีโต๊ะว่าง</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const tables = ref([])
const router = useRouter()

onMounted(() => {
  fetchTables()
})

async function fetchTables() {
  try {
    const res = await axios.get('http://localhost:3000/api/v1/customers/tables')
    tables.value = res.data
  } catch (err) {
    // handle error
  }
}

// สมมติ status 'available' คือโต๊ะว่าง
const availableTables = computed(() => tables.value)

function goToTable(id) {
  router.push(`/table/${id}`)
}
</script>
