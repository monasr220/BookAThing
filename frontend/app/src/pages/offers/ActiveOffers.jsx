import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveOffers } from './offersApi';

const GRADIENTS = [
  'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
  'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const SCOPE_LABELS = {
  all: 'كل الأفلام',
  movie: 'فيلم محدد',
  first_time: 'أول حجز',
};

const formatDiscount = (offer) =>
  offer.discountType === 'percentage'
    ? `${offer.discountValue}%`
    : `${offer.discountValue} ج.م`;

const ActiveOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getActiveOffers();
        if (!cancelled) setOffers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'تعذر تحميل العروض من السيرفر.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>
        ← الرجوع للرئيسية
      </Link>

      <header style={styles.header}>
        <h1 style={styles.title}>🎬 أقوى عروض وتخفيضات السينما</h1>
        <p style={styles.subtitle}>انسخ الكود واستخدمه وقت إتمام حجزك</p>
      </header>

      {loading && <p style={styles.status}>جاري تحميل العروض...</p>}
      {!loading && error && <p style={{ ...styles.status, color: '#ff6b6b' }}>{error}</p>}
      {!loading && !error && offers.length === 0 && (
        <p style={styles.status}>لا يوجد عروض فعالة حالياً، تابعنا قريباً.</p>
      )}

      <div style={styles.grid}>
        {offers.map((offer, i) => (
          <div key={offer._id || offer.id} style={styles.card}>
            <div style={{ ...styles.cardHeader, background: GRADIENTS[i % GRADIENTS.length] }}>
              <span style={styles.tag}>{SCOPE_LABELS[offer.scope] || 'عرض عام'}</span>
              <div style={styles.discountBadge}>
                {formatDiscount(offer)} <span style={{ fontSize: '14px' }}>خصم</span>
              </div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{offer.title}</h3>

              {offer.code ? (
                <div style={styles.codeContainer}>
                  <span style={styles.codeLabel}>كود الخصم:</span>
                  <mark style={styles.codeText}>{offer.code}</mark>
                </div>
              ) : (
                <p style={styles.cardDesc}>الخصم بيتطبق تلقائياً عند استيفاء الشروط، من غير ما تحتاج كود.</p>
              )}

              {offer.code && (
                <button style={styles.button} onClick={() => handleCopy(offer.code)}>
                  {copiedCode === offer.code ? '✅ تم نسخ الكود' : '📋 انسخ الكود'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    color: '#ffffff',
    direction: 'rtl',
    position: 'relative',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    color: '#fff',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#aaa',
  },
  status: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: '#1e1e2f',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid #333',
  },
  cardHeader: {
    padding: '25px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
  },
  tag: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  discountBadge: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.4rem',
    color: '#fff',
  },
  cardDesc: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#bbb',
    lineHeight: '1.5',
  },
  codeContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141421',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px dashed #444',
  },
  codeLabel: {
    fontSize: '0.9rem',
    color: '#888',
  },
  codeText: {
    backgroundColor: 'transparent',
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    letterSpacing: '1px',
  },
  button: {
    backgroundColor: '#e50914',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '5px',
  },
};

export default ActiveOffers;
