const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const matchController = require('../controllers/matchController');
const broadcasterController = require('../controllers/broadcasterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const { ROLES } = require('../constants');

// Public routes
router.get('/matches/live', matchController.getLiveMatches);
router.get('/matches/today', matchController.getTodayMatches);
router.get('/matches/upcoming', matchController.getUpcomingMatches);
router.get('/matches/:id', matchController.getMatchById);
router.get('/matches/:id/streams', broadcasterController.getMatchStreams);
router.get('/standings/:competitionId', matchController.getStandings);

// Admin: create match
router.post('/matches', authMiddleware, roleMiddleware(ROLES.ADMIN), [
  body('homeTeam').trim().notEmpty().withMessage('Home team is required'),
  body('awayTeam').trim().notEmpty().withMessage('Away team is required'),
  body('competition').trim().notEmpty().withMessage('Competition is required'),
  body('sportType').trim().notEmpty().withMessage('Sport type is required'),
  body('kickoffTime').isISO8601().withMessage('Valid kickoff time is required'),
  validateMiddleware
], matchController.createMatch);

// Admin: update match
router.put('/matches/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), [
  body('homeScore').optional().isInt({ min: 0 }).withMessage('Home score must be a non-negative integer'),
  body('awayScore').optional().isInt({ min: 0 }).withMessage('Away score must be a non-negative integer'),
  body('minute').optional().isInt({ min: 0 }).withMessage('Minute must be a non-negative integer'),
  body('status').optional().isIn(['scheduled', 'live', 'halftime', 'finished', 'postponed']).withMessage('Invalid status'),
  validateMiddleware
], matchController.updateMatch);

// Admin: add match event
router.post('/matches/:id/events', authMiddleware, roleMiddleware(ROLES.ADMIN), [
  body('minute').isInt({ min: 0 }).withMessage('Minute is required and must be non-negative'),
  body('type').isIn(['goal', 'yellow_card', 'red_card', 'substitution', 'penalty', 'own_goal', 'corner', 'foul', 'offside', 'shot', 'shot_on_target', 'save', 'injury_time']).withMessage('Invalid event type'),
  body('team').isIn(['home', 'away']).withMessage('Team must be home or away'),
  validateMiddleware
], matchController.addMatchEvent);

// Admin: upsert standing
router.post('/standings', authMiddleware, roleMiddleware(ROLES.ADMIN), [
  body('competition').trim().notEmpty().withMessage('Competition is required'),
  body('teamName').trim().notEmpty().withMessage('Team name is required'),
  validateMiddleware
], matchController.upsertStanding);

module.exports = router;
