const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { authenticateJWT } = require('../middelware/AuthMiddleWare');
const { validateReviewParams, validateCreateReviewBody } = require('../middelware/ReviewMiddelware');

router.get('/movie/:movieId', validateReviewParams, reviewController.getMovieReviews);

router.post('/', authenticateJWT, validateCreateReviewBody, reviewController.createReview);

router.put('/:id', authenticateJWT, validateReviewParams, reviewController.updateReview);

router.delete('/:id', authenticateJWT, validateReviewParams, reviewController.deleteReview);

module.exports = router;
