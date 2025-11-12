# Achievements System - Supabase Schema

This SQL script provisions the tables and policies required for the in-app achievements feature (`First Workout`, `7 Day Challenge`, `30 Day Challenge`). Run it in the Supabase SQL editor before shipping the feature.

## Objects Created

### 1. `user_achievements`

Stores each user's achievement state:

- `user_id` (`uuid`) – references `auth.users`
- `achievement_id` (`text`) – matches the IDs defined in `constants/Achievements.ts`
- `unlocked` (`boolean`) – whether the achievement has been unlocked
- `progress` (`integer`) – latest progress value (clamped to the target threshold)
- `unlocked_at` (`timestamptz`) – timestamp of the first unlock (nullable)
- `updated_at` (`timestamptz`) – auto-updated timestamp for auditing

Primary key: `(user_id, achievement_id)`

### 2. Row Level Security (RLS)

`user_achievements` has RLS enabled with the following policies:

- Select: users can read only their own rows
- Insert: users can create rows only for themselves
- Update: users can update only their own rows

## Installation

```sql
-- Achievements storage
create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  unlocked boolean not null default false,
  progress integer not null default 0,
  unlocked_at timestamptz null,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_achievements_pkey primary key (user_id, achievement_id),
  constraint user_achievements_achievement_id_check check (achievement_id <> '')
);

alter table public.user_achievements enable row level security;

create policy "Achievements select own"
  on public.user_achievements
  for select
  using (auth.uid() = user_id);

create policy "Achievements insert own"
  on public.user_achievements
  for insert
  with check (auth.uid() = user_id);

create policy "Achievements update own"
  on public.user_achievements
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: keep updated_at fresh on write
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists user_achievements_set_updated_at on public.user_achievements;

create trigger user_achievements_set_updated_at
  before update on public.user_achievements
  for each row
  execute procedure public.set_updated_at();
```

## Usage

1. The app reads existing achievement rows on dashboard/progress load.
2. When workouts are completed, the client computes progress locally and upserts the relevant achievement rows.
3. Unlock timestamps are written once, and subsequent updates leave them unchanged.

> **Note:** The IDs used by the app are:
>
> - `first_workout`
> - `seven_day_challenge`
> - `thirty_day_challenge`

---
