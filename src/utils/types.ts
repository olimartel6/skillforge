// Enums
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'creativity' | 'learn_faster' | 'discipline';
export type Tier = 'basics' | 'intermediate' | 'advanced';
export type MediaType = 'photo' | 'video' | 'audio'; // audio reserved for future use; MVP uses video for audio-centric skills
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Database types
export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  selected_skill_id: string | null;
  skill_level: SkillLevel | null;
  goal: Goal | null;
  premium_expires_at: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

export interface SkillTreeNode {
  id: string;
  skill_id: string;
  name: string;
  tier: Tier;
  order: number;
  unlock_after_streak: number;
}

export interface Challenge {
  id: string;
  skill_id: string;
  node_id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration_minutes: number;
  is_generated: boolean;
  tips?: string[];
}

export interface PracticeSession {
  id: string;
  user_id: string;
  challenge_id: string;
  skill_id: string;
  media_url: string | null;
  media_type: MediaType;
  ai_feedback: AIFeedback | null;
  is_shared: boolean;
  created_at: string;
}

export interface AIFeedback {
  strengths: string[];
  mistakes: string[];
  improvement_tip: string;
  encouragement: string;
  score: number;
  error?: boolean;
  message?: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  freeze_tokens: number;
  last_practice_date: string | null;
}

export interface UserProgress {
  user_id: string;
  node_id: string;
  unlocked_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface UserRoadmap {
  id: string;
  user_id: string;
  day_number: number;
  node_id: string;
  challenge_title: string;
  challenge_description: string;
  completed_at: string | null;
  created_at: string;
}

export interface CommunityPost extends PracticeSession {
  user: Pick<User, 'id' | 'username' | 'avatar_url'>;
  skill: Pick<Skill, 'name' | 'icon'>;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export interface Comment {
  id: string;
  user_id: string;
  practice_id: string;
  text: string;
  created_at: string;
  user?: Pick<User, 'id' | 'username' | 'avatar_url'>;
}
