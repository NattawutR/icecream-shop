import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
// import Payment from '../views/Payment.vue'
// import Track from '../views/Track.vue'
// import StaffLogin from '../views/StaffLogin.vue'
// import StaffOrders from '../views/StaffOrders.vue'
import MeetView from '../views/MeetView.vue'
import OrderView from '../views/OrderView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import TableView from '../views/TableView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminOrdersView from '../views/AdminOrdersView.vue'
import AdminRegisterView from '../views/AdminRegisterView.vue'
const routes = [
  { path: '/', component: Home },
  // { path: '/meet', component: MeetView },
  { path: '/order/:id', component: OrderView, props: true },
  { path: '/table/:id', component: TableView, props: true },
  { path: '/admin/login', component: AdminLoginView },
  { path: '/admin/orders', component: AdminOrdersView },
  { path: '/admin/register', component: AdminRegisterView },
  { path: '/admin/reset-password', component: ResetPasswordView }, // เพิ่มบรรทัดนี้
  // { path: '/payment', component: Payment },
  // { path: '/track', component: Track },
  // { path: '/staff/login', component: StaffLogin },
  // { path: '/staff/orders', component: StaffOrders },
]
// { path: '/staff/login', component: StaffLogin },
// ยังไม่มีหน้า StaffOrdersView.vue
// { path: '/staff/orders', component: StaffsOrders },

// เพิ่ม navigation guard
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
