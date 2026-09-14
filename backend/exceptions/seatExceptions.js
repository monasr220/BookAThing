class SeatError extends Error{
    constructor(
        message =  'Internal seat Error',
        statusCode =500,
        errorCode = 'SEAT_INTERNAL_ERROR',
        details = null,
        isOperational = true 
    ){
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = isOperational
        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(this ,  this.constructor);
    }
    toJSON() {
        return {
            status: 'error',
            statusCode: this.statusCode,
            errorCode: this.errorCode,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

class SeatNotFoundError extends SeatError {
    constructor(message = 'Seat or Screen record not found', details = null) {
        super(message, 404, 'SEAT_NOT_FOUND', details);
    }
}

class SeatValidationError extends SeatError {
    constructor(message = 'Invalid seat parameter or payload', details = null) {
        super(message, 400, 'SEAT_VALIDATION_ERROR', details);
    }
}

class DuplicateSeatError extends SeatError {
    constructor(message = 'Duplicate seat detected in screen layout', details = null) {
        super(message, 409, 'DUPLICATE_SEAT_ERROR', details);
    }
}

module.exports = {
    SeatError,
    SeatNotFoundError,
    SeatValidationError,
    DuplicateSeatError
}
