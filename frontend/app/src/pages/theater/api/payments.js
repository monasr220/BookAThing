import apiClient, { unwrap } from './client'

// مفيش endpoint حالياً بيرجع كل حجوزات مسرح معين (شوف الملاحظة في Bookings.jsx)،
// فمفيش طريقة نعرض بيها قائمة مدفوعات نختار منها نعمل refund. لحد ما الباك اند
// يضيف endpoint زي GET /theaters/:theaterId/bookings، بنستخدم bookingId اللي
// العميل شايفه في صفحة الإيصال بتاعته (Receipt.jsx) كمدخل يدوي.

export async function getPaymentByBooking(bookingId) {
  const response = await apiClient.get(`/payments/booking/${bookingId}`)
  return unwrap(response) // { id, bookingId, amount, currency, status, paymentMethod, transactionRef, createdAt }
}

export async function refundPayment(paymentId) {
  const response = await apiClient.post(`/payments/${paymentId}/refund`)
  return unwrap(response)
}
