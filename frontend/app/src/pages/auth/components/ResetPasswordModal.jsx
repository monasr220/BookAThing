import React, { useState, useEffect } from 'react';
import './ResetPasswordModal.css';

const ResetPasswordModal = ({ isOpen, email, onClose, onSubmitNewPassword }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    //Reset inputs and errors upon opening
    useEffect(() => {
        if (isOpen) {
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        let newErrors = {};

        const strongPasswordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

        if (!newPassword) {
            newErrors.newPassword = 'A new password is required.';
        } else if (!strongPasswordRegex.test(newPassword)) {
            newErrors.newPassword = 'The password must be at least 8 characters long (letters, numbers, and special characters like @#$)';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Password confirmation is required.';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'The passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onSubmitNewPassword(newPassword);
    };

    return (

        <div className="modal-overlay">
            <div className="modal-card">
                <h3>Reset Password</h3>
                <p>Enter a new password for <strong>{email}</strong></p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '15px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                            }}
                            className={errors.newPassword ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                    </div>

                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            className={errors.confirmPassword ? 'input-error' : ''}
                            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="verify-btn">Reset Password</button>
                </form>

                <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '15px' }}>
                    <button type="button" className="close-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>

    );
};

export default ResetPasswordModal;