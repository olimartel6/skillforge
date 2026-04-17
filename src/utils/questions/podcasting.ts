import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerPodcastingQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Podcasting'] = {
  'Podcast Concept': [
    { type: 'multiple_choice', prompt: 'What makes a good podcast concept?', options: ['No planning needed', 'Copying another podcast exactly', 'A clear topic that serves a specific audience', 'Covering everything'], correctAnswer: 'A clear topic that serves a specific audience', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A podcast should have a clearly defined target audience.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Your podcast ___ statement describes what your show is about and for whom.', options: ['Mission', 'Income', 'Legal', 'Technical'], correctAnswer: 'Mission', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Starting a podcast without knowing your target audience.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What should you research before launching?', options: ['Only equipment', 'Similar podcasts in your niche', 'Only music', 'Nothing'], correctAnswer: 'Similar podcasts in your niche', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A unique angle helps your podcast stand out in a crowded market.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Format Choice': [
    { type: 'multiple_choice', prompt: 'What is a common podcast format?', options: ['Text only', 'Solo, interview, or co-hosted', 'Music only', 'Silent meditation'], correctAnswer: 'Solo, interview, or co-hosted', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Interview-format podcasts help bring in different perspectives.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ podcast features two or more regular hosts discussing topics.', options: ['Co-hosted', 'Solo', 'Silent', 'Musical'], correctAnswer: 'Co-hosted', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Choosing a format that matches your strengths and topic.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "narrative" podcast?', options: ['A live call-in show', 'A story-driven podcast with produced audio', 'A music podcast', 'An unscripted chat'], correctAnswer: 'A story-driven podcast with produced audio', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Episode length should match your content — not all podcasts need to be long.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Your Niche': [
    { type: 'multiple_choice', prompt: 'What is a podcast niche?', options: ['A type of microphone', 'A specific topic area you focus on', 'A hosting platform', 'A recording technique'], correctAnswer: 'A specific topic area you focus on', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A more specific niche often attracts a more loyal audience.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Your niche should be at the intersection of your ___ and audience demand.', options: ['Passion', 'Budget', 'Location', 'Equipment'], correctAnswer: 'Passion', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Trying to appeal to absolutely everyone with your podcast.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'How do you validate your podcast niche?', options: ['Copy the top podcast', 'Check if people are searching for and discussing the topic', 'Ask one friend', 'Don\'t validate, just start'], correctAnswer: 'Check if people are searching for and discussing the topic', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Competition in your niche proves there\'s an audience for it.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Mic Setup': [
    { type: 'multiple_choice', prompt: 'What type of microphone is best for beginners?', options: ['USB condenser microphone', 'Built-in laptop mic', 'Bluetooth earbuds', 'Speakerphone'], correctAnswer: 'USB condenser microphone', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A pop filter helps reduce plosive sounds (p\'s and b\'s).', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Speak about 4-6 ___ from the microphone for best audio.', options: ['Inches', 'Feet', 'Meters', 'Yards'], correctAnswer: 'Inches', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using your laptop\'s built-in microphone for your podcast.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a dynamic microphone good at?', options: ['Wireless connection', 'Recording music only', 'Picking up everything', 'Rejecting background noise'], correctAnswer: 'Rejecting background noise', difficulty: 'easy' },
    { type: 'true_false', prompt: 'XLR microphones need an audio interface to connect to a computer.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
  ],
  'Recording Space': [
    { type: 'multiple_choice', prompt: 'What is the biggest enemy of good podcast audio?', options: ['Silence', 'Echo and background noise', 'Quiet rooms', 'Soft surfaces'], correctAnswer: 'Echo and background noise', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A closet full of clothes can be a great recording space.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Soft surfaces like curtains and carpets help ___ sound reflections.', options: ['Absorb', 'Amplify', 'Create', 'Increase'], correctAnswer: 'Absorb', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Recording in a tiled bathroom for its natural reverb.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is acoustic treatment?', options: ['Making rooms louder', 'Soundproofing only', 'Playing music', 'Adding materials to reduce echo and improve sound'], correctAnswer: 'Adding materials to reduce echo and improve sound', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Recording away from windows reduces outside noise interference.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Software': [
    { type: 'multiple_choice', prompt: 'Which is a free podcast recording/editing software?', options: ['Audacity', 'Photoshop', 'Excel', 'Final Cut Pro'], correctAnswer: 'Audacity', difficulty: 'easy' },
    { type: 'true_false', prompt: 'GarageBand is a free option for Mac users to edit podcasts.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Export your podcast audio as ___ format for most hosting platforms.', options: ['MP3', 'WAV', 'FLAC', 'MIDI'], correctAnswer: 'MP3', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Learning basic audio editing before publishing episodes.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "noise reduction" do in audio editing?', options: ['Removes background hiss and hum', 'Adds music', 'Makes audio louder', 'Changes your voice'], correctAnswer: 'Removes background hiss and hum', difficulty: 'easy' },
    { type: 'true_false', prompt: 'You need expensive software to start a podcast.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
  ],
  'Voice Training': [
    { type: 'multiple_choice', prompt: 'How can you improve your podcast voice?', options: ['Yell into the mic', 'Practice projection, pacing, and warmth', 'Use auto-tune', 'Whisper everything'], correctAnswer: 'Practice projection, pacing, and warmth', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Speaking at a varied pace keeps listeners engaged.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Drinking ___ helps keep your vocal cords hydrated during recording.', options: ['Water', 'Coffee', 'Soda', 'Milk'], correctAnswer: 'Water', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Speaking in a monotone voice throughout your podcast.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "vocal fry"?', options: ['A low, creaky voice quality often used at sentence ends', 'A singing technique', 'A microphone effect', 'Frying food'], correctAnswer: 'A low, creaky voice quality often used at sentence ends', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Smiling while speaking can make your voice sound warmer.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Interview Skills': [
    { type: 'multiple_choice', prompt: 'What is the key to a great podcast interview?', options: ['Reading questions from a script only', 'Talking more than the guest', 'Interrupting often', 'Asking open-ended questions and actively listening'], correctAnswer: 'Asking open-ended questions and actively listening', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Researching your guest beforehand improves interview quality.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Open-ended questions start with words like "how," "why," and "___".', options: ['What', 'Is', 'Do', 'Can'], correctAnswer: 'What', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Asking only yes/no questions during an interview.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What should you do when a guest gives an interesting answer?', options: ['Move to the next question immediately', 'Follow up and dig deeper', 'Change the subject', 'Disagree'], correctAnswer: 'Follow up and dig deeper', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Active listening means fully concentrating on what the guest is saying.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  };
}
