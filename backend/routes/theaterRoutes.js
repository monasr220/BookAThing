const express = require('express');
const router = express.Router();

const theaterController = require('../controllers/theaterController');
const { authenticateJWT, authorizeRoles, authorizeTheatreAdmin } = require('../middelware/AuthMiddleWare');
const {
    validateTheaterId,
    validateScreenId,
    createTheaterRules,
    updateTheaterRules,
    createScreenRules
} = require('../middelware/theaterMiddleware');

// --- Theaters ---

router.post('/', authenticateJWT, authorizeRoles('owner', 'admin'), createTheaterRules, theaterController.createTheater);
router.get('/', theaterController.getAllTheaters);

router.get('/mine', authenticateJWT, authorizeRoles('owner'), theaterController.getMyTheaters);

router.get('/:theaterId', validateTheaterId, theaterController.getTheaterById);
router.put('/:theaterId', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, updateTheaterRules, theaterController.updateTheater);
router.delete('/:theaterId', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, theaterController.deleteTheater);

// --- Screens (nested under a theater so ownership can be checked via :theaterId) ---

router.post('/:theaterId/screens', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, createScreenRules, theaterController.createScreen);
router.get('/:theaterId/screens', validateTheaterId, theaterController.getScreensByTheater);

router.get('/:theaterId/screens/:screenId', validateTheaterId, validateScreenId, theaterController.getScreenById);
router.put('/:theaterId/screens/:screenId', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, validateScreenId, theaterController.updateScreen);
router.delete('/:theaterId/screens/:screenId', authenticateJWT, authorizeTheatreAdmin, validateTheaterId, validateScreenId, theaterController.deleteScreen);

module.exports = router;
