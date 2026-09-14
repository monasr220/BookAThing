import api from '../../lib/api';

export const getActiveOffers = async () => {
  const response = await api.get('/offers/active');
  // شكل الرد العام من الباك اند: { statusCode, success, message, data }
  return response.data?.data ?? [];
};
