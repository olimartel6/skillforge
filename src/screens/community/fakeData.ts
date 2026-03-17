import { CommunityPost, Comment } from '../../utils/types';

export const AVATAR_GRADIENTS: [string, string][] = [
  ['#FF6B35', '#FF3D00'],  // orange
  ['#6C63FF', '#4F46E5'],  // purple
  ['#34D399', '#059669'],  // green
  ['#F472B6', '#DB2777'],  // pink
  ['#60A5FA', '#2563EB'],  // blue
  ['#FBBF24', '#D97706'],  // yellow
  ['#A78BFA', '#7C3AED'],  // violet
  ['#FB923C', '#EA580C'],  // amber
  ['#38BDF8', '#0284C7'],  // sky
  ['#E879F9', '#C026D3'],  // fuchsia
];

export const PRACTICE_DESCRIPTIONS: Record<string, { text: string; emoji: string }> = {
  'Drawing': { text: 'Sketched urban landscape in ink', emoji: '🎨' },
  'Guitar': { text: 'Practiced fingerpicking pattern', emoji: '🎸' },
  'Magic Tricks': { text: 'Worked on double lift technique', emoji: '🪄' },
  'Beatboxing': { text: 'Drilled kick-snare combos', emoji: '🥁' },
  'Dance': { text: 'Rehearsed isolation moves', emoji: '💃' },
  'Photography': { text: 'Shot golden hour portraits', emoji: '📸' },
  'Singing': { text: 'Warmed up with scales and arpeggios', emoji: '🎤' },
  'Stand-up Comedy': { text: 'Tested new 5-minute set at open mic', emoji: '🎭' },
  'Piano': { text: 'Practiced Chopin nocturne hands together', emoji: '🎹' },
  'Calligraphy': { text: 'Worked on copperplate flourishes', emoji: '🖊️' },
  'Trading': { text: 'Analyzed EUR/USD chart patterns', emoji: '📈' },
  'Business': { text: 'Built financial model for startup pitch', emoji: '💼' },
  'Cooking': { text: 'Made homemade pasta from scratch', emoji: '🍝' },
  'Fitness': { text: 'Completed progressive overload leg day', emoji: '💪' },
  'Chess': { text: 'Studied Sicilian Defense variations', emoji: '♟️' },
  'Coding': { text: 'Built a REST API with authentication', emoji: '💻' },
  'Marketing': { text: 'Designed A/B test for landing page', emoji: '📊' },
  'Meditation': { text: 'Completed 30-min body scan session', emoji: '🧘' },
  'Fashion Design': { text: 'Draped a mini collection prototype', emoji: '✂️' },
  'Podcasting': { text: 'Recorded and edited interview episode', emoji: '🎙️' },
};

const MS_MIN = 1000 * 60;

export const FAKE_POSTS: CommunityPost[] = [
  {
    id: 'fp1', user_id: 'u1', challenge_id: 'c1', skill_id: 's1',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 25).toISOString(),
    user: { id: 'u1', username: 'Maya', avatar_url: null },
    skill: { name: 'Drawing', icon: '✏️' },
    like_count: 47, comment_count: 12, is_liked: false,
  },
  {
    id: 'fp2', user_id: 'u2', challenge_id: 'c2', skill_id: 's2',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 90).toISOString(),
    user: { id: 'u2', username: 'Jake', avatar_url: null },
    skill: { name: 'Guitar', icon: '🎸' },
    like_count: 23, comment_count: 5, is_liked: true,
  },
  {
    id: 'fp3', user_id: 'u3', challenge_id: 'c3', skill_id: 's3',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 180).toISOString(),
    user: { id: 'u3', username: 'Sofia', avatar_url: null },
    skill: { name: 'Magic Tricks', icon: '🪄' },
    like_count: 89, comment_count: 21, is_liked: false,
  },
  {
    id: 'fp4', user_id: 'u4', challenge_id: 'c4', skill_id: 's4',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 300).toISOString(),
    user: { id: 'u4', username: 'Leo', avatar_url: null },
    skill: { name: 'Beatboxing', icon: '🥁' },
    like_count: 156, comment_count: 34, is_liked: true,
  },
  {
    id: 'fp5', user_id: 'u5', challenge_id: 'c5', skill_id: 's5',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 420).toISOString(),
    user: { id: 'u5', username: 'Aria', avatar_url: null },
    skill: { name: 'Dance', icon: '💃' },
    like_count: 212, comment_count: 45, is_liked: false,
  },
  {
    id: 'fp6', user_id: 'u6', challenge_id: 'c6', skill_id: 's6',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 600).toISOString(),
    user: { id: 'u6', username: 'Marcus', avatar_url: null },
    skill: { name: 'Photography', icon: '📸' },
    like_count: 78, comment_count: 9, is_liked: false,
  },
  {
    id: 'fp7', user_id: 'u7', challenge_id: 'c7', skill_id: 's7',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 800).toISOString(),
    user: { id: 'u7', username: 'Zara', avatar_url: null },
    skill: { name: 'Singing', icon: '🎤' },
    like_count: 341, comment_count: 42, is_liked: true,
  },
  {
    id: 'fp8', user_id: 'u8', challenge_id: 'c8', skill_id: 's8',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 1000).toISOString(),
    user: { id: 'u8', username: 'Kai', avatar_url: null },
    skill: { name: 'Stand-up Comedy', icon: '😂' },
    like_count: 534, comment_count: 50, is_liked: false,
  },
  {
    id: 'fp9', user_id: 'u9', challenge_id: 'c9', skill_id: 's9',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 1200).toISOString(),
    user: { id: 'u9', username: 'Nina', avatar_url: null },
    skill: { name: 'Piano', icon: '🎹' },
    like_count: 167, comment_count: 28, is_liked: false,
  },
  {
    id: 'fp10', user_id: 'u10', challenge_id: 'c10', skill_id: 's10',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 1440).toISOString(),
    user: { id: 'u10', username: 'Alex', avatar_url: null },
    skill: { name: 'Calligraphy', icon: '🖊️' },
    like_count: 92, comment_count: 14, is_liked: true,
  },
  // --- New posts fp11-fp25 ---
  {
    id: 'fp11', user_id: 'u11', challenge_id: 'c11', skill_id: 's11',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 60).toISOString(),
    user: { id: 'u11', username: 'Priya', avatar_url: null },
    skill: { name: 'Trading', icon: '📈' },
    like_count: 35, comment_count: 7, is_liked: false,
  },
  {
    id: 'fp12', user_id: 'u12', challenge_id: 'c12', skill_id: 's12',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 150).toISOString(),
    user: { id: 'u12', username: 'Derek', avatar_url: null },
    skill: { name: 'Business', icon: '💼' },
    like_count: 128, comment_count: 18, is_liked: true,
  },
  {
    id: 'fp13', user_id: 'u13', challenge_id: 'c13', skill_id: 's13',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 240).toISOString(),
    user: { id: 'u13', username: 'Hana', avatar_url: null },
    skill: { name: 'Cooking', icon: '🍳' },
    like_count: 263, comment_count: 31, is_liked: false,
  },
  {
    id: 'fp14', user_id: 'u14', challenge_id: 'c14', skill_id: 's14',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 360).toISOString(),
    user: { id: 'u14', username: 'Tyrone', avatar_url: null },
    skill: { name: 'Fitness', icon: '🏋️' },
    like_count: 445, comment_count: 39, is_liked: true,
  },
  {
    id: 'fp15', user_id: 'u15', challenge_id: 'c15', skill_id: 's15',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 480).toISOString(),
    user: { id: 'u15', username: 'Elise', avatar_url: null },
    skill: { name: 'Chess', icon: '♟️' },
    like_count: 57, comment_count: 11, is_liked: false,
  },
  {
    id: 'fp16', user_id: 'u16', challenge_id: 'c16', skill_id: 's16',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 720).toISOString(),
    user: { id: 'u16', username: 'Ravi', avatar_url: null },
    skill: { name: 'Coding', icon: '💻' },
    like_count: 312, comment_count: 26, is_liked: false,
  },
  {
    id: 'fp17', user_id: 'u17', challenge_id: 'c17', skill_id: 's17',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 900).toISOString(),
    user: { id: 'u17', username: 'Lina', avatar_url: null },
    skill: { name: 'Marketing', icon: '📊' },
    like_count: 19, comment_count: 3, is_liked: true,
  },
  {
    id: 'fp18', user_id: 'u18', challenge_id: 'c18', skill_id: 's18',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 1080).toISOString(),
    user: { id: 'u18', username: 'Omar', avatar_url: null },
    skill: { name: 'Meditation', icon: '🧘' },
    like_count: 189, comment_count: 15, is_liked: false,
  },
  {
    id: 'fp19', user_id: 'u19', challenge_id: 'c19', skill_id: 's19',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 1320).toISOString(),
    user: { id: 'u19', username: 'Vera', avatar_url: null },
    skill: { name: 'Fashion Design', icon: '✂️' },
    like_count: 800, comment_count: 47, is_liked: true,
  },
  {
    id: 'fp20', user_id: 'u20', challenge_id: 'c20', skill_id: 's20',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 1600).toISOString(),
    user: { id: 'u20', username: 'Sam', avatar_url: null },
    skill: { name: 'Podcasting', icon: '🎙️' },
    like_count: 73, comment_count: 8, is_liked: false,
  },
  {
    id: 'fp21', user_id: 'u21', challenge_id: 'c21', skill_id: 's21',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 1900).toISOString(),
    user: { id: 'u21', username: 'Chloe', avatar_url: null },
    skill: { name: 'Drawing', icon: '✏️' },
    like_count: 145, comment_count: 22, is_liked: false,
  },
  {
    id: 'fp22', user_id: 'u22', challenge_id: 'c22', skill_id: 's22',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 2200).toISOString(),
    user: { id: 'u22', username: 'Dante', avatar_url: null },
    skill: { name: 'Guitar', icon: '🎸' },
    like_count: 5, comment_count: 1, is_liked: true,
  },
  {
    id: 'fp23', user_id: 'u23', challenge_id: 'c23', skill_id: 's23',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 2700).toISOString(),
    user: { id: 'u23', username: 'Freya', avatar_url: null },
    skill: { name: 'Cooking', icon: '🍳' },
    like_count: 398, comment_count: 36, is_liked: false,
  },
  {
    id: 'fp24', user_id: 'u24', challenge_id: 'c24', skill_id: 's24',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 3500).toISOString(),
    user: { id: 'u24', username: 'Idris', avatar_url: null },
    skill: { name: 'Chess', icon: '♟️' },
    like_count: 241, comment_count: 19, is_liked: true,
  },
  {
    id: 'fp25', user_id: 'u25', challenge_id: 'c25', skill_id: 's25',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - MS_MIN * 4320).toISOString(),
    user: { id: 'u25', username: 'Mei', avatar_url: null },
    skill: { name: 'Trading', icon: '📈' },
    like_count: 112, comment_count: 13, is_liked: false,
  },
];

// Fixed day numbers per post (increasing with experience)
export const POST_DAY_NUMBERS: Record<string, number> = {
  fp1: 3, fp2: 7, fp3: 5, fp4: 14, fp5: 21,
  fp6: 9, fp7: 18, fp8: 25, fp9: 12, fp10: 16,
  fp11: 2, fp12: 11, fp13: 8, fp14: 22, fp15: 6,
  fp16: 19, fp17: 4, fp18: 15, fp19: 27, fp20: 10,
  fp21: 13, fp22: 1, fp23: 17, fp24: 24, fp25: 20,
};

// Fixed streak numbers per post
export const POST_STREAKS: Record<string, number> = {
  fp1: 3, fp2: 7, fp3: 5, fp4: 12, fp5: 18,
  fp6: 9, fp7: 15, fp8: 22, fp9: 10, fp10: 14,
  fp11: 2, fp12: 11, fp13: 8, fp14: 20, fp15: 6,
  fp16: 17, fp17: 4, fp18: 13, fp19: 25, fp20: 8,
  fp21: 11, fp22: 3, fp23: 14, fp24: 21, fp25: 16,
};

// Build a Record for PostDetailScreen lookup
export const FAKE_POSTS_BY_ID: Record<string, CommunityPost> = Object.fromEntries(
  FAKE_POSTS.map((p) => [p.id, p])
);

// Fake comments: 2-4 comments for each of the first 15 posts
export const FAKE_COMMENTS: Comment[] = [
  // fp1 - Drawing
  { id: 'fc1', user_id: 'u2', practice_id: 'fp1', text: 'Love the progress! Keep it up!', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), user: { id: 'u2', username: 'Jake', avatar_url: null } },
  { id: 'fc2', user_id: 'u3', practice_id: 'fp1', text: 'This is amazing work! The shading is so smooth.', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: { id: 'u3', username: 'Sofia', avatar_url: null } },
  { id: 'fc3', user_id: 'u5', practice_id: 'fp1', text: 'What pen are you using? The lines are so clean.', created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), user: { id: 'u5', username: 'Aria', avatar_url: null } },

  // fp2 - Guitar
  { id: 'fc4', user_id: 'u1', practice_id: 'fp2', text: 'That fingerpicking is getting so smooth!', created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(), user: { id: 'u1', username: 'Maya', avatar_url: null } },
  { id: 'fc5', user_id: 'u7', practice_id: 'fp2', text: 'Try slowing it down 20% then speed back up, helped me a lot.', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), user: { id: 'u7', username: 'Zara', avatar_url: null } },

  // fp3 - Magic Tricks
  { id: 'fc6', user_id: 'u4', practice_id: 'fp3', text: 'Wait, how did you do that?!', created_at: new Date(Date.now() - 1000 * 60 * 170).toISOString(), user: { id: 'u4', username: 'Leo', avatar_url: null } },
  { id: 'fc7', user_id: 'u8', practice_id: 'fp3', text: 'The misdirection is perfect. Fooled me completely.', created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(), user: { id: 'u8', username: 'Kai', avatar_url: null } },
  { id: 'fc8', user_id: 'u10', practice_id: 'fp3', text: 'You should post a tutorial!', created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(), user: { id: 'u10', username: 'Alex', avatar_url: null } },

  // fp4 - Beatboxing
  { id: 'fc9', user_id: 'u1', practice_id: 'fp4', text: 'The bass is so deep, how do you get that sound?', created_at: new Date(Date.now() - 1000 * 60 * 290).toISOString(), user: { id: 'u1', username: 'Maya', avatar_url: null } },
  { id: 'fc10', user_id: 'u9', practice_id: 'fp4', text: 'This is fire! Love the rhythm.', created_at: new Date(Date.now() - 1000 * 60 * 270).toISOString(), user: { id: 'u9', username: 'Nina', avatar_url: null } },
  { id: 'fc11', user_id: 'u6', practice_id: 'fp4', text: 'Day 14 and you sound this good? Incredible.', created_at: new Date(Date.now() - 1000 * 60 * 250).toISOString(), user: { id: 'u6', username: 'Marcus', avatar_url: null } },
  { id: 'fc12', user_id: 'u3', practice_id: 'fp4', text: 'We should collab!', created_at: new Date(Date.now() - 1000 * 60 * 230).toISOString(), user: { id: 'u3', username: 'Sofia', avatar_url: null } },

  // fp5 - Dance
  { id: 'fc13', user_id: 'u7', practice_id: 'fp5', text: 'Your isolations are so clean now!', created_at: new Date(Date.now() - 1000 * 60 * 400).toISOString(), user: { id: 'u7', username: 'Zara', avatar_url: null } },
  { id: 'fc14', user_id: 'u2', practice_id: 'fp5', text: 'The musicality is next level. You feel the beat.', created_at: new Date(Date.now() - 1000 * 60 * 380).toISOString(), user: { id: 'u2', username: 'Jake', avatar_url: null } },
  { id: 'fc15', user_id: 'u4', practice_id: 'fp5', text: 'Love seeing day 21 progress!', created_at: new Date(Date.now() - 1000 * 60 * 370).toISOString(), user: { id: 'u4', username: 'Leo', avatar_url: null } },

  // fp6 - Photography
  { id: 'fc16', user_id: 'u5', practice_id: 'fp6', text: 'The golden hour light is perfect here.', created_at: new Date(Date.now() - 1000 * 60 * 580).toISOString(), user: { id: 'u5', username: 'Aria', avatar_url: null } },
  { id: 'fc17', user_id: 'u9', practice_id: 'fp6', text: 'Great composition! Rule of thirds nailed.', created_at: new Date(Date.now() - 1000 * 60 * 550).toISOString(), user: { id: 'u9', username: 'Nina', avatar_url: null } },

  // fp7 - Singing
  { id: 'fc18', user_id: 'u1', practice_id: 'fp7', text: 'Your vocal range has improved so much!', created_at: new Date(Date.now() - 1000 * 60 * 780).toISOString(), user: { id: 'u1', username: 'Maya', avatar_url: null } },
  { id: 'fc19', user_id: 'u6', practice_id: 'fp7', text: 'Beautiful tone! What song is this?', created_at: new Date(Date.now() - 1000 * 60 * 760).toISOString(), user: { id: 'u6', username: 'Marcus', avatar_url: null } },
  { id: 'fc20', user_id: 'u10', practice_id: 'fp7', text: 'Chills. Seriously.', created_at: new Date(Date.now() - 1000 * 60 * 740).toISOString(), user: { id: 'u10', username: 'Alex', avatar_url: null } },

  // fp8 - Stand-up Comedy
  { id: 'fc21', user_id: 'u3', practice_id: 'fp8', text: 'That punchline had me dying!', created_at: new Date(Date.now() - 1000 * 60 * 980).toISOString(), user: { id: 'u3', username: 'Sofia', avatar_url: null } },
  { id: 'fc22', user_id: 'u7', practice_id: 'fp8', text: 'Your timing is getting really sharp.', created_at: new Date(Date.now() - 1000 * 60 * 960).toISOString(), user: { id: 'u7', username: 'Zara', avatar_url: null } },
  { id: 'fc23', user_id: 'u2', practice_id: 'fp8', text: 'Day 25 comedian vibes for real.', created_at: new Date(Date.now() - 1000 * 60 * 940).toISOString(), user: { id: 'u2', username: 'Jake', avatar_url: null } },
  { id: 'fc24', user_id: 'u4', practice_id: 'fp8', text: 'More please!', created_at: new Date(Date.now() - 1000 * 60 * 920).toISOString(), user: { id: 'u4', username: 'Leo', avatar_url: null } },

  // fp9 - Piano
  { id: 'fc25', user_id: 'u8', practice_id: 'fp9', text: 'Chopin would be proud. Beautiful dynamics.', created_at: new Date(Date.now() - 1000 * 60 * 1180).toISOString(), user: { id: 'u8', username: 'Kai', avatar_url: null } },
  { id: 'fc26', user_id: 'u5', practice_id: 'fp9', text: 'How long did it take to get hands together?', created_at: new Date(Date.now() - 1000 * 60 * 1160).toISOString(), user: { id: 'u5', username: 'Aria', avatar_url: null } },
  { id: 'fc27', user_id: 'u1', practice_id: 'fp9', text: 'The expressiveness is so good for day 12!', created_at: new Date(Date.now() - 1000 * 60 * 1140).toISOString(), user: { id: 'u1', username: 'Maya', avatar_url: null } },

  // fp10 - Calligraphy
  { id: 'fc28', user_id: 'u6', practice_id: 'fp10', text: 'Those flourishes are so satisfying to watch.', created_at: new Date(Date.now() - 1000 * 60 * 1420).toISOString(), user: { id: 'u6', username: 'Marcus', avatar_url: null } },
  { id: 'fc29', user_id: 'u3', practice_id: 'fp10', text: 'What nib size are you using?', created_at: new Date(Date.now() - 1000 * 60 * 1400).toISOString(), user: { id: 'u3', username: 'Sofia', avatar_url: null } },

  // fp11 - Trading
  { id: 'fc30', user_id: 'u12', practice_id: 'fp11', text: 'Good catch on that support level!', created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(), user: { id: 'u12', username: 'Derek', avatar_url: null } },
  { id: 'fc31', user_id: 'u25', practice_id: 'fp11', text: 'Have you tried adding RSI to your analysis?', created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(), user: { id: 'u25', username: 'Mei', avatar_url: null } },

  // fp12 - Business
  { id: 'fc32', user_id: 'u17', practice_id: 'fp12', text: 'Love the financial projections, very realistic.', created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(), user: { id: 'u17', username: 'Lina', avatar_url: null } },
  { id: 'fc33', user_id: 'u11', practice_id: 'fp12', text: 'What assumptions did you use for growth rate?', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), user: { id: 'u11', username: 'Priya', avatar_url: null } },
  { id: 'fc34', user_id: 'u16', practice_id: 'fp12', text: 'Solid work. Would love to see the pitch deck.', created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(), user: { id: 'u16', username: 'Ravi', avatar_url: null } },

  // fp13 - Cooking
  { id: 'fc35', user_id: 'u23', practice_id: 'fp13', text: 'That pasta looks incredible! Did you use semolina?', created_at: new Date(Date.now() - 1000 * 60 * 230).toISOString(), user: { id: 'u23', username: 'Freya', avatar_url: null } },
  { id: 'fc36', user_id: 'u14', practice_id: 'fp13', text: 'Making me hungry just looking at this.', created_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(), user: { id: 'u14', username: 'Tyrone', avatar_url: null } },

  // fp14 - Fitness
  { id: 'fc37', user_id: 'u18', practice_id: 'fp14', text: 'Progressive overload is the way! Great form.', created_at: new Date(Date.now() - 1000 * 60 * 350).toISOString(), user: { id: 'u18', username: 'Omar', avatar_url: null } },
  { id: 'fc38', user_id: 'u15', practice_id: 'fp14', text: 'What program are you following?', created_at: new Date(Date.now() - 1000 * 60 * 330).toISOString(), user: { id: 'u15', username: 'Elise', avatar_url: null } },
  { id: 'fc39', user_id: 'u20', practice_id: 'fp14', text: 'Day 22 gains looking real!', created_at: new Date(Date.now() - 1000 * 60 * 310).toISOString(), user: { id: 'u20', username: 'Sam', avatar_url: null } },

  // fp15 - Chess
  { id: 'fc40', user_id: 'u24', practice_id: 'fp15', text: 'The Sicilian is tricky. Have you tried the Dragon?', created_at: new Date(Date.now() - 1000 * 60 * 470).toISOString(), user: { id: 'u24', username: 'Idris', avatar_url: null } },
  { id: 'fc41', user_id: 'u16', practice_id: 'fp15', text: 'Nice study session. Openings matter more than people think.', created_at: new Date(Date.now() - 1000 * 60 * 450).toISOString(), user: { id: 'u16', username: 'Ravi', avatar_url: null } },
];
