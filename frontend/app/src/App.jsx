import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/home/Home'));
const AuthForm = lazy(() => import('./pages/auth/AuthForm'));
const ActiveOffers = lazy(() => import('./pages/offers/ActiveOffers'));
const MovieBooking = lazy(() => import('./pages/booking/MovieBooking'));
// لوحة تحكم أصحاب السينمات بتدير التنقل الداخلي بتاعها لوحدها
const TheaterApp = lazy(() => import('./pages/theater/TheaterApp'));

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div style={{ padding: 40, color: '#fff' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/offers" element={<ActiveOffers />} />
          <Route path="/movie/:id" element={<MovieBooking />} />
          <Route path="/theater/*" element={<TheaterApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

