-- Rink Reports Complete Schema
-- This migration documents the full database schema required by the application.
-- Run against a fresh Supabase project or use as a reference for incremental migrations.
--
-- All tables use RLS. Policies should be configured after table creation.

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'facility_admin', 'manager', 'supervisor', 'staff', 'read_only');
CREATE TYPE checklist_type AS ENUM ('opening', 'closing', 'daily');
CREATE TYPE recurrence AS ENUM ('daily', 'weekly', 'monthly', 'seasonal');
CREATE TYPE fuel_type AS ENUM ('gas', 'electric');
CREATE TYPE equipment_type AS ENUM ('zamboni', 'edger', 'other');
CREATE TYPE incident_type AS ENUM ('incident', 'accident');
CREATE TYPE injured_type AS ENUM ('patron', 'staff');
CREATE TYPE swap_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE depth_source AS ENUM ('manual', 'bluetooth');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  zip TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  phone TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  data_retention_years INTEGER NOT NULL DEFAULT 3,
  incident_retention_years INTEGER NOT NULL DEFAULT 7,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  operating_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  facility_id UUID REFERENCES facilities(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  position TEXT,
  certifications TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE module_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  module TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  role_access JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (facility_id, module)
);

CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipients TEXT[],
  recipient_roles TEXT[],
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DAILY REPORTS
-- ============================================================================

CREATE TABLE daily_report_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID NOT NULL REFERENCES daily_report_tabs(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  checklist_type checklist_type NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  recurrence recurrence NOT NULL DEFAULT 'daily',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE checklist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_item_id UUID NOT NULL REFERENCES checklist_items(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  date DATE NOT NULL,
  checked_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE (checklist_item_id, date, facility_id)
);

-- ============================================================================
-- ICE DEPTH MANAGEMENT
-- ============================================================================

CREATE TABLE ice_depth_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ice_depth_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES ice_depth_templates(id) ON DELETE CASCADE,
  point_number INTEGER NOT NULL,
  x_percent NUMERIC NOT NULL,
  y_percent NUMERIC NOT NULL,
  label TEXT
);

CREATE TABLE ice_depth_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL REFERENCES ice_depth_points(id),
  template_id UUID NOT NULL REFERENCES ice_depth_templates(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  value NUMERIC NOT NULL DEFAULT 0,
  depth_inches NUMERIC NOT NULL DEFAULT 0,
  source depth_source NOT NULL DEFAULT 'manual',
  recorded_by TEXT NOT NULL DEFAULT '',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ICE OPERATIONS
-- ============================================================================

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  type equipment_type NOT NULL,
  fuel_type fuel_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ice_cuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  rink_name TEXT NOT NULL,
  machine_hours NUMERIC NOT NULL DEFAULT 0,
  ice_taken NUMERIC NOT NULL DEFAULT 0,
  water_used NUMERIC NOT NULL DEFAULT 0,
  cut_number INTEGER,
  water_temperature NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE edging_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  equipment_id UUID REFERENCES equipment(id),
  rink_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blade_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  blade_type TEXT,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE circle_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE circle_check_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE circle_check_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_check_id UUID NOT NULL REFERENCES circle_checks(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES circle_check_items(id),
  passed BOOLEAN NOT NULL,
  notes TEXT
);

-- ============================================================================
-- SCHEDULING
-- ============================================================================

CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#0ea5e9',
  required_certifications TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID REFERENCES auth.users(id),
  position_id UUID NOT NULL REFERENCES positions(id),
  assigned_to UUID REFERENCES auth.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  day_of_week INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shift_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  target_id UUID NOT NULL REFERENCES auth.users(id),
  status swap_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_to UUID REFERENCES auth.users(id),
  reason TEXT,
  status swap_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INCIDENT REPORTING
-- ============================================================================

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type incident_type NOT NULL,
  title TEXT,
  date DATE,
  time TIME,
  date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  location TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  injured_name TEXT,
  injured_type injured_type,
  body_diagram_data JSONB,
  body_regions TEXT[],
  severity TEXT,
  first_aid_given BOOLEAN,
  equipment_involved TEXT,
  damage_description TEXT,
  estimated_cost NUMERIC,
  actions_taken TEXT,
  witnesses TEXT,
  category TEXT,
  reported_by TEXT NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- REFRIGERATION
-- ============================================================================

CREATE TABLE refrigeration_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refrigeration_reading_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES refrigeration_equipment(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  min_threshold NUMERIC,
  max_threshold NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC
);

CREATE TABLE refrigeration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES refrigeration_equipment(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  recorded_by TEXT NOT NULL DEFAULT '',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refrigeration_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID NOT NULL REFERENCES refrigeration_logs(id) ON DELETE CASCADE,
  reading_type_id UUID NOT NULL REFERENCES refrigeration_reading_types(id),
  value NUMERIC NOT NULL,
  out_of_range BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_by TEXT NOT NULL DEFAULT ''
);

CREATE TABLE refrigeration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  equipment_id UUID NOT NULL REFERENCES refrigeration_equipment(id),
  reading_id UUID NOT NULL REFERENCES refrigeration_readings(id),
  reading_type_id UUID NOT NULL REFERENCES refrigeration_reading_types(id),
  value NUMERIC NOT NULL,
  threshold_type TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- AIR QUALITY
-- ============================================================================

CREATE TABLE air_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  min_threshold NUMERIC,
  max_threshold NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE air_quality_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  location TEXT NOT NULL,
  notes TEXT,
  has_exceedance BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE air_quality_reading_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID NOT NULL REFERENCES air_quality_readings(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES air_quality_metrics(id),
  value NUMERIC NOT NULL,
  out_of_range BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE air_quality_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL,
  name TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE air_quality_jurisdiction_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES air_quality_jurisdictions(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES air_quality_metrics(id),
  warning_min NUMERIC,
  warning_max NUMERIC,
  critical_min NUMERIC,
  critical_max NUMERIC
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_depth_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_depth_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_depth_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE edging_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blade_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_check_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE refrigeration_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE refrigeration_reading_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE refrigeration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refrigeration_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE refrigeration_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_reading_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_jurisdiction_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access data within their facility
-- Pattern: SELECT/INSERT/UPDATE/DELETE where facility_id matches user's profile.facility_id

-- Example policy template (apply per table):
-- CREATE POLICY "facility_isolation" ON <table_name>
--   FOR ALL
--   USING (
--     facility_id = (SELECT facility_id FROM profiles WHERE id = auth.uid())
--   )
--   WITH CHECK (
--     facility_id = (SELECT facility_id FROM profiles WHERE id = auth.uid())
--   );

-- Profiles: users can read their own facility's profiles
CREATE POLICY "profiles_facility_read" ON profiles
  FOR SELECT USING (
    facility_id = (SELECT facility_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Facilities: users can read/update their own facility
CREATE POLICY "facilities_own" ON facilities
  FOR ALL USING (
    id = (SELECT facility_id FROM profiles WHERE id = auth.uid())
  );

-- Notifications: users can only see their own notifications
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Air quality jurisdictions: public read (reference data)
CREATE POLICY "jurisdictions_public_read" ON air_quality_jurisdictions
  FOR SELECT USING (true);

CREATE POLICY "jurisdiction_thresholds_public_read" ON air_quality_jurisdiction_thresholds
  FOR SELECT USING (true);

-- For all other tables with facility_id, apply the facility isolation policy.
-- This is documented here as a template; apply to each table:
--
-- CREATE POLICY "facility_isolation" ON <table>
--   FOR ALL
--   USING (facility_id = (SELECT facility_id FROM profiles WHERE id = auth.uid()))
--   WITH CHECK (facility_id = (SELECT facility_id FROM profiles WHERE id = auth.uid()));

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_facility ON profiles(facility_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_checklist_entries_date ON checklist_entries(facility_id, date);
CREATE INDEX idx_ice_depth_readings_template ON ice_depth_readings(template_id, recorded_at);
CREATE INDEX idx_ice_cuts_facility ON ice_cuts(facility_id, created_at);
CREATE INDEX idx_shifts_facility_date ON shifts(facility_id, date);
CREATE INDEX idx_incidents_facility ON incidents(facility_id, date_time);
CREATE INDEX idx_refrigeration_logs_facility ON refrigeration_logs(facility_id, recorded_at);
CREATE INDEX idx_air_quality_readings_facility ON air_quality_readings(facility_id, recorded_at);
CREATE INDEX idx_refrigeration_alerts_facility ON refrigeration_alerts(facility_id, resolved);
