# Database Schema & Entity Relationships

> **27 Mongoose Models** across 6 feature modules
> **Database:** MongoDB 7.x | **ODM:** Mongoose 9.x

---

## 📊 Entity Relationship Diagram

```
╔══════════════════════════════════════════════════════════════════╗
║                      AUTHENTICATION & USERS                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  User ────1:N──→ Review (userId)                                 ║
║  User ────1:N──→ Notification (recipientId)                      ║
║  User ────1:N──→ Verification (userId, refPath: userType)        ║
║  User ────1:N──→ AdminLog (adminId)                              ║
║  User ────1:N──→ Favorite (userId)                               ║
║  User ────1:1──→ NotificationPreference (userId)                 ║
║  User ────1:N──→ ItemReview (userId)                             ║
║  User ────1:N──→ Discussion (authorId)                           ║
║  User ────1:N──→ Comment (authorId)                              ║
║  User ────1:N──→ Report (reporterId / resolvedBy)                ║
║  User ────1:1──→ UserStats (userId)                              ║
║  User ────1:N──→ PointsLedger (userId)                           ║
║  User ────N:M──→ Badge (through UserBadge)                       ║
║  User ────M:N──→ Content (through embedded watchlist[])          ║
║                                                                  ║
║  Company ──1:N──→ Notification (recipientId)                     ║
║  Company ──1:N──→ Verification (userId, refPath: userType)       ║
║  Company ──1:N──→ Content (companyId)                            ║
║  Company ──1:N──→ Advertisement (companyId)                      ║
║  Company ──1:N──→ Campaign (companyId)                           ║
║  Company ──1:N──→ UpcomingContent (companyId)                    ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║                  SPRINT 1: PLATFORM FOUNDATION                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Campaign ────N:M──→ Advertisement (embedded ObjectId[])         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║                  SPRINT 2: ENTERTAINMENT DISCOVERY               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Content ◄───────── Review (contentId)                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║              SPRINT 3: STREAMING & LIVE SCORES                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Match ────1:N──→ MatchEvent (matchId)                           ║
║  Match ────1:N──→ Lineup (matchId)                               ║
║  Match ────1:N──→ StreamAvailability (matchId)                   ║
║  Broadcaster ──1:N──→ StreamAvailability (broadcasterId)         ║
║                                                                  ║
║  STANDALONE: Standing, Platform, Sport                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║                    SPRINT 4: COMMUNITY                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Discussion ──1:N──→ Comment (discussionId)                      ║
║  Comment ────1:N──→ Comment (parentCommentId, self-ref)          ║
║                                                                  ║
║  STANDALONE: Report, ItemReview                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║                    SPRINT 4: GAMIFICATION                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  User │──→ UserStats (1:1) │──→ PointsLedger (1:N)               ║
║  UserBadge ────M:1──→ Badge (badgeId)                            ║
║  UserBadge ────M:1──→ User (userId)                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🧩 Model Summary

| #  | Model                      | Collection                  | Module        | Key Fields                                                                                                                                                                                                                                                                                                                                                           | Indexes                                                                                                                                                                                                                              |
| -- | -------------------------- | --------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1  | `User`                   | `users`                   | Auth          | fullName, username, email, password(hashed), role(user/company/admin), avatar, isEmailVerified, isActive, lastLogin, watchlist[] (ref: Content)                                                                                                                                                                                                                      | email(unique), username(unique), role, isActive                                                                                                                                                                                      |
| 2  | `Company`                | `companies`               | Auth          | companyName, username, email, password(hashed), description, industry, website, logo, foundedYear, location, socialMediaLinks, verificationStatus(pending/verified/rejected), rejectionReason, approvedAt, rejectedAt, isActive                                                                                                                                      | email(unique), username(unique), verificationStatus, isActive                                                                                                                                                                        |
| 3  | `Content`                | `contents`                | Discovery     | title, originalTitle, type(MOVIE/TV_SERIES/WEB_SERIES/ANIME/DOCUMENTARY), description, poster, backdrop, genres[], tags[], spokenLanguage, languages[], releaseYear, releaseMonth, rating(0-10), status(Released/Upcoming/Ongoing/Completed), platforms[], episodeCount, currentEpisode, popularity, trending, isFeatured, companyId(ref: Company), tmdbId, isActive | title(text index with weights), {isActive,trending}, {isActive,popularity}, {isActive,rating}, {isActive,updatedAt}, {isActive,status,releaseYear}, type, {type,status,releaseYear}, {type,genres,spokenLanguage}, platforms, tmdbId |
| 4  | `Review`                 | `reviews`                 | Sprint 2      | userId(ref: User), contentId(ref: Content), rating(1-10), review(max:1000), isModerated, moderatedBy(ref: User), isActive                                                                                                                                                                                                                                            | {userId,contentId}(unique), {contentId,isActive}, userId                                                                                                                                                                             |
| 5  | `Advertisement`          | `advertisements`          | Sprint 1      | companyId(ref: Company), title, description, imageUrl, targetUrl, placement(banner/sidebar/popup/featured), status(pending/active/paused/rejected/expired), startDate, endDate, budget, rejectionReason                                                                                                                                                              | companyId, status, placement                                                                                                                                                                                                         |
| 6  | `Campaign`               | `campaigns`               | Sprint 1      | companyId(ref: Company), name, description, advertisements[](ref: Advertisement), status(draft/active/paused/completed/rejected), startDate, endDate, budget, targetAudience, rejectionReason                                                                                                                                                                        | companyId, status                                                                                                                                                                                                                    |
| 7  | `Platform`               | `platforms`               | Streaming     | name(unique), logo, website, description, supportedRegions[], contentTypes[](MOVIE/TV_SERIES/ANIME/DOCUMENTARY/SPORTS/ALL), isActive                                                                                                                                                                                                                                 | name(unique), isActive                                                                                                                                                                                                               |
| 8  | `Sport`                  | `sports`                  | Sports        | title, sportType(Football/Cricket/Basketball/...), tournamentName, homeTeam, awayTeam, homeScore, awayScore, status(Upcoming/Live/Completed), startDate, endDate, venue, streamingLinks[], poster, description(max:1000), isActive                                                                                                                                   | sportType, status, {sportType,status}, {isActive,status}, {status,startDate}                                                                                                                                                         |
| 9  | `Notification`           | `notifications`           | Notifications | recipientId, recipientType(User/Company), type(verification/system/promotion/match_reminder/goal_alert/match_event/badge_earned/level_up/comment_reply/discussion_reply), title, message, isRead, link, relatedMatchId(ref: Match), relatedModel                                                                                                                     | {recipientId,recipientType}, isRead, createdAt, relatedMatchId                                                                                                                                                                       |
| 10 | `Verification`           | `verifications`           | Auth          | userId(refPath: userType), userType(User/Company), otp, token, purpose(EMAIL_VERIFICATION/PASSWORD_RESET), expiresAt(TTL index), isUsed                                                                                                                                                                                                                              | {userId,userType}, token, otp, expiresAt(TTL)                                                                                                                                                                                        |
| 11 | `AdminLog`               | `adminlogs`               | Admin         | adminId(ref: User), action, targetType(User/Company/Advertisement/Campaign/Content/System), targetId, details, ipAddress                                                                                                                                                                                                                                             | adminId, action, createdAt                                                                                                                                                                                                           |
| 12 | `Match`                  | `matches`                 | Sprint 3      | homeTeam, awayTeam, competition, sportType, homeScore, awayScore, status(scheduled/live/halftime/finished/postponed), minute, kickoffTime, venue, referee, stats{sub-stats}, externalId, isActive                                                                                                                                                                    | status, kickoffTime, {status,kickoffTime}, sportType, competition, isActive, {homeTeam,awayTeam,kickoffTime}                                                                                                                         |
| 13 | `MatchEvent`             | `matchevents`             | Sprint 3      | matchId(ref: Match), minute, addedTime, type(goal/yellow_card/red_card/substitution/penalty/own_goal/corner/foul/offside/shot/shot_on_target/save/injury_time), team(home/away), playerName, assistedBy, description(max:200)                                                                                                                                        | {matchId,minute}, {matchId,type}                                                                                                                                                                                                     |
| 14 | `Standing`               | `standings`               | Sprint 3      | competition, teamName, played, wins, draws, losses, goalsFor, goalsAgainst, goalDifference, points, position, form[W/D/L], season                                                                                                                                                                                                                                    | {competition,teamName}(unique), {competition,points}, {competition,position}                                                                                                                                                         |
| 15 | `Lineup`                 | `lineups`                 | Sprint 3      | matchId(ref: Match), team(home/away), formation, players[{name,number,position,isCaptain,isGoalkeeper}], substitutes[{name,number,position}], coach                                                                                                                                                                                                                  | {matchId,team}(unique)                                                                                                                                                                                                               |
| 16 | `Broadcaster`            | `broadcasters`            | Sprint 3      | name(unique), logoUrl, website, regions[], isOfficial, isActive                                                                                                                                                                                                                                                                                                      | name(unique), isActive                                                                                                                                                                                                               |
| 17 | `StreamAvailability`     | `streamavailabilities`    | Sprint 3      | matchId(ref: Match), broadcasterId(ref: Broadcaster), region, url, isOfficial, isFree, quality(SD/HD/4K/Auto), language                                                                                                                                                                                                                                              | {matchId,broadcasterId,region}(unique), {matchId,region}, region                                                                                                                                                                     |
| 18 | `Favorite`               | `favorites`               | Sprint 3      | userId(ref: User), type(team/tournament/match/content), refId, refName, sportType                                                                                                                                                                                                                                                                                    | {userId,type,refId}(unique), {userId,type}, {refId,type}                                                                                                                                                                             |
| 19 | `NotificationPreference` | `notificationpreferences` | Sprint 3      | userId(ref: User, unique), matchReminders, reminderMinutesBefore(5-1440), goalAlerts, tournamentAnnouncements, reviewReplies, discussionReplies, forumDigest, emailNotifications                                                                                                                                                                                     | userId(unique)                                                                                                                                                                                                                       |
| 20 | `ItemReview`             | `itemreviews`             | Sprint 4      | userId(ref: User), itemId, itemType(content/match/sport/platform/broadcaster), rating(1-5), body(max:2000), helpfulVotes, helpfulVoters[](ref: User), verified, isActive                                                                                                                                                                                             | {userId,itemId,itemType}(unique), {itemId,itemType,isActive}, {itemId,itemType,rating}, helpfulVotes                                                                                                                                 |
| 21 | `Discussion`             | `discussions`             | Sprint 4      | title(3-200), body(max:10000), authorId(ref: User), pinned, locked, tags[], viewCount, commentCount, lastActivityAt, isActive                                                                                                                                                                                                                                        | {pinned,lastActivityAt}, {authorId,createdAt}, tags, {isActive,pinned,lastActivityAt}, text index on {title,body,tags}                                                                                                               |
| 22 | `Comment`                | `comments`                | Sprint 4      | discussionId(ref: Discussion), authorId(ref: User), body(max:5000), parentCommentId(ref: Comment, self-ref), depth(0-3), likes[](ref: User), likeCount, isHidden, isActive                                                                                                                                                                                           | {discussionId,createdAt}, {discussionId,parentCommentId}, {authorId,createdAt}, likeCount                                                                                                                                            |
| 23 | `Report`                 | `reports`                 | Sprint 4      | targetType(discussion/comment/review/user), targetId, reporterId(ref: User), reason(spam/harassment/inappropriate/misinformation/copyright/other), description(max:1000), status(pending/resolved/dismissed), resolvedBy(ref: User), resolvedAt, resolutionNote(max:500)                                                                                             | {targetType,targetId,reporterId}(unique), {status,createdAt}, {targetType,targetId}                                                                                                                                                  |
| 24 | `UserStats`              | `userstats`               | Sprint 4      | userId(ref: User, unique), points, level, totalReviews, totalDiscussions, totalComments, totalFavorites, loginStreak, lastLoginDate, longestStreak, currentWeekPoints, currentMonthPoints                                                                                                                                                                            | userId(unique), points                                                                                                                                                                                                               |
| 25 | `Badge`                  | `badges`                  | Sprint 4      | key(unique), name, description, iconUrl, category(reviewer/contributor/social/streak/milestone/achievement), criteria, pointsAwarded, isActive                                                                                                                                                                                                                       | key(unique), category                                                                                                                                                                                                                |
| 26 | `UserBadge`              | `userbadges`              | Sprint 4      | userId(ref: User), badgeId(ref: Badge), earnedAt, notified                                                                                                                                                                                                                                                                                                           | {userId,badgeId}(unique), {userId,earnedAt}                                                                                                                                                                                          |
| 27 | `PointsLedger`           | `pointsledgers`           | Sprint 4      | userId(ref: User), action(review_created/review_liked/discussion_created/comment_created/comment_liked/favorite_added/login_streak/badge_earned/level_up/daily_login/profile_completed/watchlist_added), points, refId, refModel, description, weekStart, monthStart                                                                                                 | {userId,createdAt}, action, {weekStart,points}, {monthStart,points}                                                                                                                                                                  |

---

## 📐 Complete Schema Details

### 1. User

```
{
  fullName:        String (required, 2-50 chars),
  username:        String (required, unique, lowercase, 3-30 chars),
  email:           String (required, unique, lowercase),
  password:        String (required, min 8, select: false, hashed via bcrypt pre-save),
  role:            String (enum: user|company|admin, default: 'user'),
  avatar:          String (default: ''),
  isEmailVerified: Boolean (default: false),
  isActive:        Boolean (default: true),
  lastLogin:       Date,
  watchlist:       [ObjectId → Content]
}
// Methods: comparePassword(password), toPublicProfile()
// Pre-save: hashes password if modified
```

### 2. Company

```
{
  companyName:         String (required, 2-100 chars),
  username:            String (required, unique, lowercase, 3-30 chars),
  email:               String (required, unique, lowercase),
  password:            String (required, min 8, select: false, hashed via bcrypt),
  description:         String (max: 1000),
  industry:            String,
  website:             String,
  logo:                String,
  foundedYear:         Number (min: 1800, max: current year),
  location:            String,
  socialMediaLinks:    { facebook, twitter, linkedin, instagram },
  verificationStatus:  String (enum: pending|verified|rejected, default: 'pending'),
  rejectionReason:     String (max: 500),
  approvedAt:          Date,
  rejectedAt:          Date,
  isActive:            Boolean (default: true),
  lastLogin:           Date
}
// Methods: comparePassword(password), toPublicProfile()
```

### 3. Content

```
{
  title:            String (required, indexed),
  originalTitle:    String,
  type:             String (required, enum: MOVIE|TV_SERIES|WEB_SERIES|ANIME|DOCUMENTARY),
  description:      String (max: 2000),
  poster:           String (URL),
  backdrop:         String (URL),
  genres:           [String],
  tags:             [String],
  spokenLanguage:   String (default: 'English'),
  languages:        [String],
  releaseYear:      Number (indexed),
  releaseMonth:     Number (0-11),
  rating:           Number (0-10, default: 0),
  status:           String (enum: Released|Upcoming|Ongoing|Completed, default: 'Released'),
  platforms:        [String],
  episodeCount:     Number (for TV series),
  currentEpisode:   Number (for ongoing series),
  popularity:       Number,
  trending:         Number,
  isFeatured:       Boolean (admin-managed),
  companyId:        ObjectId → Company,
  tmdbId:           Number (TMDB integration),
  isActive:         Boolean (default: true)
}
// Text index: { title: 10, originalTitle: 8, tags: 6, genres: 4, description: 2 }
// 10+ compound indexes for efficient filtering/sorting
```

### 4. Review (Sprint 2 — 1-10 Scale)

```
{
  userId:      ObjectId → User (required),
  contentId:   ObjectId → Content (required),
  rating:      Number (required, min: 1, max: 10),
  review:      String (max: 1000),
  isModerated: Boolean (default: false),
  moderatedBy: ObjectId → User,
  isActive:    Boolean (default: true)
}
// Static: calculateAverageRating(contentId) → { averageRating, count }
```

### 5. Advertisement

```
{
  companyId:        ObjectId → Company (required),
  title:            String (required, 3-100 chars),
  description:      String (max: 1000),
  imageUrl:         String,
  targetUrl:        String,
  placement:        String (enum: banner|sidebar|popup|featured, default: 'banner'),
  status:           String (enum: pending|active|paused|rejected|expired, default: 'pending'),
  startDate:        Date,
  endDate:          Date,
  budget:           Number (min: 0),
  rejectionReason:  String (max: 500)
}
```

### 6. Campaign

```
{
  companyId:        ObjectId → Company (required),
  name:             String (required, 3-100 chars),
  description:      String (max: 2000),
  advertisements:   [ObjectId → Advertisement],
  status:           String (enum: draft|active|paused|completed|rejected, default: 'draft'),
  startDate:        Date,
  endDate:          Date,
  budget:           Number (min: 0),
  targetAudience:   String (max: 500),
  rejectionReason:  String (max: 500)
}
```

### 7. Platform

```
{
  name:              String (required, unique),
  logo:              String,
  website:           String,
  description:       String (max: 500),
  supportedRegions:  [String],
  contentTypes:      [String (enum: MOVIE|TV_SERIES|ANIME|DOCUMENTARY|SPORTS|ALL)],
  isActive:          Boolean (default: true)
}
```

### 8. Sport

```
{
  title:            String (required),
  sportType:        String (required, enum: Football|Cricket|Basketball|Tennis|Baseball|...),
  tournamentName:   String,
  homeTeam:         String (required),
  awayTeam:         String (required),
  homeScore:        Number (default: 0),
  awayScore:        Number (default: 0),
  status:           String (enum: Upcoming|Live|Completed, default: 'Upcoming'),
  startDate:        Date (required),
  endDate:          Date,
  venue:            String,
  streamingLinks:   [{ name, url }],
  poster:           String,
  description:      String (max: 1000),
  isActive:         Boolean (default: true)
}
```

### 9. Notification

```
{
  recipientId:      ObjectId (refPath: recipientType),
  recipientType:    String (enum: User|Company),
  type:             String (enum: verification|system|promotion|match_reminder|goal_alert|
                             match_event|badge_earned|level_up|comment_reply|discussion_reply),
  title:            String (required),
  message:          String (required),
  isRead:           Boolean (default: false),
  link:             String,
  relatedMatchId:   ObjectId → Match,
  relatedModel:     String
}
```

### 10. Verification

```
{
  userId:     ObjectId (refPath: userType),
  userType:   String (enum: User|Company),
  token:      String,
  otp:        String (6-digit),
  purpose:    String (enum: EMAIL_VERIFICATION|PASSWORD_RESET),
  expiresAt:  Date (required, TTL index auto-deletes expired docs),
  isUsed:     Boolean (default: false)
}
```

### 11. AdminLog

```
{
  adminId:     ObjectId → User (required),
  action:      String (required),
  targetType:  String (enum: User|Company|Advertisement|Campaign|Content|System),
  targetId:    ObjectId,
  details:     String,
  ipAddress:   String
}
```

### 12. Match

```
{
  homeTeam:     String (required),
  awayTeam:     String (required),
  competition:  String (required),
  sportType:    String (required, enum: Football|Cricket|Basketball|...),
  homeScore:    Number (default: 0),
  awayScore:    Number (default: 0),
  status:       String (enum: scheduled|live|halftime|finished|postponed, default: 'scheduled'),
  minute:       Number (default: 0),
  kickoffTime:  Date (required),
  venue:        String,
  referee:      String,
  stats: {
    homePossession:      Number (default: 50),
    awayPossession:      Number (default: 50),
    homeShots:           Number, awayShots:           Number,
    homeShotsOnTarget:   Number, awayShotsOnTarget:   Number,
    homeFouls:           Number, awayFouls:           Number,
    homeCorners:         Number, awayCorners:         Number,
    homeYellowCards:     Number, awayYellowCards:     Number,
    homeRedCards:        Number, awayRedCards:        Number
  },
  externalId:  String (external API reference),
  isActive:    Boolean (default: true)
}
```

### 13. MatchEvent

```
{
  matchId:      ObjectId → Match (required),
  minute:       Number (required, min: 0),
  addedTime:    Number (injury time),
  type:         String (required, enum: goal|yellow_card|red_card|substitution|penalty|
                       own_goal|corner|foul|offside|shot|shot_on_target|save|injury_time),
  team:         String (required, enum: home|away),
  playerName:   String,
  assistedBy:   String,
  description:  String (max: 200)
}
```

### 14. Standing

```
{
  competition:    String (required),
  teamName:       String (required),
  played:         Number (min: 0),
  wins:           Number (min: 0),
  draws:          Number (min: 0),
  losses:         Number (min: 0),
  goalsFor:       Number (min: 0),
  goalsAgainst:   Number (min: 0),
  goalDifference: Number (auto-calculatable),
  points:         Number (min: 0),
  position:       Number (rank),
  form:           [String (enum: W|D|L)],
  season:         String (default: current year)
}
// Compound unique: { competition, teamName }
```

### 15. Lineup

```
{
  matchId:     ObjectId → Match (required),
  team:        String (required, enum: home|away),
  formation:   String (e.g., "4-3-3"),
  players:     [{
    name:         String (required),
    number:       Number (required),
    position:     String,
    isCaptain:    Boolean,
    isGoalkeeper: Boolean
  }],
  substitutes: [{
    name:     String (required),
    number:   Number (required),
    position: String
  }],
  coach:       String
}
// Compound unique: { matchId, team }
```

### 16. Broadcaster

```
{
  name:       String (required, unique),
  logoUrl:    String,
  website:    String,
  regions:    [String],
  isOfficial: Boolean (default: true),
  isActive:   Boolean (default: true)
}
```

### 17. StreamAvailability

```
{
  matchId:        ObjectId → Match (required),
  broadcasterId:  ObjectId → Broadcaster (required),
  region:         String (required),
  url:            String (required),
  isOfficial:     Boolean (default: true),
  isFree:         Boolean (default: false),
  quality:        String (enum: SD|HD|4K|Auto, default: 'HD'),
  language:       String (default: 'English')
}
// Compound unique: { matchId, broadcasterId, region }
```

### 18. Favorite

```
{
  userId:    ObjectId → User (required),
  type:      String (required, enum: team|tournament|match|content),
  refId:     ObjectId (required, polymorphic reference),
  refName:   String,
  sportType: String (for team favorites)
}
// Compound unique: { userId, type, refId }
```

### 19. NotificationPreference

```
{
  userId:                 ObjectId → User (required, unique),
  matchReminders:         Boolean (default: true),
  reminderMinutesBefore:  Number (default: 30, min: 5, max: 1440),
  goalAlerts:             Boolean (default: true),
  tournamentAnnouncements: Boolean (default: true),
  reviewReplies:          Boolean (default: true),
  discussionReplies:      Boolean (default: true),
  forumDigest:            Boolean (default: false),
  emailNotifications:     Boolean (default: false)
}
```

### 20. ItemReview (Sprint 4 — 1-5 Star System)

```
{
  userId:         ObjectId → User (required),
  itemId:         ObjectId (required, polymorphic reference),
  itemType:       String (required, enum: content|match|sport|platform|broadcaster),
  rating:         Number (required, min: 1, max: 5),
  body:           String (max: 2000),
  helpfulVotes:   Number (default: 0),
  helpfulVoters:  [ObjectId → User],
  verified:       Boolean (default: false),
  isActive:       Boolean (default: true)
}
// Static: getRatingSummary(itemId, itemType) → { averageRating, totalReviews, distribution }
// Compound unique: { userId, itemId, itemType }
```

### 21. Discussion

```
{
  title:          String (required, 3-200 chars),
  body:           String (required, max: 10000),
  authorId:       ObjectId → User (required),
  pinned:         Boolean (default: false, pinned discussions appear first),
  locked:         Boolean (default: false, locked discussions reject new comments),
  tags:           [String],
  viewCount:      Number (auto-incremented on GET),
  commentCount:   Number (auto-incremented on comment create),
  lastActivityAt: Date (default: now, updated on new comments),
  isActive:       Boolean (default: true, soft delete flag)
}
// Text index: { title: 10, tags: 8, body: 5 }
```

### 22. Comment

```
{
  discussionId:     ObjectId → Discussion (required),
  authorId:         ObjectId → User (required),
  body:             String (required, max: 5000),
  parentCommentId:  ObjectId → Comment (self-ref, nullable),
  depth:            Number (0-3, max nesting),
  likes:            [ObjectId → User],
  likeCount:        Number (default: 0),
  isHidden:         Boolean (moderation flag),
  isActive:         Boolean (default: true, soft delete flag)
}
```

### 23. Report

```
{
  targetType:     String (required, enum: discussion|comment|review|user),
  targetId:       ObjectId (required, polymorphic reference),
  reporterId:     ObjectId → User (required),
  reason:         String (required, enum: spam|harassment|inappropriate|misinformation|copyright|other),
  description:    String (max: 1000),
  status:         String (enum: pending|resolved|dismissed, default: 'pending'),
  resolvedBy:     ObjectId → User,
  resolvedAt:     Date,
  resolutionNote: String (max: 500)
}
// Compound unique: { targetType, targetId, reporterId }
```

### 24. UserStats

```
{
  userId:             ObjectId → User (required, unique),
  points:             Number (default: 0),
  level:              Number (default: 1, tracked from levels.config),
  totalReviews:       Number (default: 0),
  totalDiscussions:   Number (default: 0),
  totalComments:      Number (default: 0),
  totalFavorites:     Number (default: 0),
  loginStreak:        Number (default: 0),
  lastLoginDate:      Date,
  longestStreak:      Number (default: 0),
  currentWeekPoints:  Number (for weekly leaderboard),
  currentMonthPoints: Number (for monthly leaderboard)
}
```

### 25. Badge

```
{
  key:            String (required, unique, e.g., 'first_review'),
  name:           String (required, e.g., 'First Review'),
  description:    String (required, e.g., 'Write your first review'),
  iconUrl:        String,
  category:       String (enum: reviewer|contributor|social|streak|milestone|achievement),
  criteria:       String (required, human-readable),
  pointsAwarded:  Number (bonus points when unlocked),
  isActive:       Boolean (default: true)
}
```

### 26. UserBadge

```
{
  userId:    ObjectId → User (required),
  badgeId:   ObjectId → Badge (required),
  earnedAt:  Date (default: now),
  notified:  Boolean (whether user was notified)
}
// Compound unique: { userId, badgeId }
```

### 27. PointsLedger

```
{
  userId:      ObjectId → User (required),
  action:      String (required, enum: all gamification actions),
  points:      Number (required, positive for earn, negative for spend),
  refId:       ObjectId (reference to the source entity),
  refModel:    String (model name of reference),
  description: String,
  weekStart:   Date (Monday of week for weekly leaderboard aggregation),
  monthStart:  Date (1st of month for monthly leaderboard aggregation)
}
```

---

## 🔐 Gamification: Points & Levels

### Point Values

| Action                 | Points | Frequency Limit           | Notes                                 |
| ---------------------- | ------ | ------------------------- | ------------------------------------- |
| `review_created`     | 50     | Per review                | Writing a 1-5 star ItemReview         |
| `review_liked`       | 5      | Per helpful vote received | Someone marked your review helpful    |
| `discussion_created` | 30     | Per discussion            | Starting a new discussion thread      |
| `comment_created`    | 15     | Per comment               | Commenting on a discussion            |
| `comment_liked`      | 3      | Per like received         | Someone liked your comment            |
| `favorite_added`     | 10     | Per favorite              | Adding a team/tournament to favorites |
| `daily_login`        | 5      | Once per day              | Logging in each calendar day          |
| `login_streak`       | 10     | Once per streak day       | Bonus for consecutive login days      |
| `badge_earned`       | 25     | Per badge                 | Unlocking a new achievement badge     |
| `profile_completed`  | 20     | Once                      | Completing profile setup              |
| `watchlist_added`    | 5      | Per item                  | Adding content to personal watchlist  |

### Level Thresholds

| Level | Title       | XP Required (Total) | XP Needed to Level Up |
| ----- | ----------- | ------------------: | --------------------: |
| 1     | Newcomer    |                   0 |                   100 |
| 2     | Explorer    |                 100 |                   150 |
| 3     | Contributor |                 250 |                   250 |
| 4     | Enthusiast  |                 500 |                   500 |
| 5     | Expert      |               1,000 |                 1,000 |
| 6     | Specialist  |               2,000 |                 1,500 |
| 7     | Veteran     |               3,500 |                 1,500 |
| 8     | Master      |               5,000 |                 2,500 |
| 9     | Grandmaster |               7,500 |                 2,500 |
| 10    | Legend      |              10,000 |              — (max) |

> **Level calculation:** `calculateLevel(totalPoints)` iterates `LEVEL_THRESHOLDS` from highest to lowest and returns the level whose `minPoints` the user has reached.

### Badge Criteria

| Badge              | Key                    | Category    | Criteria             | Bonus Points |
| ------------------ | ---------------------- | ----------- | -------------------- | :----------: |
| First Review       | `first_review`       | reviewer    | Write 1 review       |      25      |
| The Critic         | `critic`             | reviewer    | Write 5 reviews      |      50      |
| Review Master      | `review_master`      | reviewer    | Write 10 reviews     |     100     |
| First Discussion   | `first_discussion`   | contributor | Create 1 discussion  |      25      |
| First Comment      | `first_comment`      | contributor | Post 1 comment       |      10      |
| Discussion Starter | `discussion_starter` | contributor | Create 5 discussions |      50      |
| Popular Commenter  | `popular_commenter`  | contributor | Post 25 comments     |      75      |
| Super Fan          | `super_fan`          | social      | Add 10 favorites     |      50      |
| Hat Trick          | `streak_3`           | streak      | 3-day login streak   |      30      |
| Week Warrior       | `streak_7`           | streak      | 7-day login streak   |      75      |
| Monthly Devotion   | `streak_30`          | streak      | 30-day login streak  |     200     |
| Centurion          | `centurion`          | milestone   | Earn 100 points      |      25      |
| Seasoned Pro       | `level_5`            | milestone   | Reach Level 5        |     100     |
| Hall of Fame       | `level_10`           | milestone   | Reach Level 10       |     250     |

---

## 🌐 Socket.io Real-Time Events

NexPlay uses **Socket.io** for real-time bidirectional communication. The server is initialized with JWT authentication for socket connections (invalid tokens are allowed but anonymous).

### Server Events (Emitted to Clients)

| Event            | Direction      | Room/Channel        | Payload                                                                            |
| ---------------- | -------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `match:score`  | Server → Room | `match:{matchId}` | `{ matchId, homeScore, awayScore, minute, timestamp }`                           |
| `match:event`  | Server → Room | `match:{matchId}` | `{ matchId, event: {...}, timestamp }`                                           |
| `match:status` | Server → Room | `match:{matchId}` | `{ matchId, status, timestamp }`                                                 |
| `notification` | Server → User | `user:{userId}`   | Full notification document`{ _id, type, title, message, link, ... }`             |
| `gamification` | Server → User | `user:{userId}`   | `{ userId, action, points, totalPoints, level, leveledUp, newLevelTitle, type }` |

### Client Events (Sent to Server)

| Event           | Direction        | Payload         | Description                              |
| --------------- | ---------------- | --------------- | ---------------------------------------- |
| `join-match`  | Client → Server | `{ matchId }` | Join a match room for live score updates |
| `leave-match` | Client → Server | `{ matchId }` | Leave a match room                       |

### Connection Details

- **Namespace:** Default (`/`)
- **Auth Transport:** `socket.handshake.auth.token` or `socket.handshake.query.token`
- **Auth Validation:** JWT access token verification (optional — anonymous connections allowed)
- **Transports:** WebSocket preferred, with long-polling fallback
- **CORS Origin:** Configured via `CLIENT_URL` env variable (default: `http://localhost:5173`)

### Gamification Event Types

When `gamification` events are emitted, the `type` field distinguishes the sub-event:

| type             | Additional Fields                                  | Description                  |
| ---------------- | -------------------------------------------------- | ---------------------------- |
| `level_up`     | `{ oldLevel, newLevel }`                         | User advanced to a new level |
| `badge_earned` | `{ badge: { key, name, description, iconUrl } }` | User unlocked a new badge    |
| *(none)*       | —                                                 | Standard points award event  |

### Notification Types

| type               | Source                                     | Description                                               |
| ------------------ | ------------------------------------------ | --------------------------------------------------------- |
| `goal_alert`     | Match event (goal)                         | Real-time goal notification for favorited teams           |
| `match_event`    | Match event (red_card, halftime, fulltime) | Other significant match events                            |
| `match_reminder` | Cron job                                   | Upcoming match reminder (based on NotificationPreference) |
| `badge_earned`   | Gamification service                       | Badge unlocked notification                               |
| `level_up`       | Gamification service                       | Level advancement notification                            |
| `system`         | Admin broadcast                            | System-wide announcements                                 |
| `promotion`      | Company announcement                       | Promotional content from companies                        |
| `verification`   | Admin action                               | Company verification status changes                       |
