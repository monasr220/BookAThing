const crypto = require('crypto');

/**
 * Generates a unique transaction reference identifier.
 */
const generateTransactionRef = (prefix = 'TXN') => {
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${randomHex}`;
};

/**
 * Converts monetary unit to lowest currency denomination (e.g. dollars/pounds to cents/piasters).
 */
const toSubunits = (amount) => Math.round(Number(amount) * 100);

/**
 * Validates HMAC webhook signature from payment gateways.
 */
const verifyWebhookSignature = (payload, signature, secret) => {
    const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computedSignature)
    );
};

module.exports = {
    generateTransactionRef,
    toSubunits,
    verifyWebhookSignature
};