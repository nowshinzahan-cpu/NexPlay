# NexPlay API Reference

> **Base URL:** `http://localhost:5000/api` (development)
> **Content-Type:** `application/json`
> **Authentication:** `Bearer <access_token>` (unless marked public)

---

## ⏱ Rate Limiting

Rate limits are applied per IP address. In development mode, limits are generous for testing:

| Limiter | Scope | Window | Max Requests |
|---------|-------|--------|-------------|
| `apiLimiter` | All `/api` routes | 15 minutes | 1000 |
| `loginLimiter` | POST /api/auth/login | 15 minutes | 100 |
| `registerLimiter` | POST /api/auth/register | 1 hour | 50 |
| `authLimiter` | Password reset flows | 15 minutes | 100 |
| `otpLimiter` | OTP verification/resend | 15 minutes | 30 |

> **Note:** Rate limiting is **bypassed** when `NODE_ENV=test`. Configured in `server/middleware/rateLimiter.js`.

When exceeded, returns HTTP **429** with response:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

---

## 📋 Response Format

All API responses follow a consistent envelope:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role/ownership) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## 🔐 Authentication

### POST /api/auth/register

Register a new user or company.

**Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass1!",
  "confirmPassword": "SecurePass1!",
  "role": "user"
}
```

**Role options:** `user` | `company` (admin registration is blocked)

**Response 201:** `{ userId: "..." }`

---

### POST /api/auth/login

Login with email or username.

**Body:**
```json
{
  "emailOrUsername": "john@example.com",
  "password": "SecurePass1!",
  "rememberMe": false
}
```

**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "...",
    "email": "...",
    "role": "user",
    "name": "John Doe"
  }
}
```

---

### POST /api/auth/refresh

Refresh an expired access token.

**Body:** `{ "refreshToken": "eyJ..." }`

**Response 200:** `{ "accessToken": "...", "refreshToken": "..." }`

---

### GET /api/auth/me

Get the currently authenticated user's profile. Requires auth.

---

### POST /api/auth/logout

Acknowledge logout (client-side token removal).

---

### POST /api/auth/forgot-password

Send OTP to email for password reset.

**Body:** `{ "email": "john@example.com" }`

---

### POST /api/auth/verify-otp

Verify OTP and receive a temporary reset token.

**Body:** `{ "email": "...", "otp": "123456" }`

**Response 200:** `{ "resetToken": "..." }`

---

### POST /api/auth/resend-otp

Resend a new OTP to the user's email.

**Body:** `{ "email": "..." }`

---

### POST /api/auth/reset-password

Reset password using the temporary token.

**Body:**
```json
{
  "resetToken": "...",
  "newPassword": "NewPass1!",
  "confirmPassword": "NewPass1!"
}
```

---

## 👤 User Profile

### GET /api/user/profile

Get current user's profile. Requires auth.

---

### PUT /api/user/profile

Update profile (allowed: `fullName`, `avatar`). Requires auth.

---

### PUT /api/user/change-password

Change password. Requires auth.

**Body:**
```json
{
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass1!",
  "confirmPassword": "NewPass1!"
}
```

---

## 🏢 Company

### GET /api/company/profile

Get own company profile. Requires company auth.

---

### PUT /api/company/profile

Update company profile. Requires company auth.

**Allowed fields:** companyName, description, industry, website, foundedYear, location, socialMediaLinks

---

### POST /api/company/logo

Upload company logo (multipart/form-data). Requires company auth.

---

### GET /api/company/profile/:id

Get a company's public profile by ID. Public.

---

## 📢 Advertisements

### GET /api/company/advertisements

List own advertisements (paginated). Requires company auth.

**Query:** `?page=1&limit=20&status=pending`

---

### GET /api/company/advertisements/:id

Get single advertisement. Requires company auth.

---

### POST /api/company/advertisements

Create an advertisement (verified companies only).

---

### PUT /api/company/advertisements/:id

Update an advertisement (pending status only).

---

### DELETE /api/company/advertisements/:id

Delete an advertisement (non-active only).

---

### GET /api/advertisements/active

Get active advertisements by placement. Public.

**Query:** `?placement=banner&limit=5`

---

### GET /api/admin/advertisements

Admin: list all advertisements (paginated). Requires admin.

---

### PATCH /api/admin/advertisements/:id/status

Admin: update advertisement status. Requires admin.

**Body:** `{ "status": "active|rejected|paused", "rejectionReason": "..." }`

---

## 📋 Campaigns

### GET /api/company/campaigns

List own campaigns (paginated). Requires company auth.

---

### GET /api/company/campaigns/:id

Get single campaign. Requires company auth.

---

### POST /api/company/campaigns

Create a campaign (verified companies only).

---

### PUT /api/company/campaigns/:id

Update a campaign (pending status only).

---

### DELETE /api/company/campaigns/:id

Delete a campaign (non-active only).

---

### GET /api/admin/campaigns

Admin: list all campaigns. Requires admin.

---

### PATCH /api/admin/campaigns/:id/status

Admin: update campaign status. Requires admin.

---

## 🎬 Content

### GET /api/content/trending

Get trending content. Public.

---

### GET /api/content/popular

Get popular content. Public.

---

### GET /api/content/recommended

Get recommended content. Public.

---

### GET /api/content/latest-updates

Get latest updated content. Public.

---

### GET /api/content/upcoming

Get upcoming releases. Public.

---

### GET /api/content/where-to-watch

Get content with streaming platform links. Public.

---

### GET /api/content/search

Search content. Public.

**Query:** `?q=movie&type=MOVIE&genre=Action&language=English&year=2025&platform=Netflix&status=Released&sort=popularity&page=1&limit=20`

---

### GET /api/content/suggestions

Search suggestions (autocomplete). Public.

**Query:** `?q=batman`

---

### GET /api/content/:id

Get single content by ID. Public.

---

## ⭐ Reviews (Sprint 2 — 1-10 Scale)

### GET /api/content/:id/reviews

Get reviews for content (paginated). Public.

**Query:** `?page=1&limit=20`

---

### POST /api/content/:id/reviews

Create a review (1-10 scale). Requires auth (user role).

**Body:** `{ "rating": 8, "review": "Great movie!" }`

---

### PUT /api/content/:id/reviews

Update own review. Requires auth (user role).

---

### DELETE /api/content/:id/reviews

Delete own review. Requires auth (user role).

---

### GET /api/user/reviews

Get own reviews (paginated). Requires auth.

---

### GET /api/admin/reviews

Admin: get all reviews (paginated). Requires admin.

---

### PATCH /api/admin/reviews/:id/moderate

Admin: moderate a review. Requires admin.

**Body:** `{ "action": "remove|restore" }`

---

## ⚽ Sports

### GET /api/sports

List sports events with filtering. Public.

**Query:** `?sportType=Football&status=Live&search=Manchester&tournament=Premier&page=1&limit=20`

---

### GET /api/sports/live

Get live sports events. Public.

---

### GET /api/sports/upcoming

Get upcoming sports events. Public.

---

### GET /api/sports/completed

Get completed sports events (paginated). Public.

---

### GET /api/sports/types

Get distinct sport types. Public.

---

### GET /api/sports/:id

Get single sports event by ID. Public.

---

### POST /api/sports

Create a sports event. Requires admin.

---

### PUT /api/sports/:id

Update a sports event. Requires admin.

---

### DELETE /api/sports/:id

Delete a sports event. Requires admin.

---

## 📺 Platforms

### GET /api/platforms

Get active streaming platforms (public listing). Public.

---

### GET /api/platforms/all

Admin: get all platforms (paginated, includes inactive). Requires admin.

---

### POST /api/platforms

Admin: create platform. Requires admin.

---

### PUT /api/platforms/:id

Admin: update platform. Requires admin.

---

### DELETE /api/platforms/:id

Admin: delete platform. Requires admin.

---

> **Note:** Admin platform endpoints are also available under `/api/admin/platforms`.

---

## 📦 Upcoming Content

### GET /api/company/upcoming

Get own upcoming content (paginated). Requires company auth.

---

### GET /api/company/upcoming/all

Get all own content (paginated). Requires company auth.

---

### POST /api/company/upcoming

Create upcoming content (verified companies only).

---

### PUT /api/company/upcoming/:id

Update upcoming content. Requires company auth.

---

### DELETE /api/company/upcoming/:id

Delete upcoming content. Requires company auth.

---

## 🔔 Notifications

### GET /api/notifications

Get notifications (paginated). Requires auth.

**Query:** `?read=false&category=system&page=1&limit=20`

---

### PATCH /api/notifications/:id/read

Mark notification as read. Requires auth.

---

### PATCH /api/notifications/read-all

Mark all notifications as read. Requires auth.

---

### DELETE /api/notifications/:id

Delete a notification. Requires auth.

---

### GET /api/notifications/unread-count

Get unread notification count. Requires auth.

**Response 200:**
```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

---

### POST /api/notifications/announcement

Create an announcement. Requires auth (verified companies or admin).

**Body:** `{ "title": "...", "message": "...", "type": "promotion" }`

---

## 👑 Admin

### GET /api/admin/dashboard/stats

Get admin dashboard statistics. Requires admin.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCompanies": 25,
    "pendingVerifications": 3,
    "totalContent": 500,
    "activeAdvertisements": 12,
    "totalMatches": 30,
    "pendingReports": 5
  }
}
```

---

### GET /api/admin/users

List users (paginated). Requires admin.

**Query:** `?page=1&limit=20&status=active&search=john`

---

### DELETE /api/admin/users/:id

Delete a user. Requires admin.

---

### PATCH /api/admin/users/:id/status

Toggle user active status. Requires admin.

**Body:** `{ "isActive": false }`

---

### GET /api/admin/companies

List companies (paginated). Requires admin.

---

### GET /api/admin/companies/pending

List pending verification companies. Requires admin.

---

### GET /api/admin/companies/:id

Get single company details. Requires admin.

---

### PATCH /api/admin/companies/:id/verify

Verify or reject a company. Requires admin.

**Body:** `{ "status": "verified|rejected", "rejectionReason": "..." }`

---

### DELETE /api/admin/companies/:id

Delete a company (with cascade cleanup). Requires admin.

---

### PATCH /api/admin/companies/:id/status

Toggle company active status. Requires admin.

---

### GET /api/admin/activity-log

Get admin activity log (paginated). Requires admin.

---

### POST /api/admin/notifications/broadcast

Broadcast system-wide notification. Requires admin.

**Body:** `{ "title": "...", "message": "...", "type": "system" }`

---

### PATCH /api/admin/contents/:id/featured

Toggle content featured status. Requires admin.

**Body:** `{ "isFeatured": true }`

---

### GET /api/admin/contents/featured

Get featured content (paginated). Requires admin.

---

## 👤 Watchlist

### GET /api/user/watchlist

Get user's watchlist (paginated). Requires auth.

---

### GET /api/user/watchlist/check/:contentId

Check if content is in watchlist. Requires auth.

**Response 200:** `{ "isInWatchlist": true }`

---

### POST /api/user/watchlist/:contentId

Add content to watchlist. Requires auth.

---

### DELETE /api/user/watchlist/:contentId

Remove content from watchlist. Requires auth.

---

## 🔬 Recommendations

### GET /api/user/recommendations

Get personalized recommendations. Requires auth.

---

---

# 🔥 SPRINT 3 & 4 ADDITIONS

---

## ⚽ Live Scores & Match Center (Sprint 3)

### GET /api/matches/live

Get matches currently in progress (status: live or halftime). Public.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "homeTeam": "FC Barcelona",
      "awayTeam": "Real Madrid",
      "homeScore": 2,
      "awayScore": 1,
      "status": "live",
      "minute": 67,
      "competition": "La Liga",
      "sportType": "Football",
      "venue": "Camp Nou",
      "referee": "Antonio Mateu",
      "kickoffTime": "2026-07-28T20:00:00.000Z",
      "stats": {
        "homePossession": 58, "awayPossession": 42,
        "homeShots": 14, "awayShots": 8,
        "homeShotsOnTarget": 7, "awayShotsOnTarget": 3
      }
    }
  ]
}
```

---

### GET /api/matches/today

Get all matches scheduled for today. Public.

---

### GET /api/matches/upcoming

Get upcoming matches with filters. Public.

**Query:** `?competition=La+Liga&team=Barcelona&sportType=Football&from=2026-07-01&to=2026-08-01&page=1&limit=20`

---

### GET /api/matches/:id

Get full match details including events timeline, lineups, and stats. Public.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "homeTeam": "FC Barcelona",
    "awayTeam": "Real Madrid",
    "homeScore": 3,
    "awayScore": 1,
    "status": "finished",
    "minute": 90,
    "competition": "La Liga",
    "sportType": "Football",
    "venue": "Camp Nou",
    "referee": "Antonio Mateu",
    "kickoffTime": "2026-07-28T20:00:00.000Z",
    "stats": { "homePossession": 58, "awayPossession": 42, "homeShots": 14, ... },
    "events": [
      { "minute": 23, "type": "goal", "team": "home", "playerName": "Lewandowski", "description": "Header from corner kick" },
      { "minute": 35, "type": "yellow_card", "team": "away", "playerName": "Carvajal", "description": "Tactical foul" },
      { "minute": 58, "type": "goal", "team": "home", "playerName": "Yamal", "description": "Solo run and finish" }
    ],
    "lineups": [
      { "team": "home", "formation": "4-3-3", "players": [...], "coach": "..." },
      { "team": "away", "formation": "4-4-2", "players": [...], "coach": "..." }
    ]
  }
}
```

---

### POST /api/matches

Admin: create a new match. Requires admin.

**Body:**
```json
{
  "homeTeam": "FC Barcelona",
  "awayTeam": "Real Madrid",
  "competition": "La Liga",
  "sportType": "Football",
  "kickoffTime": "2026-07-28T20:00:00.000Z",
  "venue": "Camp Nou",
  "referee": "John Doe",
  "status": "scheduled"
}
```

**Match status values:** `scheduled`, `live`, `halftime`, `finished`, `postponed`

---

### PUT /api/matches/:id

Admin: update match (score, status, stats). Requires admin. Emits real-time Socket.io events on score/status changes.

**Body:** `{ "homeScore": 3, "awayScore": 1, "status": "finished", "minute": 90 }`

---

### POST /api/matches/:id/events

Admin: add a match event. Requires admin. Emits real-time Socket.io events and creates notifications for users who favorited involved teams.

**Body:**
```json
{
  "minute": 30,
  "type": "goal",
  "team": "home",
  "playerName": "Messi",
  "assistedBy": "Iniesta",
  "description": "Left-footed shot from outside the box"
}
```

**Event types:** `goal`, `yellow_card`, `red_card`, `substitution`, `penalty`, `own_goal`, `corner`, `foul`, `offside`, `shot`, `shot_on_target`, `save`, `injury_time`

---

### GET /api/standings/:competitionId

Get standings/league table for a competition. Public.

**Query:** league name as competitionId (e.g., `La Liga`)

**Response:** Sorted by points (desc) → goal difference (desc) → goals for (desc)
```json
{
  "success": true,
  "data": [
    { "competition": "La Liga", "teamName": "FC Barcelona", "played": 10, "wins": 8, "draws": 1, "losses": 1, "goalsFor": 25, "goalsAgainst": 8, "points": 25, "goalDifference": 17 },
    { "competition": "La Liga", "teamName": "Real Madrid", "played": 10, "wins": 7, "draws": 2, "losses": 1, "goalsFor": 22, "goalsAgainst": 10, "points": 23, "goalDifference": 12 }
  ]
}
```

---

### POST /api/standings

Admin: create or update a standing entry (upsert by competition + teamName). Requires admin.

**Body:** `{ "competition": "La Liga", "teamName": "FC Barcelona", "played": 10, "wins": 8, "draws": 1, "losses": 1, "goalsFor": 25, "goalsAgainst": 8 }`

---

## 📡 Streaming Platforms & Broadcasters (Sprint 3)

### GET /api/matches/:id/streams

Get streaming links for a match by region. Public.

**Query:** `?region=US`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "matchId": "...",
      "broadcasterId": { "_id": "...", "name": "ESPN", "logoUrl": "...", "website": "https://espn.com", "isOfficial": true },
      "region": "US",
      "url": "https://espn.com/watch/barca-vs-madrid",
      "isOfficial": true,
      "isFree": false,
      "quality": "4K",
      "language": "English"
    }
  ]
}
```

---

### GET /api/admin/broadcasters

Admin: list all broadcasters (paginated, includes inactive). Requires admin.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "ESPN",
      "logoUrl": "...",
      "website": "https://espn.com",
      "regions": ["US", "UK"],
      "isOfficial": true,
      "isActive": true
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### GET /api/admin/broadcasters/:id

Admin: get single broadcaster. Requires admin.

---

### POST /api/admin/broadcasters

Admin: create a broadcaster. Requires admin.

**Body:** `{ "name": "ESPN", "logoUrl": "...", "website": "...", "regions": ["US", "UK"], "isOfficial": true }`

---

### PUT /api/admin/broadcasters/:id

Admin: update broadcaster. Requires admin.

**Body:** `{ "isOfficial": false, "isActive": false, "name": "ESPN UK" }`

---

### DELETE /api/admin/broadcasters/:id

Admin: delete broadcaster (with cascade cleanup of stream availabilities). Requires admin.

---

### POST /api/admin/broadcasters/streams

Admin: create stream availability for a match. Requires admin.

**Body:** `{ "matchId": "...", "broadcasterId": "...", "region": "US", "url": "https://...", "isOfficial": true, "isFree": false, "quality": "4K", "language": "English" }`

---

### DELETE /api/admin/broadcasters/streams/:id

Admin: delete a stream availability. Requires admin.

---

## ⭐ Favorites (Sprint 3)

### POST /api/favorites

Add a favorite team, tournament, match, or content. Requires auth.

**Body:** `{ "type": "team", "refId": "507f1f77bcf86cd799439099", "refName": "FC Barcelona", "sportType": "Football" }`

**Type options:** `team`, `tournament`, `match`, `content`

**Response 201:** Automatically awards gamification points (`favorite_added: +10`).

---

### DELETE /api/favorites

Remove a favorite. Requires auth.

**Body:** `{ "type": "team", "refId": "507f1f77bcf86cd799439099" }`

---

### GET /api/favorites

List user's favorites (paginated, sorted by newest first). Requires auth.

**Query:** `?type=team&page=1&limit=20`

---

### GET /api/favorites/check

Check if an item is favorited. Requires auth.

**Query:** `?type=team&refId=507f1f77bcf86cd799439099`

**Response 200:**
```json
{
  "success": true,
  "data": { "isFavorited": true, "favorite": { ... } }
}
```

---

## 🔔 Notification Preferences (Sprint 3)

### GET /api/notification-preferences

Get current user's notification preferences. Requires auth.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "matchReminders": true,
      "reminderMinutesBefore": 30,
      "goalAlerts": true,
      "tournamentAnnouncements": true,
      "reviewReplies": true,
      "discussionReplies": true,
      "forumDigest": false,
      "emailNotifications": false
    }
  }
}
```

---

### PUT /api/notification-preferences

Update notification preferences. Requires auth.

**Body:** `{ "matchReminders": false, "goalAlerts": false }`

**Allowed fields:** matchReminders, reminderMinutesBefore, goalAlerts, tournamentAnnouncements, reviewReplies, discussionReplies, forumDigest, emailNotifications

---

## ⭐ Item Reviews (Sprint 4 — 1-5 Star System)

A separate review system for any item type (content, matches, sports, platforms, broadcasters). One review per user per item (409 on duplicate).

### POST /api/reviews

Create a review (1-5 star rating). Requires auth.

**Body:**
```json
{
  "itemId": "507f1f77bcf86cd799439011",
  "itemType": "content",
  "rating": 5,
  "body": "Excellent content!"
}
```

**Item types:** `content`, `match`, `sport`, `platform`, `broadcaster`

**Response 201:** Automatically awards gamification points (`review_created: +50`).

---

### PUT /api/reviews/:id

Update own review. Requires auth.

**Body:** `{ "rating": 4, "body": "Still good" }`

---

### DELETE /api/reviews/:id

Delete own review. Requires auth.

---

### GET /api/items/:itemId/reviews

Get reviews for an item (paginated). Public.

**Query:** `?page=1&limit=20&sort=recent|helpful|rating`

**Sort options:** `recent` (default), `helpful` (by votes), `rating` (highest first)

---

### GET /api/items/:itemId/rating-summary

Get rating summary/distribution for an item. Public.

**Query:** `?itemType=content`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.2,
    "totalReviews": 15,
    "distribution": { "1": 1, "2": 0, "3": 2, "4": 5, "5": 7 }
  }
}
```

---

### POST /api/reviews/:id/helpful

Mark a review as helpful (one vote per user). Requires auth.

**Response 200:** `{ "helpfulVotes": 6 }`

Automatically awards points to review author (`review_liked: +5`).

---

## 💬 Discussion Forum (Sprint 4)

### GET /api/discussions

List discussions (paginated, pinned first, sorted by last activity). Public.

**Query:** `?page=1&limit=20&search=movie&tag=cinema`

---

### GET /api/discussions/:id

Get discussion detail (auto-increments view count). Public.

---

### POST /api/discussions

Create a discussion. Requires auth.

**Body:** `{ "title": "Best movie ever?", "body": "I think it's Rocky.", "tags": ["movies", "sports"] }`

**Response 201:** Automatically awards gamification points (`discussion_created: +30`).

---

### PUT /api/discussions/:id

Update own discussion. Requires auth (or admin bypass).

**Body:** `{ "title": "...", "body": "...", "tags": [...] }`

---

### DELETE /api/discussions/:id

Soft delete own discussion (sets isActive=false, also hides all comments). Requires auth (or admin).

---

### GET /api/discussions/:discussionId/comments

Get top-level comments with nested replies for a discussion (paginated). Public.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "authorId": { "_id": "...", "fullName": "John Doe", "username": "johndoe", "avatar": "..." },
      "body": "Rocky is great!",
      "depth": 0,
      "likeCount": 3,
      "createdAt": "...",
      "replies": [
        {
          "_id": "...",
          "authorId": { ... },
          "body": "I agree!",
          "depth": 1,
          "likeCount": 1,
          "createdAt": "..."
        }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### POST /api/discussions/:discussionId/comments

Add a comment to a discussion. Requires auth.

**Body:** `{ "body": "I agree!", "parentCommentId": null }`

**Notes:**
- Set `parentCommentId` to reply to an existing comment
- Nested replies limited to 3 levels deep
- Locked discussions reject new comments (403)
- Automatically awards gamification points (`comment_created: +15`)

---

### PUT /api/comments/:id

Update own comment. Requires auth.

**Body:** `{ "body": "Updated comment text" }`

---

### DELETE /api/comments/:id

Soft delete own comment (sets isActive=false). Requires auth (or admin).

---

### POST /api/comments/:id/like

Toggle like on a comment. Requires auth.

**Response 200:** `{ "liked": true, "likeCount": 4 }`

Automatically awards points to comment author (`comment_liked: +3`).

---

## 🚨 Reports & Moderation (Sprint 4)

### POST /api/reports

Report content (discussion, comment, review, or user). Requires auth.

**Body:**
```json
{
  "targetType": "discussion",
  "targetId": "...",
  "reason": "spam",
  "description": "This is spam"
}
```

**Target types:** `discussion`, `comment`, `review`, `user`
**Reasons:** `spam`, `harassment`, `inappropriate`, `misinformation`, `copyright`, `other`

---

### GET /api/moderation/reports

Admin: list reports (paginated, defaults to pending). Requires admin.

**Query:** `?status=pending|resolved|dismissed&targetType=discussion&page=1&limit=20`

---

### PATCH /api/moderation/reports/:id

Admin: resolve or dismiss a report. Requires admin.

**Body:** `{ "status": "resolved|dismissed", "resolutionNote": "...", "hideTarget": true, "deleteTarget": false }`

---

### GET /api/moderation/stats

Admin: get moderation dashboard stats. Requires admin.

**Response 200:**
```json
{
  "success": true,
  "data": { "pending": 5, "resolved": 12, "dismissed": 3, "total": 20 }
}
```

---

### PATCH /api/moderation/discussions/:id/lock

Admin: toggle lock on a discussion (prevents new comments). Requires admin.

---

### PATCH /api/moderation/discussions/:id/pin

Admin: toggle pin on a discussion (appears at top of list). Requires admin.

---

## 🏆 Gamification & Leaderboard (Sprint 4)

### GET /api/leaderboard

Get leaderboard with range filter. Public.

**Query:** `?range=weekly|monthly|allTime&page=1&limit=20`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": { "_id": "...", "fullName": "John Doe", "username": "john", "avatar": "..." },
      "points": 1500,
      "level": 5,
      "totalReviews": 12,
      "totalDiscussions": 3
    }
  ]
}
```

**Range behavior:**
- `weekly`: Points earned since Monday of the current week (from PointsLedger aggregation)
- `monthly`: Points earned since the 1st of the current month
- `allTime`: Total accumulated points from UserStats (default)

---

### GET /api/user/stats

Get current user's gamification stats, level progress, and earned badges. Requires auth.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "userId": "...",
      "points": 850,
      "level": 3,
      "title": "Contributor",
      "totalReviews": 5,
      "totalDiscussions": 2,
      "totalComments": 8,
      "totalFavorites": 12,
      "loginStreak": 4,
      "longestStreak": 7
    },
    "levelProgress": {
      "currentLevel": { "level": 3, "title": "Contributor", "minPoints": 250 },
      "nextLevel": { "level": 4, "title": "Enthusiast", "minPoints": 500 },
      "progress": 0.82,
      "pointsToNext": 150
    },
    "badges": [
      { "_id": "...", "key": "first_review", "name": "First Review", "description": "Write your first review", "iconUrl": "...", "category": "reviewer", "earnedAt": "2026-06-01T00:00:00.000Z" }
    ]
  }
}
```

---

### GET /api/badges

Get all available badges. Public.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "key": "first_review", "name": "First Review", "description": "Write your first review", "iconUrl": "...", "category": "reviewer", "isActive": true, "pointsAwarded": 25 },
    { "_id": "...", "key": "critic", "name": "The Critic", "description": "Write 5 reviews", "category": "reviewer", "pointsAwarded": 50 },
    ...
  ]
}
```

---

### GET /api/user/points-history

Get paginated points transaction history for current user. Requires auth.

**Query:** `?page=1&limit=20`

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "userId": "...", "action": "review_created", "points": 50, "refId": "...", "refModel": "ItemReview", "description": "review_created - 50 points", "weekStart": "...", "createdAt": "..." }
  ]
}
```

---

## 🏅 Action Points & Badges Reference

### Point Values

| Action | Points | Frequency Limit | Notes |
|--------|--------|----------------|-------|
| `review_created` | 50 | Per review | Writing a review (1-5 star ItemReview) |
| `review_liked` | 5 | Per helpful vote | Someone marked your review helpful |
| `discussion_created` | 30 | Per discussion | Starting a new discussion |
| `comment_created` | 15 | Per comment | Commenting on a discussion |
| `comment_liked` | 3 | Per like received | Someone liked your comment |
| `favorite_added` | 10 | Per favorite | Adding a team/tournament to favorites |
| `daily_login` | 5 | Once per day | Logging in each day |
| `login_streak` | 10 | Once per day (streak days) | Consecutive login bonuses |
| `badge_earned` | 25 | Per badge | Unlocking a new badge |
| `profile_completed` | 20 | Once | Completing profile setup |
| `watchlist_added` | 5 | Per item | Adding content to watchlist |

### Badges

| Badge | Key | Category | Criteria | Bonus Points |
|-------|-----|----------|----------|-------------|
| First Review | `first_review` | reviewer | Write 1 review | 25 |
| The Critic | `critic` | reviewer | Write 5 reviews | 50 |
| Review Master | `review_master` | reviewer | Write 10 reviews | 100 |
| First Discussion | `first_discussion` | contributor | Create 1 discussion | 25 |
| First Comment | `first_comment` | contributor | Post 1 comment | 10 |
| Discussion Starter | `discussion_starter` | contributor | Create 5 discussions | 50 |
| Popular Commenter | `popular_commenter` | contributor | Post 25 comments | 75 |
| Super Fan | `super_fan` | social | Add 10 favorites | 50 |
| Hat Trick | `streak_3` | streak | 3-day login streak | 30 |
| Week Warrior | `streak_7` | streak | 7-day login streak | 75 |
| Monthly Devotion | `streak_30` | streak | 30-day login streak | 200 |
| Centurion | `centurion` | milestone | Earn 100 points | 25 |
| Seasoned Pro | `level_5` | milestone | Reach Level 5 | 100 |
| Hall of Fame | `level_10` | milestone | Reach Level 10 | 250 |

### Level Thresholds

| Level | Title | XP Required (Total) |
|-------|-------|---------------------|
| 1 | Newcomer | 0 |
| 2 | Explorer | 100 |
| 3 | Contributor | 250 |
| 4 | Enthusiast | 500 |
| 5 | Expert | 1,000 |
| 6 | Specialist | 2,000 |
| 7 | Veteran | 3,500 |
| 8 | Master | 5,000 |
| 9 | Grandmaster | 7,500 |
| 10 | Legend | 10,000 |
