/*
# Nova AI — Task and Execution Persistence

1. New Tables
- `nova_tasks`: Stores each user task/request submitted to Nova Master Agent.
  - id (uuid, primary key)
  - request (text, the user's original prompt)
  - status (text: idle, understanding, planning, selecting, executing, combining, verifying, complete, error)
  - intent_category (text, detected domain)
  - intent_complexity (text: low, medium, high)
  - output_format (text: structured-report, document, action-plan, content, code, analysis, data, workflow)
  - detected_domains (text[], array of detected domain names)
  - plan_summary (text, human-readable plan summary)
  - plan_reasoning (text, why agents were selected)
  - final_output (jsonb, the synthesized NovaOutput object)
  - verified (boolean, whether QA verification passed)
  - verification_notes (text, QA notes)
  - agents_used (text[], names of agents that completed)
  - error (text, error message if failed)
  - created_at (timestamptz)
  - completed_at (timestamptz, null until done)

- `nova_task_agents`: Stores per-agent execution results within a task.
  - id (uuid, primary key)
  - task_id (uuid, foreign key to nova_tasks)
  - agent_id (text, e.g. "marketing", "sales")
  - agent_name (text, display name)
  - status (text: available, running, completed, error, waiting)
  - output (text, agent's generated content)
  - reasoning (text, agent's reasoning for its output)
  - error (text, error message if agent failed)
  - started_at (timestamptz)
  - completed_at (timestamptz)

- `nova_task_logs`: Stores execution log entries for full audit trail.
  - id (uuid, primary key)
  - task_id (uuid, foreign key to nova_tasks)
  - phase (text: understanding, planning, selecting, executing, combining, verifying, complete, error)
  - agent_id (text, nullable — which agent the log relates to)
  - message (text, log message)
  - level (text: info, success, warning, error)
  - created_at (timestamptz)

2. Indexes
- nova_tasks: created_at DESC for task history listing
- nova_task_agents: task_id for fetching agents per task
- nova_task_logs: task_id + created_at for ordered log retrieval

3. Security
- RLS enabled on all three tables.
- Policies allow anon + authenticated full CRUD (single-tenant, no auth screen).
- Data is intentionally shared/public across the app.
*/