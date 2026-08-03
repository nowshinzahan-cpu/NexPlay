const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Badge } = require('../models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexplay';

const badges = [
  // Reviewer badges
  { key: 'first_review', name: 'First Review', description: 'Write your first review', category: 'reviewer', criteria: 'Write 1 review', pointsAwarded: 25 },
  { key: 'critic', name: 'The Critic', description: 'Write 5 reviews', category: 'reviewer', criteria: 'Write 5 reviews', pointsAwarded: 50 },
  { key: 'review_master', name: 'Review Master', description: 'Write 10 reviews', category: 'reviewer', criteria: 'Write 10 reviews', pointsAwarded: 100 },

  // Contributor badges
  { key: 'first_discussion', name: 'First Discussion', description: 'Start your first discussion', category: 'contributor', criteria: 'Create 1 discussion', pointsAwarded: 25 },
  { key: 'first_comment', name: 'First Comment', description: 'Post your first comment', category: 'contributor', criteria: 'Post 1 comment', pointsAwarded: 10 },
  { key: 'discussion_starter', name: 'Discussion Starter', description: 'Start 5 discussions', category: 'contributor', criteria: 'Create 5 discussions', pointsAwarded: 50 },
  { key: 'popular_commenter', name: 'Popular Commenter', description: 'Post 25 comments', category: 'contributor', criteria: 'Post 25 comments', pointsAwarded: 75 },

  // Social badges
  { key: 'super_fan', name: 'Super Fan', description: 'Favorite 10 teams or tournaments', category: 'social', criteria: 'Add 10 favorites', pointsAwarded: 50 },

  // Streak badges
  { key: 'streak_3', name: 'Hat Trick', description: 'Log in for 3 consecutive days', category: 'streak', criteria: '3-day login streak', pointsAwarded: 30 },
  { key: 'streak_7', name: 'Week Warrior', description: 'Log in for 7 consecutive days', category: 'streak', criteria: '7-day login streak', pointsAwarded: 75 },
  { key: 'streak_30', name: 'Monthly Devotion', description: 'Log in for 30 consecutive days', category: 'streak', criteria: '30-day login streak', pointsAwarded: 200 },

  // Milestone badges
  { key: 'centurion', name: 'Centurion', description: 'Earn 100 points', category: 'milestone', criteria: 'Reach 100 points', pointsAwarded: 25 },
  { key: 'level_5', name: 'Seasoned Pro', description: 'Reach Level 5', category: 'milestone', criteria: 'Achieve Level 5', pointsAwarded: 100 },
  { key: 'level_10', name: 'Hall of Fame', description: 'Reach Level 10', category: 'milestone', criteria: 'Achieve Level 10', pointsAwarded: 250 }
];

async function seedBadges() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}`);

    // Clear existing badges
    await Badge.deleteMany({});
    console.log('✓ Cleared existing badges');

    // Insert badges
    const created = await Badge.insertMany(badges);
    console.log(`✓ Created ${created.length} badges`);

    await mongoose.connection.close();
    console.log('\n✅ Badge seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Badge seeding failed:', error);
    process.exit(1);
  }
}

seedBadges();
