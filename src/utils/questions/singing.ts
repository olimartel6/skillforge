import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerSingingQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Singing'] = {
  'Breathing': [
    { type: 'multiple_choice', prompt: 'Where should you breathe from when singing?', options: ['Diaphragm', 'Nose only', 'Chest only', 'Throat'], correctAnswer: 'Diaphragm', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Diaphragmatic breathing uses the belly, not just the chest.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ is a dome-shaped muscle below the lungs that controls breathing.', options: ['Diaphragm', 'Larynx', 'Pharynx', 'Trachea'], correctAnswer: 'Diaphragm', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Raising your shoulders when taking a breath to sing.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What happens to your belly during a good singing breath?', options: ['It tightens', 'Nothing', 'It expands outward', 'It sucks in'], correctAnswer: 'It expands outward', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Breath control is the foundation of good singing technique.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Pitch Basics': [
    { type: 'multiple_choice', prompt: 'What is pitch?', options: ['Rhythm', 'How high or low a note sounds', 'Volume', 'Speed of a song'], correctAnswer: 'How high or low a note sounds', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Singing "on pitch" means hitting the correct note.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Singing below the correct note is called singing ___.', options: ['Flat', 'Sharp', 'Loud', 'Fast'], correctAnswer: 'Flat', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using a piano or tuner app to check your pitch.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "singing sharp" mean?', options: ['Singing slightly above the correct pitch', 'Singing loudly', 'Singing too low', 'Singing in a minor key'], correctAnswer: 'Singing slightly above the correct pitch', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Ear training helps improve pitch accuracy over time.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Vocal Range': [
    { type: 'multiple_choice', prompt: 'What is vocal range?', options: ['How fast you can sing', 'The span from your lowest to highest note', 'Your favorite genre', 'How loud you can sing'], correctAnswer: 'The span from your lowest to highest note', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Soprano is the highest common female voice type.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The lowest common male voice type is ___.', options: ['Bass', 'Tenor', 'Alto', 'Soprano'], correctAnswer: 'Bass', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a tenor?', options: ['Lowest female voice', 'A song tempo', 'Highest common male voice', 'An instrument'], correctAnswer: 'Highest common male voice', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Forcing yourself to sing notes outside your comfortable range.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Your vocal range can expand with proper training.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Warm-Ups': [
    { type: 'multiple_choice', prompt: 'Why are vocal warm-ups important?', options: ['They waste time', 'They prepare vocal cords and prevent strain', 'They make you louder', 'They change your range'], correctAnswer: 'They prepare vocal cords and prevent strain', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Lip trills are a common vocal warm-up exercise.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Singing ___ up and down is a basic warm-up exercise.', options: ['Scales', 'Songs', 'Lyrics', 'Words'], correctAnswer: 'Scales', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Singing at full power without warming up first.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'How long should a vocal warm-up last?', options: ['5 seconds', '10-15 minutes', 'No time needed', '1 hour'], correctAnswer: '10-15 minutes', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Humming is a gentle and effective vocal warm-up.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Vowel Shapes': [
    { type: 'multiple_choice', prompt: 'Why are vowel shapes important in singing?', options: ['They look nice', 'They affect tone quality and resonance', 'They change the lyrics', 'They don\'t matter'], correctAnswer: 'They affect tone quality and resonance', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Tall, open vowels produce a richer singing tone.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The five primary vowels in singing are A, E, I, O, and ___.', options: ['U', 'Y', 'W', 'R'], correctAnswer: 'U', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Modifying vowels slightly on high notes for easier singing.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What does "open throat" mean in singing?', options: ['Singing with mouth closed', 'Yelling', 'Breathing through the mouth', 'A relaxed, open pharynx for better resonance'], correctAnswer: 'A relaxed, open pharynx for better resonance', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Jaw tension hurts vowel production.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Head Voice': [
    { type: 'multiple_choice', prompt: 'What is head voice?', options: ['Speaking voice', 'The lighter, higher register of the voice', 'Thinking about singing', 'Whispering'], correctAnswer: 'The lighter, higher register of the voice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Head voice vibrations are felt mostly in the head/skull area.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Head voice is used for ___ notes in your range.', options: ['Higher', 'Lower', 'Middle', 'All'], correctAnswer: 'Higher', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Straining to hit high notes instead of switching to head voice.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Head voice sounds _____ compared to chest voice.', options: ['Exactly the same', 'Lower', 'Heavier and louder', 'Lighter and more airy'], correctAnswer: 'Lighter and more airy', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Falsetto and head voice are exactly the same thing.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
  ],
  'Chest Voice': [
    { type: 'multiple_choice', prompt: 'What is chest voice?', options: ['Whispering', 'Head voice synonym', 'The fuller, lower register used for speaking and lower singing', 'Only for men'], correctAnswer: 'The fuller, lower register used for speaking and lower singing', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Chest voice vibrations are felt in the chest area.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Chest voice uses thicker vocal cord vibration for a ___ sound.', options: ['Richer', 'Thinner', 'Lighter', 'Quieter'], correctAnswer: 'Richer', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Pushing chest voice too high instead of blending into mix voice.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Most pop and rock singing is primarily in which voice?', options: ['Chest voice and mix', 'Falsetto', 'Whistle register', 'Head voice'], correctAnswer: 'Chest voice and mix', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Everyone has a chest voice, regardless of voice type.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Mix Voice': [
    { type: 'multiple_choice', prompt: 'What is mix voice?', options: ['A type of microphone', 'Singing two notes at once', 'A blend of chest and head voice qualities', 'Only for opera'], correctAnswer: 'A blend of chest and head voice qualities', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Mix voice allows you to sing higher without straining.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Mix voice bridges the ___ between chest and head voice.', options: ['Gap', 'Key', 'Note', 'Beat'], correctAnswer: 'Gap', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing smoothly transitioning between chest and head voice.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Where does the "break" or "passaggio" occur?', options: ['At your lowest note', 'Where chest voice transitions to head voice', 'At the end of a song', 'When you run out of breath'], correctAnswer: 'Where chest voice transitions to head voice', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Training mix voice helps eliminate the vocal "break".', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  };
}
