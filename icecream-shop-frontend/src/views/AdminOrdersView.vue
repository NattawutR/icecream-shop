<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">รายการออเดอร์ (Admin)</h1>
    <div class="flex gap-2 mb-6">
      <button
        :class="tab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
        class="px-4 py-2 rounded"
        @click="tab = 'orders'"
      >
        ดูรายการออเดอร์ทั้งหมด
      </button>
      <button
        :class="tab === 'tables' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
        class="px-4 py-2 rounded"
        @click="tab = 'tables'"
      >
        ดูโต๊ะทั้งหมด
      </button>
      <button
        :class="tab === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
        class="px-4 py-2 rounded"
        @click="tab = 'report'"
      >
        ดูรายงาน
      </button>
    </div>

    <div v-if="tab === 'orders'">
      <div v-for="status in orderStatuses" :key="status" class="mb-8">
        <h2 class="text-lg font-semibold mb-2">{{ statusText(status) }}</h2>
        <ul v-if="ordersByStatus(status).length">
          <li
            v-for="order in ordersByStatus(status)"
            :key="order.order_id"
            class="border rounded p-3 mb-4 shadow-sm bg-white flex flex-col gap-2"
          >
            <div class="font-semibold text-blue-700">เลขออร์เดอร์: {{ order.order_id }}</div>
            <div>โต๊ะ: {{ order.table_id }}</div>
            <div>
              <span class="font-semibold">สถานะ: </span>
              <span :class="statusColor(order.status)">
                {{ statusText(order.status) }}
              </span>
            </div>
            <div>
              <span class="font-semibold">รายการ:</span>
              <ul class="ml-4 list-disc">
                <li v-for="item in order.order_items" :key="item.item_id" class="text-sm">
                  {{ item.menu_items.name }} x{{ item.quantity }} (฿{{
                    (item.price * item.quantity).toFixed(2)
                  }})
                </li>
              </ul>
            </div>
            <button
              v-if="order.status === 'submitted'"
              class="bg-green-500 text-white px-3 py-1 rounded self-end"
              @click="assignOrder(order)"
            >
              รับออเดอร์
            </button>
            <button
              v-if="order.status === 'preparing'"
              class="bg-blue-500 text-white px-3 py-1 rounded self-end"
              @click="serveOrder(order)"
            >
              เสิร์ฟ
            </button>
          </li>
        </ul>
        <div v-else class="text-gray-500 text-center">ไม่มีออเดอร์ในสถานะนี้</div>
      </div>
    </div>

    <div v-else-if="tab === 'tables'">
      <h2 class="text-lg font-semibold mb-2">โต๊ะทั้งหมด</h2>
      <ul v-if="tables.length">
        <li
          v-for="table in tables"
          :key="table.table_id"
          class="border rounded p-3 mb-4 shadow-sm bg-white flex flex-col gap-2"
        >
          <div class="font-semibold text-blue-700">โต๊ะ: {{ table.table_id }}</div>
          <div>สถานะ: {{ table.status }}</div>
          <div class="flex gap-2 mt-2">
            <button
              class="bg-blue-500 text-white px-3 py-1 rounded"
              @click="viewTableOrders(table.table_id)"
            >
              ดูรายการ
            </button>
            <button
              class="bg-green-600 text-white px-3 py-1 rounded"
              @click="requestTablePayment(table.table_id)"
            >
              คิดเงิน
            </button>
          </div>
          <div v-if="tableOrders[table.table_id]">
            <h3 class="font-semibold mt-2">รายการออเดอร์</h3>
            <ul>
              <li v-for="order in tableOrders[table.table_id]" :key="order.order_id">
                <li v-for="item in order.order_items" :key="item.item_id" class="text-sm">
              {{ item.menu_items.name }} x{{ item.quantity }} (฿{{ (item.price * item.quantity).toFixed(2) }})
            </li>
               <div class="mt-2 font-bold text-green-700">
                เงินรวม: ฿{{ totalTableAmount(table.table_id) }}
              </div>
              <div v-if="qrUrls[table.table_id]" class="mt-2">
                <a :href="qrUrls[table.table_id]" target="_blank" class="text-blue-600 underline">ดู QR สำหรับชำระเงิน</a>
              </div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <div v-else class="text-gray-500 text-center">ไม่มีข้อมูลโต๊ะ</div>
    </div>
    <div v-else-if="tab === 'report'">
      <h2 class="text-lg font-semibold mb-2">รายงานยอดขาย</h2>
      <div class="flex gap-2 mb-4">
        <input type="date" v-model="reportDate" class="border px-2 py-1 rounded" />
        <button
          class="bg-blue-500 text-white px-3 py-1 rounded"
          @click="fetchDailyReport"
        >
          รายวัน
        </button>
        <input type="month" v-model="reportMonth" class="border px-2 py-1 rounded" />
        <button
          class="bg-blue-500 text-white px-3 py-1 rounded"
          @click="fetchMonthlyReport"
        >
          รายเดือน
        </button>
      </div>
      <div v-if="dailyReport">
        <h3 class="font-semibold">รายงานรายวัน ({{ reportDate }})</h3>
        <div>ยอดขายรวม: ฿{{ dailyReport.total }}</div>
        
      </div>
      <div v-if="monthlyReport">
        <h3 class="font-semibold">รายงานรายเดือน ({{ reportMonth }})</h3>
        <div>ยอดขายรวม: ฿{{ monthlyReport.total }}</div>
      
      </div>
    </div>
  </div>
   <!-- transition name="fade">
      <div
        v-if="notification"
        class="fixed bottom-4 right-4 bg-yellow-200 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow"
      >
        {{ notification }}
      </div>
    </transition>< -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
const qrUrls = ref({})
const tab = ref('orders')
const orders = ref([])
const tables = ref([])
let paymentEventSources = []
const reportDate = ref(new Date().toISOString().slice(0, 10))
const reportMonth = ref(new Date().toISOString().slice(0, 7))
const dailyReport = ref(null)
const monthlyReport = ref(null)
import { useToast } from 'vue-toastification'
const orderStatuses = ['submitted', 'preparing', 'served', 'awaiting_payment']
const toast = useToast()
onMounted(() => {
  fetchOrders()
  fetchTables()
  subscribeNewOrderSSE()
})

let eventSources = []
let newOrderEventSource = null
let fetchOrdersTimeout = null

async function subscribeNewOrderSSE() {
  // ปิด eventSource เดิมถ้ามี
  if (newOrderEventSource) newOrderEventSource.close()
  // subscribe SSE endpoint สำหรับ admin
  newOrderEventSource = new EventSource('http://localhost:3000/api/v1/orders/admin/new-order')
  newOrderEventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    showNotification(`มีออเดอร์ใหม่: ${data.order_id || ''}`)
    // debounce การเรียก fetchOrders
    if (fetchOrdersTimeout) clearTimeout(fetchOrdersTimeout)
    fetchOrdersTimeout = setTimeout(() => {
      fetchOrders()
    }, 1000) // รอ 1 วินาที
  }
}
async function fetchDailyReport() {
  try {
    const res = await axios.get(
      `http://localhost:3000/api/v1/rpt/sales/daily?date=${reportDate.value}`
    )
    dailyReport.value = res.data
    console.log(dailyReport.value);
    
  } catch (err) {
    showNotification('ไม่สามารถดึงรายงานรายวันได้')
  }
}

async function fetchMonthlyReport() {
  try {
    const [year, month] = reportMonth.value.split('-')
    const res = await axios.get(
      `http://localhost:3000/api/v1/rpt/sales/monthly?year=${year}&month=${month}`
    )
    monthlyReport.value = res.data
  } catch (err) {
    showNotification('ไม่สามารถดึงรายงานรายเดือนได้')
  }
}

watch(tables, (newTables) => {
  // ปิดทุก eventSource เดิม
  eventSources.forEach((es) => es.close())
  eventSources = []

  // subscribe เฉพาะโต๊ะที่สถานะ processing
  newTables.forEach((table) => {
    if (table.status === 'occupied' ) {
      const es = new EventSource(`http://localhost:3000/api/v1/orders/${table.table_id}/payment`)
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        showNotification(`โต๊ะ ${table.table_id} ขอชำระเงิน`)
        fetchOrders() // รีเฟรชออเดอร์ทั้งหมด
      }
      eventSources.push(es)
    }
    else if (table.status === 'awaiting_payment' ) {
      ///api/v1/orders/:id/paymentSuccess
      const es = new EventSource(`http://localhost:3000/api/v1/orders/${table.table_id}/paymentSuccess`)
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        showNotification(`โต๊ะ ${table.table_id} ชำระเงินแล้ว`)
        fetchOrders() // รีเฟรชออเดอร์ทั้งหมด
      }
      eventSources.push(es)
    }
  })
})

// ปิด eventSources เมื่อออกจากหน้า

onUnmounted(() => {
  if (newOrderEventSource) newOrderEventSource.close()
  eventSources.forEach((es) => es.close())
  eventSources = []
  paymentEventSources.forEach((es) => es.close())
  paymentEventSources = []
})

async function fetchOrders() {
  try {
    const token = localStorage.getItem('admin_token')
    const res = await axios.get('http://localhost:3000/api/v1/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
    orders.value = res.data
  } catch (err) {
    // handle error
  }
}

async function fetchTables() {
  try {
    const token = localStorage.getItem('admin_token')
    const res = await axios.get('http://localhost:3000/api/v1/tables', {
      headers: { Authorization: `Bearer ${token}` },
    })
    tables.value = res.data
  } catch (err) {
    // handle error
  }
}

function totalTableAmount(tableId) {
  const orders = tableOrders.value[tableId] || []
  return orders.reduce((sum, order) => {
    return sum + order.order_items.reduce((osum, item) => osum + Number(item.price) * Number(item.quantity), 0)
  }, 0)
}

function ordersByStatus(status) {
  return orders.value.filter((o) => o.status === status)
}
const notification = ref('')
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

function statusColor(status) {
  return {
    'text-orange-500': status === 'preparing',
    'text-green-600': status === 'served',
    'text-gray-500': status === 'submitted',
    'text-red-500': status === 'awaiting_payment',
  }
}

async function serveOrder(order) {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.put(
      `http://localhost:3000/api/v1/orders/OrderStatusServed/${order.order_id}/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    fetchOrders()
  } catch (err) {
    // handle error
  }
}

function subscribePaymentSSE() {
  paymentEventSources.forEach((es) => es.close())
  paymentEventSources = []
  orders.value.forEach((order) => {
    if (order.status === 'awaiting_payment') {
      const es = new EventSource(
        `http://localhost:3000/api/v1/orders/${order.order_id}/payment-sse`,
      )
      es.onmessage = (event) => {
        const data = JSON.parse(event.data)
        // แจ้งเตือนหรืออัปเดต UI ตามข้อมูล payment gateway
        // เช่น showNotification(`ออร์เดอร์ ${order.order_id} ชำระเงินแล้ว`)
      }
      paymentEventSources.push(es)
    }
  })
}
onUnmounted(() => {
    if (newOrderEventSource) newOrderEventSource.close()
  eventSources.forEach((es) => es.close())
  eventSources = []
})

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

async function assignOrder(order) {
  try {
    const token = localStorage.getItem('admin_token')
    const payload = parseJwt(token)
    const staffId = payload?.staffId
    await axios.put(
      `http://localhost:3000/api/v1/orders/${order.order_id}/assign`,
      { staffId },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    fetchOrders()
  } catch (err) {}
}
const tableOrders = ref({})

async function viewTableOrders(tableId) {
  try {
    const res = await axios.get(`http://localhost:3000/api/v1/customers/${tableId}/pending-orders`)
    tableOrders.value = { ...tableOrders.value, [tableId]: res.data }
  } catch (err) {
    // handle error
  }
}

async function requestTablePayment(tableId) {
  try {
    const orders = tableOrders.value[tableId] || []
    if (!orders.length) return
    // ใช้ payment_id ของ order ล่าสุดในโต๊ะนั้น
    const lastOrder = orders[orders.length - 1]
    const paymentId = lastOrder.payment_id
    // คำนวณเงินรวมทั้งหมดของโต๊ะ (บาท -> สตางค์)
    const amountBaht = totalTableAmount(tableId)
    const amountSatang = Math.round(amountBaht * 100)
    const res = await axios.post(
      `http://localhost:3000/api/v1/payments/${paymentId}/pay`,
      { amount: amountSatang }
    )
    if (res.data.qr) {
      qrUrls.value = { ...qrUrls.value, [tableId]: res.data.qr }
    }
  } catch (err) {
    // handle error
  }
}
</script>
