# Monthly Goals System - SQL Schema

This SQL schema creates a comprehensive monthly goals tracking system for the ProFit app using Supabase.

## Tables Created

### 1. `monthly_goals`

Stores user's monthly goal targets:

- `workout_goal`: Target number of workouts per month (default: 20)
- `calorie_goal`: Target calories to burn per month (default: 10,000)
- `minute_goal`: Target minutes to exercise per month (default: 1,200)

### 2. `monthly_progress`

Tracks user's monthly progress:

- `workouts_completed`: Number of workouts completed this month
- `calories_burned`: Total calories burned this month
- `minutes_exercised`: Total minutes exercised this month

### 3. `weekly_progress`

Tracks user's weekly progress:

- `workouts_completed`: Number of workouts completed this week
- `calories_burned`: Total calories burned this week
- `minutes_exercised`: Total minutes exercised this week

## Functions Created

### 1. `get_or_create_monthly_goals(p_user_id UUID)`

- Gets existing monthly goals or creates default ones
- Returns: workout_goal, calorie_goal, minute_goal

### 2. `get_monthly_progress(p_user_id UUID)`

- Gets current month's progress
- Returns: workouts_completed, calories_burned, minutes_exercised

### 3. `get_weekly_progress(p_user_id UUID)`

- Gets current week's progress
- Returns: workouts_completed, calories_burned, minutes_exercised

### 4. `update_monthly_progress(p_user_id UUID, p_workouts INTEGER, p_calories INTEGER, p_minutes INTEGER)`

- Updates monthly progress counters
- Can be used to add or subtract progress

### 5. `update_weekly_progress(p_user_id UUID, p_workouts INTEGER, p_calories INTEGER, p_minutes INTEGER)`

- Updates weekly progress counters
- Can be used to add or subtract progress

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- All functions are SECURITY DEFINER for controlled access

## Usage in App

1. **Load Goals**: Call `get_or_create_monthly_goals()` on app startup
2. **Load Progress**: Call `get_monthly_progress()` and `get_weekly_progress()` on app startup
3. **Update Progress**: Call `update_monthly_progress()` and `update_weekly_progress()` when workouts are completed
4. **Unmark Workout**: Call update functions with negative values to decrease counters

## Installation

Run this SQL script in your Supabase SQL editor to create the tables and functions.
