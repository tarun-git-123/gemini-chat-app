# Gemini Chat Studio

A professional chat module built with Next.js, Node.js server routes, and the Gemini API.

## Setup

1. Install dependencies:

   ```bash
   npm.cmd install
   ```

2. Create `.env.local` in this folder:

   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Start the development server:

   ```bash
   npm.cmd run dev
   ```

4. Open `http://localhost:3000`.

## Notes

- The Gemini API key is used only inside `app/api/chat/route.ts`.
- The browser calls `/api/chat`, so the key is never exposed client-side.
- The app uses `gemini-2.5-flash` through Google's recommended `@google/genai` SDK.

