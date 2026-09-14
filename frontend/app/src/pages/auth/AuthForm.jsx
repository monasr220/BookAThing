import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './AuthForm.css';
import OtpModal from './components/OtpModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import { authService } from './authService';
import { validateAuthForm } from './utils/validation';

const AuthForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // من فين جاي المستخدم ولازم يرجعله بعد ما يخلص تسجيل دخول (افتراضياً صفحة الهوم)
    const redirectTo = searchParams.get('redirect') || '/';

    const [isLogin, setIsLogin] = useState(true);
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [isResetPassOpen, setIsResetPassOpen] = useState(false);
    const [otpFlow, setOtpFlow] = useState('signup');
    const [tempOtp, setTempOtp] = useState('');
    const [loading, setLoading] = useState(false);
    // Only ever set from a devOtp field the backend includes when it isn't
    // production and email sending isn't configured — see OtpModal.
    const [devOtp, setDevOtp] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (searchParams.get('mode') === 'signup') setIsLogin(false);
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 11) {
                setFormData({ ...formData, phone: numericValue });
            }
            return;
        }

        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateAuthForm(formData, isLogin);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);

        try {
            if (isLogin) {
                await authService.login({
                    email: formData.email,
                    password: formData.password
                });
                // نفس الـ origin دلوقتي، فالتوكن اتخزن في localStorage وبقى شغال في كل الموقع
                navigate(redirectTo);
            } else {
                setOtpFlow('signup');
                //  send OTP
                const otpRes = await authService.sendSignUpOtp(formData.email);
                setDevOtp(otpRes?.devOtp || null);
                setIsOtpOpen(true);
            }
        } catch (err) {
            const serverMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setErrors((prev) => ({ ...prev, email: serverMsg }));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordClick = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setErrors({ ...errors, email: 'Please enter a valid email address first to send the recovery code.' });
            return;
        }

        setLoading(true);
        try {
            const otpRes = await authService.forgotPassword(formData.email);
            setDevOtp(otpRes?.data?.devOtp || null);
            setOtpFlow('forgot_password');
            setIsOtpOpen(true);
        } catch (err) {
            const serverMsg = err.response?.data?.message || 'Failed to send recovery code.';
            setErrors((prev) => ({ ...prev, email: serverMsg }));
        } finally {
            setLoading(false);
        }
    };

    // click  Verify  OTP Modal
    const handleVerifyOtpSubmit = async (otpCode) => {
        setLoading(true);
        try {
            if (otpFlow === 'signup') {
                //  completeSignUp
                await authService.completeSignUp({
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    otp: otpCode
                });
                setIsOtpOpen(false);
                alert('Account created and verified successfully!');
                setIsLogin(true);
            } else {
                //  save OTP to send NewPassword
                setTempOtp(otpCode);
                setIsOtpOpen(false);
                setIsResetPassOpen(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtpCall = async () => {
        try {
            if (otpFlow === 'signup') {
                const otpRes = await authService.sendSignUpOtp(formData.email);
                setDevOtp(otpRes?.devOtp || null);
            } else {
                const otpRes = await authService.forgotPassword(formData.email);
                setDevOtp(otpRes?.data?.devOtp || null);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resend code');
        }
    };

    const handleResetPasswordSubmit = async (newPassword) => {
        setLoading(true);
        try {
            await authService.resetPassword({
                email: formData.email,
                otp: tempOtp,
                newPassword
            });
            setIsResetPassOpen(false);
            setIsLogin(true);
            alert('Password reset successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="auth-container">
            <Link
                to="/"
                style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    color: '#ccc',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                }}
            >
                ← Back to CINEMA
            </Link>
            <div className="auth-card">
                <h2>{isLogin ? 'Login' : 'Sign UP'}</h2>
                <p className="subtitle">
                    {isLogin
                        ? 'Welcome back !Please enter your details to login'
                        : 'Create your account to get started'}
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={errors.fullName ? 'input-error' : ''}
                            />
                            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="01xxxxxxxxx"
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? 'input-error' : ''}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <div className="label-wrapper">
                            <label>Password</label>
                            {isLogin && (
                                <span className="forgot-pass" onClick={handleForgotPasswordClick}>
                                    Forgot Password?
                                </span>
                            )}
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'input-error' : ''}
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                    )}



                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="toggle-text">
                    {isLogin ? (
                        <p>
                            Don't have an account?{' '}
                            <span onClick={() => { setIsLogin(false); setErrors({}); }}>Sign Up</span>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{' '}
                            <span onClick={() => { setIsLogin(true); setErrors({}); }}>Login</span>
                        </p>
                    )}
                </div>
            </div>

            <OtpModal
                isOpen={isOtpOpen}
                email={formData.email}
                devOtp={devOtp}
                onClose={() => setIsOtpOpen(false)}
                onVerify={handleVerifyOtpSubmit}
                onResend={handleResendOtpCall}
            />

            <ResetPasswordModal
                isOpen={isResetPassOpen}
                email={formData.email}
                onClose={() => setIsResetPassOpen(false)}
                onSubmitNewPassword={handleResetPasswordSubmit}
            />
        </div>

    );
};

export default AuthForm;