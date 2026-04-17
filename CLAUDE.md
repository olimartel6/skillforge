# Skilly — Project Instructions

## Quick Context
Skilly is a mobile learning app ("Duolingo for business skills") built with Expo SDK 55 / React Native.
Owner: Olivier (Oli). Communication via Telegram in French (terse replies, action over explanation).

## Tech Stack
- **Framework:** Expo SDK 55, React Native 0.83.2, TypeScript
- **State:** Zustand stores (userStore, gameStore, streakStore, challengeStore, communityStore)
- **Backend:** Supabase (project: karztsksjqohxhgxdeje)
- **Payments:** RevenueCat (iOS, key: appl_vJjp...) + Stripe (Android via Edge Functions)
- **Bundle ID:** com.olimartel6.skilly
- **App Store Connect ID:** 6760734423

## Key Files
- `src/utils/gameQuestions.ts` — ALL quiz questions (7000+ lines, ~7000 questions)
- `src/screens/games/GamesHomeScreen.tsx` — Main game screen with module list, paywall, lesson press handler
- `src/screens/games/GameSessionScreen.tsx` — Quiz gameplay with 13 game types
- `src/screens/games/TradingSimScreen.tsx` — Trading simulation (candlestick charts, buy/sell)
- `src/screens/games/MasterSimScreen.tsx` — Decision-based simulation for other skills
- `src/services/purchases.ts` — RevenueCat/Stripe payment handling
- `src/services/liveGame.ts` — Supabase Realtime multiplayer
- `src/store/gameStore.ts` — XP, levels, completed lessons, missed questions
- `src/i18n/` — EN/FR/ES translations
- `src/utils/translations/` — Question translations per skill per language
- `app.json` — App config (version, scheme: "skilly")
- `eas.json` — EAS build config (ascAppId: 6760734423)

## Build & Deploy
```bash
# Build iOS
eas build --platform ios --non-interactive

# Submit to App Store
eas submit --platform ios --latest --non-interactive

# Test locally
npx expo export --platform ios
```
- Version source is REMOTE (eas.json: appVersionSource: "remote")
- Always increment version in app.json for new releases
- `.npmrc` has `legacy-peer-deps=true`
- ios/ has two .xcodeproj — uses "SkillForge 2.xcodeproj"

## Question Format
```typescript
LESSON_QUESTIONS['SkillName']['ModuleName'] = [
  { type: 'multiple_choice', prompt: '...', options: ['A','B','C','D'], correctAnswer: 'B', difficulty: 'easy', explanation: '...' },
  { type: 'true_false', prompt: '...', options: ['True','False'], correctAnswer: 'True', difficulty: 'medium', explanation: '...' },
  { type: 'fill_gap', prompt: 'The ___ is...', options: ['A','B','C','D'], correctAnswer: 'C', difficulty: 'hard', explanation: '...' },
];
```
- 8 questions per module (4-5 MC, 2-3 TF, 1 FG)
- Distribute correctAnswer positions evenly (25% per position)
- NEVER make correct answer always the longest option
- Every question MUST have explanation field
- Max 5 hashtags for TikTok descriptions

## Paywall Logic
- 1 free lesson per day (count increments at START of lesson, not end)
- `isPremium` checks `profile.premium_expires_at > now`
- `syncPremiumStatus` clears premium on failure (catch block sets null)
- App.tsx re-syncs Zustand store after RevenueCat check
- Paywall rendered as overlay (NOT early return) to avoid React hooks crash

## TikTok Carousels
Generator at `/Users/oli/tiktok-generator/`. Pinterest images in `images/pinterest_*/`.
Output to iCloud: `/Users/oli/Library/Mobile Documents/com~apple~CloudDocs/tiktok-carousels/`
Send slides + caption via Telegram. Max 5 hashtags.

## Rules
- Reply to Telegram in French, short and direct
- Never break existing functionality when adding features
- Always verify build passes before submitting
- Shuffle answer positions for new questions
- Each TikTok must be unique (different hook/concept/structure)
