import api from '../../lib/api';

export const authService = {
    sendSignUpOtp: async (email) => {
        const response = await api.post('/auth/send-signup-otp', { email });
        return response.data;
    },

    completeSignUp: async ({ name, email, password, phone, otp }) => {
        const response = await api.post('/auth/complete-signup', { name, email, password, phone, otp });
        if (response.data?.data?.accessToken) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        const data = response.data?.data;
        if (data?.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        }
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async ({ email, otp, newPassword }) => {
        const response = await api.post('/auth/reset-password', { email, otp, newPassword });
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },
};
