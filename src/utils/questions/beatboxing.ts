import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerBeatboxingQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Beatboxing'] = {
  'Basic Beats': [
    { type: 'multiple_choice', prompt: 'What are the 3 basic beatbox sounds?', options: ['Bass, treble, mid', 'Clap, snap, stomp', 'Kick (B), hi-hat (T), snare (Pf/K)', 'Hum, whistle, click'], correctAnswer: 'Kick (B), hi-hat (T), snare (Pf/K)', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Beatboxing uses only the mouth, lips, and throat to create sounds.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The basic kick drum sound is made with the letter ___.', options: ['B', 'T', 'K', 'S'], correctAnswer: 'B', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing basic sounds slowly before trying fast beats.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the standard 4-beat pattern in beatboxing?', options: ['B-T-K-T (kick-hat-snare-hat)', 'All kicks', 'Only breathing', 'Random sounds'], correctAnswer: 'B-T-K-T (kick-hat-snare-hat)', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Beatboxing originated in hip-hop culture.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Hi-Hat': [
    { type: 'multiple_choice', prompt: 'How do you make a basic hi-hat sound?', options: ['Hum loudly', 'Clap your hands', 'A sharp "ts" or "t" with tongue behind teeth', 'Say "boom"'], correctAnswer: 'A sharp "ts" or "t" with tongue behind teeth', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The hi-hat keeps the rhythm between kick and snare.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'An open hi-hat sound is longer, while a closed hi-hat is ___.', options: ['Short', 'Louder', 'Deeper', 'Silent'], correctAnswer: 'Short', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing hi-hat sounds at a consistent tempo.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What creates variation in hi-hat patterns?', options: ['Making them all the same', 'Not using them', 'Mixing open and closed hi-hats with different rhythms', 'Volume only'], correctAnswer: 'Mixing open and closed hi-hats with different rhythms', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The hi-hat is the most frequently used sound in a basic beat.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Snare': [
    { type: 'multiple_choice', prompt: 'How is a basic snare sound made?', options: ['Humming', 'A sharp "pf" or "kh" pushing air out', 'Saying "boom"', 'Clicking tongue'], correctAnswer: 'A sharp "pf" or "kh" pushing air out', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The snare typically falls on beats 2 and 4 in a standard pattern.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The "pf" snare is made by pushing air through closed ___.', options: ['Lips', 'Teeth', 'Nose', 'Eyes'], correctAnswer: 'Lips', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Making your snare sound punchy and distinct from other sounds.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What makes a good snare sound?', options: ['Being breathy', 'Being quiet', 'A sharp, crisp attack', 'Being identical to the kick'], correctAnswer: 'A sharp, crisp attack', difficulty: 'easy' },
    { type: 'true_false', prompt: 'There are multiple ways to make snare sounds in beatboxing.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Bass Drop': [
    { type: 'multiple_choice', prompt: 'What is a "bass drop" in beatboxing?', options: ['A deep, low-frequency sound made with the throat or lips', 'A clapping sound', 'A high-pitched squeal', 'Dropping a bass guitar'], correctAnswer: 'A deep, low-frequency sound made with the throat or lips', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Lip bass uses lip vibration to create a deep bass sound.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The lip ___ is one of the most popular bass sounds in beatboxing.', options: ['Roll', 'Click', 'Pop', 'Snap'], correctAnswer: 'Roll', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Straining your throat to make bass sounds louder.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Where does the vibration come from in lip bass?', options: ['Loose lip vibration, similar to a motorboat sound', 'The nose', 'The teeth', 'The tongue'], correctAnswer: 'Loose lip vibration, similar to a motorboat sound', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Bass sounds add depth and power to beatbox patterns.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Patterns': [
    { type: 'multiple_choice', prompt: 'What is a beatbox pattern?', options: ['A type of microphone', 'A repeated sequence of sounds forming a rhythm', 'A dance move', 'A clothing design'], correctAnswer: 'A repeated sequence of sounds forming a rhythm', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The basic "boots and cats" phrase mimics a drum pattern.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ is one complete cycle of your beat pattern.', options: ['Bar', 'Line', 'Round', 'Set'], correctAnswer: 'Bar', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Mastering one pattern before learning the next.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'How do you make patterns more interesting?', options: ['Add variations, fills, and new sounds', 'Make them simpler', 'Keep them exactly the same', 'Speed up only'], correctAnswer: 'Add variations, fills, and new sounds', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Practicing with a metronome helps keep your patterns in time.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Vocal Scratching': [
    { type: 'multiple_choice', prompt: 'What does vocal scratching imitate?', options: ['DJ turntable scratching sounds', 'A cat scratching', 'Writing sounds', 'Scratching an itch'], correctAnswer: 'DJ turntable scratching sounds', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Vocal scratching adds a DJ-like element to beatboxing.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Vocal scratches use ___ movements with vocalized sounds.', options: ['Tongue', 'Hand', 'Foot', 'Head'], correctAnswer: 'Tongue', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing scratch sounds slowly to get the technique right.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What makes a scratch sound realistic?', options: ['Being very loud', 'Smooth pitch bending and proper mouth shape', 'Using your hands', 'Singing a note'], correctAnswer: 'Smooth pitch bending and proper mouth shape', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Inward and outward scratches create different textures.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Throat Bass': [
    { type: 'multiple_choice', prompt: 'Where does throat bass vibration originate?', options: ['The tongue', 'The lips', 'The throat/vocal folds area', 'The nose'], correctAnswer: 'The throat/vocal folds area', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Throat bass should not cause pain if done correctly.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Throat bass creates a deep ___ vibration in the throat.', options: ['Growling', 'High', 'Silent', 'Whistling'], correctAnswer: 'Growling', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Forcing throat bass for long periods when it hurts.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'How should you practice throat bass as a beginner?', options: ['Gently and in short sessions', 'Never alone', 'Only when sick', 'Full power immediately'], correctAnswer: 'Gently and in short sessions', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Staying hydrated helps protect your throat when practicing bass sounds.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Looping': [
    { type: 'multiple_choice', prompt: 'What is "looping" in beatboxing?', options: ['Running in circles', 'A type of bass', 'Recording a pattern and layering more sounds over it', 'Repeating the same sound'], correctAnswer: 'Recording a pattern and layering more sounds over it', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A loop station/pedal lets you build beats by layering recordings.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'When looping, timing and ___ are critical for clean loops.', options: ['Precision', 'Volume', 'Speed', 'Silence'], correctAnswer: 'Precision', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing your loop timing without a loop station first.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the first layer usually in a loop?', options: ['Vocals', 'Bass only', 'A melody', 'The basic drum pattern'], correctAnswer: 'The basic drum pattern', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Popular loop stations include the Boss RC series.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
  ],
  };
}
