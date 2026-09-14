import axios from 'axios';

// نقطة واحدة لعنوان الباك اند، متجاية من ملف .env واحد بس (VITE_API_BASE_URL)
// بدل ما كل قسم في الموقع يكون له نسخته الخاصة.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// كل التطبيق (هوم / لوجين / عروض / لوحة السينما) بقى شغال على نفس الـ origin،
// فـ localStorage بقى مشترك تلقائياً - مفيش داعي نمرر التوكن في الرابط.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolvePendingQueue(newToken) {
    pendingQueue.forEach(({ resolve }) => resolve(newToken));
    pendingQueue = [];
}

function rejectPendingQueue(err) {
    pendingQueue.forEach(({ reject }) => reject(err));
    pendingQueue = [];
}

export function clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

export function isLoggedIn() {
    return Boolean(localStorage.getItem('accessToken'));
}

export function getCurrentUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// لو التوكن انتهت صلاحيته (401)، بنحاول نجدده مرة واحدة بالـ refreshToken.
// لو فشل، بنمسح الجلسة ونرجّع اليوزر لصفحة تسجيل الدخول.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status !== 401 || originalRequest._retry || originalRequest.url?.includes('/auth/')) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            clearSession();
            return Promise.reject(error);
        }

        // لو فيه refresh شغال بالفعل، الطلب ده بينضم لقائمة الانتظار
        // وبينفّذ تاني لما التوكن الجديد يوصل - أو بيترفض لو الـ refresh فشل.
        if (isRefreshing) {
            try {
                const newToken = await new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                });
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (queueError) {
                return Promise.reject(queueError);
            }
        }

        isRefreshing = true;
        try {
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
            const newAccessToken = data?.data?.accessToken || data?.accessToken;
            if (!newAccessToken) throw new Error('no access token in refresh response');

            localStorage.setItem('accessToken', newAccessToken);
            isRefreshing = false;
            resolvePendingQueue(newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            isRefreshing = false;
            rejectPendingQueue(refreshError);
            clearSession();
            window.location.href = '/auth';
            return Promise.reject(refreshError);
        }
    }
);

// شكل الرد العام في الباك اند: { statusCode, message, success, data }
// لكن فيه endpoints قديمة بترجع الداتا direct من غير "data" - الدالة دي بتتعامل مع الحالتين
export function unwrap(response) {
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
        return body.data;
    }
    return body;
}

export function getErrorMessage(error, fallback = 'حصل خطأ، حاول تاني') {
    return error.response?.data?.message || error.message || fallback;
}

export default api;
