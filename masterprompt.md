# 🤖 BotChat — AI Chatbot App | Claude Code Master Build Prompt

---

## ROLE

You are an expert **React Native / Expo mobile engineer** with deep experience in:
- Building production-grade chat interfaces (WhatsApp-like, iMessage-like)
- Firebase (Firestore real-time, Authentication)
- Supabase Storage (media/file uploads)
- Anthropic Claude API integration
- TypeScript-first mobile development
- Smooth animations with React Native Reanimated
- Clean, scalable folder architecture

You write clean, fully typed TypeScript code. You never use `any` types.
You follow React Native performance best practices at all times.
You build one phase at a time and confirm the app runs before moving forward.

---

## TASK

Build a fully functional **AI-powered chatbot mobile application** called **BotChat** using React Native with Expo. The app must simulate a real-time messaging experience — visually and functionally indistinguishable from a native messaging app like WhatsApp or iMessage — but powered by an AI backend (Anthropic Claude API).

The project must be built in **12 sequential phases**. Do not skip phases. Do not merge phases. After every phase, the app must run without errors before proceeding.

---

## CONTENT

### App Summary

| Property | Value |
|---|---|
| App Name | BotChat |
| Framework | React Native + Expo (managed workflow, TypeScript) |
| Navigation | Expo Router (file-based routing) |
| Database | Firebase Firestore (real-time) |
| Authentication | Firebase Auth (email/password) |
| Media Storage | Supabase Storage Buckets |
| AI Backend | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| State Management | Zustand |
| Animations | React Native Reanimated |
| Styling | StyleSheet API + custom theme system |
| Local Storage | AsyncStorage |

---

## CONSTRAINTS

- Build **one phase at a time** — never proceed to the next phase until the current one compiles and runs
- Use **functional components and hooks only** — no class components ever
- All components must be **fully typed with TypeScript** — absolutely no `any` types
- All Firebase real-time listeners must be **properly unsubscribed** in `useEffect` cleanup functions
- All environment variables must be stored in `.env` — **no API keys hardcoded** anywhere in source files
- Use `npx expo install` for all Expo-compatible packages to avoid SDK version conflicts
- The Anthropic API call will be made directly from the app (client-side) for this development build — document this in a `SECURITY.md` file noting it must be moved behind a backend proxy before production deployment
- If a phase introduces a new file, **create the file fully** before referencing it elsewhere
- Every screen must handle these three states: **loading**, **error**, and **empty**
- The app must work on both **iOS and Android**

---

## PROJECT FOLDER STRUCTURE

Generate this complete folder structure before writing any code:

```
/app
  /(auth)
    _layout.tsx
    login.tsx
    register.tsx
  /(tabs)
    _layout.tsx
    index.tsx          # Conversations list (Home)
    profile.tsx        # User profile & settings
  /chat
    [id].tsx           # Dynamic chat screen per conversation
  _layout.tsx          # Root layout with auth guard

/components
  /chat
    MessageBubble.tsx
    TypingIndicator.tsx
    ChatInput.tsx
    MessageList.tsx
    DateSeparator.tsx
  /conversations
    ConversationItem.tsx
    ConversationList.tsx
    BotPickerModal.tsx
  /shared
    Avatar.tsx
    Header.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
    OfflineBanner.tsx
    StatusIcon.tsx

/hooks
  useChat.ts
  useAuth.ts
  useConversations.ts
  useTheme.ts
  useNetworkStatus.ts

/services
  firebase.ts
  anthropic.ts
  supabase.ts

/store
  chatStore.ts
  authStore.ts

/context
  ThemeContext.tsx

/types
  index.ts

/constants
  theme.ts
  bots.ts

/utils
  formatTime.ts
  generateId.ts

SECURITY.md
.env
.env.example
```

---

## Phase 1 — Project Initialization & Configuration

### Step 1.1 — Expo Project Bootstrap

Run the following command to initialize the project:

```bash
npx create-expo-app@latest botchat --template blank-typescript
cd botchat
```

### Step 1.2 — Install All Dependencies

Run each group separately to catch errors early:

```bash
# Navigation (Expo Router)
npx expo install expo-router react-native-screens react-native-safe-area-context

# Firebase
npm install firebase

# Supabase
npm install @supabase/supabase-js

# Animations
npx expo install react-native-reanimated react-native-gesture-handler

# Storage & Media
npx expo install @react-native-async-storage/async-storage
npx expo install expo-image-picker
npx expo install expo-haptics

# UI & Utilities
npx expo install expo-linear-gradient
npx expo install expo-font
npm install zustand
npm install date-fns
npm install react-native-uuid

# Icons
npm install @expo/vector-icons

# Network
npx expo install @react-native-community/netinfo
```

### Step 1.3 — Configure `app.json`

Update `app.json` with the following:

```json
{
  "expo": {
    "name": "BotChat",
    "slug": "botchat",
    "version": "1.0.0",
    "scheme": "botchat",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0084FF"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      [
        "expo-image-picker",
        {
          "photosPermission": "BotChat needs access to your photos to update your profile picture."
        }
      ]
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.botchat.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0084FF"
      },
      "package": "com.botchat.app"
    }
  }
}
```

### Step 1.4 — Environment Variables

Create `.env` at the root:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_ANTHROPIC_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Create `.env.example` with the same keys but empty values.
Add `.env` to `.gitignore`.

### Step 1.5 — SECURITY.md

Create `SECURITY.md` at the root with the following content:

```markdown
# Security Notes

## Anthropic API Key
The Anthropic API is currently called directly from the client (React Native app).
This is acceptable for local development and portfolio demonstration only.

Before any public or production deployment:
- Move all Anthropic API calls to a backend server (e.g. Firebase Cloud Functions, Express.js)
- The client should call YOUR backend endpoint, which in turn calls Anthropic
- Never expose the Anthropic API key in a shipped mobile binary

## Firebase Rules
Firestore security rules are scoped per user. Review and tighten rules before production.

## Supabase
The anon key is safe to expose in client apps as long as Row Level Security (RLS) 
policies are correctly configured on your Supabase project.
```

---

## Phase 2 — Types, Theme & Constants

### Step 2.1 — TypeScript Types (`/types/index.ts`)

Define every interface the app will use:

```typescript
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';
export type BotCategory = 'assistant' | 'companion' | 'expert' | 'fun';
export type ThemeMode = 'light' | 'dark';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  avatarColor: string;
  avatarInitials: string;
  personality: string;
  category: BotCategory;
  isOnline: boolean;
  categoryLabel: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status: MessageStatus;
  mediaUrl?: string | null;
}

export interface Conversation {
  id: string;
  userId: string;
  botId: string;
  bot: Bot;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  createdAt: Date;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  primary: string;
  primaryDark: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  bubbleUser: string;
  bubbleUserText: string;
  bubbleBot: string;
  bubbleBotText: string;
  border: string;
  online: string;
  offline: string;
  unreadBadge: string;
  inputBackground: string;
  header: string;
  headerText: string;
  error: string;
  success: string;
  warning: string;
  overlay: string;
}
```

### Step 2.2 — Theme Constants (`/constants/theme.ts`)

```typescript
import { ThemeColors } from '../types';

export const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  surfaceSecondary: '#EFEFEF',
  primary: '#0084FF',
  primaryDark: '#0066CC',
  text: '#1A1A1A',
  textSecondary: '#8E8E93',
  textInverse: '#FFFFFF',
  bubbleUser: '#0084FF',
  bubbleUserText: '#FFFFFF',
  bubbleBot: '#F0F0F0',
  bubbleBotText: '#1A1A1A',
  border: '#E5E5EA',
  online: '#34C759',
  offline: '#8E8E93',
  unreadBadge: '#0084FF',
  inputBackground: '#F2F2F7',
  header: '#FFFFFF',
  headerText: '#1A1A1A',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  overlay: 'rgba(0,0,0,0.4)',
};

export const darkTheme: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  primary: '#0084FF',
  primaryDark: '#0066CC',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textInverse: '#000000',
  bubbleUser: '#0084FF',
  bubbleUserText: '#FFFFFF',
  bubbleBot: '#2C2C2E',
  bubbleBotText: '#FFFFFF',
  border: '#38383A',
  online: '#30D158',
  offline: '#636366',
  unreadBadge: '#0084FF',
  inputBackground: '#1C1C1E',
  header: '#1C1C1E',
  headerText: '#FFFFFF',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  overlay: 'rgba(0,0,0,0.6)',
};
```

### Step 2.3 — Bots Configuration (`/constants/bots.ts`)

```typescript
import { Bot } from '../types';

export const BOTS: Bot[] = [
  {
    id: 'bot_aria',
    name: 'Aria',
    description: 'Your everyday AI assistant for any task',
    avatarColor: '#0084FF',
    avatarInitials: 'AR',
    personality: `You are Aria, a warm, helpful, and concise AI assistant. 
You help users with everyday tasks, questions, and problems. 
Keep responses friendly, clear, and under 3 sentences unless the user needs more detail. 
Never break character.`,
    category: 'assistant',
    isOnline: true,
    categoryLabel: 'Assistant',
  },
  {
    id: 'bot_max',
    name: 'Max',
    description: 'Senior coding expert & tech advisor',
    avatarColor: '#FF6B35',
    avatarInitials: 'MX',
    personality: `You are Max, a senior software engineer with 15 years of experience 
across all major programming languages and frameworks. You give precise, correct, 
well-explained technical help. Always use markdown code blocks for code samples. 
Be direct and technical. Never break character.`,
    category: 'expert',
    isOnline: true,
    categoryLabel: 'Tech Expert',
  },
  {
    id: 'bot_luna',
    name: 'Luna',
    description: 'Creative writing & storytelling companion',
    avatarColor: '#9B59B6',
    avatarInitials: 'LN',
    personality: `You are Luna, a creative and imaginative writing companion. 
You help with stories, poetry, brainstorming, scripts, and all creative expression. 
Your tone is lyrical, warm, and deeply inspiring. 
Always encourage the user's creativity. Never break character.`,
    category: 'companion',
    isOnline: true,
    categoryLabel: 'Creative',
  },
  {
    id: 'bot_rex',
    name: 'Rex',
    description: 'Fitness coach & wellness advisor',
    avatarColor: '#27AE60',
    avatarInitials: 'RX',
    personality: `You are Rex, an energetic and highly motivating fitness coach and wellness advisor. 
You give practical, science-backed advice on workouts, nutrition, recovery, and mental wellness. 
Keep responses actionable, specific, and encouraging. Never break character.`,
    category: 'expert',
    isOnline: false,
    categoryLabel: 'Fitness',
  },
  {
    id: 'bot_zara',
    name: 'Zara',
    description: 'Fun facts, trivia & curiosity explorer',
    avatarColor: '#E74C3C',
    avatarInitials: 'ZR',
    personality: `You are Zara, an enthusiastic trivia master and fun facts explorer. 
You make every topic fascinating and surprising. 
Always add an unexpected "Did you know?" angle to your responses. 
Be energetic, playful, and genuinely excited about knowledge. Never break character.`,
    category: 'fun',
    isOnline: true,
    categoryLabel: 'Fun & Trivia',
  },
];
```

---

## Phase 3 — Services Layer

### Step 3.1 — Firebase Service (`/services/firebase.ts`)

Initialize Firebase with the following:
- Import `initializeApp`, `getApps`, `getApp` from `firebase/app`
- Import `getAuth` from `firebase/auth`
- Import `getFirestore` from `firebase/firestore`
- Read all config values from `EXPO_PUBLIC_` environment variables
- Use `getApps().length` guard to prevent double initialization
- Export: `app`, `auth`, `db`
- Export helper functions:
  - `createUserDocument(uid, data)` — creates doc at `users/{uid}`
  - `getUserDocument(uid)` — fetches doc at `users/{uid}`
  - `updateUserDocument(uid, data)` — updates doc at `users/{uid}`

**Firestore Collections Structure:**
```
users/{uid}
  - uid: string
  - email: string
  - displayName: string
  - avatarUrl: string | null
  - createdAt: Timestamp

conversations/{conversationId}
  - id: string
  - userId: string
  - botId: string
  - bot: Bot object (full snapshot)
  - lastMessage: string
  - lastMessageTime: Timestamp
  - unreadCount: number
  - createdAt: Timestamp

messages/{conversationId}/msgs/{messageId}
  - id: string
  - conversationId: string
  - content: string
  - role: 'user' | 'assistant'
  - timestamp: Timestamp
  - status: MessageStatus
  - mediaUrl: string | null
```

**Firestore Security Rules — apply these in Firebase Console:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /conversations/{convId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }

    match /messages/{convId}/msgs/{msgId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3.2 — Supabase Service (`/services/supabase.ts`)

- Initialize Supabase client using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Create a storage bucket named `avatars` (set to public in Supabase dashboard)
- Export the following functions:

```typescript
// Upload avatar image and return public URL
uploadAvatar(uri: string, userId: string): Promise<string>
// Steps inside:
// 1. Fetch the file from the local URI
// 2. Convert to blob/ArrayBuffer
// 3. Upload to path: avatars/{userId}/avatar.jpg
// 4. Call getPublicUrl() and return the URL string
// 5. On error, throw with a descriptive message

// Delete avatar for a user
deleteAvatar(userId: string): Promise<void>
```

### Step 3.3 — Anthropic Service (`/services/anthropic.ts`)

```typescript
// Main function signature
sendMessageToBot(
  messages: AnthropicMessage[],
  systemPrompt: string
): Promise<string>

// Implementation details:
// - URL: https://api.anthropic.com/v1/messages
// - Method: POST
// - Headers:
//     x-api-key: EXPO_PUBLIC_ANTHROPIC_API_KEY
//     anthropic-version: 2023-06-01
//     content-type: application/json
// - Body:
//     model: "claude-sonnet-4-20250514"
//     max_tokens: 1024
//     system: systemPrompt
//     messages: messages array
// - Extract reply from: response.content[0].text
// - On any error: return "I'm having trouble responding right now. Please try again."
// - Log errors to console but never crash the app
```

---

## Phase 4 — Auth & Theme Context

### Step 4.1 — Theme Context (`/context/ThemeContext.tsx`)

- Create a `ThemeContext` with `{ theme, themeMode, toggleTheme }`
- On mount, read saved `themeMode` from `AsyncStorage` (key: `'@botchat_theme'`)
- Default to `'light'` if nothing is stored
- `toggleTheme()` switches between light/dark and saves to `AsyncStorage`
- Export `useTheme()` convenience hook
- Wrap entire app in `ThemeProvider`

### Step 4.2 — Auth Store (`/store/authStore.ts`)

Zustand store:

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}
```

### Step 4.3 — Chat Store (`/store/chatStore.ts`)

Zustand store:

```typescript
interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  updateLastMessage: (conversationId: string, message: string, time: Date) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  removeConversation: (conversationId: string) => void;
}
```

### Step 4.4 — Auth Hook (`/hooks/useAuth.ts`)

- On mount, set up `onAuthStateChanged` Firebase listener
- When user is logged in: fetch their Firestore document, set to `authStore`
- When logged out: call `authStore.clearUser()`
- Clean up the listener in `useEffect` return
- Export `{ user, isLoading }` from the store

---

## Phase 5 — Authentication Screens

### Step 5.1 — Root Layout (`/app/_layout.tsx`)

- Import `useAuth` hook
- While `isLoading === true`: render a full-screen `LoadingSpinner` component centered on screen
- If `user` exists: redirect to `/(tabs)/`
- If no `user`: redirect to `/(auth)/login`
- Wrap with `ThemeProvider`
- Initialize the auth listener here using `useAuth()`

### Step 5.2 — Auth Layout (`/app/(auth)/_layout.tsx`)

- Simple Stack navigator for auth screens
- No header shown
- Background matches theme

### Step 5.3 — Login Screen (`/app/(auth)/login.tsx`)

Build the complete login screen with this exact layout (top to bottom):

1. **Top half (decorative):**
   - Gradient background from `primary` to `primaryDark`
   - Large robot emoji or SVG icon (80px)
   - App name "BotChat" in white, 32px bold
   - Tagline "Chat smarter, not harder" in white, 16px

2. **Bottom half (form card):**
   - White/surface card with rounded top corners (24px radius)
   - "Welcome back" heading, 24px bold
   - Email `TextInput` with email icon — keyboard type `email-address`, auto-capitalize `none`
   - Password `TextInput` with lock icon — `secureTextEntry`, toggle show/hide button
   - Error message in red if auth fails
   - "Sign In" primary button — full width, brand color, 16px bold text
   - Shows `ActivityIndicator` inside button while loading — disables button
   - "Don't have an account? **Register**" link at bottom

**Firebase logic:**
- Call `signInWithEmailAndPassword(auth, email, password)`
- On success: auth state change will handle navigation automatically
- On error: display user-friendly messages:
  - `auth/user-not-found` → "No account found with this email"
  - `auth/wrong-password` → "Incorrect password"
  - `auth/too-many-requests` → "Too many attempts. Try again later."
  - Default → "Sign in failed. Please try again."

### Step 5.4 — Register Screen (`/app/(auth)/register.tsx`)

Same layout structure as login with these fields:

1. Full name `TextInput` (auto-capitalize words)
2. Email `TextInput`
3. Password `TextInput` (min 6 characters, show strength indicator)
4. Confirm password `TextInput`
5. Validation: passwords must match, email must be valid format, name must not be empty
6. "Create Account" primary button with loading state

**Firebase logic:**
- Call `createUserWithEmailAndPassword(auth, email, password)`
- Call `updateProfile(userCredential.user, { displayName })`
- Create Firestore document at `users/{uid}` with full User object
- On success: auth state change handles navigation

---

## Phase 6 — Conversations List (Home Screen)

### Step 6.1 — useConversations Hook (`/hooks/useConversations.ts`)

```typescript
// Returns
{
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  startConversation: (bot: Bot) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  refreshConversations: () => void;
}

// Implementation:
// - Query Firestore: conversations where userId == currentUser.uid
// - orderBy('lastMessageTime', 'desc')
// - Use onSnapshot for real-time updates
// - Unsubscribe on cleanup
// - startConversation(bot):
//     1. Check if conversation with this botId already exists for user
//     2. If yes: navigate to existing conversation
//     3. If no: create new Firestore document, then navigate
// - deleteConversation(id):
//     1. Delete conversation document
//     2. Delete all messages in messages/{id}/msgs subcollection
```

### Step 6.2 — ConversationItem Component (`/components/conversations/ConversationItem.tsx`)

Renders a single conversation row with:

- **Left:** Circular bot avatar (48px) using bot's `avatarColor` as background, `avatarInitials` as white text (18px bold). A green/grey dot (10px) positioned bottom-right of avatar indicating online status
- **Middle:** Bot name (16px bold, theme text color) on top. Last message preview below (14px, `textSecondary`, 1 line truncated with ellipsis)
- **Right:** Timestamp (12px, `textSecondary`) on top. Unread count badge (blue circle, white number, 10px) below — hidden when `unreadCount === 0`
- **Separator:** thin 1px line between items (indented to align with text, not avatar)
- **Press:** Navigate to `/chat/${conversation.id}`, call `clearUnread(conversation.id)`
- **Long press:** Show action sheet with "Delete Conversation" option

### Step 6.3 — BotPickerModal Component (`/components/conversations/BotPickerModal.tsx`)

A bottom sheet modal that shows all available bots:

- Slides up from bottom using Reanimated
- Dark overlay behind it (tappable to dismiss)
- Handle bar at top
- Title: "Choose a Bot"
- Renders each bot as a row:
  - Colored avatar with initials
  - Bot name (bold) + description (secondary text)
  - Category badge (small pill, colored by category)
  - Online indicator
  - Chevron right
- Tapping a bot calls `startConversation(bot)` and closes modal

### Step 6.4 — Home Screen (`/app/(tabs)/index.tsx`)

Full conversations list screen:

**Header:**
- "BotChat" title (left, bold, 24px)
- Search icon button (right)
- Edit/Compose icon button (right)

**Search bar:**
- Appears below header when search icon is tapped (animated slide down)
- Filters conversation list by bot name in real time
- Dismiss button to hide

**Body:**
- While loading: show 5 skeleton loading placeholder rows (animated shimmer)
- On error: error message with retry button
- If no conversations: `EmptyState` component with a chat bubble icon, "No conversations yet", "Start by picking a bot to chat with" subtitle, and a "Browse Bots" primary button
- If conversations exist: `FlatList` of `ConversationItem` components

**Floating Action Button (FAB):**
- Bottom-right corner
- Blue circle, `+` icon or compose icon
- Shadow/elevation
- Scale animation on press (haptic feedback)
- Opens `BotPickerModal`

---

## Phase 7 — Chat Screen

### Step 7.1 — useChat Hook (`/hooks/useChat.ts`)

```typescript
// Input
conversationId: string
bot: Bot

// Returns
{
  messages: Message[];
  loading: boolean;
  isTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

// sendMessage(content) full implementation:
// 1. Create a user message object with status 'sending', unique ID, current timestamp
// 2. Append to local messages state immediately (optimistic UI)
// 3. Save to Firestore: messages/{conversationId}/msgs/{messageId}
// 4. Update conversation document: lastMessage, lastMessageTime
// 5. Set isTyping = true
// 6. Calculate realistic delay: Math.min(500 + content.length * 10, 3000)
// 7. Wait for that delay using setTimeout/Promise
// 8. Build messages array for Anthropic: map all messages to { role, content }
// 9. Call anthropic.sendMessageToBot(messagesArray, bot.personality)
// 10. Create assistant message object, save to Firestore
// 11. Update user message status to 'read' in Firestore
// 12. Update conversation lastMessage with bot's reply
// 13. Set isTyping = false
// 14. On any error: append an error message bubble, set isTyping = false

// Pagination:
// - Initial load: last 20 messages (orderBy timestamp desc, limit 20)
// - loadMoreMessages(): fetch next 20 before the oldest loaded message
// - Use onSnapshot for real-time updates on initial page
```

### Step 7.2 — MessageBubble Component (`/components/chat/MessageBubble.tsx`)

**User bubble (right side):**
- Container aligned `flex-end`
- Bubble: `backgroundColor: bubbleUser`, `borderRadius: 18`, `borderBottomRightRadius: 4`
- Text: `color: bubbleUserText`, `fontSize: 16`, `lineHeight: 22`
- Max width: `75%` of screen width
- Padding: 10px horizontal, 8px vertical
- Below bubble row (right-aligned): timestamp (11px, textSecondary) + `StatusIcon` component
- Entrance animation: `FadeIn + SlideInRight` (Reanimated, 300ms)

**Bot bubble (left side):**
- Container aligned `flex-start`
- Bot avatar (28px circle) to the left, vertically bottom-aligned
- Bubble: `backgroundColor: bubbleBot`, `borderRadius: 18`, `borderBottomLeftRadius: 4`
- Text: `color: bubbleBotText`, `fontSize: 16`, `lineHeight: 22`
- Max width: `75%` of screen width
- Below bubble: timestamp (11px, textSecondary)
- Entrance animation: `FadeIn + SlideInLeft` (Reanimated, 300ms)

**StatusIcon Component (`/components/shared/StatusIcon.tsx`):**
- `sending` → single grey clock icon (12px)
- `sent` → single grey checkmark (12px)
- `delivered` → double grey checkmark (12px)
- `read` → double blue checkmark (12px)
- `error` → red exclamation circle (12px)

### Step 7.3 — TypingIndicator Component (`/components/chat/TypingIndicator.tsx`)

- Renders as a bot bubble (left-aligned, with bot avatar)
- Contains three circles (8px diameter each, `textSecondary` color)
- Each dot animates: `translateY` from 0 to -6 and back using `withRepeat(withSequence(...))`
- Staggered delays: dot 1 = 0ms, dot 2 = 150ms, dot 3 = 300ms
- The entire indicator fades in with `FadeIn` when mounted
- Fades out with `FadeOut` when unmounted
- Wrap in `AnimatePresence`-equivalent logic using conditional rendering + Reanimated

### Step 7.4 — ChatInput Component (`/components/chat/ChatInput.tsx`)

```
|  [📎]  [     Message...     (grows up to 5 lines)     ]  [➤]  |
```

- Sticky to bottom of screen
- Background: `surface`, top border: 1px `border` color
- Left icon: attachment (📎) — on press, calls `expo-image-picker`, uploads to Supabase, sends as message with `mediaUrl`
- `TextInput`: multiline, placeholder "Message...", auto-grows, max height = 5 lines
- Right button: paper plane icon, `primary` color when text is not empty, `textSecondary` when empty, disabled when empty
- `KeyboardAvoidingView`: behavior `padding` on iOS, `height` on Android
- On send: call `sendMessage(text)`, clear input, light haptic feedback

### Step 7.5 — DateSeparator Component (`/components/chat/DateSeparator.tsx`)

- Renders between messages when date changes
- Centered horizontal line with date label in the middle
- Label text: result of `formatDateSeparator(date)` util
- Text: 12px, `textSecondary`, slightly rounded pill background

### Step 7.6 — Chat Screen (`/app/chat/[id].tsx`)

**Header:**
- Back arrow (left) — navigates back with haptic
- Bot avatar (36px circle with initials + color)
- Bot name (bold, 16px) + status text below:
  - If `isTyping`: "typing..." in `primary` color, animated fade in/out
  - If `bot.isOnline`: "Online" with green dot
  - If offline: "Offline" with grey dot
- Three-dot menu icon (right) opens an Action Sheet with:
  - "Bot Info" → shows a modal with bot name, description, category, personality summary
  - "Clear Chat" → confirmation alert → deletes all messages in Firestore subcollection
  - "Cancel"

**Message List:**
- Inverted `FlatList` (newest messages at bottom)
- `keyExtractor`: use `message.id`
- Renders `MessageBubble` for each message
- Renders `DateSeparator` between messages when the date changes
- On new message: auto-scroll to bottom (animated)
- Pull up (inverted FlatList pull down) to load older messages (`loadMoreMessages`)
- Shows loading spinner at top while loading more
- Empty state: centered bot avatar (64px) + "Say hello to {bot.name}! 👋" + subtitle "Start the conversation"

**TypingIndicator** renders below the last message when `isTyping === true`

**ChatInput** pinned at bottom

---

## Phase 8 — Profile Screen

### Step 8.1 — Profile Screen (`/app/(tabs)/profile.tsx`)

Build the profile and settings screen:

**Profile Section (top):**
- Large avatar (80px circle) — shows user's `avatarUrl` if set, otherwise initials from `displayName`
- Small camera icon overlay on avatar (bottom-right) — tappable
- On avatar tap: `expo-image-picker` opens photo library → on selection, upload to Supabase bucket `avatars/{uid}/avatar.jpg` → update Firestore user document → update Firebase Auth profile
- Display name below avatar (20px bold) — tappable to open edit name modal
- Email below name (14px, textSecondary) — not editable

**Settings Section:**
Each item is a `TouchableOpacity` row with icon (left), label, and control or chevron (right):

| Icon | Label | Control |
|---|---|---|
| 🌙 | Dark Mode | Toggle switch |
| 🔔 | Notifications | Toggle switch (cosmetic only for now) |
| 💬 | Message Sound | Toggle switch (cosmetic only) |

**Data Section:**
| Icon | Label | Action |
|---|---|---|
| 🗑️ | Clear All Conversations | Alert confirmation → delete all user's conversations + messages |
| 📤 | Export Chat History | Show "Coming soon" toast |

**About Section:**
| Icon | Label | Value |
|---|---|---|
| ℹ️ | App Version | 1.0.0 |
| 🔒 | Privacy Policy | Placeholder link |
| ⭐ | Rate BotChat | Placeholder |

**Sign Out Button:**
- Full width, `error` color border, `error` color text
- Calls `signOut(auth)` on press
- Shows confirmation alert first: "Are you sure you want to sign out?"

---

## Phase 9 — Shared Components

### Step 9.1 — Avatar Component (`/components/shared/Avatar.tsx`)

Props: `size: number`, `imageUrl?: string | null`, `initials: string`, `color: string`

- If `imageUrl` is provided: show `Image` component (circular, `size x size`)
- If not: show colored circle with `initials` text centered
- Text size scales with avatar size: `size * 0.35`
- Circular via `borderRadius: size / 2`

### Step 9.2 — EmptyState Component (`/components/shared/EmptyState.tsx`)

Props: `icon: string`, `title: string`, `subtitle?: string`, `actionLabel?: string`, `onAction?: () => void`

- Centered vertically and horizontally
- Large icon/emoji (56px)
- Title text (18px bold)
- Subtitle (14px, textSecondary, centered)
- Optional primary button at bottom

### Step 9.3 — LoadingSpinner Component (`/components/shared/LoadingSpinner.tsx`)

Props: `fullScreen?: boolean`, `size?: 'small' | 'large'`, `color?: string`

- If `fullScreen`: centers in a flex-1 container
- Uses `ActivityIndicator`

### Step 9.4 — OfflineBanner Component (`/components/shared/OfflineBanner.tsx`)

- Sits at the top of the screen (below status bar)
- Red background, white text: "No internet connection"
- WiFi-off icon on the left
- Slides down with Reanimated when offline, slides up when online
- Uses `useNetworkStatus` hook

### Step 9.5 — useNetworkStatus Hook (`/hooks/useNetworkStatus.ts`)

- Uses `@react-native-community/netinfo`
- Returns `{ isConnected: boolean }`
- Subscribes to NetInfo and returns real-time connection state

---

## Phase 10 — Utility Functions

### Step 10.1 — Time Formatter (`/utils/formatTime.ts`)

```typescript
// formatMessageTime(date: Date): string
// Rules:
// - Less than 1 min ago → "just now"
// - 1–59 minutes ago → "Xm" (e.g. "5m")
// - 60–23:59 hours ago → "HH:mm" (e.g. "14:30")
// - Yesterday → "Yesterday"
// - 2–6 days ago → day name (e.g. "Monday")
// - 7+ days ago → "DD/MM/YY"

// formatDateSeparator(date: Date): string
// Rules:
// - Today → "Today"
// - Yesterday → "Yesterday"
// - 2–6 days ago → full day name (e.g. "Monday")
// - 7+ days ago → "DD MMMM YYYY" (e.g. "5 January 2025")

// Use date-fns for all date calculations
```

### Step 10.2 — ID Generator (`/utils/generateId.ts`)

```typescript
// generateId(): string
// Uses react-native-uuid to generate a v4 UUID
// Export as a named function
```

---

## Phase 11 — Animations & Polish

Apply all of the following after all screens are functional:

### Step 11.1 — Message Bubble Animations
- All bubbles enter with `FadeIn` + directional slide (user: right, bot: left)
- Duration: 250ms, easing: `Easing.out(Easing.quad)`
- Use `entering` prop on Animated views

### Step 11.2 — Typing Indicator
- Smooth mount/unmount transitions
- Dot bounce loop must feel natural, not mechanical

### Step 11.3 — Screen Transitions
- Auth screens: fade transition
- Chat screen: slide from right (default stack behavior)
- Modal: slide from bottom

### Step 11.4 — Micro-interactions
- FAB: `useSharedValue` scale spring animation on press
- ConversationItem: subtle background highlight on press
- Send button: scale down on press, scale back up on release
- Tab bar icons: scale 1.0 → 1.15 on press

### Step 11.5 — Haptic Feedback (using `expo-haptics`)
- Send message: `ImpactFeedbackStyle.Light`
- Delete conversation: `ImpactFeedbackStyle.Medium`
- Sign out: `ImpactFeedbackStyle.Medium`
- FAB press: `ImpactFeedbackStyle.Light`

---

## Phase 12 — Performance, Error Handling & Final Checklist

### Step 12.1 — Performance Optimizations

- Wrap `MessageBubble` and `ConversationItem` with `React.memo`
- Use `useCallback` on all event handlers passed as props
- FlatList props to set:
  - `removeClippedSubviews={true}`
  - `maxToRenderPerBatch={10}`
  - `windowSize={10}`
  - `initialNumToRender={15}`
- Use `InteractionManager.runAfterInteractions` for non-critical post-navigation work

### Step 12.2 — Global Error Handling

- Wrap root layout with an error boundary component
- All async functions wrapped in `try/catch`
- Firebase errors mapped to user-friendly strings
- API errors handled gracefully (bot sends error bubble, never crashes)

### Step 12.3 — Final Pre-Launch Checklist

```
CONFIGURATION
[ ] .env file has all 9 keys filled
[ ] .env is in .gitignore
[ ] .env.example committed with empty values
[ ] SECURITY.md committed

AUTHENTICATION
[ ] Register creates user in Firebase Auth + Firestore
[ ] Login works with correct credentials
[ ] Correct error messages show for wrong credentials
[ ] Auth guard redirects unauthenticated users to login
[ ] Sign out works and clears all state

CONVERSATIONS
[ ] Conversations list loads in real-time
[ ] Unread badges show and clear correctly
[ ] Deleting a conversation removes it and its messages
[ ] Empty state shows when no conversations
[ ] Search filters correctly

CHAT
[ ] All 5 bots respond with correct personalities
[ ] Typing indicator appears and disappears correctly
[ ] Message status: sending → sent → read updates correctly
[ ] Date separators appear correctly between days
[ ] Pagination loads older messages
[ ] Clear chat deletes all messages

PROFILE
[ ] Avatar upload works via Supabase
[ ] Display name edit updates Firestore + UI
[ ] Dark mode toggle persists across app restarts
[ ] Clear all conversations works with confirmation

GENERAL
[ ] App works on iOS simulator
[ ] App works on Android emulator
[ ] Dark mode looks correct on all screens
[ ] Offline banner appears when network drops
[ ] No TypeScript errors (run: npx tsc --noEmit)
[ ] No console errors or warnings in production build
```

### Step 12.4 — Run the App

```bash
npx expo start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go for physical device
```

---

*End of BotChat Master Build Prompt*