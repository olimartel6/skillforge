import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerDanceQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Dance'] = {
  'Rhythm Feel': [
    { type: 'multiple_choice', prompt: 'What is rhythm in dance?', options: ['How fast you move', 'Moving in time with the beat of the music', 'A type of dance', 'The music volume'], correctAnswer: 'Moving in time with the beat of the music', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=440&h=300&fit=crop' },
    { type: 'true_false', prompt: 'Counting beats helps you stay on rhythm.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=440&h=300&fit=crop' },
    { type: 'fill_gap', prompt: 'Most popular music has ___ beats per measure.', options: ['4', '3', '5', '7'], correctAnswer: '4', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Dancing without listening to the music\'s beat.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "downbeat"?', options: ['The last beat', 'A sad song', 'The emphasized first beat of a measure', 'A quiet moment'], correctAnswer: 'The emphasized first beat of a measure', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Clapping along to music helps develop your sense of rhythm.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Basic Steps': [
    { type: 'multiple_choice', prompt: 'What is a "step-touch"?', options: ['A jump', 'A tap dance move', 'A spin', 'Step to the side, then bring the other foot to touch'], correctAnswer: 'Step to the side, then bring the other foot to touch', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=440&h=300&fit=crop' },
    { type: 'true_false', prompt: 'Most dance basics can be broken into simple weight transfers.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=440&h=300&fit=crop' },
    { type: 'fill_gap', prompt: 'A ___ is when you transfer weight from one foot to the other.', options: ['Step', 'Jump', 'Freeze', 'Slide'], correctAnswer: 'Step', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Mastering basic steps before learning complex choreography.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "groove" in dance?', options: ['A stage name', 'A type of shoe', 'A natural bounce or sway to the music', 'A crack in the floor'], correctAnswer: 'A natural bounce or sway to the music', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Bouncing slightly with bent knees helps you feel the beat.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Body Isolation': [
    { type: 'multiple_choice', prompt: 'What is body isolation?', options: ['Dancing alone', 'Standing still', 'Moving one body part independently of others', 'Stretching'], correctAnswer: 'Moving one body part independently of others', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Head, chest, and hip isolations are fundamental to many dance styles.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: '___ isolation involves moving your ribcage side to side independently.', options: ['Chest', 'Hip', 'Head', 'Shoulder'], correctAnswer: 'Chest', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing isolations slowly in front of a mirror.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Why are isolations important in dance?', options: ['They replace stretching', 'They are easy', 'They look weird', 'They build body control and make movements cleaner'], correctAnswer: 'They build body control and make movements cleaner', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Shoulder rolls are a type of isolation exercise.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Footwork': [
    { type: 'multiple_choice', prompt: 'What makes good footwork?', options: ['Never moving feet', 'Clean, precise foot placement on beat', 'Heavy stomping', 'Random steps'], correctAnswer: 'Clean, precise foot placement on beat', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Staying light on your feet helps with quick footwork.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Dancing on the ___ of your feet allows faster movement.', options: ['Balls', 'Heels', 'Sides', 'Toes only'], correctAnswer: 'Balls', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Looking down at your feet while dancing.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "pivot"?', options: ['A slide', 'A jump', 'Turning on the ball of one foot', 'A fall'], correctAnswer: 'Turning on the ball of one foot', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Good footwork requires both speed and control.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Arm Movement': [
    { type: 'multiple_choice', prompt: 'Where do arm movements originate from?', options: ['The elbows', 'The core and shoulders', 'The wrists only', 'The fingers'], correctAnswer: 'The core and shoulders', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Arms should complement and enhance your body movement in dance.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Clean arm movements require ___ and intentional placement.', options: ['Control', 'Speed', 'Force', 'Stiffness'], correctAnswer: 'Control', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Letting arms hang limp and lifeless while dancing.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What creates "flow" in arm movements?', options: ['Smooth transitions connecting one position to the next', 'Random flailing', 'Sharp stops only', 'Keeping arms still'], correctAnswer: 'Smooth transitions connecting one position to the next', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Finger placement and hand shapes add detail to arm movements.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Hip-Hop Basics': [
    { type: 'multiple_choice', prompt: 'Where did hip-hop dance originate?', options: ['Tokyo', 'London', 'New York City and Los Angeles', 'Paris'], correctAnswer: 'New York City and Los Angeles', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The "bounce" is a fundamental element of hip-hop dance.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Hip-hop dance emphasizes ___ and musicality with the beat.', options: ['Groove', 'Height', 'Silence', 'Stillness'], correctAnswer: 'Groove', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Learning the cultural history behind hip-hop dance.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "breaking" (breakdancing)?', options: ['A style of hip-hop involving floor work and power moves', 'A partner dance', 'A slow dance', 'Breaking things'], correctAnswer: 'A style of hip-hop involving floor work and power moves', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Hip-hop dance includes both choreographed and freestyle elements.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Pop & Lock': [
    { type: 'multiple_choice', prompt: 'What is "popping"?', options: ['A spin move', 'Quickly contracting and relaxing muscles to create a jerking effect', 'A jump', 'Popping balloons'], correctAnswer: 'Quickly contracting and relaxing muscles to create a jerking effect', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Locking involves freezing in a position after a quick movement.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Popping was created by ___ Sam in Fresno, California.', options: ['Boogaloo', 'DJ', 'MC', 'Break'], correctAnswer: 'Boogaloo', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Practicing pops with each individual body part separately.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What creates the "hit" in popping?', options: ['Loud music', 'A sharp muscle contraction', 'Jumping', 'Hitting something'], correctAnswer: 'A sharp muscle contraction', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Don Campbell is credited with creating locking.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
  ],
  'Wave Motion': [
    { type: 'multiple_choice', prompt: 'What is a body wave?', options: ['A type of hair style', 'A fluid, sequential movement passing through the body', 'Waving hello', 'A jump move'], correctAnswer: 'A fluid, sequential movement passing through the body', difficulty: 'easy' },
    { type: 'true_false', prompt: 'An arm wave passes movement from fingertips through the shoulders.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Waves require smooth ___ from one body part to the next.', options: ['Transfer', 'Jumping', 'Stopping', 'Tension'], correctAnswer: 'Transfer', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing waves very slowly to master the flow.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Where does a body wave typically start?', options: ['The knees', 'The elbows', 'The head or chest', 'The feet'], correctAnswer: 'The head or chest', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Isolation skills directly help improve wave movements.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  };
}
