import React, { useState, useEffect } from 'react';
import './OtpModal.css';

const OtpModal = ({ isOpen, email, devOtp, onClose, onVerify, onResend }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(120);
    const [error, setError] = useState('');

    //Reset status
    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '']);
            setTimer(120);
            setError('');
        }
    }, [isOpen]);

    //  Start counter 
    useEffect(() => {
        let interval = null;
        if (isOpen && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isOpen, timer]);

    if (!isOpen) return null;

    //Navigating between digit fields while typing
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        setError('');

        // Automatically move to the next field
        if (element.value !== '' && element.nextSibling) {
            element.nextSibling.focus();
        }
    };
    //Handling the back button
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (timer === 0) {
            setError('The code has expired; please request a new code.');
            return;
        }

        if (otpCode.length < 4) {
            setError('Please enter the full 4-digit code');
            return;
        }

        onVerify(otpCode);
    };

    const formatTime = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (

        <div className="modal-overlay">
            <div className="modal-card">
                <h3>Verify Your Email</h3>
                <p>We've sent a 4-digit code to: <strong>{email}</strong></p>

                {/* Dev-only: the backend returns devOtp when email isn't configured yet
                    (e.g. real Gmail credentials missing), so testing doesn't get stuck
                    waiting on an email that will never arrive. Never present in production
                    because the backend never sends devOtp there. */}
                {devOtp && (
                    <div className="dev-otp-hint">
                        <span>Dev mode — email isn't sending. Your code: <strong>{devOtp}</strong></span>
                        <button
                            type="button"
                            className="dev-otp-fill-btn"
                            onClick={() => { setOtp(devOtp.toString().split('').slice(0, 4)); setError(''); }}
                        >
                            Fill in
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="otp-inputs">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                className={error ? 'input-error' : ''}
                            />
                        ))}
                    </div>

                    {/* عرض رسائل الأخطاء إن وجدت */}
                    {error && <span className="error-message modal-error">{error}</span>}

                    <div className="timer-section">
                        {timer > 0 ? (
                            <p>Code expires in: <span>{formatTime()}</span></p>
                        ) : (
                            <p className="expired">Code expired!</p>
                        )}
                    </div>

                    <button type="submit" className="verify-btn">Verify Code</button>
                </form>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="resend-btn"
                        disabled={timer > 0}
                        onClick={() => {
                            setTimer(120);
                            setOtp(['', '', '', '']);
                            setError('');
                            if (onResend) onResend();
                        }}
                    >
                        Resend Code
                    </button>
                    <button type="button" className="close-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>

    );
};

export default OtpModal;