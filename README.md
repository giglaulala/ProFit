## Supabase Setup

Add your Supabase credentials in `app.json` under `expo.extra`:

```
"supabaseUrl": "https://YOUR_PROJECT.ref.supabase.co",
"supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
```

### Web confirmation callback

1. In the `web` workspace create `.env.local` (or configure the same env vars in hosting) with:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

2. Deploy the new confirmation handler page exposed at `/confirm`. Supabase uses it when users click the email link.
3. In Supabase Dashboard → Authentication → URL Configuration set:
   - `Site URL` (and allowed redirect) to `https://YOUR_DOMAIN/confirm`
   - or pass `options.emailRedirectTo` to `supabase.auth.signUp` pointing at the same page.
4. Once the page loads, it reads Supabase’s `token_hash`/`code` params, calls the appropriate `supabase.auth.verifyOtp`/`exchangeCodeForSession`, and shows the user a success or retry message. If you change the URL, update the `Site URL` so Supabase emits the correct link.

Install dependency:

Optional tables for trainee settings:

```sql
create table if not exists trainee_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  goal text,
  weight numeric,
  height numeric,
  free_days int,
  completed_at timestamptz default now()
);
alter table trainee_settings enable row level security;
create policy "read own settings" on trainee_settings for select using (auth.uid() = id);
create policy "upsert own settings" on trainee_settings for insert with check (auth.uid() = id);
create policy "update own settings" on trainee_settings for update using (auth.uid() = id);
```

```
npm i @supabase/supabase-js @react-native-async-storage/async-storage
```

## AI Chat Setup

The chat assistant runs through the web server at `web/src/app/api/chat/route.ts` and forwards messages to OpenAI.

1. In the `web` workspace, create a `.env.local` file (or set environment variables in your hosting platform) with:

   ```
   OPENAI_API_KEY=sk-************************************
   OPENAI_MODEL=gpt-4o-mini # optional override
   OPENAI_API_URL=https://api.openai.com/v1/chat/completions # optional override for Azure/OpenAI-compatible  endpoints
   ```

2. Start the web server so the mobile client can reach `/api/chat`:

   ```bash
   cd web
   npm install
   npm run dev
   ```

3. Ensure `expo.extra.apiBaseUrl` in `app.json` points to the running web server (Expo replaces `localhost` with your LAN IP automatically).

With the key in place, the in-app chat will return live AI responses instead of the placeholder text.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
