const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Company = require('../models/Company');
const Platform = require('../models/Platform');
const Advertisement = require('../models/Advertisement');
const Campaign = require('../models/Campaign');
const Review = require('../models/Review');
const Content = require('../models/Content');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');
const Verification = require('../models/Verification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexplay';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}\n`);

    // ── Clear all existing data ──────────────────────────────────
    // NOTE: Content is NOT cleared here — it's managed separately by seedContent.js.
    // Run seedContent.js BEFORE seed.js if you want review/ad data tied to content.
    const models = [
      User, Company, Platform, Advertisement, Campaign,
      Review, Notification, AdminLog, Verification
    ];
    await Promise.all(models.map(model => model.deleteMany({})));
    console.log('✓ Cleared all existing data (Content preserved for review linking)\n');

    const now = new Date();

    // ── 1. Admin Accounts ────────────────────────────────────────
    console.log('Seeding admins...');
    const adminPassword = await bcrypt.hash('NexPlay@Admin#2025', SALT_ROUNDS);
    const adminDocs = [
      { fullName: 'Elena Vasquez', username: 'elena_vasquez', email: 'elena.vasquez@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Marcus Chen', username: 'marcus_chen', email: 'marcus.chen@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Priya Sharma', username: 'priya_sharma', email: 'priya.sharma@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Ahmed Farouk', username: 'ahmed_farouk', email: 'ahmed.farouk@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Yuki Tanaka', username: 'yuki_tanaka', email: 'yuki.tanaka@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Olivia Bennett', username: 'olivia_bennett', email: 'olivia.bennett@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Diego Ramirez', username: 'diego_ramirez', email: 'diego.ramirez@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Aiko Sato', username: 'aiko_sato', email: 'aiko.sato@nexplay.com', password: adminPassword, role: 'admin', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now }
    ];
    await User.collection.insertMany(adminDocs);
    console.log(`  ✓ Created ${adminDocs.length} admins`);

    // ── 2. Regular User Accounts ─────────────────────────────────
    console.log('Seeding users...');
    const userPassword = await bcrypt.hash('NexPlay@User#2025', SALT_ROUNDS);
    const userDocs = [
      { fullName: 'Liam O\'Connor', username: 'liam_oconnor', email: 'liam.oconnor@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Sofia Rodriguez', username: 'sofia_rodriguez', email: 'sofia.rodriguez@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Kenji Watanabe', username: 'kenji_watanabe', email: 'kenji.watanabe@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Fatima Al-Rashid', username: 'fatima_alrashid', email: 'fatima.alrashid@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Dmitri Volkov', username: 'dmitri_volkov', email: 'dmitri.volkov@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Amara Okafor', username: 'amara_okafor', email: 'amara.okafor@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Hans Mueller', username: 'hans_mueller', email: 'hans.mueller@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Mei-Lin Chang', username: 'meilin_chang', email: 'meilin.chang@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Carlos Santos', username: 'carlos_santos', email: 'carlos.santos@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Aisha Kapoor', username: 'aisha_kapoor', email: 'aisha.kapoor@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Viktor Petrov', username: 'viktor_petrov', email: 'viktor.petrov@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Grace Kim', username: 'grace_kim', email: 'grace.kim@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Omar Hassan', username: 'omar_hassan', email: 'omar.hassan@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Isabella Conti', username: 'isabella_conti', email: 'isabella.conti@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now },
      { fullName: 'Raj Patel', username: 'raj_patel', email: 'raj.patel@gmail.com', password: userPassword, role: 'user', isEmailVerified: true, isActive: true, createdAt: now, updatedAt: now }
    ];
    await User.collection.insertMany(userDocs);
    console.log(`  ✓ Created ${userDocs.length} users`);

    // ── 3. Company Accounts ──────────────────────────────────────
    console.log('Seeding companies...');
    const companyPassword = await bcrypt.hash('NexPlay@Company#2025', SALT_ROUNDS);
    const companyDocs = [
      { companyName: 'Nexus Media Group', username: 'nexusmedia', email: 'info@nexusmedia.com', password: companyPassword, industry: 'Digital Marketing', description: 'Premier digital marketing and media conglomerate specializing in cross-platform content promotion and audience analytics.', website: 'https://nexusmedia.com', verificationStatus: 'verified', approvedAt: now, foundedYear: 2016, location: 'San Francisco, USA', socialMediaLinks: { twitter: '@nexusmedia' }, createdAt: now, updatedAt: now },
      { companyName: 'Aurora Entertainment', username: 'auroraent', email: 'contact@auroraentertainment.com', password: companyPassword, industry: 'Entertainment', description: 'Full-service entertainment and production company creating award-winning films, series, and interactive experiences for global audiences.', website: 'https://auroraentertainment.com', verificationStatus: 'verified', approvedAt: now, foundedYear: 2017, location: 'London, UK', socialMediaLinks: { twitter: '@auroraent' }, createdAt: now, updatedAt: now },
      { companyName: 'Titan Content Studios', username: 'titanstudios', email: 'hello@titanstudios.com', password: companyPassword, industry: 'Film Production', description: 'Independent film and content production studio pushing creative boundaries with bold storytelling and cutting-edge visual effects.', website: 'https://titanstudios.com', verificationStatus: 'pending', foundedYear: 2019, location: 'Toronto, Canada', socialMediaLinks: { twitter: '@titanstudios' }, createdAt: now, updatedAt: now },
      { companyName: 'Pioneer Digital Works', username: 'pioneerdw', email: 'info@pioneerdigitalworks.com', password: companyPassword, industry: 'Technology', description: 'Innovative technology solutions provider building next-generation digital infrastructure for content creators and streaming platforms.', website: 'https://pioneerdigitalworks.com', verificationStatus: 'verified', approvedAt: now, foundedYear: 2014, location: 'Berlin, Germany', createdAt: now, updatedAt: now },
      { companyName: 'Prism Broadcasting', username: 'prismbroadcast', email: 'team@prismbroadcast.com', password: companyPassword, industry: 'Broadcasting', description: 'Multi-channel broadcasting network delivering premium entertainment content across television, streaming, and digital platforms.', website: 'https://prismbroadcast.com', verificationStatus: 'pending', foundedYear: 2020, location: 'Sydney, Australia', createdAt: now, updatedAt: now },
      { companyName: 'Vertex Creative Labs', username: 'vertexcreative', email: 'studio@vertexcreative.com', password: companyPassword, industry: 'Creative Agency', description: 'Award-winning creative design and branding agency crafting visual identities, marketing campaigns, and immersive brand experiences.', website: 'https://vertexcreative.com', verificationStatus: 'rejected', rejectionReason: 'Business registration documents are outdated. Please provide updated certification and tax records.', rejectedAt: now, foundedYear: 2021, location: 'Mumbai, India', createdAt: now, updatedAt: now },
      { companyName: 'Horizon Film Productions', username: 'horizonfilm', email: 'info@horizonfilm.com', password: companyPassword, industry: 'Film Production', description: 'Boutique film production company dedicated to producing independent cinema and documentary features with social impact.', website: 'https://horizonfilm.com', verificationStatus: 'verified', approvedAt: now, foundedYear: 2015, location: 'Cape Town, South Africa', createdAt: now, updatedAt: now },
      { companyName: 'Apex Streaming Solutions', username: 'apexstream', email: 'contact@apexstream.com', password: companyPassword, industry: 'Technology', description: 'Enterprise-grade streaming infrastructure provider offering encoding, CDN, and analytics solutions for OTT platforms.', website: 'https://apexstream.com', verificationStatus: 'pending', foundedYear: 2018, location: 'Seoul, South Korea', createdAt: now, updatedAt: now }
    ];
    const insertedCompanies = await Company.collection.insertMany(companyDocs);
    const companies = await Company.find({}).lean();
    console.log(`  ✓ Created ${companyDocs.length} companies`);

    // ── 4. Platforms ──────────────────────────────────────────────
    console.log('Seeding platforms...');
    const platformDocs = [
      { name: 'Netflix', website: 'https://www.netflix.com', description: 'Global streaming service offering movies, TV series, and original content.', supportedRegions: ['Worldwide'], contentTypes: ['MOVIE', 'TV_SERIES', 'DOCUMENTARY'], isActive: true },
      { name: 'Amazon Prime', website: 'https://www.primevideo.com', description: 'Amazon\'s streaming platform with movies, TV shows, and exclusive originals.', supportedRegions: ['Worldwide'], contentTypes: ['MOVIE', 'TV_SERIES'], isActive: true },
      { name: 'Disney+', website: 'https://www.disneyplus.com', description: 'Disney\'s streaming service for Disney, Pixar, Marvel, Star Wars, and National Geographic.', supportedRegions: ['Worldwide'], contentTypes: ['MOVIE', 'TV_SERIES', 'DOCUMENTARY'], isActive: true },
      { name: 'Apple TV+', website: 'https://tv.apple.com', description: 'Apple\'s streaming service featuring original series and films.', supportedRegions: ['Worldwide'], contentTypes: ['MOVIE', 'TV_SERIES'], isActive: true },
      { name: 'HBO Max', website: 'https://www.hbomax.com', description: 'WarnerMedia\'s streaming platform with HBO originals, movies, and series.', supportedRegions: ['North America', 'Latin America', 'Europe'], contentTypes: ['MOVIE', 'TV_SERIES', 'DOCUMENTARY'], isActive: true },
      { name: 'Hulu', website: 'https://www.hulu.com', description: 'US-based streaming service with TV shows, movies, and original content.', supportedRegions: ['United States'], contentTypes: ['MOVIE', 'TV_SERIES'], isActive: true },
      { name: 'Crunchyroll', website: 'https://www.crunchyroll.com', description: 'Global anime streaming service with simulcasts and classic series.', supportedRegions: ['Worldwide'], contentTypes: ['ANIME'], isActive: true },
      { name: 'Sony LIV', website: 'https://www.sonyliv.com', description: 'Indian streaming platform with movies, TV shows, and live sports.', supportedRegions: ['India', 'South Asia'], contentTypes: ['MOVIE', 'TV_SERIES', 'SPORTS'], isActive: true },
      { name: 'Zee5', website: 'https://www.zee5.com', description: 'Indian streaming service offering movies, TV shows, and original content in multiple languages.', supportedRegions: ['India', 'South Asia'], contentTypes: ['MOVIE', 'TV_SERIES'], isActive: true },
      { name: 'Viki', website: 'https://www.viki.com', description: 'Global streaming service for Asian TV shows, movies, and variety content.', supportedRegions: ['Worldwide'], contentTypes: ['TV_SERIES', 'MOVIE'], isActive: true },
      { name: 'Paramount+', website: 'https://www.paramountplus.com', description: 'Streaming service offering movies, sports, news, and original series from Paramount.', supportedRegions: ['North America', 'Latin America', 'Europe'], contentTypes: ['MOVIE', 'TV_SERIES', 'SPORTS'], isActive: true },
      { name: 'Peacock', website: 'https://www.peacocktv.com', description: 'NBCUniversal\'s streaming service with movies, TV shows, and live events.', supportedRegions: ['United States'], contentTypes: ['MOVIE', 'TV_SERIES', 'SPORTS'], isActive: true }
    ];
    await Platform.insertMany(platformDocs);
    console.log(`  ✓ Created ${platformDocs.length} platforms`);

    // ── 5. Reviews by users ──────────────────────────────────────
    console.log('Seeding reviews...');
    const users = await User.find({ role: 'user' }).lean();
    const contentItems = await Content.find({}).lean();

    if (contentItems.length > 0 && users.length > 0) {
      const reviewerComments = [
        'Absolutely amazing! The storytelling and cinematography are top-notch. Highly recommended!',
        'Good watch, but could have been better. The ending felt rushed.',
        'One of the best things I have ever watched. Brilliant performances throughout.',
        'Decent entertainment. Not groundbreaking but enjoyable for what it is.',
        'Masterpiece! Every scene is crafted with such precision and care.',
        'I enjoyed this more than I expected. Great character development.',
        'The visuals are stunning, but the plot needs work. Still worth watching.',
        'A must-watch for fans of the genre. Does not disappoint.',
        'Slow start but picks up nicely in the second half. Glad I stuck with it.',
        'Overhyped in my opinion. Good but not great. Solid 7/10.',
        'Incredible world-building and attention to detail. A feast for the eyes.',
        'The performances carry this otherwise average script. Still enjoyable.',
        'Thought-provoking and deeply moving. This stayed with me for days.',
        'A refreshing take on a familiar concept. Bold and creative filmmaking.',
        'The soundtrack alone makes this worth watching. Absolutely phenomenal.',
        'Engaging from start to finish. Every episode leaves you wanting more.',
        'Not my usual genre but I was pleasantly surprised. Give it a chance!',
        'Cinematic excellence. The direction and editing are flawless.',
        'A rollercoaster of emotions. Laughed, cried, and cheered all in one sitting.',
        'The chemistry between the leads is electric. Perfect casting.'
      ];

      const reviewDocs = [];
      const usedPairs = new Set();

      users.forEach((user, userIdx) => {
        const numReviews = Math.min(4 + (userIdx % 4), contentItems.length);
        const shuffled = [...contentItems].sort(() => Math.random() - 0.5);

        for (let i = 0; i < numReviews && i < shuffled.length; i++) {
          const contentId = shuffled[i]._id.toString();
          const pair = `${user._id}:${contentId}`;
          if (usedPairs.has(pair)) continue;
          usedPairs.add(pair);

          const rating = Math.floor(Math.random() * 5) + 6; // 6-10
          reviewDocs.push({
            userId: user._id,
            contentId: shuffled[i]._id,
            rating,
            review: reviewerComments[Math.floor(Math.random() * reviewerComments.length)],
            isModerated: false,
            isActive: true,
            createdAt: new Date(now - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
            updatedAt: now
          });
        }
      });

      if (reviewDocs.length > 0) {
        await Review.insertMany(reviewDocs);
        console.log(`  ✓ Created ${reviewDocs.length} reviews by users`);
      }
    } else {
      console.log('  ⚠ No content or users found for reviews (run seedContent.js first?)');
    }

    // ── 6. Advertisements ────────────────────────────────────────
    console.log('Seeding advertisements...');
    const verifiedCompanies = companies.filter(c => c.verificationStatus === 'verified');
    if (verifiedCompanies.length > 0) {
      const adsDoc = [];
      const adTemplates = [
        { title: 'Summer Blockbuster Campaign', description: 'Promote our latest summer movie lineup with exclusive behind-the-scenes content and trailers across all streaming platforms.' },
        { title: 'Tech Solutions Promo', description: 'Discover how our technology solutions can help your business grow with AI-powered analytics and cloud infrastructure.' },
        { title: 'Brand Awareness Campaign', description: 'Increase brand visibility across all streaming platforms with targeted advertisements and audience engagement strategies.' },
        { title: 'Product Launch', description: 'Launch our new content management platform designed for streaming services and digital media companies.' },
        { title: 'Holiday Special Promo', description: 'Festive season special campaign promoting curated holiday content and family-friendly entertainment packages.' },
        { title: 'Global Expansion Drive', description: 'Strategic campaign to promote our services in emerging markets across Asia, Africa, and Latin America.' }
      ];

      verifiedCompanies.forEach((company, idx) => {
        const placements = ['banner', 'sidebar', 'featured', 'popup'];
        const ad1 = adTemplates[idx % adTemplates.length];
        const ad2 = adTemplates[(idx + 3) % adTemplates.length];

        adsDoc.push({
          companyId: company._id,
          title: ad1.title,
          description: ad1.description,
          imageUrl: '',
          targetUrl: company.website || '#',
          placement: placements[idx % placements.length],
          status: 'active',
          budget: 30000 + (idx * 15000),
          startDate: now,
          endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
          createdAt: now,
          updatedAt: now
        });

        adsDoc.push({
          companyId: company._id,
          title: ad2.title,
          description: ad2.description,
          imageUrl: '',
          targetUrl: company.website || '#',
          placement: 'banner',
          status: idx % 2 === 0 ? 'pending' : 'active',
          budget: 40000 + (idx * 10000),
          startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
          createdAt: now,
          updatedAt: now
        });

        // Add a third ad for each verified company
        adsDoc.push({
          companyId: company._id,
          title: `${company.companyName} Showcase`,
          description: `Exclusive promotional content from ${company.companyName}. Discover our latest projects and offerings.`,
          imageUrl: '',
          targetUrl: company.website || '#',
          placement: 'sidebar',
          status: idx < 2 ? 'active' : 'paused',
          budget: 20000 + (idx * 8000),
          startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: now
        });
      });
      await Advertisement.insertMany(adsDoc);
      console.log(`  ✓ Created ${adsDoc.length} advertisements`);
    } else {
      console.log('  ⚠ No verified companies found for advertisements');
    }

    // ── 7. Notifications ──────────────────────────────────────────
    console.log('Seeding notifications...');
    const notificationDocs = [];

    verifiedCompanies.forEach(company => {
      notificationDocs.push({
        recipientId: company._id, recipientType: 'Company', type: 'verification',
        title: 'Company Verified', message: 'Congratulations! Your company has been verified successfully. You can now create advertisements and manage content.',
        isRead: true, createdAt: now
      });
    });

    const rejectedCompany = companies.find(c => c.verificationStatus === 'rejected');
    if (rejectedCompany) {
      notificationDocs.push({
        recipientId: rejectedCompany._id, recipientType: 'Company', type: 'verification',
        title: 'Verification Rejected',
        message: `Your company verification request has been rejected. Reason: ${rejectedCompany.rejectionReason || 'Incomplete documentation.'}`,
        isRead: false, createdAt: now
      });
    }

    const pendingCompanies = companies.filter(c => c.verificationStatus === 'pending');
    pendingCompanies.forEach(company => {
      notificationDocs.push({
        recipientId: company._id, recipientType: 'Company', type: 'system',
        title: 'Verification In Progress', message: `Your verification request is being reviewed. We will notify you once the process is complete. Estimated time: 3-5 business days.`,
        isRead: false, createdAt: now
      });
    });

    users.forEach(user => {
      notificationDocs.push({
        recipientId: user._id, recipientType: 'User', type: 'system',
        title: 'Welcome to NexPlay!', message: `Welcome ${user.fullName}! Start exploring movies, TV series, and more. Personalize your watchlist and discover new favorites.`,
        isRead: true, createdAt: now
      });
    });

    // Add some extra notifications for random users
    users.slice(0, 5).forEach((user, idx) => {
      const notificationTypes = [
        { title: 'New Content Alert', message: 'A new movie in your favorite genre has been added. Check it out!' },
        { title: 'Review Milestone', message: 'Congratulations! Your review has helped 50+ users discover new content.' },
        { title: 'Watchlist Update', message: 'One of your saved items is now available for streaming on a new platform.' }
      ];
      const nt = notificationTypes[idx % notificationTypes.length];
      notificationDocs.push({
        recipientId: user._id, recipientType: 'User', type: 'promotion',
        title: nt.title, message: nt.message,
        isRead: false, createdAt: new Date(now - idx * 24 * 60 * 60 * 1000)
      });
    });

    await Notification.insertMany(notificationDocs);
    console.log(`  ✓ Created ${notificationDocs.length} notifications`);

    // ── 8. Verify seeded data ────────────────────────────────────
    console.log('\nVerifying seeded data...');
    const verifyAdmins = await User.countDocuments({ role: 'admin' });
    const verifyUsers = await User.countDocuments({ role: 'user' });
    const verifyCompanies = await Company.countDocuments();
    const verifyPlatforms = await Platform.countDocuments();
    const verifyReviews = await Review.countDocuments();
    const verifyAds = await Advertisement.countDocuments();

    const allGood = verifyAdmins === 8 && verifyUsers === 15 && verifyCompanies === 8;
    if (!allGood) {
      throw new Error(
        `Verification failed: admins=${verifyAdmins} (expected 8), ` +
        `users=${verifyUsers} (expected 15), companies=${verifyCompanies} (expected 8)`
      );
    }

    console.log(`  Admins:         ${verifyAdmins} ✓`);
    console.log(`  Users:          ${verifyUsers} ✓`);
    console.log(`  Companies:      ${verifyCompanies} ✓`);
    console.log(`  Platforms:      ${verifyPlatforms} ✓`);
    console.log(`  Reviews:        ${verifyReviews} ✓`);
    console.log(`  Advertisements: ${verifyAds} ✓`);

    // ── 9. Verify bcrypt passwords work ──────────────────────────
    const testAdmin = await User.findOne({ email: 'elena.vasquez@nexplay.com' }).select('+password');
    const pwMatch = await testAdmin.comparePassword('NexPlay@Admin#2025');
    if (!pwMatch) throw new Error('Password verification failed for admin account');
    console.log('  Password verification: ✓\n');

    // ── 10. Print Summary ────────────────────────────────────────
    console.log('='.repeat(50));
    console.log('  SEED COMPLETE - All data verified');
    console.log('='.repeat(50));
    console.log('');
    console.log('  ADMIN ACCOUNTS (8)');
    console.log('  '.repeat(48));
    console.log('  elena.vasquez@nexplay.com    / NexPlay@Admin#2025');
    console.log('  marcus.chen@nexplay.com      / NexPlay@Admin#2025');
    console.log('  priya.sharma@nexplay.com     / NexPlay@Admin#2025');
    console.log('  ahmed.farouk@nexplay.com     / NexPlay@Admin#2025');
    console.log('  yuki.tanaka@nexplay.com      / NexPlay@Admin#2025');
    console.log('  olivia.bennett@nexplay.com   / NexPlay@Admin#2025');
    console.log('  diego.ramirez@nexplay.com    / NexPlay@Admin#2025');
    console.log('  aiko.sato@nexplay.com        / NexPlay@Admin#2025');
    console.log('');
    console.log('  USER ACCOUNTS (15)');
    console.log('  '.repeat(48));
    console.log('  liam.oconnor@gmail.com     / NexPlay@User#2025');
    console.log('  sofia.rodriguez@gmail.com  / NexPlay@User#2025');
    console.log('  kenji.watanabe@gmail.com   / NexPlay@User#2025');
    console.log('  fatima.alrashid@gmail.com  / NexPlay@User#2025');
    console.log('  dmitri.volkov@gmail.com    / NexPlay@User#2025');
    console.log('  amara.okafor@gmail.com     / NexPlay@User#2025');
    console.log('  hans.mueller@gmail.com     / NexPlay@User#2025');
    console.log('  meilin.chang@gmail.com     / NexPlay@User#2025');
    console.log('  carlos.santos@gmail.com    / NexPlay@User#2025');
    console.log('  aisha.kapoor@gmail.com     / NexPlay@User#2025');
    console.log('  viktor.petrov@gmail.com    / NexPlay@User#2025');
    console.log('  grace.kim@gmail.com        / NexPlay@User#2025');
    console.log('  omar.hassan@gmail.com      / NexPlay@User#2025');
    console.log('  isabella.conti@gmail.com   / NexPlay@User#2025');
    console.log('  raj.patel@gmail.com        / NexPlay@User#2025');
    console.log('');
    console.log('  COMPANY ACCOUNTS (8)');
    console.log('  '.repeat(48));
    console.log('  Nexus Media Group          / NexPlay@Company#2025  [Verified]');
    console.log('  Aurora Entertainment       / NexPlay@Company#2025  [Verified]');
    console.log('  Pioneer Digital Works      / NexPlay@Company#2025  [Verified]');
    console.log('  Horizon Film Productions   / NexPlay@Company#2025  [Verified]');
    console.log('  Titan Content Studios      / NexPlay@Company#2025  [Pending]');
    console.log('  Prism Broadcasting         / NexPlay@Company#2025  [Pending]');
    console.log('  Apex Streaming Solutions   / NexPlay@Company#2025  [Pending]');
    console.log('  Vertex Creative Labs       / NexPlay@Company#2025  [Rejected]');
    console.log('');
    console.log(`  PLATFORMS:     ${verifyPlatforms}`);
    console.log(`  REVIEWS:       ${verifyReviews}`);
    console.log(`  ADVERTISEMENTS: ${verifyAds}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error(`\nSEED FAILED: ${error.message}`);
    process.exit(1);
  }
}

seedData();
