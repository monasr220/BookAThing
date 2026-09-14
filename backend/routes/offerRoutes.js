const express = require('express');
const router = express.Router();

const offerController = require('../controllers/offerController');
const { authenticateJWT, authorizeRoles } = require('../middelware/AuthMiddleWare');
const {
    validateOfferId,
    createOfferRules,
    updateOfferRules
} = require('../middelware/offerMiddleware');

router.get('/active', (req, res, next) => {
    req.query.activeOnly = 'true';
    next();
}, offerController.getAllOffers);

router.post('/', authenticateJWT, authorizeRoles('admin'), createOfferRules, offerController.createOffer);
router.get('/', authenticateJWT, authorizeRoles('admin'), offerController.getAllOffers);

router.get('/:id', authenticateJWT, authorizeRoles('admin'), validateOfferId, offerController.getOfferById);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), validateOfferId, updateOfferRules, offerController.updateOffer);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), validateOfferId, offerController.deleteOffer);

router.patch('/:id/deactivate', authenticateJWT, authorizeRoles('admin'), validateOfferId, offerController.deactivateOffer);

module.exports = router;
