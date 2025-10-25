create table public.health_metrics (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  height_cm integer not null,
  current_weight_kg numeric(5, 2) not null,
  goal character varying(50) not null,
  physical_activity_level character varying(50) not null,
  smoking_habits character varying(50) not null,
  alcohol_consumption character varying(50) not null,
  recorded_date date not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint health_metrics_pkey primary key (id),
  constraint health_metrics_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint health_metrics_alcohol_consumption_check check (
    (
      (alcohol_consumption)::text = any (
        (
          array[
            'Never'::character varying,
            'Occasionally'::character varying,
            'Often'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint health_metrics_goal_check check (
    (
      (goal)::text = any (
        (
          array[
            'Weight Loss'::character varying,
            'Weight Gain'::character varying,
            'Maintain'::character varying,
            'Boost Immunity'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint health_metrics_physical_activity_level_check check (
    (
      (physical_activity_level)::text = any (
        (
          array[
            'Sedentary'::character varying,
            'Light'::character varying,
            'Moderate'::character varying,
            'High'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint health_metrics_smoking_habits_check check (
    (
      (smoking_habits)::text = any (
        (
          array[
            'Yes'::character varying,
            'No'::character varying,
            'Sometimes'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_health_metrics_user_id on public.health_metrics using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_health_metrics_recorded_date on public.health_metrics using btree (user_id, recorded_date desc) TABLESPACE pg_default;