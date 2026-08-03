const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const request = require('supertest');

// ── Set test environment before importing the app ────────────────
process.env.NODE_ENV = 'test';

// Import the Express app (won't start server in test mode)
const app = require('../server');
const { generateTokenPair } = require('../utils/jwt');

// Test data
let testUser, testAdmin, testContent, testSport, testPlatform;
let userToken, adminToken;
const testPassword = 'Test@1234';

// ═════════════════════════════════════════════════════════════════
// SETUP & TEARDOWN
// ═════════════════════════════════════════════════════════════════

before(async () => {
  // Connect to test database (uses same MONGO_URI from env)
  await mongoose.connect(process.env.MONGO_URI);

  // Clean any test data from previous runs
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Create test user
  const User = require('../models/User');
  const Content = require('../models/Content');
  const Sport = require('../models/Sport');
  const Platform = require('../models/Platform');

  testUser = await User.create({
    fullName: 'Test User',
    username: 'testuser',
    email: 'testuser@example.com',
    password: testPassword,
    role: 'user',
    isEmailVerified: true,
    isActive: true
  });

  testAdmin = await User.create({
    fullName: 'Test Admin',
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: testPassword,
    role: 'admin',
    isEmailVerified: true,
    isActive: true
  });

  // Create test content
  testContent = await Content.create({
    title: 'Test Movie',
    type: 'MOVIE',
    description: 'A test movie for integration testing',
    genres: ['Action', 'Thriller'],
    language: 'English',
    releaseYear: 2025,
    rating: 0,
    status: 'Released',
    platforms: ['Netflix'],
    isActive: true
  });

  // Create test sport
  testSport = await Sport.create({
    title: 'Test Match',
    sportType: 'Football',
    tournamentName: 'Test Cup',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    homeScore: 2,
    awayScore: 1,
    status: 'Completed',
    startDate: new Date('2025-01-01'),
    venue: 'Test Stadium',
    isActive: true
  });

  // Create test platform
  testPlatform = await Platform.create({
    name: 'TestFlix',
    website: 'https://testflix.com',
    description: 'A test streaming platform',
    isActive: true
  });

  // Generate JWT tokens
  userToken = generateTokenPair({
    userId: testUser._id,
    role: testUser.role,
    type: 'user',
    email: testUser.email
  }).accessToken;

  adminToken = generateTokenPair({
    userId: testAdmin._id,
    role: testAdmin.role,
    type: 'user',
    email: testAdmin.email
  }).accessToken;
});

after(async () => {
  // Clean up test data
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await mongoose.connection.close();
});

// ═════════════════════════════════════════════════════════════════
// REVIEW ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Review API — Integration', () => {
  const basePath = '/api/content';

  it('POST /api/content/:id/reviews — should reject missing rating', async () => {
    const res = await request(app)
      .post(`${basePath}/${testContent._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ review: 'Great movie!' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/content/:id/reviews — should reject rating below 1', async () => {
    const res = await request(app)
      .post(`${basePath}/${testContent._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 0, review: 'Bad' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/content/:id/reviews — should reject rating above 10', async () => {
    const res = await request(app)
      .post(`${basePath}/${testContent._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 11, review: 'Overrated' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/content/:id/reviews — should create a review successfully', async () => {
    const res = await request(app)
      .post(`${basePath}/${testContent._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 8, review: 'Great movie!' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.review);
    assert.strictEqual(res.body.data.review.rating, 8);
  });

  it('GET /api/content/:id/reviews — should get reviews for content', async () => {
    const res = await request(app)
      .get(`${basePath}/${testContent._id}/reviews`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    assert.strictEqual(res.body.data[0].rating, 8);
  });

  it('PUT /api/content/:id/reviews — should update existing review', async () => {
    const res = await request(app)
      .put(`${basePath}/${testContent._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 9, review: 'Even better on rewatch!' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.review.rating, 9);
  });

  it('GET /api/user/reviews — should get my reviews', async () => {
    const res = await request(app)
      .get('/api/user/reviews')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('DELETE /api/content/:id/reviews — should delete own review', async () => {
    const res = await request(app)
      .delete(`${basePath}/${testContent._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/admin/reviews — admin should get all reviews', async () => {
    const res = await request(app)
      .get('/api/admin/reviews')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPORT ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Sport API — Integration', () => {
  it('GET /api/sports — should list sports events', async () => {
    const res = await request(app).get('/api/sports');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/sports — should filter by sport type', async () => {
    const res = await request(app)
      .get('/api/sports?sportType=Football');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.every(s => s.sportType === 'Football'));
  });

  it('GET /api/sports/live — should get live events', async () => {
    const res = await request(app).get('/api/sports/live');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/sports/upcoming — should get upcoming events', async () => {
    const res = await request(app).get('/api/sports/upcoming');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/sports/completed — should get completed events', async () => {
    const res = await request(app).get('/api/sports/completed');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/sports/types — should get sport types', async () => {
    const res = await request(app).get('/api/sports/types');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.includes('Football'));
  });

  it('GET /api/sports/:id — should get single event', async () => {
    const res = await request(app)
      .get(`/api/sports/${testSport._id}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Test Match');
  });

  it('POST /api/sports — admin should create sport event', async () => {
    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'New Match',
        sportType: 'Cricket',
        homeTeam: 'Team X',
        awayTeam: 'Team Y',
        startDate: new Date('2026-06-01').toISOString(),
        venue: 'New Stadium'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.sport.title, 'New Match');
  });

  it('POST /api/sports — should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Incomplete' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('PUT /api/sports/:id — admin should update sport', async () => {
    const res = await request(app)
      .put(`/api/sports/${testSport._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ homeScore: 3, awayScore: 2 });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.sport.homeScore, 3);
  });

  it('DELETE /api/sports/:id — admin should delete sport', async () => {
    // Create a temp sport to delete
    const Sport = require('../models/Sport');
    const temp = await Sport.create({
      title: 'Temp Match',
      sportType: 'Tennis',
      homeTeam: 'P1',
      awayTeam: 'P2',
      startDate: new Date(),
      status: 'Upcoming'
    });

    const res = await request(app)
      .delete(`/api/sports/${temp._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('POST /api/sports — should reject without auth', async () => {
    const res = await request(app)
      .post('/api/sports')
      .send({
        title: 'Unauthorized',
        sportType: 'Football',
        homeTeam: 'A',
        awayTeam: 'B',
        startDate: new Date().toISOString()
      });

    assert.strictEqual(res.status, 401);
  });
});

// ═════════════════════════════════════════════════════════════════
// PLATFORM ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Platform API — Integration', () => {
  it('GET /api/platforms — should list active platforms', async () => {
    const res = await request(app).get('/api/platforms');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data.every(p => p.isActive === true));
  });

  it('POST /api/admin/platforms — admin should create platform', async () => {
    const res = await request(app)
      .post('/api/admin/platforms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'NewStream',
        website: 'https://newstream.com',
        description: 'A brand new streaming platform'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.platform.name, 'NewStream');
  });

  it('POST /api/admin/platforms — should reject duplicate name', async () => {
    const res = await request(app)
      .post('/api/admin/platforms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'TestFlix' });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/admin/platforms — should reject missing name', async () => {
    const res = await request(app)
      .post('/api/admin/platforms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ website: 'https://example.com' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('PUT /api/admin/platforms/:id — admin should update platform', async () => {
    const res = await request(app)
      .put(`/api/admin/platforms/${testPlatform._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('DELETE /api/admin/platforms/:id — admin should delete platform', async () => {
    // Create a platform to delete
    const Platform = require('../models/Platform');
    const temp = await Platform.create({
      name: 'TempPlatform',
      website: 'https://temp.com'
    });

    const res = await request(app)
      .delete(`/api/admin/platforms/${temp._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════════════════════
// WATCHLIST ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Watchlist API — Integration', () => {
  it('POST /api/user/watchlist/:contentId — should add to watchlist', async () => {
    const res = await request(app)
      .post(`/api/user/watchlist/${testContent._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
  });

  it('POST /api/user/watchlist/:contentId — should reject duplicate', async () => {
    const res = await request(app)
      .post(`/api/user/watchlist/${testContent._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/user/watchlist/check/:contentId — should return true for added content', async () => {
    const res = await request(app)
      .get(`/api/user/watchlist/check/${testContent._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.isInWatchlist, true);
  });

  it('GET /api/user/watchlist/check/:contentId — should return false for other content', async () => {
    const otherId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/user/watchlist/check/${otherId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.isInWatchlist, false);
  });

  it('GET /api/user/watchlist — should get paginated watchlist', async () => {
    const res = await request(app)
      .get('/api/user/watchlist')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.meta.total > 0);
  });

  it('DELETE /api/user/watchlist/:contentId — should remove from watchlist', async () => {
    const res = await request(app)
      .delete(`/api/user/watchlist/${testContent._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/user/watchlist — should reflect removal', async () => {
    const res = await request(app)
      .get('/api/user/watchlist')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.meta.total, 0);
  });
});

// ═════════════════════════════════════════════════════════════════
// ADMIN BROADCAST & FEATURED CONTENT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Admin API — Broadcast & Featured Content', () => {
  it('POST /api/admin/notifications/broadcast — should broadcast notification', async () => {
    const res = await request(app)
      .post('/api/admin/notifications/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'System Update',
        message: 'Platform will be updated this weekend.',
        type: 'system'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.count > 0);
  });

  it('POST /api/admin/notifications/broadcast — should reject missing title', async () => {
    const res = await request(app)
      .post('/api/admin/notifications/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message: 'No title here' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('PATCH /api/admin/contents/:id/featured — should toggle featured content', async () => {
    const res = await request(app)
      .patch(`/api/admin/contents/${testContent._id}/featured`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isFeatured: true });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.content.isFeatured, true);
  });

  it('GET /api/admin/contents/featured — should list featured content', async () => {
    const res = await request(app)
      .get('/api/admin/contents/featured')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data.every(c => c.isFeatured === true));
  });

  it('PATCH /api/admin/contents/:id/featured — should unfeature content', async () => {
    const res = await request(app)
      .patch(`/api/admin/contents/${testContent._id}/featured`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isFeatured: false });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.content.isFeatured, false);
  });

  it('GET /api/admin/contents/featured — should reflect unfeatured', async () => {
    const res = await request(app)
      .get('/api/admin/contents/featured')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.length, 0);
  });

  it('Should reject admin endpoints with user role', async () => {
    const res = await request(app)
      .post('/api/admin/notifications/broadcast')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Hack', message: 'Attempt' });

    assert.strictEqual(res.status, 403);
  });
});

// ═════════════════════════════════════════════════════════════════
// UPCOMING CONTENT ENDPOINT TESTS (Company)
// ═════════════════════════════════════════════════════════════════

describe('Upcoming Content API — Integration', () => {
  let companyToken;
  let verifiedCompany;

  before(async () => {
    const Company = require('../models/Company');
    // Create a verified company for upcoming content tests
    verifiedCompany = await Company.create({
      companyName: 'Test Studio',
      username: 'teststudio',
      email: 'studio@example.com',
      password: testPassword,
      verificationStatus: 'verified',
      isActive: true
    });

    companyToken = generateTokenPair({
      userId: verifiedCompany._id,
      role: 'company',
      type: 'company',
      email: verifiedCompany.email
    }).accessToken;
  });

  it('POST /api/company/upcoming — should create upcoming content', async () => {
    const res = await request(app)
      .post('/api/company/upcoming')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        title: 'Coming Soon Movie',
        type: 'MOVIE',
        description: 'An upcoming blockbuster',
        releaseYear: 2026
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.content.title, 'Coming Soon Movie');
    assert.strictEqual(res.body.data.content.status, 'Upcoming');
  });

  it('POST /api/company/upcoming — should reject invalid type', async () => {
    const res = await request(app)
      .post('/api/company/upcoming')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        title: 'Invalid Type',
        type: 'GAME'
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/company/upcoming — should list company upcoming content', async () => {
    const res = await request(app)
      .get('/api/company/upcoming')
      .set('Authorization', `Bearer ${companyToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });
});

// ═════════════════════════════════════════════════════════════════
// PUBLIC CONTENT API TESTS
// ═════════════════════════════════════════════════════════════════

describe('Content API — Public Endpoints', () => {
  it('GET /api/health — should return health status', async () => {
    const res = await request(app).get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/content/:id — should return single content', async () => {
    const res = await request(app)
      .get(`/api/content/${testContent._id}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data._id, testContent._id.toString());
  });

  it('GET /api/content/trending — should return trending content', async () => {
    const res = await request(app).get('/api/content/trending');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/content/popular — should return popular content', async () => {
    const res = await request(app).get('/api/content/popular');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET 404 — should handle unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 3 — MATCH CENTER ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Match Center API — Integration', () => {
  let testMatchId;

  it('POST /api/matches — admin should create a match', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        homeTeam: 'FC Barcelona',
        awayTeam: 'Real Madrid',
        competition: 'La Liga',
        sportType: 'Football',
        kickoffTime: new Date(Date.now() + 86400000).toISOString(),
        venue: 'Camp Nou',
        referee: 'John Doe'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.match.homeTeam, 'FC Barcelona');
    testMatchId = res.body.data.match._id;
  });

  it('POST /api/matches — should reject missing required fields', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ homeTeam: 'Team A' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/matches — should reject without auth', async () => {
    const res = await request(app)
      .post('/api/matches')
      .send({
        homeTeam: 'A', awayTeam: 'B', competition: 'C',
        sportType: 'Football', kickoffTime: new Date().toISOString()
      });

    assert.strictEqual(res.status, 401);
  });

  it('POST /api/matches — should reject non-admin', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        homeTeam: 'A', awayTeam: 'B', competition: 'C',
        sportType: 'Football', kickoffTime: new Date().toISOString()
      });

    assert.strictEqual(res.status, 403);
  });

  it('GET /api/matches/live — should list live matches', async () => {
    const res = await request(app).get('/api/matches/live');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('GET /api/matches/today — should list today matches', async () => {
    const res = await request(app).get('/api/matches/today');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/matches/upcoming — should list upcoming matches', async () => {
    const res = await request(app).get('/api/matches/upcoming');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/matches/upcoming — should filter by competition', async () => {
    const res = await request(app).get('/api/matches/upcoming?competition=La%20Liga');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.every(m => m.competition === 'La Liga'));
  });

  it('GET /api/matches/:id — should get match details', async () => {
    const res = await request(app).get(`/api/matches/${testMatchId}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.homeTeam, 'FC Barcelona');
    assert.ok(Array.isArray(res.body.data.events));
    assert.ok(Array.isArray(res.body.data.lineups));
  });

  it('GET /api/matches/:id — should 404 for non-existent match', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/matches/${fakeId}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });

  it('PUT /api/matches/:id — admin should update match score', async () => {
    const res = await request(app)
      .put(`/api/matches/${testMatchId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ homeScore: 2, awayScore: 1, status: 'live', minute: 45 });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.match.homeScore, 2);
  });

  it('POST /api/matches/:id/events — admin should add match event', async () => {
    const res = await request(app)
      .post(`/api/matches/${testMatchId}/events`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ minute: 30, type: 'goal', team: 'home', playerName: 'Messi' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.event.type, 'goal');
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 3 — BROADCASTER ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Broadcaster API — Integration', () => {
  let testBroadcasterId;

  it('POST /api/admin/broadcasters — admin should create broadcaster', async () => {
    const res = await request(app)
      .post('/api/admin/broadcasters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'SportsChannel',
        logoUrl: 'https://example.com/logo.png',
        website: 'https://sportschannel.com',
        regions: ['US', 'UK', 'India'],
        isOfficial: true
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.broadcaster.name, 'SportsChannel');
    testBroadcasterId = res.body.data.broadcaster._id;
  });

  it('POST /api/admin/broadcasters — should reject duplicate name', async () => {
    const res = await request(app)
      .post('/api/admin/broadcasters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'SportsChannel' });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/admin/broadcasters — should reject missing name', async () => {
    const res = await request(app)
      .post('/api/admin/broadcasters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ website: 'https://example.com' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/admin/broadcasters — admin should list all broadcasters', async () => {
    const res = await request(app)
      .get('/api/admin/broadcasters')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/admin/broadcasters — should reject without auth', async () => {
    const res = await request(app).get('/api/admin/broadcasters');

    assert.strictEqual(res.status, 401);
  });

  it('PUT /api/admin/broadcasters/:id — admin should update broadcaster', async () => {
    const res = await request(app)
      .put(`/api/admin/broadcasters/${testBroadcasterId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isOfficial: false, isActive: false });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.broadcaster.isOfficial, false);
  });

  it('DELETE /api/admin/broadcasters/:id — admin should delete broadcaster', async () => {
    const res = await request(app)
      .delete(`/api/admin/broadcasters/${testBroadcasterId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 3 — FAVORITES ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Favorites API — Integration', () => {
  it('POST /api/favorites — should add a favorite team', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'team', refId: '507f1f77bcf86cd799439099' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
  });

  it('POST /api/favorites — should reject duplicate favorite', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'team', refId: '507f1f77bcf86cd799439099' });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/favorites — should reject missing type', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ refId: '507f1f77bcf86cd799439098' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/favorites — should reject without auth', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .send({ type: 'team', refId: 'x' });

    assert.strictEqual(res.status, 401);
  });

  it('GET /api/favorites — should list user favorites', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('DELETE /api/favorites — should remove a favorite', async () => {
    const res = await request(app)
      .delete('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'team', refId: '507f1f77bcf86cd799439099' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 3 — NOTIFICATION PREFERENCES ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Notification Preferences API — Integration', () => {
  it('GET /api/notification-preferences — should return defaults', async () => {
    const res = await request(app)
      .get('/api/notification-preferences')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.preferences.matchReminders, true);
  });

  it('GET /api/notification-preferences — should reject without auth', async () => {
    const res = await request(app).get('/api/notification-preferences');

    assert.strictEqual(res.status, 401);
  });

  it('PUT /api/notification-preferences — should update preferences', async () => {
    const res = await request(app)
      .put('/api/notification-preferences')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ matchReminders: false, goalAlerts: false });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.preferences.matchReminders, false);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 4 — ITEM REVIEWS ENDPOINT TESTS (1-5 star system)
// ═════════════════════════════════════════════════════════════════

describe('Item Review API — Integration', () => {
  let testReviewId;
  const testItemId = new mongoose.Types.ObjectId();

  it('POST /api/reviews — should create a 5-star review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        itemId: testItemId.toString(),
        itemType: 'content',
        rating: 5,
        body: 'Excellent content!'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.review.rating, 5);
    testReviewId = res.body.data.review._id;
  });

  it('POST /api/reviews — should reject duplicate review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        itemId: testItemId.toString(),
        itemType: 'content',
        rating: 3
      });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/reviews — should reject rating below 1', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        itemId: new mongoose.Types.ObjectId().toString(),
        itemType: 'content',
        rating: 0
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/reviews — should reject rating above 5', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        itemId: new mongoose.Types.ObjectId().toString(),
        itemType: 'content',
        rating: 6
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/reviews — should reject without auth', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ itemId: 'x', itemType: 'content', rating: 3 });

    assert.strictEqual(res.status, 401);
  });

  it('PUT /api/reviews/:id — should update review', async () => {
    const res = await request(app)
      .put(`/api/reviews/${testReviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4, body: 'Still good, but not perfect' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.review.rating, 4);
  });

  it('GET /api/items/:itemId/reviews — should get reviews for item', async () => {
    const res = await request(app)
      .get(`/api/items/${testItemId}/reviews`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/items/:itemId/rating-summary — should return aggregation', async () => {
    const res = await request(app)
      .get(`/api/items/${testItemId}/rating-summary`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.averageRating > 0);
    assert.ok(res.body.data.totalReviews > 0);
    assert.ok(typeof res.body.data.distribution === 'object');
  });

  it('POST /api/reviews/:id/helpful — should mark helpful', async () => {
    const res = await request(app)
      .post(`/api/reviews/${testReviewId}/helpful`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('DELETE /api/reviews/:id — should delete own review', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${testReviewId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 4 — DISCUSSION FORUM ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Discussion Forum API — Integration', () => {
  let testDiscussionId;
  let testCommentId;

  it('POST /api/discussions — should create a discussion', async () => {
    const res = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Best sports movie ever?',
        body: 'I think Rocky is the best sports movie. What do you think?',
        tags: ['movies', 'sports']
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.discussion.title, 'Best sports movie ever?');
    testDiscussionId = res.body.data.discussion._id;
  });

  it('POST /api/discussions — should reject missing title', async () => {
    const res = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'Just a body' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/discussions — should reject without auth', async () => {
    const res = await request(app)
      .post('/api/discussions')
      .send({ title: 'Hack', body: 'Attempt' });

    assert.strictEqual(res.status, 401);
  });

  it('GET /api/discussions — should list discussions', async () => {
    const res = await request(app).get('/api/discussions');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/discussions — should support search', async () => {
    const res = await request(app).get('/api/discussions?search=Rocky');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.some(d => d.body.includes('Rocky')));
  });

  it('GET /api/discussions/:id — should get discussion detail', async () => {
    const res = await request(app).get(`/api/discussions/${testDiscussionId}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Best sports movie ever?');
  });

  it('POST /api/discussions/:id/comments — should add a comment', async () => {
    const res = await request(app)
      .post(`/api/discussions/${testDiscussionId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'I agree! Rocky is amazing.' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.comment.body, 'I agree! Rocky is amazing.');
    testCommentId = res.body.data.comment._id;
  });

  it('POST /api/comments/:id/like — should toggle like', async () => {
    const res = await request(app)
      .post(`/api/comments/${testCommentId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('PUT /api/comments/:id — should update own comment', async () => {
    const res = await request(app)
      .put(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'Updated: I totally agree!' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.comment.body, 'Updated: I totally agree!');
  });

  it('DELETE /api/comments/:id — should delete own comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('PUT /api/discussions/:id — should update own discussion', async () => {
    const res = await request(app)
      .put(`/api/discussions/${testDiscussionId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Updated: Best sports movie ever?' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('DELETE /api/discussions/:id — should delete own discussion', async () => {
    const res = await request(app)
      .delete(`/api/discussions/${testDiscussionId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 4 — REPORT & MODERATION ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Report & Moderation API — Integration', () => {
  let testReportId;
  let testDiscussionId;

  before(async () => {
    // Create a discussion to report
    const Discussion = require('../models/Discussion');
    const disc = await Discussion.create({
      title: 'Reportable Content',
      body: 'This is not appropriate',
      authorId: testUser._id,
      tags: ['test']
    });
    testDiscussionId = disc._id;
  });

  it('POST /api/reports — should create a report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        targetType: 'discussion',
        targetId: testDiscussionId.toString(),
        reason: 'spam',
        description: 'This is spam content'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    testReportId = res.body.data.report._id;
  });

  it('POST /api/reports — should reject missing reason', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ targetType: 'discussion', targetId: testDiscussionId.toString() });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/moderation/stats — admin should get report stats', async () => {
    const res = await request(app)
      .get('/api/moderation/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.pending >= 1);
  });

  it('GET /api/moderation/reports — admin should list pending reports', async () => {
    const res = await request(app)
      .get('/api/moderation/reports?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/moderation/reports — should reject without auth', async () => {
    const res = await request(app).get('/api/moderation/reports');

    assert.strictEqual(res.status, 401);
  });

  it('PATCH /api/moderation/reports/:id — admin should resolve report', async () => {
    const res = await request(app)
      .patch(`/api/moderation/reports/${testReportId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved', hideTarget: true });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.report.status, 'resolved');
  });

  it('PATCH /api/moderation/reports/:id — should reject non-admin', async () => {
    const res = await request(app)
      .patch(`/api/moderation/reports/${testReportId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 403);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 4 — GAMIFICATION ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Gamification API — Integration', () => {
  it('GET /api/leaderboard — should return leaderboard', async () => {
    const res = await request(app).get('/api/leaderboard');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('GET /api/leaderboard — should support range filter', async () => {
    const res = await request(app).get('/api/leaderboard?range=weekly');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/leaderboard — should support monthly filter', async () => {
    const res = await request(app).get('/api/leaderboard?range=monthly');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/user/stats — should return user stats', async () => {
    const res = await request(app)
      .get('/api/user/stats')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.stats);
  });

  it('GET /api/user/stats — should reject without auth', async () => {
    const res = await request(app).get('/api/user/stats');

    assert.strictEqual(res.status, 401);
  });

  it('GET /api/badges — should list all badges', async () => {
    const res = await request(app).get('/api/badges');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/user/points-history — should return points history', async () => {
    const res = await request(app)
      .get('/api/user/points-history')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 4 — NOTIFICATION CENTER ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Notification Center API — Integration', () => {
  let testNotificationId;

  it('GET /api/notifications — should list user notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/notifications — should support read filter', async () => {
    const res = await request(app)
      .get('/api/notifications?read=false')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/notifications/unread-count — should return count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(typeof res.body.data.unreadCount, 'number');
  });

  it('PATCH /api/notifications/read-all — should mark all as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('DELETE /api/notifications/:id — should delete own notification', async () => {
    // Create a test notification to delete
    const Notification = require('../models/Notification');
    const notif = await Notification.create({
      recipientId: testUser._id,
      recipientType: 'User',
      type: 'system',
      title: 'Test Notification',
      message: 'To be deleted'
    });
    testNotificationId = notif._id;

    const res = await request(app)
      .delete(`/api/notifications/${testNotificationId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('DELETE /api/notifications/:id — should 404 for non-existent notification', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/notifications/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });

  it('DELETE /api/notifications/:id — should reject without auth', async () => {
    const res = await request(app)
      .delete(`/api/notifications/${testNotificationId}`);

    assert.strictEqual(res.status, 401);
  });
});

// ═════════════════════════════════════════════════════════════════
// SPRINT 4 — MODERATION LOCK/PIN ENDPOINT TESTS
// ═════════════════════════════════════════════════════════════════

describe('Moderation Lock & Pin API — Integration', () => {
  let testDiscussionId;

  before(async () => {
    const Discussion = require('../models/Discussion');
    const disc = await Discussion.create({
      title: 'Lock Test',
      body: 'Testing lock functionality',
      authorId: testUser._id,
      tags: ['test']
    });
    testDiscussionId = disc._id;
  });

  it('PATCH /api/moderation/discussions/:id/lock — admin should lock discussion', async () => {
    const res = await request(app)
      .patch(`/api/moderation/discussions/${testDiscussionId}/lock`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.locked, true);
  });

  it('POST /api/discussions/:id/comments — should reject comment on locked discussion', async () => {
    const res = await request(app)
      .post(`/api/discussions/${testDiscussionId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'Trying to comment on locked thread' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('PATCH /api/moderation/discussions/:id/pin — admin should pin discussion', async () => {
    const res = await request(app)
      .patch(`/api/moderation/discussions/${testDiscussionId}/pin`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.pinned, true);
  });

  it('PATCH /api/moderation/discussions/:id/lock — should reject non-admin', async () => {
    const res = await request(app)
      .patch(`/api/moderation/discussions/${testDiscussionId}/lock`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 403);
  });
});
