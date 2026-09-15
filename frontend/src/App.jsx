import { useState } from 'react'
import BookingFlow from './components/BookingFlow'
import Payment from './components/Payment'
import Success from './components/Success'

function App() {
  const [step, setStep] = useState("booking") // booking, payment, success
  const movie = { title: "Inside Out 2" }

  return (
    <div style={{ padding: '20px', background: '#0f0f0f', minHeight: '100vh', color: 'white' }}>
      {step === "booking" && <BookingFlow movie={movie} onNext={() => setStep("payment")} />}
      {step === "payment" && <Payment onNext={() => setStep("success")} onBack={() => setStep("booking")} />}
      {step === "success" && <Success onReset={() => setStep("booking")} />}
    </div>
  )
}

export default App