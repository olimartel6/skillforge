# SkillForge — Design Specification

**Date:** 2026-03-15
**Status:** Approved

## Overview

SkillForge is an AI micro-learning coach mobile app where users practice a creative skill 5 minutes per day and get instant AI feedback via their camera. Philosophy: "Talent is practice."

**Target users:** Age 16–30, creative people learning skills like drawing, guitar, speaking, etc.

**Core loop:** Open app daily → complete 5-min challenge → record practice → AI feedback → progress in skill tree.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native Expo (TypeScript) |
| State | Zustand |
| Navigation | React Navigation |
| Camera/Media | Expo Camera, Expo AV |
| Animations | Reanimated |
| Backend | Supabase (Auth, Database, Storage, Edge Functions) |
| AI | Claude API (via Supabase Edge Functions) |
| Payments | RevenueCat (App Store subscriptions) |
| Notifications | Expo Notifications (local) |

**Supabase project:** `karztsksjqohxhgxdeje` (us-east-1)

## Architecture

**Option C: Supabase Edge Functions as Backend**

All server-side logic runs in Supabase Edge Functions (Deno). No separate backend server. The React Native client talks directly to Supabase for auth, database, and storage, and calls Edge Functions for AI operations.

```
React Native App
    ├── Supabase Client (auth, db, storage)
    └── Edge Functions (AI calls, business logic)
            └── Claude API (key stored as Supabase secret)
```

Benefits: serverless, scales automatically, AI key stays server-side, single ecosystem.

## Data Model

### users (extends Supabase auth.users)
- `id` (uuid, FK to auth.users)
- `username` (text, unique)
- `avatar_url` (text, nullable)
- `selected_skill_id` (uuid, FK to skills)
- `skill_level` (enum: beginner, intermediate, advanced)
- `goal` (enum: creativity, learn_faster, discipline)
- `premium_expires_at` (timestamptz, nullable) — null = free tier; set by RevenueCat webhook
- `onboarding_complete` (boolean, default false)
- `created_at` (timestamptz)

### skills
- `id` (uuid, PK)
- `name` (text)
- `icon` (text, emoji)
- `description` (text)
- `category` (text)

20+ skills: Drawing, Painting, Guitar, Piano, Singing, Public speaking, Storytelling, Photography, Video editing, Acting, Stand-up comedy, Writing, Calligraphy, Animation, 3D modeling, Dance, Magic tricks, Beatboxing, Filmmaking, Language pronunciation.

### skill_tree_nodes
- `id` (uuid, PK)
- `skill_id` (uuid, FK to skills)
- `name` (text)
- `tier` (enum: basics, intermediate, advanced)
- `order` (integer)
- `unlock_after_streak` (integer)

### challenges
- `id` (uuid, PK)
- `skill_id` (uuid, FK to skills)
- `node_id` (uuid, FK to skill_tree_nodes)
- `title` (text)
- `description` (text)
- `difficulty` (enum: beginner, intermediate, advanced)
- `duration_minutes` (integer, default 5)
- `is_generated` (boolean) — true if AI-generated, false if seeded

### practice_sessions
- `id` (uuid, PK)
- `user_id` (uuid, FK to users)
- `challenge_id` (uuid, FK to challenges)
- `skill_id` (uuid, FK to skills) — denormalized for fast feed/filter queries
- `media_url` (text, nullable)
- `media_type` (enum: photo, video, audio)
- `ai_feedback` (jsonb) — structured feedback from Claude
- `is_shared` (boolean, default false)
- `created_at` (timestamptz)

### streaks
- `user_id` (uuid, PK, FK to users)
- `current_streak` (integer, default 0)
- `longest_streak` (integer, default 0)
- `freeze_tokens` (integer, default 1)
- `last_practice_date` (date)

### user_progress
- `user_id` (uuid, FK to users)
- `node_id` (uuid, FK to skill_tree_nodes)
- `unlocked_at` (timestamptz)
- PK: (user_id, node_id)

### badges
- `id` (uuid, PK)
- `name` (text)
- `description` (text)
- `icon` (text, emoji)
- `condition_type` (text) — e.g., "streak_7", "streak_30", "first_upload", "practices_100"
- `condition_value` (integer)

### user_badges
- `user_id` (uuid, FK to users)
- `badge_id` (uuid, FK to badges)
- `earned_at` (timestamptz)
- PK: (user_id, badge_id)

### follows
- `follower_id` (uuid, FK to users)
- `following_id` (uuid, FK to users)
- `created_at` (timestamptz)
- PK: (follower_id, following_id)

### likes
- `user_id` (uuid, FK to users)
- `practice_id` (uuid, FK to practice_sessions)
- `created_at` (timestamptz)
- PK: (user_id, practice_id)

### comments
- `id` (uuid, PK)
- `user_id` (uuid, FK to users)
- `practice_id` (uuid, FK to practice_sessions)
- `text` (text)
- `created_at` (timestamptz)

### user_roadmap
- `id` (uuid, PK)
- `user_id` (uuid, FK to users)
- `day_number` (integer, 1–30)
- `node_id` (uuid, FK to skill_tree_nodes)
- `challenge_title` (text)
- `challenge_description` (text)
- `completed_at` (timestamptz, nullable)
- `created_at` (timestamptz)
- UNIQUE: (user_id, day_number)

## Supabase Edge Functions

### generate-challenge
- **Input:** `{ skill_id, node_id, difficulty }`
- **Logic:** Check challenges table for cached challenge matching criteria. If cache miss, call Claude API to generate a structured 5-minute challenge.
- **Claude prompt:** "Generate a 5-minute {difficulty} {skill_name} practice challenge for the topic '{node_name}'. Return JSON: { title, description, tips: string[], duration: 5 }"
- **Output:** `{ title, description, tips, duration }`
- Saves generated challenge to database for reuse.

### analyze-practice
- **Input:** `{ media_url, media_type, challenge_id }`
- **Logic:** Download media from Supabase Storage.
  - **Photo:** Send directly to Claude Vision API (claude-sonnet-4-6).
  - **Video:** Extract 3–5 key frames at even intervals (max 30s recording). Send frames as multi-image input to Claude Vision.
  - **Audio:** All audio-centric skills (guitar, singing, etc.) require the user to record **video** (so Claude can see hand position, posture, etc.). Pure audio-only is not supported in MVP — the UI always records video for these skills.
- **Claude prompt:** "Analyze this {media_type} of a student practicing: '{challenge_description}'. Return JSON: { strengths: string[], mistakes: string[], improvement_tip: string, encouragement: string, score: number (1-10) }"
- **Output:** `{ strengths[], mistakes[], improvement_tip, encouragement, score }`
- **Error handling:** If Claude API fails, return a graceful fallback: `{ error: true, message: "Feedback unavailable — your practice is still saved. We'll retry shortly." }`. Client shows a retry button.

### generate-roadmap
- **Input:** `{ skill_id, skill_level, goal }`
- **Logic:** Called once after onboarding. Generates a 30-day practice plan mapped to skill tree nodes.
- **Output:** Array of 30 daily challenge descriptions with node assignments.

All functions read the Claude API key from Supabase secrets (`ANTHROPIC_API_KEY`). Never exposed to client.

## Auth Flow & Conditional Routing

- **WelcomeScreen** embeds auth (email/password form + Apple/Google sign-in buttons)
- On app launch, check auth state:
  - **Not authenticated** → WelcomeScreen (onboarding stack)
  - **Authenticated + not onboarded** → SkillSelectionScreen (skip welcome)
  - **Authenticated + onboarded** → Main App (tabs)

## Navigation Structure

```
Root Navigator (Stack)
├── Onboarding Flow (Stack) — shown once
│   ├── WelcomeScreen (includes auth)
│   ├── SkillSelectionScreen
│   ├── LevelSelectionScreen
│   ├── GoalSelectionScreen
│   └── RoadmapPreviewScreen
└── Main App (Bottom Tabs)
    ├── Home Tab (Stack)
    │   ├── DailyChallengeScreen
    │   ├── PracticeSessionScreen (camera + timer)
    │   └── AIFeedbackScreen
    ├── Skill Tree Tab
    │   └── SkillTreeScreen
    ├── Community Tab (Stack)
    │   ├── FeedScreen
    │   └── PostDetailScreen
    ├── Stats Tab
    │   ├── StreakDashboardScreen
    │   └── BadgesScreen
    └── Profile Tab (Stack)
        ├── ProfileScreen
        ├── SettingsScreen
        └── SubscriptionScreen
```

## Project Structure

```
src/
├── components/          — Reusable UI (Button, Card, Timer, StreakFlame, GlassCard...)
├── screens/
│   ├── onboarding/      — Welcome, SkillSelect, LevelSelect, GoalSelect, RoadmapPreview
│   ├── home/            — DailyChallenge, PracticeSession, AIFeedback
│   ├── skilltree/       — SkillTreeMap
│   ├── community/       — Feed, PostDetail
│   ├── stats/           — StreakDashboard, Badges
│   └── profile/         — Profile, Settings, Subscription
├── navigation/          — RootNavigator, TabNavigator, OnboardingNavigator
├── store/               — Zustand stores (userStore, challengeStore, streakStore, communityStore)
├── services/            — supabase.ts, aiCoach.ts, notifications.ts, purchases.ts
├── hooks/               — useStreak, useChallenge, useAuth, useTimer
├── utils/               — constants.ts, helpers.ts, types.ts
└── assets/              — images, fonts, animations
```

## State Management (Zustand)

### userStore
- `profile` — user data from DB
- `isAuthenticated` — auth state
- `isOnboarded` — onboarding complete flag
- Actions: `signIn()`, `signUp()`, `signOut()`, `updateProfile()`, `completeOnboarding()`

### challengeStore
- `currentChallenge` — today's challenge
- `timerState` — { remaining, isRunning, isPaused }
- `roadmap` — 30-day plan
- Actions: `fetchChallenge()`, `startTimer()`, `pauseTimer()`, `submitPractice()`

### streakStore
- `currentStreak`, `longestStreak`, `freezeTokens`, `lastPracticeDate`
- `badges` — earned badges
- Actions: `recordPractice()`, `useFreeze()`, `checkBadges()`

### communityStore
- `feed` — paginated practice posts
- `userPosts` — current user's shared practices
- Actions: `fetchFeed()`, `likePractice()`, `commentOnPractice()`, `followUser()`, `sharePractice()`

## UI Design System

### Theme: Dark-first, Glassmorphic, Premium

- **Background:** #0a0a0b
- **Primary accent:** #FF6B35 (orange)
- **Secondary accent:** #6C63FF (purple)
- **Success:** #34D399 (green)
- **Text primary:** #FFFFFF
- **Text secondary:** #888888
- **Text muted:** #444444
- **Font:** Inter (weights: 200, 300, 400, 500, 600, 700, 800, 900)

### Glass Effect
Design intent (CSS shown for reference — in RN use `expo-blur` BlurView + semi-transparent overlay):
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px);  /* → expo-blur BlurView intensity={20} */
border: 1px solid rgba(255, 255, 255, 0.06);
border-radius: 16px;
```

### Glass Strong (selected/active states)
```css
background: rgba(255, 255, 255, 0.07);
backdrop-filter: blur(40px);  /* → expo-blur BlurView intensity={40} */
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 20px;
```

### RN Library Mapping
- `backdrop-filter: blur()` → `expo-blur` (BlurView)
- `linear-gradient()` → `expo-linear-gradient`
- `box-shadow` → `react-native-shadow-2` or platform shadow props (shadowColor/shadowOffset/shadowRadius on iOS, elevation on Android)

### Ambient Glow
Radial gradients behind key elements (streak counter, logo, hero cards) using accent colors at 8-12% opacity.

### Button Primary
```css
background: linear-gradient(135deg, #FF6B35, #FF3D00);
border-radius: 14px;
box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
```

### Card Shadows
```css
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 120px rgba(108, 99, 255, 0.03);
```

### Design Principles
- Premium feel: generous padding, weight hierarchy (200 for decorative, 900 for stats)
- Tight letter-spacing on headings (-0.5px to -2px)
- Color as accent only, never loud backgrounds
- Subtle borders (rgba white at 5-10%)
- Active tab indicator: small bar, not color fill

## Animations (Reanimated)

1. **Streak flame** — pulsing scale (1.0 → 1.05) + glow intensity tied to streak count
2. **Node unlock** — scale spring from 0 → 1 with particle burst effect
3. **Feedback card** — staggered fade-in per section (strengths → improve → tip → encouragement), 200ms delay each
4. **Tab transitions** — shared element transitions between screens
5. **Timer** — smooth countdown, color shifts from white → orange at 1 minute remaining
6. **Challenge card entrance** — slide-up with spring physics (damping: 15, stiffness: 150)

## Auth & Security

- **Supabase Auth** with email/password, Apple Sign In, Google Sign In
- **Row Level Security (RLS)** on all tables — users can only read/write their own data; community posts readable by all authenticated users
- **Claude API key** stored as Supabase secret — never in client code
- **Media uploads** to Supabase Storage with per-user folder structure (`{user_id}/practices/{filename}`) and RLS policies
- **RevenueCat** webhook to Supabase Edge Function validates subscriptions server-side — updates `premium_expires_at` on every event (purchase, renewal, cancellation, refund, billing retry failure)
- **Premium gating** enforced server-side: RLS policies check `premium_expires_at > now()` for premium-only operations (community sharing, unlimited skills). Client-side gating is for UX only, not security.

## AI Integration Flow

### Practice Analysis
```
User finishes practice
→ Uploads photo/video/audio to Supabase Storage
→ Client calls Edge Function "analyze-practice"
→ Edge Function downloads media from Storage
→ Sends to Claude Vision API (claude-sonnet-4-6)
→ Returns structured feedback JSON
→ Client displays feedback card with staggered animation
```

### Challenge Generation
```
App needs today's challenge
→ Client calls Edge Function "generate-challenge"
→ Edge Function checks challenges table cache
→ If miss: calls Claude API with skill/level/node context
→ Returns structured challenge JSON
→ Client displays challenge card
```

## Freemium Model (RevenueCat)

### Free Tier
- 1 skill only
- Basic AI feedback (strengths + 1 tip)
- Streak tracking
- No community sharing

### Premium ($6.99/month)
- Unlimited skills
- Advanced AI feedback (full analysis + score)
- Community uploads and social features
- Advanced analytics
- Streak freeze tokens (2/month)

## Push Notifications (Local)

Using Expo Notifications for local scheduling:
- Default reminder: "Your 5-minute practice is waiting" at 8PM
- Adaptive: compute preferred practice time from average `created_at` hour of last 7 practice sessions; shift reminder to 30 min before that time
- Streak at risk: "Don't break your 12-day streak! Practice now" at 9PM if not practiced
- Badge earned: immediate local notification

## Skills & Skill Trees

Each of the 20+ skills has a 3-tier tree with 3 nodes per tier (9 nodes total):

**Example — Drawing:**
- Basics: Lines → Shapes → Shading
- Intermediate: Perspective → Anatomy → Lighting
- Advanced: Character Design → Storyboarding → Portfolio Piece

**Example — Guitar:**
- Basics: Open Chords → Strumming Patterns → Finger Exercises
- Intermediate: Barre Chords → Scales → Fingerpicking
- Advanced: Improvisation → Song Writing → Performance

Nodes unlock after completing a streak threshold (e.g., 3-day streak unlocks next node).

## Streak Rules

- **What counts:** A user must complete a practice session (submit media + receive AI feedback) to count as a practice day.
- **Timezone:** Uses the device's local timezone. The "day" resets at midnight local time.
- **Reset window:** If `last_practice_date` is not yesterday (local time), streak resets to 0 — unless a freeze token is consumed.
- **Freeze tokens:** Automatically consumed if the user misses exactly 1 day. Missing 2+ consecutive days resets the streak even with tokens remaining. Premium users receive 2 tokens/month (on billing cycle renewal via RevenueCat webhook).
- **Streak check:** Runs on app open and before displaying the home screen.

## Screens Summary

| # | Screen | Purpose |
|---|--------|---------|
| 1 | Welcome | App intro, sign up/sign in |
| 2 | Skill Selection | Choose from 20+ skills |
| 3 | Level Selection | Beginner/Intermediate/Advanced |
| 4 | Goal Selection | Creativity/Learn faster/Discipline |
| 5 | Roadmap Preview | Show generated 30-day plan |
| 6 | Daily Challenge | Today's challenge card + stats |
| 7 | Practice Session | Camera/timer/recording |
| 8 | AI Feedback | Structured feedback card |
| 9 | Skill Tree | Interactive node map |
| 10 | Community Feed | Shared practice posts |
| 11 | Post Detail | Single post + comments |
| 12 | Streak Dashboard | Streak stats + history |
| 13 | Badges | Badge collection |
| 14 | Profile | User profile + settings |
| 15 | Settings | Notifications, account |
| 16 | Subscription | Premium upgrade (RevenueCat) |

## Offline & Caching

- **On app open:** Cache current challenge, streak data, and user profile to AsyncStorage
- **Offline read:** User can view their streak, last challenge, and badges without network
- **Offline write:** Practice sessions queue locally and sync when connectivity returns
- **Feed:** Cached last 20 posts for offline browsing
