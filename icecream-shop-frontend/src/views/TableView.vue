<template>
  <div class="p-4 max-w-lg mx-auto">
    <h1 class="text-2xl font-bold mb-4">ประวัติการสั่งอาหาร</h1>
    <div class="flex gap-2 justify-end mt-2">
      <button
        v-if="!NotallAwaitingPayment"
        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        @click="goToOrderView()"
      >
        เพิ่มรายการ
      </button>

      <button
        v-if="allAwaitingPayment"
        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        @click="requestPaymentAll()"
      >
        ชำระเงิน
      </button>
    </div>
    <ul v-if="orders.length">
      <li
        v-for="order in orders"
        :key="order.order_id"
        class="border rounded p-3 mb-4 shadow-sm bg-white flex flex-col gap-2"
      >
        <div class="font-semibold text-blue-700">เลขออร์เดอร์: {{ order.order_id }}</div>
        <div>โต๊ะ: {{ order.table_id }}</div>
        <div>
          <span class="font-semibold">สถานะ: </span>
          <span
            :class="{
              'text-orange-500': order.status === 'preparing',
              'text-green-600': order.status === 'served',
              'text-gray-500': order.status === 'submitted',
              'text-red-500': order.status === 'awaiting_payment',
            }"
          >
            {{ statusText(order.status) }}
          </span>
        </div>

        <div>
          <span class="font-semibold">รายการ:</span>
          <ul class="ml-4 list-disc">
            <li v-for="item in order.order_items" :key="item.item_id" class="text-sm">
              {{ item.name }} x{{ item.quantity }} (฿{{ (item.price * item.quantity).toFixed(2) }})
            </li>
          </ul>
        </div>
      </li>
    </ul>

    <div v-else class="text-gray-500 text-center">ไม่มีประวัติการสั่งอาหาร</div>

    <!-- Notification -->
    <transition name="fade">
      <div
        v-if="notification"
        class="fixed bottom-4 right-4 bg-yellow-200 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow"
      >
        {{ notification }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'vue-toastification'
// ...existing code...
const toast = useToast()
const orders = ref([])
const router = useRouter()
const notification = ref('')
const tableId = ref()
const allAwaitingPayment = computed(() => {
  return orders.value.length > 0 && orders.value.every((o) => o.status === 'served')
})
const NotallAwaitingPayment = computed(() => {
  return orders.value.length > 0 && orders.value.every((o) => o.status === 'awaiting_payment')
})

let eventSources = []
onMounted(() => {
  tableId.value = router.currentRoute.value.params.id
  fetchOrders(tableId.value)
})

watch(orders, (newOrders) => {
  // ปิดทุก eventSource เดิม
  eventSources.forEach((es) => es.close())
  eventSources = []

  // subscribe เฉพาะ order ที่สถานะ submitted
  newOrders.forEach((order) => {
    if (order.status === 'submitted') {
      const es = new EventSource(`http://localhost:3000/api/v1/orders/${order.order_id}/subscribe`)
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        showNotification(`ออร์เดอร์ ${order.order_id} ถูกอัปเดตเป็น "${data.status}"`)
        fetchOrders(tableId.value)
      }
      eventSources.push(es)
    }
    if (order.status === 'preparing') {
      const es = new EventSource(`http://localhost:3000/api/v1/orders/${order.order_id}/subscribe`)
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        showNotification(`ออร์เดอร์ ${order.order_id} ถูกอัปเดตเป็น "${data.status}"`)
        fetchOrders(tableId.value)
      }
      eventSources.push(es)
    }
  })
})

// onUnmounted(() => {
//   if (eventSource) eventSource.close()
// })

async function fetchOrders(tableId) {
  try {
    const res = await axios.get(`http://localhost:3000/api/v1/customers/${tableId}/pending-orders`)
    orders.value = res.data
  } catch (err) {
    console.error(err)
  }
}

function goToOrderView() {
  // const tableId = router.currentRoute.value.params.id
  router.push({ path: `/order/${tableId.value}` })
}

async function requestPaymentAll() {
  try {
    const res = await axios.put(
      `http://localhost:3000/api/v1/orders/${tableId.value}/request-payment`,
    )
    showNotification(`กรุณารอสักครู่"`)
  } catch (err) {
    console.error(err)
  }
}
function showNotification(msg) {
  toast(msg, { timeout: 4000 })
}

function statusText(status) {
  const map = {
    submitted: 'รอยืนยัน',
    preparing: 'กำลังเตรียม',
    served: 'เสิร์ฟแล้ว',
    awaiting_payment: 'รอชำระเงิน',
  }
  return map[status] || status
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
