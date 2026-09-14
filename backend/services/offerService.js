const Offer = require('../models/Offer');
const Movie = require('../models/Movie');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');

class OfferService {
    static async createOffer(data) {
        const { title, type, code, condition, scope, movieId, discountType, discountValue, startsAt, endAt } = data;

        if (scope === 'movie') {
            if (!movieId) {
                throw new ValidationError('movieId is required when scope is "movie"', 'movieId');
            }
            const movie = await Movie.findById(movieId).select('_id');
            if (!movie) {
                throw new NotFoundError('Movie');
            }
        }

        if (type === 'promocode') {
            const normalizedCode = String(code || '').trim().toUpperCase();
            if (!normalizedCode) {
                throw new ValidationError('code is required when type is "promocode"', 'code');
            }
            const existing = await Offer.findOne({ code: normalizedCode });
            if (existing) {
                throw new ValidationError(`An offer with code "${normalizedCode}" already exists`, 'code');
            }
        }

        return await Offer.create({
            title,
            type,
            code,
            condition,
            scope,
            movieId: scope === 'movie' ? movieId : undefined,
            discountType,
            discountValue,
            startsAt,
            endAt
        });
    }

    static async getAllOffers({ activeOnly } = {}) {
        const filter = {};
        if (activeOnly) filter.isActive = true;
        return await Offer.find(filter).sort({ createdAt: -1 });
    }

    static async getOfferById(id) {
        const offer = await Offer.findById(id);
        if (!offer) {
            throw new NotFoundError('Offer');
        }
        return offer;
    }

    static async updateOffer(id, data) {
        const allowedUpdates = (({ title, condition, isActive, discountType, discountValue, startsAt, endAt }) =>
            ({ title, condition, isActive, discountType, discountValue, startsAt, endAt }))(data);

        const offer = await Offer.findByIdAndUpdate(id, allowedUpdates, { returnDocument: 'after', runValidators: true });
        if (!offer) {
            throw new NotFoundError('Offer');
        }
        return offer;
    }

    static async deactivateOffer(id) {
        const offer = await Offer.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
        if (!offer) {
            throw new NotFoundError('Offer');
        }
        return offer;
    }

    static async deleteOffer(id) {
        const deleted = await Offer.findByIdAndDelete(id);
        if (!deleted) {
            throw new NotFoundError('Offer');
        }
        return deleted;
    }
}

module.exports = OfferService;
