CREATE TABLE IF NOT EXISTS project_state (
  prd_id UUID PRIMARY KEY,
  title TEXT,
  current_phase TEXT,
  planner_issues JSONB DEFAULT '[]',
  reviewer_prs JSONB DEFAULT '[]',
  summariser_logs JSONB DEFAULT '[]',
  sync_errors TEXT[],
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);