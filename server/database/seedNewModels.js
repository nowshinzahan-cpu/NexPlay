/**
 * Seed Script — Sprint 3 & 4 Models
 * Run after main seed: node database/seedNewModels.js
 * Populates: Matches, MatchEvents, Broadcasters, Favorites, Discussions,
 *            Comments, Reports, Badges (already in seedBadges.js), PointsLedger
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexplay';

const Comment = require('../models/Comment');
const Discussion = require('../models/Discussion');
const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');
const Standing = require('../models/Standing');
const Broadcast = require('../models/Broadcaster');
const StreamAvailability = require('../models/StreamAvailability');
const Favorite = require('../models/Favorite');
const Report = require('../models/Report');
const User = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}\n`);

    // ── Clear existing data ────────────────────────────
    await Promise.all([
      Match.deleteMany({}),
      MatchEvent.deleteMany({}),
      Standing.deleteMany({}),
      Broadcast.deleteMany({}),
      StreamAvailability.deleteMany({}),
      Favorite.deleteMany({}),
      Discussion.deleteMany({}),
      Comment.deleteMany({}),
      Report.deleteMany({}),
    ]);
    console.log('✓ Cleared existing Sprint 3/4 data\n');

    // ── Find users for references ──────────────────────
    const users = await User.find({ role: 'user' }).limit(5).lean();
    const admin = await User.findOne({ role: 'admin' }).lean();
    if (!users.length || !admin) {
      console.log('⚠ Run main seed first (npm run seed) to create users');
      process.exit(1);
    }
    const [u1, u2, u3] = users;

    // ── Matches ────────────────────────────────────────
    const now = new Date();
    const matches = await Match.insertMany([
      {
        homeTeam: 'FC Barcelona',
        awayTeam: 'Real Madrid',
        competition: 'La Liga',
        sportType: 'Football',
        kickoffTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2h ago
        homeScore: 3,
        awayScore: 1,
        status: 'live',
        minute: 72,
        venue: 'Camp Nou',
        referee: 'Antonio Mateu',
        stats: {
          homePossession: 58, awayPossession: 42,
          homeShots: 14, awayShots: 8,
          homeShotsOnTarget: 7, awayShotsOnTarget: 3,
          homeFouls: 8, awayFouls: 12,
          homeCorners: 6, awayCorners: 3,
          homeYellowCards: 2, awayYellowCards: 3,
          homeRedCards: 0, awayRedCards: 0
        }
      },
      {
        homeTeam: 'Manchester City',
        awayTeam: 'Arsenal',
        competition: 'Premier League',
        sportType: 'Football',
        kickoffTime: new Date(now.getTime() - 30 * 60 * 1000),
        homeScore: 0,
        awayScore: 0,
        status: 'live',
        minute: 15,
        venue: 'Etihad Stadium',
        referee: 'Michael Oliver',
        stats: { homePossession: 62, awayPossession: 38, homeShots: 3, awayShots: 1,
                 homeShotsOnTarget: 1, awayShotsOnTarget: 0, homeFouls: 2, awayFouls: 3,
                 homeCorners: 2, awayCorners: 0, homeYellowCards: 0, awayYellowCards: 1,
                 homeRedCards: 0, awayRedCards: 0 }
      },
      {
        homeTeam: 'Lakers',
        awayTeam: 'Celtics',
        competition: 'NBA',
        sportType: 'Basketball',
        kickoffTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled',
        minute: 0,
        venue: 'Crypto.com Arena',
        referee: '',
        stats: {}
      },
    ]);
    console.log(`✓ Created ${matches.length} matches`);

    // ── Match Events ───────────────────────────────────
    const events = await MatchEvent.insertMany([
      { matchId: matches[0]._id, minute: 23, type: 'goal', team: 'home', playerName: 'Lewandowski', description: 'Header from corner kick' },
      { matchId: matches[0]._id, minute: 35, type: 'yellow_card', team: 'away', playerName: 'Carvajal', description: 'Tactical foul' },
      { matchId: matches[0]._id, minute: 42, type: 'goal', team: 'away', playerName: 'Vinícius Jr', description: 'Low shot from edge of box' },
      { matchId: matches[0]._id, minute: 58, type: 'goal', team: 'home', playerName: 'Yamal', description: 'Solo run and finish' },
      { matchId: matches[0]._id, minute: 67, type: 'goal', team: 'home', playerName: 'Raphinha', description: 'Free kick' },
    ]);
    console.log(`✓ Created ${events.length} match events`);

    // ── Standings ──────────────────────────────────────
    const standings = await Standing.insertMany([
      { competition: 'La Liga', teamName: 'FC Barcelona', played: 10, wins: 8, draws: 1, losses: 1, goalsFor: 25, goalsAgainst: 8, points: 25, goalDifference: 17 },
      { competition: 'La Liga', teamName: 'Real Madrid', played: 10, wins: 7, draws: 2, losses: 1, goalsFor: 22, goalsAgainst: 10, points: 23, goalDifference: 12 },
      { competition: 'La Liga', teamName: 'Atlético Madrid', played: 10, wins: 6, draws: 3, losses: 1, goalsFor: 18, goalsAgainst: 9, points: 21, goalDifference: 9 },
      { competition: 'La Liga', teamName: 'Sevilla', played: 10, wins: 5, draws: 2, losses: 3, goalsFor: 14, goalsAgainst: 12, points: 17, goalDifference: 2 },
    ]);
    console.log(`✓ Created ${standings.length} standings entries`);

    // ── Broadcasters ───────────────────────────────────
    const broadcasters = await Broadcast.insertMany([
      { name: 'ESPN', logoUrl: 'https://img.icons8.com/color/96/espn.png', website: 'https://espn.com', regions: ['US', 'Latin America'], isOfficial: true },
      { name: 'Sky Sports', logoUrl: 'https://img.icons8.com/color/96/sky-sports.png', website: 'https://skysports.com', regions: ['UK', 'Ireland'], isOfficial: true },
      { name: 'DAZN', logoUrl: '', website: 'https://dazn.com', regions: ['Canada', 'Germany', 'Italy', 'Japan'], isOfficial: true },
      { name: 'Hotstar', logoUrl: '', website: 'https://hotstar.com', regions: ['India'], isOfficial: true },
    ]);
    console.log(`✓ Created ${broadcasters.length} broadcasters`);

    // ── Stream Availabilities ──────────────────────────
    const streams = await StreamAvailability.insertMany([
      { matchId: matches[0]._id, broadcasterId: broadcasters[0]._id, region: 'US', url: 'https://espn.com/watch/barca-vs-madrid', isOfficial: true, isFree: false, quality: '4K', language: 'English' },
      { matchId: matches[0]._id, broadcasterId: broadcasters[1]._id, region: 'UK', url: 'https://skysports.com/watch/barca-vs-madrid', isOfficial: true, isFree: false, quality: 'HD', language: 'English' },
      { matchId: matches[0]._id, broadcasterId: broadcasters[3]._id, region: 'India', url: 'https://hotstar.com/watch/barca-vs-madrid', isOfficial: true, isFree: true, quality: 'HD', language: 'Hindi' },
      { matchId: matches[1]._id, broadcasterId: broadcasters[0]._id, region: 'US', url: 'https://espn.com/watch/city-vs-arsenal', isOfficial: true, isFree: false, quality: 'HD', language: 'English' },
      { matchId: matches[1]._id, broadcasterId: broadcasters[1]._id, region: 'UK', url: 'https://skysports.com/watch/city-vs-arsenal', isOfficial: true, isFree: false, quality: 'HD', language: 'English' },
      { matchId: matches[2]._id, broadcasterId: broadcasters[0]._id, region: 'US', url: 'https://espn.com/watch/lakers-vs-celtics', isOfficial: true, isFree: false, quality: '4K', language: 'English' },
    ]);
    console.log(`✓ Created ${streams.length} stream availabilities`);

    // ── Discussions ────────────────────────────────────
    const discussions = await Discussion.insertMany([
      { title: 'Best sports movie of all time?', body: 'I think Rocky is unbeatable. What do you all think?', authorId: u1._id, tags: ['movies', 'sports', 'debate'], commentCount: 3, viewCount: 45 },
      { title: 'Who will win the Champions League this year?', body: 'My money is on Manchester City. They look unstoppable this season.', authorId: u2._id, tags: ['football', 'champions-league', 'prediction'], commentCount: 5, viewCount: 89 },
      { title: 'Pinned: Community Guidelines', body: 'Welcome to the NexPlay community! Please be respectful and follow the guidelines.', authorId: admin._id, tags: ['announcement', 'guidelines'], pinned: true, locked: true, commentCount: 0, viewCount: 230 },
      { title: 'Netflix vs Prime Video — which is better?', body: 'I prefer Netflix for originals but Prime has better movie library.', authorId: u3._id, tags: ['streaming', 'netflix', 'prime-video'], commentCount: 2, viewCount: 34 },
    ]);
    console.log(`✓ Created ${discussions.length} discussions`);

    // ── Comments ───────────────────────────────────────
    const comments = await Comment.insertMany([
      { discussionId: discussions[0]._id, authorId: u2._id, body: 'Rocky is great but I prefer The Last Dance.', depth: 0 },
      { discussionId: discussions[0]._id, authorId: u3._id, body: 'What about Creed? Same universe!', depth: 0 },
      { discussionId: discussions[0]._id, authorId: u1._id, body: 'True, Creed is a worthy successor.', depth: 0 },
      { discussionId: discussions[1]._id, authorId: u3._id, body: 'Real Madrid always finds a way in UCL!', depth: 0, likes: [u1._id], likeCount: 1 },
      { discussionId: discussions[1]._id, authorId: u1._id, body: 'Bayern Munich are dark horses this year.', depth: 0 },
      { discussionId: discussions[3]._id, authorId: u1._id, body: 'Netflix has better UI but Prime has better 4K streaming.', depth: 0 },
      { discussionId: discussions[3]._id, authorId: u2._id, body: 'Disney+ is catching up fast with Hulu content.', depth: 0 },
    ]);
    console.log(`✓ Created ${comments.length} comments`);

    // ── Reports ────────────────────────────────────────
    const reports = await Report.insertMany([
      { targetType: 'comment', targetId: comments[0]._id, reporterId: u3._id, reason: 'spam', description: 'This comment is off-topic', status: 'pending' },
      { targetType: 'discussion', targetId: discussions[3]._id, reporterId: u2._id, reason: 'inappropriate', description: 'Contains inappropriate language', status: 'resolved', resolvedBy: admin._id, resolvedAt: new Date(), resolutionNote: 'Content was fine, no action taken.' },
    ]);
    console.log(`✓ Created ${reports.length} reports`);

    console.log('\n✅ Sprint 3/4 seed complete! (Badges are created by seedBadges.js — run separately)');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
