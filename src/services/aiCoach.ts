import { supabase } from './supabase';
import { AIFeedback, Challenge } from '../utils/types';

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachMissed {
  skillName: string;
  moduleName: string;
  prompt: string;
  correctAnswer: string;
  explanation?: string;
}

export interface CoachChatRequest {
  messages: CoachMessage[];
  missed: CoachMissed[];
  skillName?: string;
  xp?: number;
  streak?: number;
  level?: number;
}

export async function chatAICoach(req: CoachChatRequest): Promise<string> {
  const { data, error } = await supabase.functions.invoke('chat-ai-coach', {
    body: req,
  });
  if (error) throw error;
  if (!data?.reply) throw new Error('empty reply');
  return data.reply as string;
}

export async function generateChallenge(
  skillId: string,
  nodeId: string,
  difficulty: string
): Promise<Challenge> {
  const { data, error } = await supabase.functions.invoke('generate-challenge', {
    body: { skill_id: skillId, node_id: nodeId, difficulty },
  });
  if (error) throw error;
  return data;
}

export async function analyzePractice(
  mediaUrl: string,
  mediaType: 'photo' | 'video',
  challengeId: string
): Promise<AIFeedback> {
  const { data, error } = await supabase.functions.invoke('analyze-practice', {
    body: { media_url: mediaUrl, media_type: mediaType, challenge_id: challengeId },
  });
  if (error) throw error;
  return data;
}

export async function generateRoadmap(
  skillId: string,
  skillLevel: string,
  goal: string,
  userId: string
): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('generate-roadmap', {
    body: { skill_id: skillId, skill_level: skillLevel, goal, user_id: userId },
  });
  if (error) throw error;
  return data;
}
