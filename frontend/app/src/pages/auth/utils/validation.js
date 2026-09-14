export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const validateAuthForm = (formData, isLogin) => {
    const errors = {};

    // Email
    if (!formData.email) {
        errors.email = 'This field is required';
    } else if (!EMAIL_REGEX.test(formData.email)) {
        errors.email = 'Please enter a valid email address.';
    }

    // Password
    if (!formData.password) {
        errors.password = 'This field is required';
    } else if (!isLogin && !STRONG_PASSWORD_REGEX.test(formData.password)) {
        errors.password = 'The password must be at least 8 characters long (letters, numbers, and special characters like @#$)';
    }

    // Sign Up Fields
    if (!isLogin) {
        if (!formData.fullName?.trim()) {
            errors.fullName = 'Full name is required.';
        }

        if (!formData.phone) {
            errors.phone = 'Phone number is required.';
        } else if (formData.phone.length !== 11) {
            errors.phone = 'The phone number must consist of exactly 11 digits';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'The passwords do not match';
        }
    }

    return errors;
};