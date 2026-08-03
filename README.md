<div align="left">
  <br/>
  <h1>NexPlay</h1>
  <p>
    <strong>Enterprise-Grade Entertainment Discovery, Branding & Marketing Platform</strong>
  </p>
  <p>
    <strong>Software Requirements Specification</strong>
  </p>
  <p>
    A full-stack MERN application with role-based access control, company verification workflows,
    advertisement & campaign management, OTT content search and discovery, streaming platform integration,
    live sports scores & match center, discussion forum, gamification & badges, content moderation,
    and a comprehensive administration dashboard.
  </p>
  <br/>
  <p>
    <a href="#quick-start"><strong>Get Started</strong></a> ·
    <a href="#demo-accounts"><strong>Demo Accounts</strong></a> ·
    <a href="#api-reference"><strong>API Docs</strong></a> ·
    <a href="#4-technology-stack--architecture"><strong>Architecture</strong></a> ·
    <a href="#srs-documentation"><strong>SRS</strong></a>
  </p>
  <br/>
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-gold?style=flat-square&labelColor=1B1D22" alt="Version"/>
    <img src="https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react&labelColor=1B1D22" alt="React"/>
    <img src="https://img.shields.io/badge/node.js-18-339933?style=flat-square&logo=nodedotjs&labelColor=1B1D22" alt="Node.js"/>
    <img src="https://img.shields.io/badge/express-5-000000?style=flat-square&logo=express&labelColor=1B1D22" alt="Express"/>
    <img src="https://img.shields.io/badge/mongodb-7-47A248?style=flat-square&logo=mongodb&labelColor=1B1D22" alt="MongoDB"/>
    <img src="https://img.shields.io/badge/tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&labelColor=1B1D22" alt="Tailwind"/>
    <img src="https://img.shields.io/badge/socket.io-4-010101?style=flat-square&logo=socket.io&labelColor=1B1D22" alt="Socket.io"/>
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=1B1D22" alt="License"/>
  </p>
  <br/>
</div>

---

## Table of Contents

### SRS Documentation

- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Scope](#12-scope)
  - [1.3 Definitions](#13-definitions-acronyms-and-abbreviations)
  - [1.4 References](#14-references)
  - [1.5 Overview](#15-overview)
- [2. Overall Description](#2-overall-description)
  - [2.1 Product Perspective](#21-product-perspective)
  - [2.2 Product Features](#22-product-features)
  - [2.3 User Classes](#23-user-classes-and-characteristics)
  - [2.4 Operating Environment](#24-operating-environment)
  - [2.5 Constraints](#25-constraints)
  - [2.6 Assumptions &amp; Dependencies](#26-assumptions-and-dependencies)
- [3. System Requirements](#3-system-requirements)
  - [3.1 Functional Requirements](#31-functional-requirements)
  - [3.2 Non-Functional Requirements](#32-non-functional-requirements)
  - [3.3 External Interface Requirements](#33-external-interface-requirements)
- [4. Technology Stack &amp; Architecture](#4-technology-stack--architecture)
  - [4.1 Technology Stack](#41-technology-stack)
  - [4.2 MVC Architecture](#42-high-level-architecture-mvc)
- [5. Challenges](#5-challenges)
- [6. Sprint Plan](#6-sprint-plan)
- [7. Acceptance Criteria](#7-acceptance-criteria)
- [8. Conclusion](#8-conclusion)
- [9. Execution Plan](#9-execution-plan)
- [10. Team](#10-team)

### Project Documentation

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Database Models](#database-models)
- [WebSocket Real-Time Events](#websocket-real-time-events)
- [Security](#security)
- [Testing](#testing)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

# SRS Documentation

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements of **NexPlay** — a web-based Entertainment Discovery, Branding, and Marketing Platform.

NexPlay offers a centralized space where entertainment companies can promote their brands, advertise upcoming movies, TV shows, web series, anime, documentaries, and live sports events. Users can discover entertainment content, access official streaming platforms, receive personalized recommendations, participate in community discussions, track live sports scores, earn gamification badges, and stay informed about upcoming releases.

Unlike traditional streaming services, NexPlay does not host or distribute copyrighted content. Instead, it serves as a discovery hub by providing detailed information about entertainment content and redirecting users to official streaming services through secure links.

### 1.2 Scope

NexPlay is a web-based application built with the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js) following the **MVC (Model-View-Controller)** architecture.

The platform supports **three major user groups**:

- **Entertainment Companies** — Create verified company profiles, publish advertisements, manage promotional campaigns, and promote upcoming content.
- **Registered Users** — Browse content, search with advanced filters, create watchlists, receive personalized recommendations, submit ratings and reviews, participate in discussions, earn gamification badges, track live sports, manage favorites, and access official streaming platforms via secure redirects.
- **Administrators** — Verify companies, moderate content and discussions, manage users, monitor system activities, broadcast notifications, manage platforms and broadcasters, and handle content moderation reports.

The system integrates with external APIs such as **TMDB API** and **Sports APIs** to deliver accurate entertainment information, trailers, release dates, live sports scores, schedules, and official streaming platform details.

### 1.3 Definitions, Acronyms and Abbreviations

| Term                    | Description                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **API**           | Application Programming Interface used for communication between software systems                    |
| **MERN**          | MongoDB, Express.js, React.js, and Node.js full-stack development framework                          |
| **MVC**           | Model-View-Controller architecture separating an application into Model, View, and Controller layers |
| **JWT**           | JSON Web Token used for authentication and authorization                                             |
| **REST API**      | Representational State Transfer architecture for client-server communication                         |
| **JSON**          | JavaScript Object Notation for exchanging structured data                                            |
| **CRUD**          | Create, Read, Update, and Delete operations on database records                                      |
| **RBAC**          | Role-Based Access Control to manage user permissions based on assigned roles                         |
| **UI/UX**         | User Interface / User Experience                                                                     |
| **TMDB API**      | The Movie Database API providing information about movies and television shows                       |
| **Sports API**    | External API providing live sports scores, schedules, tournament information, and match updates      |
| **HTTPS**         | Hypertext Transfer Protocol Secure for encrypted communication                                       |
| **SSL/TLS**       | Security protocols providing encrypted communication over networks                                   |
| **MongoDB Atlas** | Cloud-hosted MongoDB database service                                                                |
| **OTP**           | One-Time Password for authentication and verification                                                |
| **CORS**          | Cross-Origin Resource Sharing                                                                        |
| **Socket.io**     | Real-time bidirectional event-based communication library                                            |
| **Gamification**  | Application of game-design elements (points, badges, levels) in non-game contexts                    |

### 1.4 References

The following technologies, frameworks, and documentation are referenced in the design and development of NexPlay:

- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [GitHub](https://github.com/)
- [Postman](https://www.postman.com/)
- [TMDB](https://www.themoviedb.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [JWT](https://jwt.io/)
- [Socket.io](https://socket.io/)
- [Vitest](https://vitest.dev/)

### 1.5 Overview

- **Section 2** describes the overall system, including the product perspective, major features, user classes, operating environment, constraints, and assumptions.
- **Section 3** specifies all functional requirements, non-functional requirements, and external interface requirements.
- **Section 4** presents the technology stack and explains the high-level MVC architecture.
- **Section 5** discusses technical and project-related challenges.
- **Section 6** presents the Agile sprint plan with objectives, features, and deliverables.
- **Section 7** defines the acceptance criteria.
- **Section 8** concludes with objectives, implementation approach, and expected outcomes.

---

## 2. Overall Description

### 2.1 Product Perspective

NexPlay is a standalone web-based platform developed with the MERN Stack. It acts as a centralized hub where entertainment companies, production houses, streaming platforms, broadcasters, and media organizations can promote their brands, advertise upcoming content, and connect with audiences.

Unlike conventional streaming platforms, NexPlay does not host or stream copyrighted content. Instead, it provides comprehensive entertainment information and securely redirects users to official streaming platforms where the selected content is legally available.

The platform integrates with external APIs such as TMDB API and Sports APIs to retrieve up-to-date information about movies, TV shows, trailers, cast members, release dates, live sports scores, match schedules, and streaming availability.

Real-time features powered by **Socket.io** provide live score updates, match events, notifications, and gamification events (points, badges, level-ups).

The application follows the **Model-View-Controller (MVC)** architectural pattern, ensuring modularity, maintainability, scalability, and separation of concerns. The responsive web interface allows access from desktops, laptops, tablets, and smartphones.

### 2.2 Product Features

#### Company Management

- Entertainment companies can create and manage verified company profiles
- Companies can upload logos, descriptions, official websites, and social media links
- Companies can publish promotional advertisements and marketing campaigns
- Companies can manage information regarding upcoming entertainment content

#### Entertainment Discovery

- Users can browse movies, TV series, web series, anime, documentaries, and sports content
- Advanced search functionality allows users to search by title
- Multiple filters: genre, language, release year, streaming platform, and popularity
- Trending and featured entertainment content is displayed dynamically
- Upcoming releases are presented through an interactive calendar

#### Streaming Platform Integration

- Users can view official streaming platforms where selected content is available
- Secure redirects take users to authorized streaming services
- Registered users can maintain personal watchlists
- Personalized recommendations are generated based on user interests and watchlist history

#### Live Sports & Match Center

- Live sports scores and match schedules are displayed using third-party Sports APIs
- Dedicated Match Center with live, today, upcoming, and completed match tabs
- Match detail pages with events timeline, lineups, formations, and match statistics
- Competition standings/league tables
- Official sports broadcasting links managed through a Broadcaster directory

#### Community & Discussion Forum

- Users can create discussions with tags for categorization
- Threaded comments with up to 3 levels of nesting
- Discussions can be pinned or locked by moderators
- Comments can be liked and reported
- Content moderation system for reports on discussions, comments, reviews, and users

#### Gamification & Badges

- Points system for user actions (reviews, discussions, comments, favorites, daily login)
- 10-level progression system with titles (Newcomer to Legend)
- 14 achievement badges across reviewer, contributor, social, streak, and milestone categories
- Real-time level-up and badge unlock notifications
- Leaderboard with weekly, monthly, and all-time rankings

#### Ratings & Reviews

- Dual review system: 1-10 scale for content reviews + 1-5 star system for any item type
- Users can submit, edit, and delete their own reviews
- Average ratings automatically calculated
- Helpful vote system on item reviews
- Admin moderation with remove/restore actions

#### Notifications & Announcements

- Real-time notification delivery via Socket.io
- Unread notification counter in header and sidebar
- Individual and bulk mark-as-read functionality
- Company announcements and admin system-wide broadcasts
- Notification preferences (match reminders, goal alerts, discussion replies, etc.)

### 2.3 User Classes and Characteristics

| User Class                        | Description                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **General Users**           | Discover content, browse categories, search using filters, maintain watchlists, submit ratings/reviews, participate in discussions, earn badges, track live sports, manage favorites |
| **Entertainment Companies** | Production houses, streaming services, broadcasters, media organizations managing profiles, ads, campaigns, and upcoming releases                                                    |
| **Content Moderators**      | Review company registrations, verify content, moderate ads, remove inappropriate reviews, handle reports                                                                             |
| **Administrators**          | Full platform control: manage users, verify companies, monitor ads, manage broadcasters, moderate content, handle reports, broadcast notifications, generate reports                 |

### 2.4 Operating Environment

| Layer                       | Environment                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| **Client**            | Modern browsers (Chrome, Firefox, Edge, Safari) — responsive across desktops, tablets, smartphones |
| **Server**            | Node.js runtime, Express.js framework, RESTful API, Socket.io, MVC architecture                     |
| **Database**          | MongoDB (NoSQL) with MongoDB Atlas for cloud deployment                                             |
| **Hosting**           | Frontend → Vercel, Backend → Render/Railway, Database → MongoDB Atlas                            |
| **External Services** | TMDB API, Sports API, Official streaming platform redirects                                         |

### 2.5 Constraints

- Application must be developed using the **MERN Stack**
- System must follow the **MVC architectural pattern**
- Platform must comply with software engineering project guidelines
- Client-server communication must use **HTTPS**
- Passwords must be **securely hashed** before storage
- **Role-Based Access Control (RBAC)** must be implemented
- Features depending on external APIs are subject to API availability and limitations
- Development follows **Agile methodology** with planned sprints
- **GitHub** for source code management and collaboration

### 2.6 Assumptions and Dependencies

- Users have stable internet connectivity
- Entertainment companies provide accurate promotional information
- External APIs remain available and return reliable data
- Official streaming platforms maintain valid redirect URLs
- Users access the application using modern browsers with JavaScript enabled
- Cloud hosting services and MongoDB Atlas remain operational
- Third-party APIs continue providing movie information, sports updates, trailers, release dates, and streaming availability

---

## 3. System Requirements

### 3.1 Functional Requirements

The functional requirements are grouped into major functional modules, each with unique identifiers (FR-1 through FR-80).

#### 3.1.1 Company Management

##### 3.1.1.1 Company Profile Management

| ID   | Requirement                                                                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| FR-1 | The system shall allow verified entertainment companies to create public company profiles                                    |
| FR-2 | The system shall allow companies to upload and manage company logos, descriptions, official websites, and social media links |
| FR-3 | Companies shall be able to edit and update their profile information at any time                                             |
| FR-4 | The system shall display company profiles publicly after administrator approval                                              |

##### 3.1.1.2 Company Verification

| ID   | Requirement                                                                                  |
| ---- | -------------------------------------------------------------------------------------------- |
| FR-5 | The system shall allow administrators to review company registration requests                |
| FR-6 | Administrators shall be able to approve or reject company verification requests              |
| FR-7 | The system shall notify companies regarding their verification status                        |
| FR-8 | Only verified companies shall be allowed to publish advertisements and promotional campaigns |

##### 3.1.1.3 Company Dashboard

| ID    | Requirement                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------- |
| FR-9  | The system shall provide a personalized dashboard for every verified company                         |
| FR-10 | Companies shall be able to manage company information from the dashboard                             |
| FR-11 | Companies shall be able to monitor advertisement performance using basic analytics                   |
| FR-12 | Companies shall be able to manage promotional campaigns and upcoming content from a single interface |

##### 3.1.1.4 Advertisement and Campaign Management

| ID    | Requirement                                                                           |
| ----- | ------------------------------------------------------------------------------------- |
| FR-13 | Companies shall be able to create promotional advertisements                          |
| FR-14 | Companies shall be able to edit scheduled advertisements                              |
| FR-15 | Companies shall be able to remove advertisements whenever necessary                   |
| FR-16 | The system shall display active advertisements on designated sections of the platform |

##### 3.1.1.5 Upcoming Content Management

| ID    | Requirement                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| FR-17 | Companies shall be able to publish information about upcoming movies, TV series, web series, documentaries, anime, and sports events |
| FR-18 | The system shall display posters, trailers, genres, release dates, and descriptions for published content                            |
| FR-19 | Companies shall be able to edit or remove upcoming content before release                                                            |
| FR-20 | The system shall automatically categorize upcoming content based on its entertainment type                                           |

#### 3.1.2 Entertainment Discovery

##### 3.1.2.1 Browse Entertainment Content

| ID    | Requirement                                                                              |
| ----- | ---------------------------------------------------------------------------------------- |
| FR-21 | Users shall be able to browse entertainment content by category                          |
| FR-22 | Categories shall include Movies, TV Series, Web Series, Anime, Documentaries, and Sports |
| FR-23 | Users shall be able to browse recently added content                                     |
| FR-24 | The homepage shall display featured entertainment collections                            |

##### 3.1.2.2 Search and Advanced Filtering

| ID    | Requirement                                                                               |
| ----- | ----------------------------------------------------------------------------------------- |
| FR-25 | Users shall be able to search entertainment content by title                              |
| FR-26 | Users shall be able to filter content by genre                                            |
| FR-27 | Users shall be able to filter content by language                                         |
| FR-28 | Users shall be able to filter content by release year, streaming platform, and popularity |

##### 3.1.2.3 Trending and Featured Content

| ID    | Requirement                                                        |
| ----- | ------------------------------------------------------------------ |
| FR-29 | The system shall display trending entertainment content            |
| FR-30 | Administrators shall manage featured content shown on the homepage |
| FR-31 | Trending content shall update dynamically based on popularity      |
| FR-32 | Promotional campaigns may appear within featured content sections  |

##### 3.1.2.4 Upcoming Release Calendar

| ID    | Requirement                                                                   |
| ----- | ----------------------------------------------------------------------------- |
| FR-33 | The system shall display upcoming releases in calendar format                 |
| FR-34 | Users shall filter releases by month                                          |
| FR-35 | Users shall filter releases by entertainment category                         |
| FR-36 | Release dates shall update automatically whenever content information changes |

##### 3.1.2.5 Content Details Page

| ID    | Requirement                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------- |
| FR-37 | The system shall display posters, trailers, cast information, genres, synopsis, and release dates |
| FR-38 | Streaming availability information shall be displayed when available                              |
| FR-39 | Ratings and reviews shall be visible on the content details page                                  |
| FR-40 | Users shall be able to add content directly to their watchlists from the details page             |

#### 3.1.3 Streaming Platform Integration

##### 3.1.3.1 Streaming Platform Directory

| ID    | Requirement                                                                                        |
| ----- | -------------------------------------------------------------------------------------------------- |
| FR-41 | The system shall maintain a directory of supported streaming platforms                             |
| FR-42 | Users shall be able to browse streaming platforms and their available entertainment content        |
| FR-43 | The system shall display platform information including name, logo, website, and supported regions |
| FR-44 | Administrators shall be able to add, update, or remove supported streaming platforms               |

##### 3.1.3.2 "Where to Watch" Feature

| ID    | Requirement                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------- |
| FR-45 | The system shall display all available streaming platforms for a selected movie or TV show                     |
| FR-46 | The system shall indicate whether content is available through subscription, rental, purchase, or free viewing |
| FR-47 | Users shall be able to compare streaming platform availability before selecting a provider                     |
| FR-48 | The platform shall update streaming availability whenever new information is received from external APIs       |

##### 3.1.3.3 Official Streaming Platform Redirect

| ID    | Requirement                                                                                  |
| ----- | -------------------------------------------------------------------------------------------- |
| FR-49 | Users shall be able to access official streaming platforms through secure redirect links     |
| FR-50 | The platform shall never host or stream copyrighted entertainment content directly           |
| FR-51 | Redirect links shall open in a new browser tab                                               |
| FR-52 | Invalid or unavailable streaming links shall display an appropriate notification to the user |

##### 3.1.3.4 Watchlist Management

| ID    | Requirement                                                                        |
| ----- | ---------------------------------------------------------------------------------- |
| FR-53 | Users shall be able to add entertainment content to their watchlists               |
| FR-54 | Users shall be able to remove items from their watchlists                          |
| FR-55 | Watchlists shall be synchronized with user accounts                                |
| FR-56 | Users shall be able to view their complete watchlists from their profile dashboard |

##### 3.1.3.5 Personalized Recommendations

| ID    | Requirement                                                          |
| ----- | -------------------------------------------------------------------- |
| FR-57 | The system shall recommend entertainment content based on watchlists |
| FR-58 | Recommendations shall consider browsing history and user preferences |
| FR-59 | Recommendation lists shall be updated periodically                   |
| FR-60 | Users shall receive personalized recommendations on their homepage   |

#### 3.1.4 Sports & Community Features

##### 3.1.4.1 Live Sports Dashboard

| ID    | Requirement                                                                         |
| ----- | ----------------------------------------------------------------------------------- |
| FR-61 | The system shall display live sports events                                         |
| FR-62 | Users shall browse sports by category                                               |
| FR-63 | Users shall browse tournaments and competitions                                     |
| FR-64 | Live sports information shall be updated automatically through external Sports APIs |

##### 3.1.4.2 Live Scores and Match Schedule

| ID    | Requirement                                                           |
| ----- | --------------------------------------------------------------------- |
| FR-65 | The system shall display live scores                                  |
| FR-66 | The system shall display upcoming match schedules                     |
| FR-67 | Completed match results shall remain accessible for users             |
| FR-68 | Sports information shall be retrieved through third-party Sports APIs |

##### 3.1.4.3 Official Sports Streaming Links

| ID    | Requirement                                                              |
| ----- | ------------------------------------------------------------------------ |
| FR-69 | The system shall provide verified streaming links for live sports events |
| FR-70 | Users shall be redirected only to official broadcasters                  |
| FR-71 | Streaming availability shall be displayed whenever available             |
| FR-72 | The platform shall not host live sports streams directly                 |

##### 3.1.4.4 Ratings and Reviews

| ID    | Requirement                                                        |
| ----- | ------------------------------------------------------------------ |
| FR-73 | Registered users shall be able to submit ratings                   |
| FR-74 | Registered users shall be able to submit reviews                   |
| FR-75 | The system shall display average ratings for entertainment content |
| FR-76 | Administrators shall be able to moderate inappropriate reviews     |

##### 3.1.4.5 Notification and Announcement System

| ID    | Requirement                                                                                        |
| ----- | -------------------------------------------------------------------------------------------------- |
| FR-77 | Users shall receive notifications about upcoming entertainment releases                            |
| FR-78 | Users shall receive notifications regarding live sports events                                     |
| FR-79 | Entertainment companies shall be able to publish promotional announcements                         |
| FR-80 | Administrators shall be able to broadcast system-wide announcements and important platform updates |

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements

| ID    | Requirement                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------- |
| NFR-1 | The system shall support at least**500 concurrent users** without significant degradation |
| NFR-2 | Average page load time shall not exceed**3 seconds** under normal conditions              |
| NFR-3 | Search results shall be returned within**2 seconds** for typical queries                  |
| NFR-4 | Content details pages shall load within**3 seconds**                                      |
| NFR-5 | API responses shall be optimized to minimize latency                                            |
| NFR-6 | The system shall efficiently cache frequently accessed data                                     |

#### 3.2.2 Security Requirements

| ID     | Requirement                                                                         |
| ------ | ----------------------------------------------------------------------------------- |
| NFR-7  | All client-server communication shall use**HTTPS (SSL/TLS)** encryption       |
| NFR-8  | User passwords shall be securely hashed using industry-standard algorithms (bcrypt) |
| NFR-9  | Authentication shall use**JSON Web Tokens (JWT)** with dual-token system      |
| NFR-10 | The system shall implement**Role-Based Access Control (RBAC)**                |
| NFR-11 | All user inputs shall be validated to prevent malicious data entry                  |
| NFR-12 | Protection against NoSQL Injection, XSS, and CSRF                                   |
| NFR-13 | Sensitive information shall never be exposed through API responses                  |

#### 3.2.3 Reliability and Availability

| ID     | Requirement                                                                                 |
| ------ | ------------------------------------------------------------------------------------------- |
| NFR-14 | The application shall maintain minimum**99% uptime**, excluding scheduled maintenance |
| NFR-15 | The database shall be backed up regularly                                                   |
| NFR-16 | The system shall gracefully handle failures of third-party APIs                             |
| NFR-17 | Users shall receive meaningful error messages when external services are unavailable        |
| NFR-18 | The application shall recover automatically after temporary service interruptions           |

#### 3.2.4 Maintainability

| ID     | Requirement                                                                 |
| ------ | --------------------------------------------------------------------------- |
| NFR-19 | The application shall follow the**MVC** architectural pattern         |
| NFR-20 | Source code shall follow consistent coding standards and naming conventions |
| NFR-21 | Clear documentation for APIs, modules, and database schemas                 |
| NFR-22 | GitHub for version control and collaborative development                    |
| NFR-23 | System modules shall be loosely coupled for maintainability                 |

#### 3.2.5 Scalability

| ID     | Requirement                                                                         |
| ------ | ----------------------------------------------------------------------------------- |
| NFR-24 | Support adding new entertainment companies without affecting existing functionality |
| NFR-25 | Database shall efficiently support increasing users and content                     |
| NFR-26 | New entertainment categories shall be added without major architectural changes     |
| NFR-27 | Additional third-party APIs shall be integrated with minimal modification           |
| NFR-28 | Backend architecture shall support horizontal scaling for production                |

#### 3.2.6 Usability

| ID     | Requirement                                                                      |
| ------ | -------------------------------------------------------------------------------- |
| NFR-29 | Interface shall be responsive across desktops, laptops, tablets, and smartphones |
| NFR-30 | Navigation shall remain simple, consistent, and intuitive                        |
| NFR-31 | Users shall perform common tasks with minimal learning effort                    |
| NFR-32 | Important actions shall provide clear confirmation or error messages             |
| NFR-33 | Platform shall follow modern UI/UX design principles                             |

#### 3.2.7 Compatibility

| ID     | Requirement                                                                        |
| ------ | ---------------------------------------------------------------------------------- |
| NFR-34 | Support latest versions of Chrome, Firefox, Edge, and Safari                       |
| NFR-35 | Function correctly on Windows, macOS, Android, and iOS                             |
| NFR-36 | Frontend shall adapt automatically to different screen sizes via responsive design |

### 3.3 External Interface Requirements

#### 3.3.1 User Interface Requirements

| ID    | Requirement                                                              |
| ----- | ------------------------------------------------------------------------ |
| UI-1  | Responsive web interface using**React.js**                         |
| UI-2  | Adapt automatically to desktops, laptops, tablets, and smartphones       |
| UI-3  | Separate dashboards for Administrators, Companies, and Users             |
| UI-4  | Homepage with featured content, trending releases, ads, and live sports  |
| UI-5  | Browse content through categories and interactive navigation             |
| UI-6  | Advanced search and filtering options                                    |
| UI-7  | Company dashboards for ads, campaigns, and upcoming content              |
| UI-8  | Admin dashboards for user management, verification, content moderation   |
| UI-9  | User dashboards with watchlists, recommendations, notifications, profile |
| UI-10 | Meaningful success, warning, and error messages                          |

#### 3.3.2 Hardware Interface Requirements

| ID   | Requirement                                               |
| ---- | --------------------------------------------------------- |
| HI-1 | Operate on desktops, laptops, tablets, and smartphones    |
| HI-2 | Require only a modern web browser and internet connection |
| HI-3 | Backend on cloud servers supporting MERN stack            |
| HI-4 | Database on cloud-hosted MongoDB Atlas                    |
| HI-5 | No additional hardware peripherals required               |

#### 3.3.3 Software Interface Requirements

| ID   | Requirement                                                              |
| ---- | ------------------------------------------------------------------------ |
| SI-1 | Integration with**TMDB API** for movie/TV information              |
| SI-2 | Integration with**Sports API** for live scores and schedules       |
| SI-3 | Integration with official streaming platforms for viewing links          |
| SI-4 | Communication with**MongoDB Atlas** for data storage               |
| SI-5 | **JWT-based** authentication                                       |
| SI-6 | **Email notification** services for verification and announcements |
| SI-7 | **RESTful APIs** for frontend-backend communication                |

#### 3.3.4 Communication Interface Requirements

| ID   | Requirement                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| CI-1 | Frontend-backend communication via**RESTful APIs**                       |
| CI-2 | Data exchange using**JSON** format                                       |
| CI-3 | All communication secured using**HTTPS**                                 |
| CI-4 | External API communication via secure HTTPS                                    |
| CI-5 | Authentication tokens transmitted securely through HTTP headers                |
| CI-6 | Database communication over encrypted connections                              |
| CI-7 | API responses following standardized HTTP status codes and response structures |

---

## 4. Technology Stack & Architecture

### 4.1 Technology Stack

#### Backend

| Technology                                                   | Version | Purpose                                  |
| ------------------------------------------------------------ | ------- | ---------------------------------------- |
| [Node.js](https://nodejs.org/)                                | 18+     | JavaScript runtime                       |
| [Express.js](https://expressjs.com/)                          | 5.2.1   | Web framework & REST API                 |
| [MongoDB](https://www.mongodb.com/)                           | 7.x     | NoSQL database                           |
| [Mongoose](https://mongoosejs.com/)                           | 9.7.4   | MongoDB ODM                              |
| [JWT](https://jwt.io/)                                        | 9.0.2   | Access & refresh token authentication    |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js)              | 2.4.3   | Password hashing                         |
| [express-validator](https://express-validator.github.io/)     | 7.2.1   | Request validation                       |
| [express-rate-limit](https://github.com/expressjs/rate-limit) | 7.5.0   | API rate limiting                        |
| [Helmet](https://helmetjs.github.io/)                         | 8.0.0   | HTTP security headers                    |
| [Morgan](https://github.com/expressjs/morgan)                 | 1.10.0  | HTTP request logging                     |
| [Winston](https://github.com/winstonjs/winston)               | 3.17.0  | Application logging                      |
| [Multer](https://github.com/expressjs/multer)                 | 1.4.5   | File upload handling                     |
| [Socket.io](https://socket.io/)                               | 4.8.3   | Real-time bidirectional communication    |
| [node-cron](https://github.com/kelektiv/node-cron)            | 4.6.0   | Scheduled tasks (sports sync, reminders) |
| [SendGrid](https://sendgrid.com/)                             | 8.1.4   | Email delivery (primary)                 |
| [Nodemailer](https://nodemailer.com/)                         | 6.9.16  | Email delivery (fallback)                |

#### Frontend

| Technology                              | Version | Purpose                                                        |
| --------------------------------------- | ------- | -------------------------------------------------------------- |
| [React](https://react.dev/)              | 18.3.1  | UI framework                                                   |
| [React Router](https://reactrouter.com/) | 6.28.2  | Client-side routing (MemoryRouter + RouteGuard for clean URLs) |
| [Vite](https://vitejs.dev/)              | 6.0.7   | Build tool & dev server                                        |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17  | Utility-first CSS framework                                    |
| [Axios](https://axios-http.org/)         | 1.7.9   | HTTP client                                                    |
| [Socket.io Client](https://socket.io/)   | 4.8.3   | Real-time client library                                       |

#### Testing

| Tool                                                      | Purpose                          |
| --------------------------------------------------------- | -------------------------------- |
| [Node Test Runner](https://nodejs.org/api/test.html)       | Backend unit & integration tests |
| [Supertest](https://github.com/ladjs/supertest)            | HTTP assertion testing           |
| [Vitest](https://vitest.dev/)                              | Frontend unit tests              |
| [React Testing Library](https://testing-library.com/react) | Component testing                |

#### Other Tools

| Tool           | Purpose                         |
| -------------- | ------------------------------- |
| Git & GitHub   | Version control & collaboration |
| Postman        | API testing                     |
| Vercel         | Frontend deployment             |
| Render/Railway | Backend deployment              |
| MongoDB Atlas  | Cloud database hosting          |

### 4.2 High-Level Architecture (MVC)

NexPlay follows the **Model-View-Controller (MVC)** architecture to promote modularity, maintainability, scalability, and separation of concerns.

```
┌───────────────────────────────────────────────────────────────┐
│                    VIEW LAYER (React.js)                      │
│  Entertainment UI  ·  Dashboards  ·  Ads  ·  Sports  ·  UI    │
│  Discussions  ·  Leaderboard  ·  Match Center  ·  Reviews     │
└─────────────────────────┬─────────────────────────────────────┘
                          │  REST API / JSON + Socket.io
┌─────────────────────────▼──────────────────────────────────────┐
│                 CONTROLLER LAYER (Express.js)                  │
│  Request Processing  ·  Validation  ·  Auth  ·  Business Rules │
│  CRUD Operations  ·  External API Integration  ·  Gamification │
│  Real-time Events  ·  Email Notifications                      │
└─────────────────────────┬──────────────────────────────────────┘
                          │  Mongoose ODM
┌─────────────────────────▼──────────────────────────────────────┐
│                    MODEL LAYER (MongoDB)                       │
│  Users  ·  Companies  ·  Content  ·  Ads  ·  Campaigns         │
│  Reviews  ·  Matches  ·  Sports  ·  Platforms  ·  Notifications│
│  Discussions  ·  Comments  ·  Badges  ·  Reports               │
│  Favorites  ·  Broadcasters  ·  User Stats  ·  Points Ledger   │
└────────────────────────────────────────────────────────────────┘
```

#### View Layer (Presentation Layer)

Implemented with **React.js**. Responsibilities include:

- Displaying entertainment content
- Rendering dashboards for each user role
- Managing user interactions and responsive UI
- Displaying advertisements and sports information
- Managing watchlists and personalized recommendations
- Rendering match center, discussion forum, leaderboard
- Displaying gamification stats, badges, and level progress

#### Controller Layer (Business Logic Layer)

Implemented with **Node.js** and **Express.js**. Responsibilities include:

- Processing user requests
- Validating input data
- Managing authentication and authorization (JWT + RBAC)
- Handling CRUD operations
- Communicating with external APIs (TMDB, Sports)
- Managing business rules and returning API responses
- Awarding gamification points and badges
- Broadcasting real-time events via Socket.io

#### Model Layer (Data Layer)

Implemented with **MongoDB** and Mongoose ODM. **27 Mongoose models** across 6 feature modules.

#### MVC Request Flow

```
User → React Frontend → Express Routes → Controllers → Models → MongoDB Database
                                       ↓
                    Controller → JSON Response → React Frontend → User Interface
                
                   --- Socket.io RT Events ---
                   Server → Socket.io → Client
                   (score updates, notifications, gamification)
```

#### Project Structure

```
nexplay/
├── frontend/                           # React.js Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/                 # Reusable UI components (18 files)
│   │   │   ├── ott/                    # OTT content components (15 files)
│   │   │   ├── Header.jsx             # Main navigation header
│   │   │   ├── Footer.jsx             # Main footer
│   │   │   ├── Sidebar.jsx            # Dashboard sidebar
│   │   │   ├── RouteGuard.jsx         # Clean URL barrier (MemoryRouter + history sync)
│   │   │   └── ...                    # AdBanner, Badge, Button, Card, DataTable,
│   │   │                              # ErrorBoundary, Input, Logo, Modal,
│   │   │                              # ReviewsSection, RoleAvatar, StarRating,
│   │   │                              # StatCard, ThemeToggle
│   │   ├── pages/                     # Application pages (38 files)
│   │   │   ├── LandingPage.jsx        # Public landing page
│   │   │   ├── SearchPage.jsx         # OTT content search & discovery
│   │   │   ├── SportsPage.jsx         # Live sports dashboard
│   │   │   ├── MatchCenter.jsx        # Match center (live/today/upcoming)
│   │   │   ├── MatchDetailPage.jsx    # Match detail with timeline/lineups
│   │   │   ├── DiscussionsPage.jsx    # Discussion forum list
│   │   │   ├── DiscussionDetailPage.jsx # Discussion with comments
│   │   │   ├── LeaderboardPage.jsx    # Gamification leaderboard
│   │   │   ├── NotificationPreferencesPage.jsx # Notification settings
│   │   │   ├── NotFoundPage.jsx       # 404 page
│   │   │   ├── auth/                  # Auth pages (5 files)
│   │   │   ├── user/                  # User dashboard pages (4 files)
│   │   │   ├── admin/                 # Admin dashboard pages (11 files)
│   │   │   └── company/               # Company dashboard pages (8 files)
│   │   ├── layouts/                   # Layout components (3 files)
│   │   ├── context/                   # React context providers (5 files)
│   │   ├── hooks/                     # Custom React hooks (5 files)
│   │   ├── services/                  # API & WebSocket services
│   │   ├── routes/                    # Protected route components
│   │   ├── utils/                     # Utility functions
│   │   └── styles/                    # CSS (Tailwind + theme variables)
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                            # Node.js/Express.js Backend
│   ├── config/                        # Database & env configuration
│   ├── controllers/                   # Business logic (25 controllers)
│   ├── models/                        # Mongoose schemas (27 models)
│   ├── routes/                        # Express route definitions (24 files)
│   ├── middleware/                     # Auth, RBAC, validation, rate limiting, caching, error handling
│   ├── services/                      # External API integrations (TMDB, Sports, Email, Gamification)
│   ├── validators/                    # Request validation rules
│   ├── utils/                         # JWT, password, response helpers
│   ├── constants/                     # App constants (roles, statuses, config)
│   ├── database/                      # Seed scripts (seed.js, seedContent.js, seedBadges.js, seedNewModels.js)
│   ├── cron/                          # Scheduled tasks (sports sync, match reminders)
│   ├── socket/                        # Socket.io real-time server
│   ├── tests/                         # Unit & integration tests (6 files)
│   └── server.js                      # Entry point
│
├── docs/
│   ├── api.md                         # Complete API reference
│   └── schema.md                      # Database schema & ERD
├── package.json                       # Root scripts (dev, seed, test)
├── NexPlay.postman_collection.json
└── README.md                          # This documentation
```

The frontend follows a **component-based architecture** with React, organized by feature (pages, components, context). The backend follows the **MVC pattern** with clean separation between routes, controllers, models, and services.

---

## 5. Challenges

### 5.1 Third-Party API Integration

The platform depends on external APIs such as TMDB API and Sports APIs to retrieve entertainment information, live sports scores, streaming availability, and match schedules. API rate limits, service downtime, and changes in API structures may temporarily affect system functionality.

### 5.2 Live Sports Data Synchronization

Displaying real-time sports scores and match updates requires continuous communication with external APIs. Ensuring low latency while minimizing unnecessary API requests is a significant technical challenge.

### 5.3 Recommendation System

Providing personalized entertainment recommendations requires analyzing user watchlists, browsing history, and preferences. Designing an efficient recommendation mechanism while maintaining good performance is an important challenge.

### 5.4 Secure Authentication and Authorization

The platform supports multiple user roles (Administrators, Companies, Users). Implementing secure authentication using JWT and enforcing Role-Based Access Control (RBAC) across all system modules is essential.

### 5.5 Responsive User Interface

The application must provide a consistent and user-friendly experience across desktops, laptops, tablets, and smartphones. Maintaining responsiveness for different screen sizes while ensuring high performance is an important design challenge.

### 5.6 Real-Time Communication

Implementing real-time features (live scores, notifications, gamification events) via Socket.io requires efficient connection management, room-based event broadcasting, and graceful reconnection handling.

### 5.7 Gamification System

Designing a balanced points system, level thresholds, and badge criteria requires careful consideration to keep users engaged without making progression too easy or too difficult.

### 5.8 Scalability

The system architecture should support increasing numbers of users, entertainment companies, advertisements, and entertainment content without requiring major architectural modifications.

---

## 6. Sprint Plan

The NexPlay project follows **Agile Software Development** methodology. The implementation is divided into **development sprints**, each focusing on a specific group of features.

### Sprint 1 — Company & Platform Foundation

**Objective:** Develop the core platform infrastructure and enable entertainment companies to establish their presence on NexPlay.

**Features:**

- Company Registration & Profile Management
- Company Verification Workflow
- Company Dashboard
- Advertisement & Campaign Management
- Upcoming Content Management

**Deliverables:**

- Companies can create and manage profiles
- Administrators can verify companies
- Companies can publish ads, campaigns, and upcoming content

---

### Sprint 2 — Entertainment Discovery

**Objective:** Develop entertainment browsing and discovery features for users.

**Features:**

- Browse Entertainment Content by category
- Search Functionality with instant results
- Advanced Filtering (genre, language, year, platform, status)
- Trending & Featured Content sections
- Upcoming Release Calendar
- Content Details Page

**Deliverables:**

- Users can browse, search, and filter entertainment content
- Detailed content pages with trending and upcoming releases

---

### Sprint 3 — Streaming Platform Integration & Live Scores

**Objective:** Connect entertainment information with official streaming platforms and introduce live sports features.

**Features:**

- Streaming Platform Directory with full CRUD
- "Where to Watch" Feature
- Official Streaming Redirect (secure new-tab)
- Watchlist Management (add/remove/view)
- Personalized Recommendations
- Live Scores & Match Center (live/today/upcoming/completed tabs)
- Match Detail Pages (events, lineups, stats, standings)
- Broadcaster Directory & Stream Availability
- Favorites (teams/tournaments)
- Notification Preferences (match reminders, goal alerts)

**Deliverables:**

- Users can discover official streaming platforms
- Watchlists synchronized with user accounts
- Secure redirection to authorized streaming services
- Live sports scores, match schedules, and standings
- Stream availability with broadcaster management

---

### Sprint 4 — Community & Gamification

**Objective:** Extend the platform with community engagement and gamification features.

**Features:**

- Discussion Forum (CRUD, nested comments, lock/pin, tags)
- Threaded Comments (3-level depth, likes, soft delete)
- Content Moderation (reports, resolve/dismiss, hide/delete targets)
- Item Reviews (1-5 star system for any item type)
- Helpful Vote System on reviews
- Gamification (points, 10 levels, leaderboard)
- Badges (14 achievement badges across 5 categories)
- Real-time notifications (score updates, gamification events)
- Admin broadcast notifications & company announcements

**Deliverables:**

- Community discussion forum with moderation
- Comprehensive gamification system with badges and levels
- Real-time features via Socket.io
- Multi-type rating and review system

---

### Sprint 5+ — Future Enhancements

**Planned features:**

- Mobile applications (React Native)
- AI-powered content recommendations
- Social sharing and user profiles
- Advanced analytics dashboards
- Live chat during sports events
- Multi-language support
- Payment integration for premium features

---

## 7. Acceptance Criteria

The NexPlay project shall be considered successfully completed when all of the following conditions are satisfied:

- [X] All planned functional requirements (FR-1 through FR-80) have been implemented
- [X] Company registration and verification operate correctly
- [X] Companies can manage advertisements and upcoming content
- [X] Users can browse entertainment content through categories
- [X] Advanced search and filtering function correctly
- [X] Trending and featured content is displayed dynamically
- [X] Official streaming platform redirects operate successfully
- [X] Personalized watchlists function correctly
- [X] Recommendation functionality provides relevant suggestions
- [X] Live sports information is retrieved from external APIs
- [X] Match Center with live/today/upcoming/completed matches
- [X] Discussion forum with threaded comments and moderation
- [X] Gamification with points, levels, badges, and leaderboard
- [X] Real-time notifications via Socket.io
- [X] Item reviews with rating aggregation and helpful votes
- [X] Ratings and reviews are stored and displayed correctly
- [X] Notification functionality operates correctly
- [X] Authentication and RBAC function correctly
- [X] Application follows the MVC architectural pattern
- [X] RESTful APIs operate successfully
- [X] MongoDB stores and retrieves application data correctly
- [X] Application is responsive across desktop, tablet, and mobile
- [X] Source code maintained using GitHub
- [X] All Agile sprint deliverables completed
- [X] System passes functional and integration testing

---

## 8. Conclusion

This Software Requirements Specification (SRS) presents a comprehensive blueprint for the development of **NexPlay**, a web-based Entertainment Discovery, Branding, and Marketing Platform built with the MERN Stack.

The platform connects entertainment companies with audiences by providing a centralized environment for brand promotion, content discovery, official streaming platform integration, live sports information, community discussions, gamification, personalized recommendations, and engagement features.

The MVC architecture ensures modularity, maintainability, scalability, and efficient separation of concerns throughout the application. Integration with external APIs allows NexPlay to deliver accurate and up-to-date entertainment information while respecting copyright by redirecting users only to authorized streaming platforms.

Real-time features powered by Socket.io deliver live score updates, instant notifications, and gamification events. The gamification system with points, levels, and badges drives user engagement and community participation.

By following Agile software development practices and implementing the functional and non-functional requirements defined in this document, NexPlay provides a secure, responsive, and user-friendly platform capable of supporting future expansion and additional entertainment services.

---

## 9. Execution Plan

This section provides a step-by-step implementation guide for developers building the NexPlay platform.

### 9.1 Scaffold the Monorepo

```
nexplay/
├── frontend/           # React.js client
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Role-specific dashboards + public pages
│       ├── context/    # React context providers (5)
│       ├── hooks/      # Custom hooks (5)
│       ├── services/   # API service layer + Socket.io client
│       ├── layouts/    # Page layouts (3)
│       ├── routes/     # Route guards
│       ├── utils/      # Utilities
│       └── styles/     # CSS / theme variables
├── server/             # Node.js/Express.js backend
│   ├── models/         # Mongoose schemas (27)
│   ├── controllers/    # Business logic (25)
│   ├── routes/         # RESTful routes (24 files)
│   ├── middleware/     # (6) Auth, RBAC, validation, rate limiting, caching, error handling
│   ├── services/       # (4) TMDB, Sports, Email, Gamification
│   ├── validators/     # Request validation rules
│   ├── utils/          # JWT, password, response helpers
│   ├── config/         # Database & env configuration
│   ├── database/       # Seed scripts (4)
│   ├── cron/           # Scheduled tasks (2)
│   ├── socket/         # Socket.io server
│   └── tests/          # Unit & integration tests
└── package.json        # Root scripts
```

### 9.2 Implementation Order

1. **Authentication First** — Implement JWT signup/login/refresh, password hashing (bcrypt), RBAC middleware for Admin/Company/User roles before building feature modules.
2. **Integrate External APIs Server-Side Only** — TMDB API and Sports API calls should only happen on the backend. Never expose API keys to the client. Cache responses to satisfy NFR-6 and reduce rate-limit risk.
3. **Implement Every FR (Checklist)** — Treat each functional requirement FR-1 through FR-80 as a checklist item.
4. **Implement Every NFR (Technical Measures)** — Each non-functional requirement must have concrete implementation.
5. **Implement All External Interface Requirements** — UI-1-10, HI-1-5, SI-1-7, CI-1-7 exactly as specified.
6. **Follow Sprint Order (1 → 4)** — Build incrementally so the app is testable and demoable after each sprint.
7. **Real-Time Features** — Implement Socket.io for live score updates, notifications, and gamification events.
8. **Notification & Email Service** — Integrate an email provider (SendGrid primary, Nodemailer fallback) for account verification, announcements, and promotional notices.
9. **Testing & Documentation** — Provide Postman collection, `.env.example`, README with setup/run/deploy instructions, seed scripts for demo data, and comprehensive tests.
10. **Verify Against Acceptance Criteria** — Before considering any module complete, verify against Section 7 (Acceptance Criteria).

---

## 10. Team

| Student ID | Name               |
| ---------- | ------------------ |
| 22301590   | Fahim Shahriar Nur |
| 23101067   | Nowshin Zahan      |
| 22301550   | Ayesha Mahjabin    |
| 23101504   | Nuzhat Nueree      |

---

# Project Documentation

---

## Overview

**NexPlay** is a production-ready MERN stack platform that connects entertainment companies with their audiences. It provides a complete ecosystem for **content discovery**, **brand promotion**, **audience engagement**, **live sports tracking**, **community discussions**, and **gamification** through a secure, role-based architecture.

> **Version 1.0.0** — All 4 sprints completed. **27 database models**, **25 API controllers**, **38 frontend pages**, **4 seed scripts**, and **Socket.io real-time features**.
>
> Documentation: [Complete API Reference](docs/api.md) · [Database Schema &amp; ERD](docs/schema.md)

---

## Key Features

### Sprint 4 — Community & Gamification

<details open>
<summary><strong>Discussion Forum</strong></summary>
<br/>

| Feature                     | Description                                            |
| --------------------------- | ------------------------------------------------------ |
| **Discussion CRUD**   | Create, read, update, soft-delete discussions          |
| **Tag System**        | Categorize discussions with tags                       |
| **Threaded Comments** | Nested replies up to 3 levels deep                     |
| **Comment Likes**     | Toggle like/unlike on comments                         |
| **Pin/Lock**          | Admins can pin important or lock inappropriate threads |
| **View Count**        | Auto-incrementing view counter                         |
| **Last Activity**     | Track and sort by most recent activity                 |
| **Dedicated Pages**   | `/discussions` and `/discussions/:id` routes       |

</details>

<details open>
<summary><strong>Gamification & Badges</strong></summary>
<br/>

| Feature                  | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| **Points System**  | Award points for reviews, discussions, comments, etc. |
| **10 Levels**      | From Newcomer (Lv.1) to Legend (Lv.10)                |
| **14 Badges**      | Unlockable achievements across 5 categories           |
| **Leaderboard**    | Weekly, monthly, and all-time rankings                |
| **Level Progress** | Visual progress bar with XP to next level             |
| **Badge Display**  | Showcase earned badges on user profile                |
| **Activity Stats** | Review, discussion, comment, and favorite counters    |
| **Points History** | Paginated ledger of all point transactions            |

</details>

<details open>
<summary><strong>Content Moderation</strong></summary>
<br/>

| Feature                      | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| **Report System**      | Report discussions, comments, reviews, or users       |
| **Report Reasons**     | Spam, harassment, inappropriate, misinformation, etc. |
| **Moderation Queue**   | Paginated list of pending/resolved/dismissed reports  |
| **Resolution Actions** | Resolve, dismiss, hide target, or delete target       |
| **Moderation Stats**   | Pending/resolved/dismissed counts dashboard           |
| **Lock/Pin Controls**  | Admins can lock or pin discussions directly           |

</details>

<details open>
<summary><strong>Item Reviews (1-5 Star System)</strong></summary>
<br/>

| Feature                       | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| **Multi-Type Reviews**  | Rate content, matches, sports, platforms, broadcasters |
| **1-5 Star Rating**     | Visual star input with half-star precision             |
| **Helpful Votes**       | Users can mark reviews as helpful (once per user)      |
| **Rating Distribution** | Breakdown of 1-5 star counts                           |
| **Average Rating**      | Calculated and displayed on items                      |
| **One Review Per User** | Prevents duplicate reviews with 409 on conflict        |

</details>

### Sprint 3 — Streaming Platform & Live Scores

<details open>
<summary><strong>Match Center</strong></summary>
<br/>

| Feature                      | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| **Live Now Tab**       | Real-time live matches with animated live indicator   |
| **Today's Matches**    | All matches scheduled for today                       |
| **Upcoming Matches**   | Filterable list of scheduled games                    |
| **Completed Matches**  | Past match results with final scores                  |
| **Match Detail Page**  | Timeline, lineups, formations, stats, streaming links |
| **Sport Type Filter**  | Filter by Football, Basketball, Cricket, Tennis, etc. |
| **Competition Filter** | Filter by league/tournament name                      |
| **Team Search**        | Search matches by team name                           |
| **League Standings**   | Competition table with points, GD, form               |
| **Match Events**       | Goals, cards, substitutions timeline                  |
| **Lineup Builder**     | Starting XI with formation visualization              |

</details>

<details open>
<summary><strong>Watchlist Management</strong></summary>
<br/>

| Feature                         | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| **Add to Watchlist**      | One-click add from content detail modal             |
| **Remove from Watchlist** | Remove with confirmation feedback                   |
| **Watchlist Page**        | Dedicated`/user/watchlist` with poster thumbnails |
| **Pagination**            | Paginated watchlist for large collections           |
| **Duplicate Check**       | Prevents duplicate additions with error feedback    |
| **Dashboard Count**       | Watchlist item count displayed on user dashboard    |

</details>

<details open>
<summary><strong>Streaming Platform & Broadcaster Directory</strong></summary>
<br/>

| Feature                       | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| **Platform CRUD**       | Admin can add, edit, and remove streaming platforms   |
| **Public Listing**      | Users can browse all supported streaming platforms    |
| **Platform Details**    | Name, logo, website, supported regions, content types |
| **Broadcaster CRUD**    | Admin can add/remove broadcasters with regions        |
| **Stream Availability** | Manage which broadcasters stream which matches        |
| **Region Filtering**    | Filter stream availability by region                  |

</details>

<details open>
<summary><strong>Favorites & Notification Preferences</strong></summary>
<br/>

| Feature                        | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| **Team Favorites**       | Favorite teams for quick access                |
| **Tournament Favorites** | Favorite leagues and competitions              |
| **Favorite Check**       | Quick API to check if item is favorited        |
| **Match Reminders**      | Configure reminder timing before matches       |
| **Goal Alerts**          | Toggle push notifications for goals            |
| **Discussion Replies**   | Get notified when someone replies to your post |
| **Email Preferences**    | Toggle email notification delivery             |

</details>

### Sprint 2 — OTT Search & Discovery

<details open>
<summary><strong>Global Search & Advanced Filtering</strong></summary>
<br/>

| Feature                       | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| **Instant Search**      | Debounced (300ms) multi-keyword search across titles and tags  |
| **Search Suggestions**  | Keyboard-navigable dropdown with top 5 results                 |
| **Category Tabs**       | All, Movies, TV Series, Web Series, Anime, Docs, Sports        |
| **Genre Filter**        | Multi-select: Action, Adventure, Comedy, Drama, Thriller, etc. |
| **Language Filter**     | Multi-select: English, Bangla, Hindi, Korean, etc.             |
| **Release Year Filter** | Single-select: 2026-Before 2020                                |
| **Status Filter**       | Context-aware: Released/Upcoming/Ongoing/Completed             |
| **Platform Filter**     | Multi-select: Netflix, Prime, Disney+, HBO, Hulu, etc.         |
| **Sort Options**        | Popular, Trending, Latest, Release Date, Highest Rated, A-Z    |
| **Filter Drawer**       | Full-screen slide-in drawer with all filters                   |
| **Active Filter Chips** | Removable chips showing current filters                        |

</details>

<details open>
<summary><strong>OTT Content Rails</strong></summary>
<br/>

| Section                       | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| **Trending Now**        | Weekly trending content sorted by recency + rating |
| **Popular Today**       | Editor's picks — highest rated content            |
| **Recommended For You** | Curated high-rated selections                      |
| **Latest Updates**      | Recently updated content                           |
| **Upcoming Releases**   | Content with status = upcoming                     |
| **Where To Watch**      | Official streaming platform links                  |

</details>

<details open>
<summary><strong>OTT Content Cards</strong></summary>
<br/>

| Feature                   | Description                                     |
| ------------------------- | ----------------------------------------------- |
| **Poster**          | Lazy-loaded images with gradient fallback       |
| **Type Badge**      | MOVIE / TV SERIES indicator                     |
| **Rating**          | Star rating with IMDb-style score               |
| **Genre Tags**      | Up to 2 genre labels per card                   |
| **Episode Count**   | TV series only — shows total episodes          |
| **Platform Badge**  | Shows streaming platform availability           |
| **Hover Overlay**   | "View Details" and "Watch Now" buttons on hover |
| **Responsive Grid** | 2→3→4→5→6 columns (mobile→tablet→desktop) |

</details>

### Sprint 1 — Platform Foundation

<details>
<summary><strong>Authentication & Security</strong></summary>
<br/>

| Feature                           | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| **Multi-Role Registration** | Register as User or Company with validation    |
| **JWT Authentication**      | Dual-token system (15min access + 7d refresh)  |
| **Token Refresh Queue**     | Prevents multiple simultaneous refresh calls   |
| **OTP Password Reset**      | 6-digit OTP flow with resend and countdown     |
| **Remember Me**             | Extended refresh token duration (30 days)      |
| **Account Control**         | Admin can block/unblock any account            |
| **Password Strength Meter** | Real-time visual feedback on password strength |

</details>

<details>
<summary><strong>Company Management</strong></summary>
<br/>

| Feature                         | Description                                           |
| ------------------------------- | ----------------------------------------------------- |
| **Company Registration**  | Dedicated registration flow with profile fields       |
| **Verification Workflow** | Full pipeline: Pending → Review → Approved/Rejected |
| **Profile Management**    | Edit details, upload logo, manage information         |
| **Feature Gating**        | Ads & campaigns locked until verification is complete |
| **Email Notifications**   | Automated alerts on verification status changes       |

</details>

<details>
<summary><strong>Advertisements & Campaigns</strong></summary>
<br/>

| Feature                       | Description                                               |
| ----------------------------- | --------------------------------------------------------- |
| **Ad Creation**         | Create ads with title, description, target URL, placement |
| **Placement Types**     | Banner, Sidebar, Popup, Featured                          |
| **Campaign Management** | Group ads into campaigns with budgets and targeting       |
| **Admin Oversight**     | Full approval, rejection, and management workflow         |
| **Rejection Handling**  | Detailed rejection reasons in UI and modals               |

</details>

<details>
<summary><strong>Administration</strong></summary>
<br/>

| Feature                           | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| **Dashboard Analytics**     | Real-time stats: users, companies, verifications |
| **User Management**         | Search, filter, block, delete users              |
| **Company Management**      | Search, status filtering, detailed profiles      |
| **Verification Queue**      | Streamlined approve/reject workflow              |
| **Activity Logging**        | Complete audit trail of all admin actions        |
| **Broadcast Notifications** | System-wide announcement broadcasting            |
| **Featured Content**        | Toggle content featured status                   |
| **Platform Management**     | CRUD for streaming platforms                     |
| **Broadcaster Management**  | CRUD for sports broadcasters                     |
| **Content Moderation**      | Report management, lock/pin discussions          |

</details>

<details>
<summary><strong>User Experience</strong></summary>
<br/>

| Feature                       | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| **Responsive Design**   | Fully responsive mobile-first layout             |
| **Dark/Light Theme**    | Toggle with localStorage persistence             |
| **Page Transitions**    | Smooth fade-in animations on all routes          |
| **Password Strength**   | Real-time meter with visual feedback             |
| **Toast Notifications** | Animated success/error/warning toasts            |
| **Loading States**      | Shimmer loading states for all components        |
| **Skeleton Loading**    | Card skeleton loaders for content sections       |
| **Error States**        | Retry-able error states with "Try Again" buttons |
| **Empty States**        | Context-aware empty state messages               |
| **Clean URL Routing**   | MemoryRouter + RouteGuard for hidden routes      |
| **404 Page**            | Custom error page with role-based redirect       |
| **Premium Animations**  | Float, glow, gradient-shift, scale-in effects    |

</details>

---

## Quick Start

### Prerequisites

| Tool                               | Version | Purpose                            |
| ---------------------------------- | ------- | ---------------------------------- |
| [Node.js](https://nodejs.org/)      | >= 18.x | JavaScript runtime                 |
| [npm](https://www.npmjs.com/)       | >= 9.x  | Package manager                    |
| [MongoDB](https://www.mongodb.com/) | >= 7.x  | Database (local, Atlas, or Docker) |

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nexplay.git
cd nexplay

# Install all dependencies (server + frontend)
npm run install:all

# Copy the environment template and configure
cp .env.example server/.env
# Then edit server/.env with your values

# Seed the database with demo data (run all seed scripts)
# Or use the unified command to run all seeds at once:
npm run seed:all

# Or run individually:
npm run seed           # Core data: 8 admins, 15 users, 7 companies
npm run seed:content   # Entertainment content (movies, series, anime)
npm run seed:badges    # 14 gamification badges
npm run seed:new       # Matches, broadcasters, discussions, standings

# Start development servers (server on :5000, frontend on :5173)
npm run dev
```

> **Note:** Create a `.env` file in the `server/` directory. Required variables: `PORT`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`. API keys for TMDB, Sports API, and SendGrid are optional — the app works with static fallback data.

### Access the Application

| Service                | URL                              | Description                    |
| ---------------------- | -------------------------------- | ------------------------------ |
| **Frontend**     | http://localhost:5173            | React + Vite dev server        |
| **Backend API**  | http://localhost:5000            | Express API server             |
| **Health Check** | http://localhost:5000/api/health | API health endpoint            |
| **Socket.io**    | http://localhost:5000            | Real-time WebSocket connection |

---

## Demo Accounts

**After running all seed scripts (`npm run seed:all` or individually `npm run seed`, `npm run seed:content`, `npm run seed:badges`, `npm run seed:new`), the following accounts and data are available.**

### Administrators (8 Predefined Accounts)

> **Admin accounts cannot register, reset passwords, or use forgot password. They are created exclusively via the seed script.**

| Email                      | Password           | Access               |
| -------------------------- | ------------------ | -------------------- |
| elena.vasquez@nexplay.com  | NexPlay@Admin#2025 | Full admin dashboard |
| marcus.chen@nexplay.com    | NexPlay@Admin#2025 | Full admin dashboard |
| priya.sharma@nexplay.com   | NexPlay@Admin#2025 | Full admin dashboard |
| ahmed.farouk@nexplay.com   | NexPlay@Admin#2025 | Full admin dashboard |
| yuki.tanaka@nexplay.com    | NexPlay@Admin#2025 | Full admin dashboard |
| olivia.bennett@nexplay.com | NexPlay@Admin#2025 | Full admin dashboard |
| diego.ramirez@nexplay.com  | NexPlay@Admin#2025 | Full admin dashboard |
| aiko.sato@nexplay.com      | NexPlay@Admin#2025 | Full admin dashboard |

### Regular Users (15 Accounts)

| Email                     | Password          | Role |
| ------------------------- | ----------------- | ---- |
| liam.oconnor@gmail.com    | NexPlay@User#2025 | user |
| sofia.rodriguez@gmail.com | NexPlay@User#2025 | user |
| kenji.watanabe@gmail.com  | NexPlay@User#2025 | user |
| fatima.alrashid@gmail.com | NexPlay@User#2025 | user |
| dmitri.volkov@gmail.com   | NexPlay@User#2025 | user |
| amara.okafor@gmail.com    | NexPlay@User#2025 | user |
| hans.mueller@gmail.com    | NexPlay@User#2025 | user |
| meilin.chang@gmail.com    | NexPlay@User#2025 | user |
| carlos.santos@gmail.com   | NexPlay@User#2025 | user |
| aisha.kapoor@gmail.com    | NexPlay@User#2025 | user |
| viktor.petrov@gmail.com   | NexPlay@User#2025 | user |
| grace.kim@gmail.com       | NexPlay@User#2025 | user |
| omar.hassan@gmail.com     | NexPlay@User#2025 | user |
| isabella.conti@gmail.com  | NexPlay@User#2025 | user |
| raj.patel@gmail.com       | NexPlay@User#2025 | user |

### Companies (7 Accounts)

| Email                           | Password             | Verification Status |
| ------------------------------- | -------------------- | ------------------- |
| info@nexusmedia.com             | NexPlay@Company#2025 | Verified            |
| contact@auroraentertainment.com | NexPlay@Company#2025 | Verified            |
| hello@titanstudios.com          | NexPlay@Company#2025 | Pending             |
| info@pioneerdigitalworks.com    | NexPlay@Company#2025 | Verified            |
| team@prismbroadcast.com         | NexPlay@Company#2025 | Pending             |
| studio@vertexcreative.com       | NexPlay@Company#2025 | Rejected            |
| info@horizonfilms.com           | NexPlay@Company#2025 | Verified            |

---

## Testing

### Backend Tests (Node Test Runner + Supertest)

```bash
cd server && npm test
```

**6 test files** covering:

- Auth & password management (JWT, registration validation, login)
- Content CRUD & search operations
- Advertisement & campaign management
- Company verification workflow
- Admin dashboard & activity logging
- Role-based access control
- Input validation & error handling
- Watchlist controller edge cases
- Review controller validation (rating bounds, missing fields)
- Sport controller validation (required fields, search query parsing)
- Platform controller validation (required name, mass assignment protection)
- Admin broadcast & featured content validation
- Route file integrity (all routes load without errors)

### Frontend Tests (Vitest + React Testing Library)

```bash
cd frontend && npx vitest run
```

**7 test files** in `frontend/src/__tests__/`:

| Test File                            | Coverage                                      |
| ------------------------------------ | --------------------------------------------- |
| `StarRating.test.jsx`              | Rating input interaction, read-only, ARIA     |
| `MatchCenter.test.jsx`             | Live match rendering, tab switching           |
| `LeaderboardPage.test.jsx`         | Leaderboard with range filter                 |
| `NotificationPreferences.test.jsx` | Notification toggle settings                  |
| `DiscussionsPage.test.jsx`         | Discussion list with pinned/locked badges     |
| `MatchDetailPage.test.jsx`         | Match detail with tabs & stream links         |
| `UserProfile.test.jsx`             | Gamification badges, level progress, activity |

---

## Rate Limiting

Rate limits are applied per IP address to prevent abuse. In development mode, limits are generous for testing with demo accounts.

| Limiter             | Scope                   | Window     | Max Requests |
| ------------------- | ----------------------- | ---------- | ------------ |
| `apiLimiter`      | All`/api` routes      | 15 minutes | 1000         |
| `loginLimiter`    | POST /api/auth/login    | 15 minutes | 100          |
| `registerLimiter` | POST /api/auth/register | 1 hour     | 50           |
| `authLimiter`     | Password reset flows    | 15 minutes | 100          |
| `otpLimiter`      | OTP verification/resend | 15 minutes | 30           |

> **Note:** Rate limiting is **bypassed** in test mode (`NODE_ENV=test`). Configured in `server/middleware/rateLimiter.js`.

Response format on limit exceeded (HTTP 429):

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

---

## API Reference

A complete API reference is available in [`docs/api.md`](docs/api.md). The API is organized into the following modules:

### Authentication & Users

- `POST /api/auth/register` — Register user or company
- `POST /api/auth/login` — Login with email/username
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/auth/me` — Get current user profile
- `POST /api/auth/logout` — Logout
- `POST /api/auth/forgot-password` — Request password reset OTP
- `POST /api/auth/verify-otp` — Verify OTP
- `POST /api/auth/resend-otp` — Resend OTP
- `POST /api/auth/reset-password` — Reset password with token

### User Profile

- `GET /api/user/profile` — Get own profile
- `PUT /api/user/profile` — Update profile
- `PUT /api/user/change-password` — Change password

### Company

- `GET /api/company/profile` — Get own company profile
- `PUT /api/company/profile` — Update company profile
- `POST /api/company/logo` — Upload company logo
- `GET /api/company/profile/:id` — Get public company profile

### Advertisements

- `GET /api/company/advertisements` — List own ads
- `POST /api/company/advertisements` — Create ad
- `GET /api/advertisements/active` — Get active ads by placement

### Campaigns

- `GET /api/company/campaigns` — List own campaigns
- `POST /api/company/campaigns` — Create campaign

### Content

- `GET /api/content/trending` — Trending content
- `GET /api/content/popular` — Popular content
- `GET /api/content/search` — Search with filters
- `GET /api/content/suggestions` — Autocomplete suggestions

### Sports & Matches

- `GET /api/sports/live` — Live sports events
- `GET /api/sports/upcoming` — Upcoming events
- `GET /api/matches/live` — Live matches with scores
- `GET /api/matches/today` — Today's matches
- `GET /api/matches/upcoming` — Upcoming matches
- `GET /api/matches/:id` — Match details (events, lineups, stats)
- `GET /api/standings/:competitionId` — Competition standings
- `POST /api/matches/:id/events` — Add match event

### Platforms & Broadcasters

- `GET /api/platforms` — Active streaming platforms
- `GET /api/admin/broadcasters` — All broadcasters
- `GET /api/matches/:id/streams` — Match streaming links

### Discussions & Comments

- `GET /api/discussions` — List discussions
- `POST /api/discussions` — Create discussion
- `GET /api/discussions/:id/comments` — Get comments
- `POST /api/discussions/:id/comments` — Add comment

### Reviews

- `GET /api/content/:id/reviews` — Content reviews (1-10 scale)
- `POST /api/reviews` — Create item review (1-5 star)
- `GET /api/items/:itemId/rating-summary` — Rating distribution

### Gamification

- `GET /api/leaderboard` — Leaderboard (weekly/monthly/allTime)
- `GET /api/user/stats` — User gamification stats
- `GET /api/badges` — All available badges
- `GET /api/user/points-history` — Points transaction history

### Notifications

- `GET /api/notifications` — Notification list
- `PATCH /api/notifications/:id/read` — Mark as read
- `PATCH /api/notifications/read-all` — Mark all as read
- `GET /api/notifications/unread-count` — Unread count

### Moderation & Reports

- `POST /api/reports` — Report content
- `GET /api/moderation/reports` — Report queue
- `PATCH /api/moderation/reports/:id` — Resolve/dismiss report
- `PATCH /api/moderation/discussions/:id/lock` — Toggle lock
- `PATCH /api/moderation/discussions/:id/pin` — Toggle pin

### Favorites

- `POST /api/favorites` — Add favorite
- `DELETE /api/favorites` — Remove favorite
- `GET /api/favorites` — List favorites

### Admin

- `GET /api/admin/dashboard/stats` — Dashboard analytics
- `GET /api/admin/users` — List users
- `PATCH /api/admin/companies/:id/verify` — Verify/reject company
- `GET /api/admin/activity-log` — Admin audit trail
- `POST /api/admin/notifications/broadcast` — System broadcast
- `PATCH /api/admin/contents/:id/featured` — Toggle featured

---

## Frontend Pages

### Public Pages (8)

| Route                | Page                 | Description                                |
| -------------------- | -------------------- | ------------------------------------------ |
| `/`                | LandingPage          | Hero section, features, trending content   |
| `/search`          | SearchPage           | OTT search with advanced filters           |
| `/sports`          | SportsPage           | Live sports dashboard                      |
| `/matches`         | MatchCenter          | Match center with tabs                     |
| `/matches/:id`     | MatchDetailPage      | Match detail with timeline, lineups, stats |
| `/discussions`     | DiscussionsPage      | Forum discussion list                      |
| `/discussions/:id` | DiscussionDetailPage | Discussion with threaded comments          |
| `/leaderboard`     | LeaderboardPage      | Leaderboard with range filter              |

### Auth Pages (5)

| Route                 | Page                | Description             |
| --------------------- | ------------------- | ----------------------- |
| `/login`            | LoginPage           | Login form              |
| `/register`         | RegisterPage        | Multi-role registration |
| `/forgot-password`  | ForgotPasswordPage  | Email input             |
| `/otp-verification` | OTPVerificationPage | 6-digit OTP input       |
| `/reset-password`   | ResetPasswordPage   | New password form       |

### User Dashboard Pages (6)

| Route                   | Page                        | Description                          |
| ----------------------- | --------------------------- | ------------------------------------ |
| `/user/dashboard`     | UserDashboard               | User home with stats                 |
| `/user/profile`       | UserProfile                 | Profile edit + gamification + badges |
| `/user/watchlist`     | UserWatchlist               | Watchlist management                 |
| `/user/reviews`       | UserReviews                 | My reviews management                |
| `/user/notifications` | NotificationPreferencesPage | Notification settings                |

### Admin Dashboard Pages (11)

| Route                     | Page                | Description                |
| ------------------------- | ------------------- | -------------------------- |
| `/admin/dashboard`      | AdminDashboard      | Analytics overview         |
| `/admin/users`          | AdminUsers          | User management            |
| `/admin/companies`      | AdminCompanies      | Company management         |
| `/admin/verifications`  | AdminVerifications  | Company verification queue |
| `/admin/advertisements` | AdminAdvertisements | Ad management              |
| `/admin/campaigns`      | AdminCampaigns      | Campaign management        |
| `/admin/platforms`      | AdminPlatforms      | Streaming platform CRUD    |
| `/admin/broadcasters`   | AdminBroadcasters   | Broadcaster management     |
| `/admin/moderation`     | AdminModeration     | Reports & moderation       |
| `/admin/rejected`       | AdminRejected       | Rejected items             |
| `/admin/activity-log`   | AdminActivityLog    | Admin audit trail          |

### Company Dashboard Pages (8)

| Route                       | Page                   | Description                 |
| --------------------------- | ---------------------- | --------------------------- |
| `/company/dashboard`      | CompanyDashboard       | Company home with analytics |
| `/company/profile`        | CompanyProfile         | Profile management          |
| `/company/advertisements` | CompanyAdvertisements  | Ad management               |
| `/company/campaigns`      | CompanyCampaigns       | Campaign management         |
| `/company/upcoming`       | CompanyUpcomingContent | Upcoming content management |
| `/company/contents`       | CompanyUpcomingContent | All content management      |
| `/company/notifications`  | CompanyNotifications   | Notifications               |

---

## Database Models

**27 Mongoose Models** across 6 feature modules covering the complete NexPlay domain.

| #  | Model                      | Module        | Key Fields                                               |
| -- | -------------------------- | ------------- | -------------------------------------------------------- |
| 1  | `User`                   | Auth          | email, password(hashed), role, watchlist[]               |
| 2  | `Company`                | Auth          | companyName, email, password(hashed), verificationStatus |
| 3  | `Content`                | Discovery     | title, type, genres[], rating, status                    |
| 4  | `Review`                 | Sprint 2      | userId, contentId, rating(1-10), isModerated             |
| 5  | `Advertisement`          | Sprint 1      | companyId, title, status, placement                      |
| 6  | `Campaign`               | Sprint 1      | companyId, name, status, advertisements[]                |
| 7  | `Platform`               | Streaming     | name, logo, website, isActive                            |
| 8  | `Sport`                  | Sports        | title, sportType, homeTeam, awayTeam, status             |
| 9  | `Notification`           | Notifications | recipientId, recipientType, type, title, isRead          |
| 10 | `Verification`           | Auth          | userId, userType, otp, purpose, expiresAt                |
| 11 | `AdminLog`               | Admin         | adminId, action, targetType, details                     |
| 12 | `Match`                  | Sprint 3      | homeTeam, awayTeam, competition, status, score, stats    |
| 13 | `MatchEvent`             | Sprint 3      | matchId, minute, type, team, playerName                  |
| 14 | `Standing`               | Sprint 3      | competition, teamName, played, wins, draws, points       |
| 15 | `Lineup`                 | Sprint 3      | matchId, team, formation, players[], coach               |
| 16 | `Broadcaster`            | Sprint 3      | name, logoUrl, regions[], isOfficial                     |
| 17 | `StreamAvailability`     | Sprint 3      | matchId, broadcasterId, region, url                      |
| 18 | `Favorite`               | Sprint 3      | userId, type, refId                                      |
| 19 | `NotificationPreference` | Sprint 3      | userId, matchReminders, goalAlerts, etc.                 |
| 20 | `ItemReview`             | Sprint 4      | userId, itemId, itemType, rating(1-5), helpfulVotes      |
| 21 | `Discussion`             | Sprint 4      | title, body, authorId, pinned, locked, tags              |
| 22 | `Comment`                | Sprint 4      | discussionId, authorId, body, parentCommentId, depth     |
| 23 | `Report`                 | Sprint 4      | targetType, targetId, reporterId, reason, status         |
| 24 | `UserStats`              | Sprint 4      | userId, points, level, streaks                           |
| 25 | `Badge`                  | Sprint 4      | key, name, description, iconUrl, category                |
| 26 | `UserBadge`              | Sprint 4      | userId, badgeId, earnedAt                                |
| 27 | `PointsLedger`           | Sprint 4      | userId, action, points, refId, weekStart                 |

Full schema documentation with ERD: [`docs/schema.md`](docs/schema.md)

---

## WebSocket Real-Time Events

NexPlay uses **Socket.io** for real-time bidirectional communication. The server supports room-based events for match updates and user-specific events for notifications and gamification.

| Event                   | Direction        | Payload                                       |
| ----------------------- | ---------------- | --------------------------------------------- |
| `match:score`         | Server → Room   | `{ matchId, homeScore, awayScore, minute }` |
| `match:event`         | Server → Room   | `{ matchId, event: {...}, match: {...} }`   |
| `match:status`        | Server → Room   | `{ matchId, status }`                       |
| `notification`        | Server → User   | `{ _id, type, title, body }`                |
| `notification:unread` | Server → User   | `{ unreadCount }`                           |
| `gamification`        | Server → User   | `{ userId, action, points, total, type }`   |
| `join:match`          | Client → Server | `{ matchId }`                               |
| `leave:match`         | Client → Server | `{ matchId }`                               |

Client initialization:

```js
import { connectSocket, joinMatchRoom, onScoreUpdate, onNotification } from './services/socket';

// After login
const socket = connectSocket(accessToken);

// Join match room for live scores
joinMatchRoom(matchId);
onScoreUpdate(matchId, (data) => {
  console.log(`Score update: ${data.homeScore} - ${data.awayScore}`);
});

// Listen for notifications
onNotification((notification) => {
  console.log('New notification:', notification);
});
```

---

## Security

### Authentication

- **JWT Dual-Token System**: Short-lived access tokens (15min) + long-lived refresh tokens (7d)
- **Refresh Token Rotation**: Each refresh invalidates the previous token
- **Queue-Based Refresh**: Prevents race conditions on multiple simultaneous requests
- **Password Hashing**: bcrypt with 12 salt rounds

### Authorization

- **Role-Based Access Control (RBAC)**: Three roles — `user`, `company`, `admin`
- **Middleware Guards**: Role-checking middleware on all protected routes
- **Company Verification Gate**: Verified status required for ad/campaign features

### Data Protection

- **Input Validation**: express-validator on all endpoints
- **HTTP Security**: Helmet.js with appropriate headers
- **Rate Limiting**: Per-IP limits on all API routes (bypassed in test mode)
- **CORS**: Configured to allow only the frontend origin
- **NoSQL Injection Prevention**: Mongoose schema validation

### Additional Measures

- **OTP**: 6-digit codes with 10-minute expiry for password reset
- **Password Requirements**: Min 8 chars, uppercase, lowercase, number, special char
- **Secure Password Reset**: Temporary tokens with 1-hour expiry
- **Activity Logging**: Complete audit trail for all admin actions

---

## Configuration

### Environment Variables (`server/.env`)

| Variable               | Required | Default               | Description                   |
| ---------------------- | -------- | --------------------- | ----------------------------- |
| `PORT`               | Yes      | 5000                  | API server port               |
| `MONGO_URI`          | Yes      | —                    | MongoDB connection string     |
| `JWT_ACCESS_SECRET`  | Yes      | —                    | JWT access token signing key  |
| `JWT_REFRESH_SECRET` | Yes      | —                    | JWT refresh token signing key |
| `CLIENT_URL`         | Yes      | http://localhost:5173 | Frontend URL for CORS         |
| `NODE_ENV`           | No       | development           | Environment mode              |
| `JWT_ACCESS_EXPIRE`  | No       | 15m                   | Access token expiry           |
| `JWT_REFRESH_EXPIRE` | No       | 7d                    | Refresh token expiry          |
| `SENDGRID_API_KEY`   | No       | —                    | SendGrid API key              |
| `TMDB_API_KEY`       | No       | —                    | TMDB API key                  |
| `SPORTS_API_KEY`     | No       | —                    | Sports API key                |
| `EMAIL_FROM`         | No       | noreply@nexplay.com   | Email sender address          |
| `BCRYPT_SALT_ROUNDS` | No       | 12                    | Password hash rounds          |

> The app works without TMDB/Sports/SendGrid API keys — it falls back to static seed data gracefully.

---

## Scripts

| Script                   | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `npm run install:all`  | Install dependencies for both server and frontend   |
| `npm run dev`          | Start both server and frontend concurrently         |
| `npm run dev:server`   | Start backend with nodemon                          |
| `npm run dev:frontend` | Start Vite dev server                               |
| `npm run start`        | Start production server                             |
| `npm run seed:all`     | Run all seed scripts in order (recommended)         |
| `npm run seed`         | Seed core data (users, companies, admins)           |
| `npm run seed:content` | Seed entertainment content                          |
| `npm run seed:badges`  | Seed gamification badges                            |
| `npm run seed:new`     | Seed Sprint 3/4 models (matches, discussions, etc.) |
| `npm run test`         | Run backend tests                                   |
| `npm run test:server`  | Run backend tests directly                          |
| `npm run build`        | Build frontend for production                       |
| `npm run clean`        | Remove all node_modules                             |

---

## Deployment

### Architecture

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  Vercel     │ ────> │  Render /   │ ────> │  MongoDB     │
│  (Frontend) │       │  Railway    │       │  Atlas       │
│  React +    │       │  (Backend)  │       │  (Database)  │
│  Vite       │       │  Express.js │       │              │
└─────────────┘       └─────────────┘       └──────────────┘
       │                    │
       │                    ├── TMDB API (Content Data)
       │                    ├── Sports API (Live Scores)
       │                    └── SendGrid (Email)
       │
       └── Users (Browsers)
```

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or any static host
```

#### Vercel Configuration (`vercel.json`)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend (Render/Railway)

```bash
cd server
npm start
```

Make sure to set all environment variables in your hosting provider's dashboard.

### Database (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Whitelist your deployment's IP address
3. Get the connection string and set as `MONGO_URI`

### Live Demo

> Deployment URLs are placeholders — replace with your actual deployed URLs.

| Service                | URL                                             |
| ---------------------- | ----------------------------------------------- |
| **Frontend**     | `https://nexplay.vercel.app`                  |
| **Backend API**  | `https://nexplay-api.onrender.com`            |
| **Health Check** | `https://nexplay-api.onrender.com/api/health` |

---

## Screenshots

> Screenshots coming soon. Add images by placing them in the `assets` directory or hosting them externally.

### Public Pages

| Page                         | Preview                                             |
| ---------------------------- | --------------------------------------------------- |
| **Landing Page**       | `![Landing Page](assets/screenshots/landing.png)` |
| **Search & Discovery** | `![Search Page](assets/screenshots/search.png)`   |
| **Live Sports**        | `![Sports Page](assets/screenshots/sports.png)`   |
| **Login**              | `![Login](assets/screenshots/login.png)`          |
| **Register**           | `![Register](assets/screenshots/register.png)`    |

### Dashboard Pages

| Page                        | Preview                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| **User Dashboard**    | `![User Dashboard](assets/screenshots/user-dashboard.png)`       |
| **Company Dashboard** | `![Company Dashboard](assets/screenshots/company-dashboard.png)` |
| **Admin Dashboard**   | `![Admin Dashboard](assets/screenshots/admin-dashboard.png)`     |
| **Admin Users**       | `![Admin Users](assets/screenshots/admin-users.png)`             |

---

## Roadmap

### Sprint 4 (Complete) — Community & Gamification

- Discussion Forum with CRUD, nested comments, lock/pin, tags
- Content Moderation with reports, resolve/dismiss, hide/delete targets
- Item Reviews (1-5 star system for any item type) with helpful votes
- Gamification: points, 10 levels, 14 badges, leaderboard
- Real-time notifications (score updates, gamification events)
- Admin broadcast notifications & company announcements

### Sprint 3 (Complete) — Streaming Platform Integration & Live Scores

- Streaming Platform Directory with full admin CRUD
- Broadcaster Directory & Stream Availability
- Watchlist Management (add/remove/view/check from API)
- Match Center with live/today/upcoming/completed tabs
- Match Detail Pages (events, lineups, formations, stats, standings)
- Competition Standings/League Tables
- Favorites (teams/tournaments) & Notification Preferences
- Official streaming platform redirect with invalid link handling

### Sprint 2 (Complete) — OTT Search & Content Discovery

- Global search with instant debounced multi-keyword matching
- Search suggestions dropdown with keyboard navigation
- Advanced multi-filter system (genre, language, year, status, platform)
- Category tabs: All, Movies, TV Series, Web Series, Anime, Docs, Sports
- Trending, Popular, Recommended, Latest Updates, Upcoming content rails
- Upcoming Release Calendar with month & category filtering
- OTT-styled content cards with poster, rating, type badge, platform info
- Content detail modal with reviews, watchlist, and streaming links
- Pagination with page numbers and ellipsis
- Loading skeletons, empty states, error states with retry

### Sprint 1 (Complete) — Company & Platform Foundation

- Complete authentication with JWT + OTP
- Role-based access control (User, Company, Admin)
- Company verification workflow
- Advertisement & campaign management
- Upcoming Content Management for verified companies
- Admin dashboard with analytics
- Responsive mobile-first design with Dark/Light theme toggle
- Page transition animations & toast notifications
- Activity audit logging

### Future Enhancements

- Mobile applications (React Native)
- AI-powered content recommendations
- Social sharing and user profiles
- Advanced analytics dashboards
- Live chat during sports events
- Multi-language support
- Payment integration for premium features

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code conventions and MVC architecture
- Write tests for new features (Node Test Runner for backend, Vitest for frontend)
- Update API documentation in `docs/api.md` for new endpoints
- Run `npm test` before submitting PRs
- Ensure all acceptance criteria are met for the module

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="left">
  <br/>
  <p>
    Built with the <strong>MERN Stack</strong>
  </p>
  <p>
    <sub>Copyright 2024-2026 NexPlay — All Rights Reserved</sub>
  </p>
  <br/>
</div>
