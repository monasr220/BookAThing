const validator = require('validator');
const bcrypt = require('bcryptjs');

const getCleanEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return null;
    }
    const trimmed = email.trim().toLowerCase();
    if (!validator.isEmail(trimmed)) {
        return null;
    }
    return trimmed;
};

const hashedPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

module.exports = {
    getCleanEmail,
    hashedPassword
};
