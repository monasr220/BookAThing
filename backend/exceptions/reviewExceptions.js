class ReviewError extends Error{
    constructor (
        message = 'Internal review proccessing error',
        statusCode = 500 ,
        errorCode= 'REVIEW_INTERNAL_ERROR',
        details = null,
        isOperational =true
    ){
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(this,this.constructor);
    }

    toJSON(){
        return {
            status:'error',
            statusCode:this.statusCode,
            errorCode : this.errorCode,
            message: this.message,
            details : this.details,
            timestamp : this.timestamp
        }
    }
}

class ReviewNotFoundError extends ReviewError {
    constructor(message = 'Review record not found', details = null) {
        super(message, 404, 'REVIEW_NOT_FOUND', details);
    }
}

class ReviewValidationError extends ReviewError {
    constructor(message = 'Invalid review input data', details = null) {
        super(message, 400, 'REVIEW_VALIDATION_ERROR', details);
    }
}

class DuplicateReviewError extends ReviewError {
    constructor(message = 'User has already reviewed this movie', details = null) {
        super(message, 409, 'DUPLICATE_REVIEW', details);
    }
}

class UnauthorizedReviewActionError extends ReviewError {
    constructor(message = 'You are not authorized to perform actions on this review', details = null) {
        super(message, 403, 'REVIEW_UNAUTHORIZED', details);
    }
}

module.exports = {
    ReviewError,
    ReviewNotFoundError,
    ReviewValidationError,
    DuplicateReviewError,
    UnauthorizedReviewActionError
};
