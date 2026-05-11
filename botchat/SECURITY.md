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
