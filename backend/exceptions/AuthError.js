const AppError = require('./AppError');

class AuthError extends AppError {
    constructor(message = "Authentication Failed") {
        super(message, 401);
    }
}

module.exports = AuthError;
