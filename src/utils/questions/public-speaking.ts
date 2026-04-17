import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerPublicSpeakingQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Public Speaking'] = {
  'Confidence': [
    { type: 'multiple_choice', prompt: 'What is the #1 way to build speaking confidence?', options: ['Speak quietly', 'Practice and preparation', 'Memorize everything', 'Avoid audiences'], correctAnswer: 'Practice and preparation', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Some nervousness before speaking is normal and even helpful.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Reframing nervousness as ___ can boost your performance.', options: ['Excitement', 'Fear', 'Boredom', 'Anger'], correctAnswer: 'Excitement', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Avoiding public speaking because you\'re nervous.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "power posing" before a speech do?', options: ['Can help you feel more confident', 'Nothing', 'Impresses the audience', 'Makes you tired'], correctAnswer: 'Can help you feel more confident', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Confidence comes naturally — you either have it or you don\'t.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
  ],
  'Eye Contact': [
    { type: 'multiple_choice', prompt: 'How long should you hold eye contact with one person?', options: ['The entire speech', '30 seconds', '3-5 seconds', '1 second'], correctAnswer: '3-5 seconds', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Looking over the audience\'s heads is as good as eye contact.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The "triangle technique" involves looking at different ___ of the room.', options: ['Sections', 'Walls', 'Lights', 'Cameras'], correctAnswer: 'Sections', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Staring at your notes the entire time while speaking.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does good eye contact convey?', options: ['Aggression', 'Nervousness', 'Confidence and connection', 'Boredom'], correctAnswer: 'Confidence and connection', difficulty: 'easy' },
    { type: 'true_false', prompt: 'You should make eye contact with people in all parts of the room.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Voice Power': [
    { type: 'multiple_choice', prompt: 'What makes a powerful speaking voice?', options: ['Projection, clarity, and variation', 'Whispering', 'Speaking very fast', 'Yelling'], correctAnswer: 'Projection, clarity, and variation', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Speaking in a monotone keeps the audience engaged.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Varying your ___ keeps listeners engaged and emphasizes key points.', options: ['Tone', 'Outfit', 'Slides', 'Seat'], correctAnswer: 'Tone', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Speaking so quietly that the back row can\'t hear you.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "vocal projection"?', options: ['Speaking clearly so everyone can hear without yelling', 'Screaming', 'Whispering loudly', 'Using a megaphone'], correctAnswer: 'Speaking clearly so everyone can hear without yelling', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Diaphragmatic breathing helps with vocal projection.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Body Language': [
    { type: 'multiple_choice', prompt: 'What percentage of communication is non-verbal?', options: ['Over 50%', '30%', '10%', '5%'], correctAnswer: 'Over 50%', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Crossed arms signal openness to the audience.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Open ___ make you appear more confident and approachable.', options: ['Gestures', 'Books', 'Emails', 'Notes'], correctAnswer: 'Gestures', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Standing still with hands in pockets during a presentation.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is purposeful movement on stage?', options: ['Pacing nervously', 'Standing perfectly still', 'Moving intentionally to engage different parts of the audience', 'Running around'], correctAnswer: 'Moving intentionally to engage different parts of the audience', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Smiling makes you appear more likable and trustworthy.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Storytelling': [
    { type: 'multiple_choice', prompt: 'Why are stories effective in speeches?', options: ['They create emotional connection and are memorable', 'They waste time', 'They confuse people', 'They replace facts'], correctAnswer: 'They create emotional connection and are memorable', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Personal stories are more engaging than abstract facts alone.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Every good story has a beginning, ___, and end.', options: ['Middle', 'Pause', 'Joke', 'Slide'], correctAnswer: 'Middle', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Adding specific sensory details to make stories vivid.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What makes a story relatable?', options: ['Universal emotions and experiences', 'Being very long', 'Using big words', 'Complex jargon'], correctAnswer: 'Universal emotions and experiences', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Vulnerability in stories builds trust with the audience.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Opening Hooks': [
    { type: 'multiple_choice', prompt: 'What is an "opening hook"?', options: ['Your name introduction', 'A compelling start that grabs attention', 'The title of your speech', 'A fishing reference'], correctAnswer: 'A compelling start that grabs attention', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Starting with "Today I\'m going to talk about..." is a strong hook.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A surprising ___ can be a powerful opening hook.', options: ['Statistic', 'Cough', 'Whisper', 'Delay'], correctAnswer: 'Statistic', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Opening a speech with an apology for being nervous.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which is the strongest opening?', options: ['A powerful question that makes people think', 'Um, so, hi everyone...', 'Reading the agenda', 'Listing your credentials'], correctAnswer: 'A powerful question that makes people think', difficulty: 'easy' },
    { type: 'before_after', prompt: 'Which speech opening is better?', options: ['So, um, today I want to talk about climate change...', 'What if I told you the last 8 years were the hottest in recorded history?'], correctAnswer: 'What if I told you the last 8 years were the hottest in recorded history?', difficulty: 'easy' },
  ],
  'Structure': [
    { type: 'multiple_choice', prompt: 'What is the basic structure of a speech?', options: ['Just the body', 'Introduction, body, conclusion', 'Random points', 'Start and stop'], correctAnswer: 'Introduction, body, conclusion', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Having 3 main points is a classic and effective structure.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A clear ___ statement tells the audience what your speech is about.', options: ['Thesis', 'Random', 'Final', 'Opening'], correctAnswer: 'Thesis', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Jumping between topics without transitions.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What should the conclusion do?', options: ['Summarize key points and end with a call to action', 'Just stop talking', 'Introduce new topics', 'Apologize for the length'], correctAnswer: 'Summarize key points and end with a call to action', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Transitions between sections help the audience follow your speech.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Pausing': [
    { type: 'multiple_choice', prompt: 'What is the power of a pause in speaking?', options: ['It wastes time', 'It shows you forgot', 'It bores the audience', 'It creates emphasis and lets ideas sink in'], correctAnswer: 'It creates emphasis and lets ideas sink in', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Filler words like "um" and "uh" are better than pausing.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Pausing before a key point builds ___ and anticipation.', options: ['Suspense', 'Boredom', 'Confusion', 'Anger'], correctAnswer: 'Suspense', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Replacing "um" and "uh" with a confident silence.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'When should you pause during a speech?', options: ['Never', 'Only at the end', 'After important points and before transitions', 'Every other word'], correctAnswer: 'After important points and before transitions', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A 2-3 second pause feels longer to the speaker than the audience.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  };
}
