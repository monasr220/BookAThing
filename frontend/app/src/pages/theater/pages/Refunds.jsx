import { useState } from 'react'
import { LoadingState, ErrorState } from '../components/StateViews'
import { getPaymentByBooking, refundPayment } from '../api/payments'
import { getErrorMessage } from '../api/client'

// مفيش endpoint حالياً بيرجع كل حجوزات مسرح/سينما (شوف الملاحظة في Bookings.jsx)،
// فمفيش طريقة نعمل قائمة مدفوعات يختار منها الأدمن/الأوونر. لحد ما الباك اند
// يضيف endpoint زي GET /theaters/:theaterId/bookings، الصفحة دي بتاخد bookingId
// يدوي (العميل بيشوفه في صفحة الإيصال بتاعته - Receipt.jsx) وبتدور على
// الدفعة المرتبطة بيه عشان تعمل refund.
function Refunds() {
  const [bookingId, setBookingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [payment, setPayment] = useState(null)

  const [refunding, setRefunding] = useState(false)
  const [refundError, setRefundError] = useState('')
  const [refundDone, setRefundDone] = useState(false)

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!bookingId.trim()) return
    setLoading(true)
    setError('')
    setPayment(null)
    setRefundDone(false)
    setRefundError('')
    try {
      const data = await getPaymentByBooking(bookingId.trim())
      setPayment(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not find a payment for that booking ID'))
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async () => {
    if (!payment) return
    if (!window.confirm(`Refund ${payment.amount} ${payment.currency}? This cannot be undone.`)) return
    setRefunding(true)
    setRefundError('')
    try {
      const updated = await refundPayment(payment.id)
      setPayment(updated)
      setRefundDone(true)
    } catch (err) {
      setRefundError(getErrorMessage(err, 'Could not refund this payment'))
    } finally {
      setRefunding(false)
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Refunds</h2>
          <p>Look up a payment by booking ID and issue a refund</p>
        </div>
      </div>

      <div className="dashboard-card mb-4">
        <form onSubmit={handleLookup} className="app-form" style={{ maxWidth: 420 }}>
          <label>Booking ID</label>
          <input
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="e.g. 6512f0a2c9d1e4b3a8f0d123"
            required
          />
          <button type="submit" className="gold-button" disabled={loading}>
            {loading ? 'Looking up...' : 'Find payment'}
          </button>
        </form>
      </div>

      {loading && <LoadingState label="Looking up payment..." />}
      {!loading && error && <ErrorState message={error} />}

      {!loading && payment && (
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <h5>Payment Details</h5>
              <p>Transaction ref: {payment.transactionRef}</p>
            </div>
          </div>

          <div className="row g-4 mb-3">
            <div className="col-md-4">
              <div className="revenue-card">
                <span>Amount</span>
                <h3>
                  {payment.amount} {payment.currency}
                </h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="revenue-card">
                <span>Status</span>
                <h3>{payment.status}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="revenue-card">
                <span>Method</span>
                <h3>{payment.paymentMethod}</h3>
              </div>
            </div>
          </div>

          {refundError && <div className="form-error mb-3">{refundError}</div>}
          {refundDone && (
            <div className="notice-box mb-3">
              <i className="fa-solid fa-circle-check"></i>
              <span>Payment refunded successfully.</span>
            </div>
          )}

          {payment.status !== 'refunded' && (
            <button className="gold-button" onClick={handleRefund} disabled={refunding}>
              {refunding ? 'Refunding...' : 'Issue Refund'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default Refunds
