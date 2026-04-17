import { supabase } from './supabase';
import { getDeviceId } from './purchases';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { GameQuestion } from '../utils/gameQuestions';

export interface LivePlayer {
  deviceId: string;
  name: string;
  score: number;
  correctCount: number;
  answered: boolean;
}

export interface LiveAnswer {
  deviceId: string;
  playerName: string;
  questionIndex: number;
  answer: string;
  timeMs: number;
  correct: boolean;
  points: number;
}

export interface LiveGameState {
  questions: GameQuestion[];
  currentIndex: number;
}

let channel: RealtimeChannel | null = null;
let currentRoomCode: string | null = null;
let currentDeviceId: string | null = null;

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(hostName: string): Promise<string> {
  await leaveRoom();
  const roomCode = generateRoomCode();
  const deviceId = await getDeviceId();
  currentDeviceId = deviceId;
  currentRoomCode = roomCode;

  channel = supabase.channel(`live_game_${roomCode}`, {
    config: { broadcast: { self: true }, presence: { key: deviceId } },
  });

  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel!.track({
        name: hostName,
        score: 0,
        correctCount: 0,
        answered: false,
        isHost: true,
      });
    }
  });

  return roomCode;
}

export async function joinRoom(roomCode: string, playerName: string): Promise<boolean> {
  await leaveRoom();
  const deviceId = await getDeviceId();
  currentDeviceId = deviceId;
  currentRoomCode = roomCode.toUpperCase();

  channel = supabase.channel(`live_game_${currentRoomCode}`, {
    config: { broadcast: { self: true }, presence: { key: deviceId } },
  });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 8000);

    channel!.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timeout);
        await channel!.track({
          name: playerName,
          score: 0,
          correctCount: 0,
          answered: false,
          isHost: false,
        });
        resolve(true);
      }
    });
  });
}

export function getPlayers(): LivePlayer[] {
  if (!channel) return [];
  const state = channel.presenceState();
  const players: LivePlayer[] = [];

  Object.entries(state).forEach(([deviceId, presences]) => {
    const p = (presences as any[])[0];
    if (p) {
      players.push({
        deviceId,
        name: p.name || 'Player',
        score: p.score || 0,
        correctCount: p.correctCount || 0,
        answered: p.answered || false,
      });
    }
  });

  return players;
}

export async function startGame(questions: GameQuestion[]): Promise<void> {
  if (!channel) return;
  // Send only multiple_choice and true_false, limit to 10
  const filtered = questions
    .filter((q) => q.type === 'multiple_choice' || q.type === 'true_false')
    .slice(0, 10);

  await channel.send({
    type: 'broadcast',
    event: 'game_start',
    payload: { questions: filtered },
  });
}

export async function submitAnswer(
  questionIndex: number,
  answer: string,
  timeMs: number,
  correct: boolean,
  points: number,
  playerName: string,
): Promise<void> {
  if (!channel || !currentDeviceId) return;

  // Broadcast the answer to all players
  await channel.send({
    type: 'broadcast',
    event: 'answer',
    payload: {
      deviceId: currentDeviceId,
      playerName,
      questionIndex,
      answer,
      timeMs,
      correct,
      points,
    } as LiveAnswer,
  });

  // Update presence with new score
  const players = getPlayers();
  const me = players.find((p) => p.deviceId === currentDeviceId);
  const newScore = (me?.score || 0) + points;
  const newCorrect = (me?.correctCount || 0) + (correct ? 1 : 0);

  await channel.track({
    name: playerName,
    score: newScore,
    correctCount: newCorrect,
    answered: true,
    isHost: me ? (channel.presenceState()[currentDeviceId] as any)?.[0]?.isHost : false,
  });
}

export async function resetAnswered(playerName: string): Promise<void> {
  if (!channel || !currentDeviceId) return;
  const state = channel.presenceState();
  const me = (state[currentDeviceId] as any)?.[0];
  if (me) {
    await channel.track({
      ...me,
      name: playerName,
      answered: false,
    });
  }
}

export async function sendGameEnd(): Promise<void> {
  if (!channel) return;
  const players = getPlayers();
  await channel.send({
    type: 'broadcast',
    event: 'game_end',
    payload: { players },
  });
}

export function onPlayersChanged(callback: (players: LivePlayer[]) => void): void {
  if (!channel) return;
  channel.on('presence', { event: 'sync' }, () => {
    callback(getPlayers());
  });
}

export function onGameStarted(callback: (state: LiveGameState) => void): void {
  if (!channel) return;
  channel.on('broadcast', { event: 'game_start' }, (payload) => {
    callback({
      questions: payload.payload.questions,
      currentIndex: 0,
    });
  });
}

export function onAnswerReceived(callback: (answer: LiveAnswer) => void): void {
  if (!channel) return;
  channel.on('broadcast', { event: 'answer' }, (payload) => {
    callback(payload.payload as LiveAnswer);
  });
}

export function onGameEnded(callback: (players: LivePlayer[]) => void): void {
  if (!channel) return;
  channel.on('broadcast', { event: 'game_end' }, (payload) => {
    callback(payload.payload.players);
  });
}

export async function leaveRoom(): Promise<void> {
  if (channel) {
    try {
      await channel.untrack();
      await supabase.removeChannel(channel);
    } catch (e) { console.warn('leaveRoom cleanup failed:', e); }
    channel = null;
  }
  currentRoomCode = null;
  currentDeviceId = null;
}

export function getRoomCode(): string | null {
  return currentRoomCode;
}

export function getDeviceIdSync(): string | null {
  return currentDeviceId;
}
