import Offer from '../models/Offer';

export function computeDiscountAmount(subTotal, discountType, discountValue) {
  let discount = 0;

  if (discountType === 'percentage') {
    discount = (subTotal * discountValue) / 100;
  } else if (discountType === 'flat') {
    discount = discountValue;
  }

  discount = Math.min(subTotal, Math.max(0, discount));
  return Math.round(discount * 100) / 100;
}

export function isWithValidity(offer) {
  const now = new Date();
  if (offer.startAt && now < new Date(offer.startAt)) return false;
  if (offer.endAt && now > new Date(offer.endAt)) return false;
  return true;
}

export async function evaluateBestOffer(cart, promoCode) {
  const { numTickets = 0, subTotal = 0, movieId, isFirstBooking = false } = cart || {};

  if (!Number.isFinite(subTotal) || subTotal <= 0) {
    return { applied: null, discount: 0, finalTotal: 0 };
  }

  const activeOffers = await Offer.find({ isActive: true }).lean();
  const candidates = [];

  for (const offer of activeOffers) {
    if (!isWithValidity(offer)) continue;

    // فحص تقييد الفيلم
    if (offer.scope === 'movie' && offer.movieId) {
      if (String(offer.movieId) !== String(movieId)) continue;
    }

    // فحص الحجز الأول
    if (offer.scope === 'first_time' && !isFirstBooking) continue;

    // 1. تقييم العروض المشروطة
    if (offer.type === 'conditional') {
      const minTickets = Number(offer?.condition?.minTickets || 0);
      if (numTickets >= minTickets) {
        const discount = computeDiscountAmount(subTotal, offer.discountType, offer.discountValue);
        if (discount > 0) candidates.push({ offer, discount });
      }
    } 
    // 2. تقييم أكواد الخصم
    else if (offer.type === 'promocode') {
      const code = String(offer?.condition?.code || '').trim().toUpperCase();
      const minTicketsPromo = Number(offer?.condition?.minTickets || 0);

      if (promoCode && code && promoCode.trim().toUpperCase() === code) {
        if (numTickets >= minTicketsPromo) {
          const discount = computeDiscountAmount(subTotal, offer.discountType, offer.discountValue);
          if (discount > 0) candidates.push({ offer, discount });
        }
      }
    }
  }

  // إرجاع النتيجة بعد انتهاء الحلقة التكرارية بالكامل
  if (candidates.length === 0) {
    return { applied: null, discount: 0, finalTotal: subTotal };
  }

  candidates.sort((a, b) => b.discount - a.discount);
  const best = candidates[0];
  const finalTotal = Math.round(Math.max(0, subTotal - best.discount) * 100) / 100;

  return {
    applied: {
      id: best.offer._id,
      title: best.offer.title,
      type: best.offer.type,
      discountType: best.offer.discountType,
      discountValue: best.offer.discountValue,
      condition: best.offer.condition,
    },
    discount: best.discount,
    finalTotal,
  };
}