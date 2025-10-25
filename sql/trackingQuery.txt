create table public.daily_tracking (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  tracked_date date not null,
  breakfast_logged boolean null default false,
  breakfast_time time without time zone null,
  breakfast_image_url character varying(500) null,
  breakfast_notes text null,
  lunch_logged boolean null default false,
  lunch_time time without time zone null,
  lunch_image_url character varying(500) null,
  lunch_notes text null,
  dinner_logged boolean null default false,
  dinner_time time without time zone null,
  dinner_image_url character varying(500) null,
  dinner_notes text null,
  water_glasses integer null default 0,
  water_bottles integer null,
  sleep_hours numeric(3, 1) null default 0,
  sleep_quality character varying(50) null,
  exercise_logged boolean null default false,
  exercise_type character varying(100) null,
  exercise_duration_minutes integer null,
  exercise_notes text null,
  symptoms text[] null default '{}'::text[],
  symptoms_notes text null,
  stress_mood_level integer null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint daily_tracking_pkey primary key (id),
  constraint daily_tracking_user_id_tracked_date_key unique (user_id, tracked_date),
  constraint daily_tracking_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint daily_tracking_exercise_type_check check (
    (
      (exercise_type is null)
      or (
        (exercise_type)::text = any (
          (
            array[
              'Running'::character varying,
              'Walking'::character varying,
              'Yoga'::character varying,
              'Strength Training'::character varying,
              'Cycling'::character varying,
              'Sports'::character varying,
              'Other'::character varying
            ]
          )::text[]
        )
      )
    )
  ),
  constraint daily_tracking_sleep_quality_check check (
    (
      (sleep_quality is null)
      or (
        (sleep_quality)::text = any (
          (
            array[
              'Poor'::character varying,
              'Fair'::character varying,
              'Good'::character varying,
              'Excellent'::character varying
            ]
          )::text[]
        )
      )
    )
  ),
  constraint daily_tracking_stress_mood_level_check check (
    (
      (stress_mood_level >= 1)
      and (stress_mood_level <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_daily_tracking_user_id on public.daily_tracking using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_daily_tracking_tracked_date on public.daily_tracking using btree (user_id, tracked_date desc) TABLESPACE pg_default;