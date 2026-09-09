/*
# Nova AI — Task and Execution Tables

Creates three tables for persisting Nova task executions.
Single-tenant app with no sign-in screen — all data is shared/public.
*/

-- === nova_tasks ===
CREATE TABLE IF NOT EXISTS nova_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request text NOT NULL,
  status text NOT NULL DEFAULT 'idle',
  intent_category text,
  intent_complexity text,
  output_format text,
  detected_domains text[] DEFAULT '{}',
  plan_summary text,
  plan_reasoning text,
  final_output jsonb,
  verified boolean DEFAULT false,
  verification_notes text,
  agents_used text[] DEFAULT '{}',
  error text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE nova_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON nova_tasks;
CREATE POLICY "anon_select_tasks" ON nova_tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON nova_tasks;
CREATE POLICY "anon_insert_tasks" ON nova_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON nova_tasks;
CREATE POLICY "anon_update_tasks" ON nova_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON nova_tasks;
CREATE POLICY "anon_delete_tasks" ON nova_tasks FOR DELETE
  TO anon, authenticated USING (true);

-- === nova_task_agents ===
CREATE TABLE IF NOT EXISTS nova_task_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES nova_tasks(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  output text DEFAULT '',
  reasoning text,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nova_task_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_task_agents" ON nova_task_agents;
CREATE POLICY "anon_select_task_agents" ON nova_task_agents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_task_agents" ON nova_task_agents;
CREATE POLICY "anon_insert_task_agents" ON nova_task_agents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_task_agents" ON nova_task_agents;
CREATE POLICY "anon_update_task_agents" ON nova_task_agents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_task_agents" ON nova_task_agents;
CREATE POLICY "anon_delete_task_agents" ON nova_task_agents FOR DELETE
  TO anon, authenticated USING (true);

-- === nova_task_logs ===
CREATE TABLE IF NOT EXISTS nova_task_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES nova_tasks(id) ON DELETE CASCADE,
  phase text NOT NULL,
  agent_id text,
  message text NOT NULL,
  level text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nova_task_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_task_logs" ON nova_task_logs;
CREATE POLICY "anon_select_task_logs" ON nova_task_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_task_logs" ON nova_task_logs;
CREATE POLICY "anon_insert_task_logs" ON nova_task_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_task_logs" ON nova_task_logs;
CREATE POLICY "anon_update_task_logs" ON nova_task_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_task_logs" ON nova_task_logs;
CREATE POLICY "anon_delete_task_logs" ON nova_task_logs FOR DELETE
  TO anon, authenticated USING (true);

-- === Indexes ===
CREATE INDEX IF NOT EXISTS idx_nova_tasks_created_at ON nova_tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nova_task_agents_task_id ON nova_task_agents (task_id);
CREATE INDEX IF NOT EXISTS idx_nova_task_logs_task_id ON nova_task_logs (task_id, created_at);