export type DayType = "weekday" | "saturday" | "sunday" | "all";

export type CategoryType =
  | "spiritual"
  | "health"
  | "learning"
  | "work"
  | "commute"
  | "family"
  | "development"
  | "financial"
  | "freelancing"
  | "business"
  | "forex"
  | "planning"
  | "rest"
  | "preparation";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  title: string;
  monthly_salary: number;
  currency: string;
  wake_time: string;
  bed_time: string;
  sleep_target_hours: number;
  morning_prayer_time: string;
  night_prayer_time: string;
  timezone?: string;
  journey_start_date?: string;
  has_performed_reset?: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduleBlock {
  id: string;
  user_id: string;
  day_type: DayType;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  title: string;
  category: CategoryType;
  is_protected: number;
  description: string;
  requires_screen: number;
  sort_order: number;
}

export interface DailyTask {
  id: string;
  user_id: string;
  goal_id?: string | null;
  title: string;
  instructions: string;
  category: CategoryType;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  actual_duration_minutes?: number;
  timer_started_at?: string | null;
  timer_accumulated_seconds?: number;
  depends_on_task_id?: string | null;
  recurrence?: "none" | "daily" | "weekdays" | "weekly";
  priority: "high" | "medium" | "low";
  status: "upcoming" | "starting_soon" | "in_progress" | "completed" | "missed" | "rescheduled" | "skipped";
  is_protected: number;
  is_daily_priority?: number;
  reschedule_reason?: string | null;
  skip_reason?: string | null;
  notes?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  reason: string;
  tier: "vision" | "90_day" | "monthly" | "weekly";
  parent_goal_id?: string | null;
  start_date: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  progress: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  currency?: string;
  status: "not_started" | "in_progress" | "completed" | "on_hold";
  completion_criteria: string;
  created_at: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  target_date: string;
  status: "pending" | "completed";
  sort_order: number;
}

export interface PrayerLog {
  id: string;
  user_id: string;
  date: string;
  prayer_type: "morning" | "night";
  scheduled_time: string;
  duration_minutes: number;
  completed: number;
  completed_at?: string | null;
  reflection_notes?: string | null;
  gratitude_notes?: string | null;
  spiritual_focus?: string | null;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  target_frequency: string;
  is_active: number;
  completed_today?: boolean;
  current_streak?: number;
}

export interface FinancialTransaction {
  id: string;
  user_id: string;
  date: string;
  type: "income" | "expense" | "savings_transfer";
  category: string;
  amount: number;
  currency: string;
  description: string;
  bucket: "personal" | "business" | "trading";
  created_at: string;
}

export interface FreelanceClient {
  id: string;
  user_id: string;
  name: string;
  company: string;
  contact_info: string;
  status: "lead" | "contacted" | "proposal_sent" | "negotiation" | "active" | "completed" | "lost";
  service_offered: string;
  estimated_value: number;
  notes: string;
  created_at: string;
}

export interface FreelanceProject {
  id: string;
  user_id: string;
  client_id?: string | null;
  client_name?: string;
  title: string;
  description: string;
  agreed_price: number;
  deadline: string;
  status: "planning" | "in_progress" | "review" | "delivered" | "paid";
  deliverables: string;
  created_at: string;
}

export interface SukuTask {
  id: string;
  user_id: string;
  area: "product" | "ui_ux" | "backend" | "testing" | "security" | "deployment" | "marketing" | "launch" | "payment";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "backlog" | "in_progress" | "completed";
  target_date: string;
  stage_id?: number | null;
  milestone?: string | null;
  created_at: string;
}

export interface ForexTrade {
  id: string;
  user_id: string;
  account_type: "backtest" | "demo" | "live" | "prop_firm";
  pair: string;
  direction: "BUY" | "SELL";
  setup_model: string;
  session: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  exit_price?: number | null;
  risk_reward_ratio: number;
  result_r?: number | null;
  outcome: "win" | "loss" | "breakeven" | "open";
  emotional_state: string;
  rules_followed: number;
  notes: string;
  date: string;
  created_at: string;
}

export interface EnglishVocab {
  id: string;
  user_id: string;
  word_phrase: string;
  definition: string;
  example_sentence: string;
  mastery_level: number;
  created_at: string;
}

export interface DailyReflection {
  id: string;
  user_id: string;
  date: string;
  morning_intention: string;
  evening_wins: string;
  evening_improvements: string;
  energy_rating: number;
  discipline_rating: number;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: string;
  time: string;
  is_read: number;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  completed_tasks_count?: number;
  missed_tasks_count?: number;
  total_focus_minutes?: number;
  wins_reflection?: string;
  challenges_reflection?: string;
  adjustments_plan?: string;
  proposed_schedule?: string | null;
  reflection?: string;
  learnings?: string;
  improvements?: string;
  next_week_priorities?: string;
  overall_score?: number;
  tasks_completed?: number;
  tasks_missed?: number;
  goals_progressed?: number;
  actual_spending?: number;
  savings_progress?: number;
  suggestions_json?: any;
  status?: string;
  created_at?: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string | null;
  goal_id?: string | null;
  title: string;
  target_duration_minutes: number;
  actual_duration_seconds: number;
  interrupted: number;
  interruption_reason?: string | null;
  status: "completed" | "interrupted" | "in_progress";
  started_at: string;
  completed_at?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface QuickCaptureItem {
  id: string;
  user_id: string;
  type: "task" | "idea" | "expense" | "reminder" | "note" | "project_idea" | "goal" | "problem";
  content: string;
  category: string;
  assigned_to?: string | null;
  is_processed: number;
  created_at: string;
  processed_at?: string | null;
}

