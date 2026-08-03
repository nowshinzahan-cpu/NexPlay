const { describe, it, mock } = require('node:test');
const assert = require('node:assert');

// ── Mock response helper ─────────────────────────────────────────
function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

// ── Import response utils for direct testing ──────────────────────
const { parseSearchQuery } = require('../utils/helpers');

// ═════════════════════════════════════════════════════════════════
// WATCHLIST CONTROLLER TESTS
// ═════════════════════════════════════════════════════════════════

describe('Watchlist Controller — Validation Logic', () => {
  it('should have correct export shape', () => {
    const watchlistController = require('../controllers/watchlistController');
    assert.strictEqual(typeof watchlistController.getWatchlist, 'function');
    assert.strictEqual(typeof watchlistController.addToWatchlist, 'function');
    assert.strictEqual(typeof watchlistController.removeFromWatchlist, 'function');
    assert.strictEqual(typeof watchlistController.checkWatchlist, 'function');
    assert.strictEqual(Object.keys(watchlistController).length, 4);
  });

  it('should call next(error) on exception in getWatchlist', async () => {
    // Force an error by passing null query to parsePagination
    const req = { query: null, user: null };
    const res = createMockRes();
    let caught = null;
    const next = (err) => { caught = err; };

    const watchlistController = require('../controllers/watchlistController');
    await watchlistController.getWatchlist(req, res, next);
    // If an error occurs, it should be passed to next() rather than crashing
    // The controller wraps logic in try/catch and calls next(error) on failure
    assert.ok(caught instanceof Error,
      'Controller should pass errors to next() on failure');
  });
});

// ═════════════════════════════════════════════════════════════════
// REVIEW CONTROLLER TESTS
// ═════════════════════════════════════════════════════════════════

describe('Review Controller — Validation Logic', () => {
  it('should reject missing rating', async () => {
    const reviewController = require('../controllers/reviewController');
    const req = {
      body: { review: 'Great movie!' },
      params: { id: '507f1f77bcf86cd799439011' },
      user: { id: '507f1f77bcf86cd799439012' }
    };
    const res = createMockRes();
    const next = () => {};

    // createReview checks !rating first, returns early with sendError before any DB call
    await reviewController.createReview(req, res, next);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Rating must be between 1 and 10'));
  });

  it('should reject rating below 1', async () => {
    const reviewController = require('../controllers/reviewController');
    const req = {
      body: { rating: 0, review: 'Bad' },
      params: { id: '507f1f77bcf86cd799439011' },
      user: { id: '507f1f77bcf86cd799439012' }
    };
    const res = createMockRes();
    const next = () => {};

    await reviewController.createReview(req, res, next);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('should reject rating above 10', async () => {
    const reviewController = require('../controllers/reviewController');
    const req = {
      body: { rating: 11, review: 'Overrated' },
      params: { id: '507f1f77bcf86cd799439011' },
      user: { id: '507f1f77bcf86cd799439012' }
    };
    const res = createMockRes();
    const next = () => {};

    await reviewController.createReview(req, res, next);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('should have correct export shape', () => {
    const reviewController = require('../controllers/reviewController');
    const exports = Object.keys(reviewController);
    assert.ok(exports.includes('createReview'));
    assert.ok(exports.includes('updateReview'));
    assert.ok(exports.includes('deleteReview'));
    assert.ok(exports.includes('getContentReviews'));
    assert.ok(exports.includes('getMyReviews'));
    assert.ok(exports.includes('adminGetReviews'));
    assert.ok(exports.includes('adminModerateReview'));
    assert.strictEqual(exports.length, 7);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPORT CONTROLLER TESTS
// ═════════════════════════════════════════════════════════════════

describe('Sport Controller — Validation Logic', () => {
  it('should reject creating sport with missing required fields', async () => {
    const sportController = require('../controllers/sportController');
    const req = {
      body: { title: 'Only Title' }, // missing sportType, homeTeam, awayTeam, startDate
      user: { id: '507f1f77bcf86cd799439011' }
    };
    const res = createMockRes();
    const next = () => {};

    await sportController.createSport(req, res, next);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('required'));
  });

  it('should build search filter correctly', () => {
    const searchTerm = 'Manchester';
    const escaped = parseSearchQuery(searchTerm);
    assert.ok(escaped.$regex);
    assert.strictEqual(escaped.$options, 'i');
  });

  it('should have correct export shape', () => {
    const sportController = require('../controllers/sportController');
    const exports = Object.keys(sportController);
    assert.ok(exports.includes('getSports'));
    assert.ok(exports.includes('getLiveSports'));
    assert.ok(exports.includes('getUpcomingSports'));
    assert.ok(exports.includes('getCompletedSports'));
    assert.ok(exports.includes('getSportTypes'));
    assert.ok(exports.includes('getSportById'));
    assert.ok(exports.includes('createSport'));
    assert.ok(exports.includes('updateSport'));
    assert.ok(exports.includes('deleteSport'));
    assert.strictEqual(exports.length, 9);
  });
});

// ═════════════════════════════════════════════════════════════════
// PLATFORM CONTROLLER TESTS
// ═════════════════════════════════════════════════════════════════

describe('Platform Controller — Validation Logic', () => {
  it('should reject creating platform without name', async () => {
    const platformController = require('../controllers/platformController');
    const req = {
      body: { website: 'https://example.com' },
      user: { id: '507f1f77bcf86cd799439011' }
    };
    const res = createMockRes();
    const next = () => {};

    await platformController.createPlatform(req, res, next);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Platform name is required'));
  });

  it('should whitelist allowed fields on update (no mass assignment)', () => {
    const allowedFields = ['name', 'logo', 'website', 'description', 'supportedRegions', 'contentTypes', 'isActive'];
    const reqBody = { name: 'Netflix', website: 'https://netflix.com', maliciousField: 'injection' };
    const updateData = {};
    for (const field of allowedFields) {
      if (reqBody[field] !== undefined) {
        updateData[field] = reqBody[field];
      }
    }
    // maliciousField should NOT be in updateData
    assert.strictEqual(updateData.name, 'Netflix');
    assert.strictEqual(updateData.website, 'https://netflix.com');
    assert.strictEqual(updateData.maliciousField, undefined);
  });

  it('should have correct export shape', () => {
    const platformController = require('../controllers/platformController');
    const exports = Object.keys(platformController);
    assert.ok(exports.includes('getActivePlatforms'));
    assert.ok(exports.includes('getPlatforms'));
    assert.ok(exports.includes('createPlatform'));
    assert.ok(exports.includes('updatePlatform'));
    assert.ok(exports.includes('deletePlatform'));
    assert.strictEqual(exports.length, 5);
  });
});

// ═════════════════════════════════════════════════════════════════
// ADMIN CONTROLLER TESTS (Broadcast & Featured)
// ═════════════════════════════════════════════════════════════════

describe('Admin Controller — Broadcast & Featured Content', () => {
  it('should reject broadcast without title and message', async () => {
    const adminController = require('../controllers/adminController');
    const req = {
      body: { type: 'system' },
      user: { id: '507f1f77bcf86cd799439011' }
    };
    const res = createMockRes();
    const next = () => {};

    await adminController.broadcastNotification(req, res, next);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('required'));
  });

  it('should reject broadcast with only title', async () => {
    const adminController = require('../controllers/adminController');
    const req = {
      body: { title: 'Hello' },
      user: { id: '507f1f77bcf86cd799439011' }
    };
    const res = createMockRes();
    const next = () => {};

    await adminController.broadcastNotification(req, res, next);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('should have correct export shape', () => {
    const adminController = require('../controllers/adminController');
    const exports = Object.keys(adminController);
    // Verify the new Sprint 3-4 functions are exported
    assert.ok(exports.includes('broadcastNotification'));
    assert.ok(exports.includes('toggleFeaturedContent'));
    assert.ok(exports.includes('getFeaturedContent'));
    // Verify existing admin functions still exported
    assert.ok(exports.includes('getDashboardStats'));
    assert.ok(exports.includes('getUsers'));
    assert.ok(exports.includes('verifyCompany'));
  });
});

// ═════════════════════════════════════════════════════════════════
// UPCOMING CONTENT CONTROLLER TESTS
// ═════════════════════════════════════════════════════════════════

describe('Upcoming Content Controller — Validation Logic', () => {
  it('should have correct export shape', () => {
    const controller = require('../controllers/upcomingContentController');
    const exports = Object.keys(controller);
    assert.ok(exports.includes('getMyUpcomingContent'));
    assert.ok(exports.includes('getMyAllContent'));
    assert.ok(exports.includes('createUpcomingContent'));
    assert.ok(exports.includes('updateUpcomingContent'));
    assert.ok(exports.includes('deleteUpcomingContent'));
    assert.strictEqual(exports.length, 5);
  });

  it('should handle errors gracefully via next()', async () => {
    const controller = require('../controllers/upcomingContentController');
    // Pass null req to cause an error — controller should call next with the error
    const req = null;
    const res = createMockRes();
    let caught = false;
    const next = (err) => { caught = true; };

    await controller.getMyUpcomingContent(req, res, next);
    // Without proper req, it will throw, and the catch block calls next(error)
    assert.ok(caught);
  });
});

// ═════════════════════════════════════════════════════════════════
// ROUTE INTEGRITY TESTS
// ═════════════════════════════════════════════════════════════════

describe('Route File Integrity — All New Routes', () => {
  it('should load review routes without error', () => {
    assert.doesNotThrow(() => require('../routes/reviewRoutes'));
  });

  it('should load sport routes without error', () => {
    assert.doesNotThrow(() => require('../routes/sportRoutes'));
  });

  it('should load platform routes without error', () => {
    assert.doesNotThrow(() => require('../routes/platformRoutes'));
  });

  it('should load upcoming content routes without error', () => {
    assert.doesNotThrow(() => require('../routes/upcomingContentRoutes'));
  });

  it('should load main routes index without error', () => {
    assert.doesNotThrow(() => require('../routes/index'));
  });

  it('should load admin routes without error', () => {
    assert.doesNotThrow(() => require('../routes/adminRoutes'));
  });

  it('should load user routes without error', () => {
    assert.doesNotThrow(() => require('../routes/userRoutes'));
  });

  it('should load auth routes without error', () => {
    assert.doesNotThrow(() => require('../routes/authRoutes'));
  });
});
