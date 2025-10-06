<template>
  <div class="p-4 max-w-lg mx-auto">
    <h1 class="text-2xl font-bold mb-4">🍦 เมนูไอศกรีม</h1>
    <div v-for="cat in categories" :key="cat" class="mb-6">
      <h2 class="text-xl font-semibold mb-2">{{ categoryLabel(cat) }}</h2>
      <ul>
        <li
          v-for="m in menuByCategory(cat)"
          :key="m.item_id"
          class="border-b py-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2"
        >
          <div>
            <span>{{ m.name }} - ฿{{ m.price }}</span>
          </div>
          <div class="flex items-center gap-2 mt-2 sm:mt-0">
            <input
              type="number"
              min="1"
              v-model.number="quantities[m.item_id]"
              class="w-16 p-1 border rounded"
            />
            <button
              class="bg-blue-500 text-white px-2 rounded"
              @click="addToCart(m, quantities[m.item_id] || 1)"
            >
              เพิ่ม
            </button>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="cart.length" class="mt-6">
      <h2 class="text-lg font-semibold mb-2">รายการที่สั่ง</h2>
      <ul>
        <li
          v-for="(item, idx) in cart"
          :key="idx"
          class="flex justify-between py-1 items-center gap-2"
        >
          <span>{{ item.name }} x{{ item.quantity }}</span>
          <span>฿{{ item.price * item.quantity }}</span>
          <button class="bg-red-500 text-white px-2 rounded ml-2" @click="removeFromCart(idx)">
            ลบ
          </button>
        </li>
      </ul>
      <div class="mt-2 font-bold">รวม: ฿{{ totalPrice }}</div>
      <button class="bg-green-600 text-white px-4 py-2 rounded mt-4 mr-2" @click="submitOrder">
        ส่งคำสั่งซื้อ
      </button>
    </div>
    <div v-if="orderId" class="mt-4 text-blue-600">
      <div>เลขออร์เดอร์: {{ orderId }}</div>
      <div v-if="paymentCollected" class="text-green-600">ชำระเงินแล้ว</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
const toast = useToast()
const router = useRouter()

const menu = ref([])
const cart = ref([])
const orderId = ref(null)
const orderStatus = ref('')
const paymentCollected = ref(false)
const quantities = ref({})
const categories = ref([])

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/v1/customers/menu')
  menu.value = res.data
  // กำหนดค่าเริ่มต้นจำนวนแต่ละเมนูเป็น 1
  menu.value.forEach((item) => {
    quantities.value[item.item_id] = 1
  })
  // สร้าง category list
  categories.value = [...new Set(menu.value.map((item) => item.category))]
})

function menuByCategory(cat) {
  return menu.value.filter((item) => item.category === cat)
}

function categoryLabel(cat) {
  if (cat === 'icecream') return 'ไอศกรีม'
  return cat
}

const addToCart = (item, qty = 1) => {
  qty = Math.max(1, Number(qty) || 1)
  const found = cart.value.find((i) => i.item_id === item.item_id)
  if (found) {
    found.quantity += qty
    toast.success(`เพิ่ม ${item.name} อีก ${qty} ชิ้น`)
  } else {
    cart.value.push({ ...item, quantity: qty })
    toast.success(`เพิ่ม ${item.name} ${qty} ชิ้น`)
  }
  quantities.value[item.item_id] = 1 // reset หลังเพิ่ม
}

const removeFromCart = (idx) => {
  const item = cart.value[idx]
  cart.value.splice(idx, 1)
  toast.info(`ลบ ${item.name} ออกจากรายการ`)
}

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const submitOrder = async () => {
  //get id form url
  const tableId = router.currentRoute.value.params.id
  console.log(tableId)

  try {
    const res = await axios.put(`http://localhost:3000/api/v1/customers/${tableId}/scan`, {
      menuItems: cart.value,
    })
    orderId.value = res.data.order.order_id
    notifyStaff(orderId.value)
    toast.success(`สั่งสำเร็จ! เลขออร์เดอร์: ${res.data.order.order_id}`)
    // subscribeOrderStatus(orderId.value)
    goToTable()
  } catch (err) {
    toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ')
  }
}
function goToTable() {
  const tableId = router.currentRoute.value.params.id
  router.push({ path: `/table/${tableId}` })
}
const collectPayment = () => {
  paymentCollected.value = true
  toast.success('รับชำระเงินเรียบร้อย')
}

function notifyStaff(orderId) {
  // mock: สามารถเชื่อมต่อ websocket หรือ push notification จริงได้
  console.log('แจ้งเตือนหลังบ้าน: มีออเดอร์ใหม่', orderId)
}
</script>
