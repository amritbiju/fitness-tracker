-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Exercises Table
create table if not exists exercises (
  id serial primary key,
  name text not null,
  muscle_group text not null,
  is_custom boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table exercises enable row level security;

drop policy if exists "Users can view public exercises" on exercises;
create policy "Users can view public exercises"
  on exercises for select
  using ( is_custom = false );

drop policy if exists "Users can view their own custom exercises" on exercises;
create policy "Users can view their own custom exercises"
  on exercises for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own custom exercises" on exercises;
create policy "Users can insert their own custom exercises"
  on exercises for insert
  with check ( auth.uid() = user_id );

-- Workout Logs Table
create table if not exists workout_logs (
  id uuid primary key default uuid_generate_v4(),
  workout_id text not null,
  exercise_id integer references exercises(id),
  set_number integer not null,
  weight numeric not null,
  reps integer not null,
  notes text,
  timestamp bigint not null,
  user_id uuid references auth.users(id) not null,
  synced_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table workout_logs enable row level security;

drop policy if exists "Users can view their own logs" on workout_logs;
create policy "Users can view their own logs"
  on workout_logs for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own logs" on workout_logs;
create policy "Users can insert their own logs"
  on workout_logs for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own logs" on workout_logs;
create policy "Users can update their own logs"
  on workout_logs for update
  using ( auth.uid() = user_id );

-- Nutrition Logs Table
create table if not exists nutrition_logs (
  id uuid primary key default uuid_generate_v4(),
  date text not null,
  item_name text not null,
  calories numeric not null,
  protein numeric not null,
  quantity text,
  user_id uuid references auth.users(id) not null,
  timestamp bigint not null,
  updated_at timestamptz default now()
);

alter table nutrition_logs enable row level security;

drop policy if exists "Users can view their own nutrition" on nutrition_logs;
create policy "Users can view their own nutrition"
  on nutrition_logs for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own nutrition" on nutrition_logs;
create policy "Users can insert their own nutrition"
  on nutrition_logs for insert
  with check ( auth.uid() = user_id );

-- Supplement Logs Table
create table if not exists supplement_logs (
  id uuid primary key default uuid_generate_v4(),
  date text not null,
  item_name text not null,
  is_taken boolean default false,
  time_group text not null,
  user_id uuid references auth.users(id) not null,
  timestamp bigint not null,
  updated_at timestamptz default now()
);

alter table supplement_logs enable row level security;

drop policy if exists "Users can view their own supplements" on supplement_logs;
create policy "Users can view their own supplements"
  on supplement_logs for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own supplements" on supplement_logs;
create policy "Users can insert their own supplements"
  on supplement_logs for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own supplements" on supplement_logs;
create policy "Users can update their own supplements"
  on supplement_logs for update
  using ( auth.uid() = user_id );
