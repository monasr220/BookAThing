class PaymentError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

class PaymentNotFoundError extends PaymentError {
    constructor(message = 'Payment record not found') {
        super(message, 404);
    }
}

class PaymentFailedError extends PaymentError {
    constructor(message = 'Payment processing failed') {
        super(message, 400);
    }
}

module.exports = {
    PaymentError,
    PaymentNotFoundError,
    PaymentFailedError
};