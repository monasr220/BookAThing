const OfferService = require('../services/offerService');
const asyncHandler = require('../utils/asyncHandler');
const CreateResponse = require('../responses/CreateResponse');
const SuccessResponse = require('../responses/SuccessResponse');

// --- Create a new offer (conditional discount or promo code) ---
exports.createOffer = asyncHandler(async (req, res) => {
    const offer = await OfferService.createOffer(req.body);
    new CreateResponse(offer, 'Offer created successfully').send(res);
});

// --- Get all offers (admins see all; pass ?activeOnly=true to filter) ---
exports.getAllOffers = asyncHandler(async (req, res) => {
    const activeOnly = req.query.activeOnly === 'true';
    const offers = await OfferService.getAllOffers({ activeOnly });
    new SuccessResponse(offers, 'Offers retrieved successfully').send(res);
});

// --- Get a single offer by ID ---
exports.getOfferById = asyncHandler(async (req, res) => {
    const offer = await OfferService.getOfferById(req.params.id);
    new SuccessResponse(offer, 'Offer retrieved successfully').send(res);
});

// --- Update an offer ---
exports.updateOffer = asyncHandler(async (req, res) => {
    const offer = await OfferService.updateOffer(req.params.id, req.body);
    new SuccessResponse(offer, 'Offer updated successfully').send(res);
});

// --- Deactivate an offer without deleting its history ---
exports.deactivateOffer = asyncHandler(async (req, res) => {
    const offer = await OfferService.deactivateOffer(req.params.id);
    new SuccessResponse(offer, 'Offer deactivated successfully').send(res);
});

// --- Permanently delete an offer ---
exports.deleteOffer = asyncHandler(async (req, res) => {
    await OfferService.deleteOffer(req.params.id);
    new SuccessResponse({ id: req.params.id }, 'Offer deleted successfully').send(res);
});
