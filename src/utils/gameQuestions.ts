import type { ChartConfig } from '../components/ChartQuestion';
import {
  registerMagicTricksQuestions,
  registerTradingQuestions,
  registerBusinessQuestions,
  registerCookingQuestions,
  registerFitnessQuestions,
  registerChessQuestions,
  registerCodingQuestions,
  registerMarketingQuestions,
  registerDrawingQuestions,
  registerGuitarQuestions,
  registerPianoQuestions,
  registerSingingQuestions,
  registerPublicSpeakingQuestions,
  registerPhotographyQuestions,
  registerDanceQuestions,
  registerStandupComedyQuestions,
  registerFashionDesignQuestions,
  registerPodcastingQuestions,
  registerMeditationQuestions,
  registerBeatboxingQuestions,
  registerFilmmakingQuestions,
  registerOnlineBusinessQuestions,
  registerAIToolsQuestions,
  registerSalesQuestions,
  registerDisciplineQuestions,
  registerBrainTrainingQuestions,
  registerMarketingAgencyQuestions,
  registerRealEstateQuestions,
  registerSideHustlesQuestions,
  registerNegotiationQuestions,
  registerBodyLanguageQuestions,
  registerPersuasionQuestions,
} from './questions';

export interface GameQuestion {
  type: string;
  prompt: string;
  options?: string[];
  correctAnswer: string | number | string[];
  image?: string;
  chart?: ChartConfig;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

type SkillCategory = 'visual_arts' | 'music' | 'communication' | 'performance' | 'digital' | 'general';

function getSkillCategory(skillName: string): SkillCategory {
  const lower = (skillName || '').toLowerCase();
  if (lower.includes('draw') || lower.includes('paint') || lower.includes('callig') || lower.includes('fashion'))
    return 'visual_arts';
  if (lower.includes('guitar') || lower.includes('piano') || lower.includes('sing') || lower.includes('beatbox'))
    return 'music';
  if (lower.includes('speak') || lower.includes('writing') || lower.includes('storytell') || lower.includes('language') || lower.includes('pronunciat') || lower.includes('podcast'))
    return 'communication';
  if (lower.includes('act') || lower.includes('danc') || lower.includes('comedy') || lower.includes('magic'))
    return 'performance';
  if (lower.includes('photo') || lower.includes('video') || lower.includes('edit') || lower.includes('animation') || lower.includes('3d') || lower.includes('film') || lower.includes('coding'))
    return 'digital';
  if (lower.includes('trading') || lower.includes('business') || lower.includes('marketing'))
    return 'general';
  if (lower.includes('cook') || lower.includes('fitness') || lower.includes('meditation') || lower.includes('chess'))
    return 'general';
  return 'general';
}

const GAME_TYPES = [
  'multiple_choice',
  'true_false',
  'match_pairs',
  'speed_sort',
  'fill_gap',
  'swipe_judge',
  'memory_cards',
  'drag_label',
  'spot_difference',
  'timed_challenge',
  'listen_pick',
  'before_after',
];

// ──────────────────── QUESTION BANKS BY CATEGORY ────────────────────

const visualArtsQuestions: Record<string, GameQuestion[]> = {
  multiple_choice: [
    { type: 'multiple_choice', prompt: 'Which color do you get by mixing red and blue?', options: ['Brown', 'Orange', 'Purple', 'Green'], correctAnswer: 'Purple', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=440&h=300&fit=crop' },
    { type: 'multiple_choice', prompt: 'What is chiaroscuro?', options: ['A sculpting technique', 'Use of strong contrast between light and dark', 'A canvas material', 'A type of paint'], correctAnswer: 'Use of strong contrast between light and dark', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'Which pencil grade is the softest?', options: ['4H', '2H', 'HB', '6B'], correctAnswer: '6B', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the vanishing point?', options: ['A blending technique', 'Where parallel lines appear to converge', 'The center of a canvas', 'The darkest area of a drawing'], correctAnswer: 'Where parallel lines appear to converge', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is cross-hatching used for?', options: ['Stretching canvas', 'Erasing mistakes', 'Building tone through intersecting lines', 'Creating color gradients'], correctAnswer: 'Building tone through intersecting lines', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which is a warm color?', options: ['Green', 'Blue', 'Orange', 'Violet'], correctAnswer: 'Orange', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "value" refer to in art?', options: ['The lightness or darkness of a color', 'The price of art', 'The style of an artist', 'The size of a painting'], correctAnswer: 'The lightness or darkness of a color', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is a complementary color to blue?', options: ['Red', 'Orange', 'Yellow', 'Green'], correctAnswer: 'Orange', difficulty: 'medium' },
  ],
  true_false: [
    { type: 'true_false', prompt: 'Primary colors can be made by mixing other colors.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Perspective drawing uses vanishing points to create depth.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A 2H pencil is softer than an HB pencil.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
    { type: 'true_false', prompt: 'White is the absence of all colors in additive color mixing.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'hard' },
    { type: 'true_false', prompt: 'Contour lines define the outline and edges of a form.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Warm colors tend to recede in a painting while cool colors advance.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
  ],
  match_pairs: [
    { type: 'match_pairs', prompt: 'Match each art term with its definition', options: ['Hue', 'The name of a color', 'Saturation', 'The intensity of a color', 'Value', 'Lightness or darkness', 'Tint', 'Color mixed with white'], correctAnswer: ['Hue:The name of a color', 'Saturation:The intensity of a color', 'Value:Lightness or darkness', 'Tint:Color mixed with white'], difficulty: 'medium' },
    { type: 'match_pairs', prompt: 'Match the tool with its use', options: ['Palette knife', 'Mixing and applying paint', 'Kneaded eraser', 'Lifting graphite gently', 'Blending stump', 'Smoothing pencil shading', 'Fixative spray', 'Protecting finished work'], correctAnswer: ['Palette knife:Mixing and applying paint', 'Kneaded eraser:Lifting graphite gently', 'Blending stump:Smoothing pencil shading', 'Fixative spray:Protecting finished work'], difficulty: 'medium' },
  ],
  speed_sort: [
    { type: 'speed_sort', prompt: 'Order these pencil grades from hardest to softest', options: ['4H', '2H', 'HB', '2B', '6B'], correctAnswer: ['4H', '2H', 'HB', '2B', '6B'], difficulty: 'medium' },
    { type: 'speed_sort', prompt: 'Order these drawing steps correctly', options: ['Sketch basic shapes', 'Add details', 'Refine outlines', 'Add shading', 'Final touches'], correctAnswer: ['Sketch basic shapes', 'Refine outlines', 'Add details', 'Add shading', 'Final touches'], difficulty: 'easy' },
  ],
  fill_gap: [
    { type: 'fill_gap', prompt: 'The three primary colors are red, blue, and ___.', options: ['Green', 'Yellow', 'Orange', 'Purple'], correctAnswer: 'Yellow', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ is used to create smooth gradients in charcoal drawings.', options: ['Ruler', 'Blending stump', 'Palette knife', 'Compass'], correctAnswer: 'Blending stump', difficulty: 'medium' },
    { type: 'fill_gap', prompt: 'In the color wheel, colors opposite each other are called ___ colors.', options: ['Analogous', 'Complementary', 'Triadic', 'Neutral'], correctAnswer: 'Complementary', difficulty: 'medium' },
  ],
  swipe_judge: [
    { type: 'swipe_judge', prompt: 'Using a 6B pencil for light, delicate line work.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Starting a portrait with basic geometric shapes to map proportions.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Applying heavy pressure from the very first sketch lines.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using a reference image to study proportions and form.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Smudging graphite with your finger for shading.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'medium' },
  ],
  memory_cards: [
    { type: 'memory_cards', prompt: 'Match these art terms with their partners', options: ['Hue', 'Hue', 'Tint', 'Tint', 'Shade', 'Shade', 'Tone', 'Tone', 'Value', 'Value', 'Contour', 'Contour'], correctAnswer: ['Hue', 'Tint', 'Shade', 'Tone', 'Value', 'Contour'], difficulty: 'medium' },
  ],
  drag_label: [
    { type: 'drag_label', prompt: 'Label the parts of the color wheel', options: ['Primary', 'Secondary', 'Tertiary', 'Complementary'], correctAnswer: ['Primary', 'Secondary', 'Tertiary', 'Complementary'], difficulty: 'medium' },
  ],
  spot_difference: [
    { type: 'spot_difference', prompt: 'Which description contains an error about shading?', options: ['Use hatching lines that follow the form of the object to create volume', 'Cross-hatching involves drawing parallel lines in only one direction'], correctAnswer: 'Cross-hatching involves drawing parallel lines in only one direction', difficulty: 'medium' },
    { type: 'spot_difference', prompt: 'Which statement about perspective is wrong?', options: ['One-point perspective has a single vanishing point', 'In two-point perspective, vertical lines also converge to vanishing points'], correctAnswer: 'In two-point perspective, vertical lines also converge to vanishing points', difficulty: 'hard' },
  ],
  timed_challenge: [
    { type: 'timed_challenge', prompt: 'Name 3 types of brush strokes', options: ['Flat wash', 'Dry brush', 'Stippling', 'Welding', 'Soldering', 'Riveting'], correctAnswer: ['Flat wash', 'Dry brush', 'Stippling'], difficulty: 'medium' },
    { type: 'timed_challenge', prompt: 'Select all warm colors', options: ['Red', 'Orange', 'Yellow', 'Blue', 'Green', 'Purple'], correctAnswer: ['Red', 'Orange', 'Yellow'], difficulty: 'easy' },
  ],
  listen_pick: [
    { type: 'listen_pick', prompt: 'Which technique creates texture by applying small dots?', options: ['Stippling', 'Hatching', 'Glazing', 'Impasto'], correctAnswer: 'Stippling', difficulty: 'medium' },
    { type: 'listen_pick', prompt: 'Which technique uses thick layers of paint for a 3D effect?', options: ['Impasto', 'Wash', 'Scumbling', 'Sgraffito'], correctAnswer: 'Impasto', difficulty: 'medium' },
  ],
  before_after: [
    { type: 'before_after', prompt: 'Which is the improved shading technique?', options: ['Shading with random scribbles in all directions', 'Shading with consistent hatching lines following the form'], correctAnswer: 'Shading with consistent hatching lines following the form', difficulty: 'easy' },
    { type: 'before_after', prompt: 'Which composition is better?', options: ['Subject placed dead center with equal empty space on all sides', 'Subject placed using the rule of thirds with visual interest'], correctAnswer: 'Subject placed using the rule of thirds with visual interest', difficulty: 'medium' },
  ],
};

const musicQuestions: Record<string, GameQuestion[]> = {
  multiple_choice: [
    { type: 'multiple_choice', prompt: 'How many notes are in a standard major scale?', options: ['7', '8', '5', '12'], correctAnswer: '7', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "forte" mean in music?', options: ['Loud', 'Fast', 'Soft', 'Slow'], correctAnswer: 'Loud', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which interval is called a "perfect fifth"?', options: ['C to E', 'C to A', 'C to F', 'C to G'], correctAnswer: 'C to G', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What time signature is a waltz typically in?', options: ['4/4', '2/4', '6/8', '3/4'], correctAnswer: '3/4', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "legato" mean?', options: ['Very fast', 'Smooth and connected', 'Gradually louder', 'Short and detached'], correctAnswer: 'Smooth and connected', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'Which chord is made up of the notes C, E, and G?', options: ['C minor', 'C augmented', 'C major', 'C diminished'], correctAnswer: 'C major', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is syncopation?', options: ['Playing in unison', 'A type of scale', 'Emphasis on off-beats', 'Playing very quietly'], correctAnswer: 'Emphasis on off-beats', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'How many frets does a standard guitar typically have?', options: ['12-14', '18-20', '21-24', '28-30'], correctAnswer: '21-24', difficulty: 'medium' },
  ],
  true_false: [
    { type: 'true_false', prompt: 'A minor chord sounds happy and bright.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The standard tuning for guitar is E-A-D-G-B-E.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Crescendo means to gradually get softer.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A whole note receives 4 beats in 4/4 time.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The pentatonic scale has 7 notes.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Staccato notes should be played short and detached.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  match_pairs: [
    { type: 'match_pairs', prompt: 'Match the musical term with its meaning', options: ['Piano', 'Soft', 'Allegro', 'Fast', 'Adagio', 'Slow', 'Fortissimo', 'Very loud'], correctAnswer: ['Piano:Soft', 'Allegro:Fast', 'Adagio:Slow', 'Fortissimo:Very loud'], difficulty: 'medium' },
    { type: 'match_pairs', prompt: 'Match the note with its beat count in 4/4', options: ['Whole note', '4 beats', 'Half note', '2 beats', 'Quarter note', '1 beat', 'Eighth note', '1/2 beat'], correctAnswer: ['Whole note:4 beats', 'Half note:2 beats', 'Quarter note:1 beat', 'Eighth note:1/2 beat'], difficulty: 'easy' },
  ],
  speed_sort: [
    { type: 'speed_sort', prompt: 'Order these tempos from slowest to fastest', options: ['Largo', 'Adagio', 'Andante', 'Allegro', 'Presto'], correctAnswer: ['Largo', 'Adagio', 'Andante', 'Allegro', 'Presto'], difficulty: 'medium' },
    { type: 'speed_sort', prompt: 'Order these notes from lowest to highest pitch', options: ['C3', 'E3', 'G3', 'C4', 'E4'], correctAnswer: ['C3', 'E3', 'G3', 'C4', 'E4'], difficulty: 'easy' },
  ],
  fill_gap: [
    { type: 'fill_gap', prompt: 'A chord made of root, minor third, and fifth is called a ___ chord.', options: ['Major', 'Minor', 'Diminished', 'Augmented'], correctAnswer: 'Minor', difficulty: 'medium' },
    { type: 'fill_gap', prompt: 'The distance between two notes is called an ___.', options: ['Octave', 'Interval', 'Arpeggio', 'Chord'], correctAnswer: 'Interval', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'In standard notation, notes on the lines of the treble clef spell ___.', options: ['FACE', 'EGBDF', 'ABCDE', 'CDEFG'], correctAnswer: 'EGBDF', difficulty: 'hard' },
  ],
  swipe_judge: [
    { type: 'swipe_judge', prompt: 'Pressing too hard on guitar strings causing buzzing.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing scales slowly with a metronome before increasing speed.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Always using the same finger for every note on a piano.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Warming up with simple exercises before playing complex pieces.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
  ],
  memory_cards: [
    { type: 'memory_cards', prompt: 'Match these music dynamics', options: ['pp', 'pp', 'p', 'p', 'mf', 'mf', 'f', 'f', 'ff', 'ff', 'mp', 'mp'], correctAnswer: ['pp', 'p', 'mf', 'f', 'ff', 'mp'], difficulty: 'medium' },
  ],
  drag_label: [
    { type: 'drag_label', prompt: 'Label the parts of a guitar', options: ['Headstock', 'Neck', 'Body', 'Bridge'], correctAnswer: ['Headstock', 'Neck', 'Body', 'Bridge'], difficulty: 'easy' },
  ],
  spot_difference: [
    { type: 'spot_difference', prompt: 'Which statement about chords is incorrect?', options: ['A major chord has a root, major third, and perfect fifth', 'A minor chord has a root, major third, and perfect fifth'], correctAnswer: 'A minor chord has a root, major third, and perfect fifth', difficulty: 'medium' },
  ],
  timed_challenge: [
    { type: 'timed_challenge', prompt: 'Select all string instruments', options: ['Guitar', 'Violin', 'Cello', 'Trumpet', 'Flute', 'Drums'], correctAnswer: ['Guitar', 'Violin', 'Cello'], difficulty: 'easy' },
    { type: 'timed_challenge', prompt: 'Select the notes in a C major chord', options: ['C', 'E', 'G', 'D', 'F', 'A'], correctAnswer: ['C', 'E', 'G'], difficulty: 'medium' },
  ],
  listen_pick: [
    { type: 'listen_pick', prompt: 'Which describes a staccato playing style?', options: ['Short and detached notes', 'Long and flowing notes', 'Gradually getting louder', 'Playing without rhythm'], correctAnswer: 'Short and detached notes', difficulty: 'easy' },
    { type: 'listen_pick', prompt: 'What does "vibrato" involve?', options: ['Rapid variation of pitch', 'Playing with a mute', 'Strumming without a pick', 'Playing in a different key'], correctAnswer: 'Rapid variation of pitch', difficulty: 'medium' },
  ],
  before_after: [
    { type: 'before_after', prompt: 'Which is better practice technique?', options: ['Playing a difficult piece at full speed repeatedly until you get it right', 'Breaking the piece into sections and practicing each slowly before combining'], correctAnswer: 'Breaking the piece into sections and practicing each slowly before combining', difficulty: 'easy' },
  ],
};

const communicationQuestions: Record<string, GameQuestion[]> = {
  multiple_choice: [
    { type: 'multiple_choice', prompt: 'What is the ideal number of main points in a presentation?', options: ['3-5', '1-2', '12+', '8-10'], correctAnswer: '3-5', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "ethos" in rhetoric?', options: ['Appeal to logic', 'Appeal to credibility', 'Appeal to emotion', 'Appeal to time'], correctAnswer: 'Appeal to credibility', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What percentage of communication is non-verbal?', options: ['55-65%', '10-20%', '30-40%', '80-90%'], correctAnswer: '55-65%', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is active listening?', options: ['Repeating everything back word for word', 'Taking notes during conversation', 'Waiting for your turn to speak', 'Fully concentrating and responding to the speaker'], correctAnswer: 'Fully concentrating and responding to the speaker', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which is NOT a persuasion technique?', options: ['Randomization', 'Reciprocity', 'Scarcity', 'Social proof'], correctAnswer: 'Randomization', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is the "rule of three" in public speaking?', options: ['Practice 3 times before presenting', 'Use 3 main points for impact', 'Speak for 3 minutes max', 'Repeat each point 3 times'], correctAnswer: 'Use 3 main points for impact', difficulty: 'easy' },
  ],
  true_false: [
    { type: 'true_false', prompt: 'Filler words like "um" and "uh" always strengthen your message.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Eye contact helps build trust with your audience.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Reading directly from slides is the best presentation technique.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A strong opening hook captures the audience within the first 30 seconds.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Speaking faster shows confidence and expertise.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
  ],
  match_pairs: [
    { type: 'match_pairs', prompt: 'Match the rhetoric term with its meaning', options: ['Ethos', 'Credibility appeal', 'Pathos', 'Emotional appeal', 'Logos', 'Logical appeal', 'Kairos', 'Timeliness'], correctAnswer: ['Ethos:Credibility appeal', 'Pathos:Emotional appeal', 'Logos:Logical appeal', 'Kairos:Timeliness'], difficulty: 'medium' },
  ],
  speed_sort: [
    { type: 'speed_sort', prompt: 'Order a presentation structure correctly', options: ['Hook / Opening', 'Introduction / Context', 'Main Points', 'Supporting Evidence', 'Conclusion / Call to Action'], correctAnswer: ['Hook / Opening', 'Introduction / Context', 'Main Points', 'Supporting Evidence', 'Conclusion / Call to Action'], difficulty: 'easy' },
  ],
  fill_gap: [
    { type: 'fill_gap', prompt: 'The appeal to emotion in rhetoric is called ___.', options: ['Ethos', 'Pathos', 'Logos', 'Kairos'], correctAnswer: 'Pathos', difficulty: 'medium' },
    { type: 'fill_gap', prompt: 'A speech should end with a strong ___ to leave a lasting impression.', options: ['Apology', 'Call to action', 'List of references', 'Disclaimer'], correctAnswer: 'Call to action', difficulty: 'easy' },
  ],
  swipe_judge: [
    { type: 'swipe_judge', prompt: 'Crossing your arms while speaking to an audience.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using strategic pauses to let key points sink in.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Starting a presentation with a relevant personal story.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
  ],
  memory_cards: [
    { type: 'memory_cards', prompt: 'Match communication concepts', options: ['Ethos', 'Ethos', 'Pathos', 'Pathos', 'Logos', 'Logos', 'Hook', 'Hook', 'CTA', 'CTA', 'Pause', 'Pause'], correctAnswer: ['Ethos', 'Pathos', 'Logos', 'Hook', 'CTA', 'Pause'], difficulty: 'medium' },
  ],
  drag_label: [
    { type: 'drag_label', prompt: 'Label the parts of a persuasive essay', options: ['Thesis', 'Evidence', 'Counterargument', 'Conclusion'], correctAnswer: ['Thesis', 'Evidence', 'Counterargument', 'Conclusion'], difficulty: 'medium' },
  ],
  spot_difference: [
    { type: 'spot_difference', prompt: 'Which presentation tip is incorrect?', options: ['Make eye contact with different sections of the audience throughout your talk', 'Always read your entire speech from a script to avoid mistakes'], correctAnswer: 'Always read your entire speech from a script to avoid mistakes', difficulty: 'easy' },
  ],
  timed_challenge: [
    { type: 'timed_challenge', prompt: 'Select all elements of strong body language', options: ['Eye contact', 'Open posture', 'Natural gestures', 'Looking at the floor', 'Fidgeting', 'Monotone voice'], correctAnswer: ['Eye contact', 'Open posture', 'Natural gestures'], difficulty: 'easy' },
  ],
  listen_pick: [
    { type: 'listen_pick', prompt: 'Which vocal technique involves changing pitch to maintain interest?', options: ['Vocal variety', 'Monotone', 'Whispering', 'Shouting'], correctAnswer: 'Vocal variety', difficulty: 'easy' },
  ],
  before_after: [
    { type: 'before_after', prompt: 'Which is a better speech opening?', options: ['Today I will talk about climate change and its effects.', 'Imagine waking up to find your entire neighborhood underwater. For millions, this is not hypothetical.'], correctAnswer: 'Imagine waking up to find your entire neighborhood underwater. For millions, this is not hypothetical.', difficulty: 'easy' },
  ],
};

const performanceQuestions: Record<string, GameQuestion[]> = {
  multiple_choice: [
    { type: 'multiple_choice', prompt: 'What is "blocking" in theater?', options: ['The planned movement of actors on stage', 'Forgetting your lines', 'A vocal warm-up', 'A type of stage lighting'], correctAnswer: 'The planned movement of actors on stage', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the key principle of misdirection in magic?', options: ['Directing the audience\'s attention away from the secret move', 'Moving very fast', 'Speaking loudly', 'Using very large props'], correctAnswer: 'Directing the audience\'s attention away from the secret move', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "force" in card magic?', options: ['Making someone pick a specific card while they think it\'s free choice', 'Bending the cards', 'Throwing cards at the audience', 'Stacking the deck visibly'], correctAnswer: 'Making someone pick a specific card while they think it\'s free choice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "double lift" in card magic?', options: ['Picking up the deck twice', 'Lifting two cards as one', 'A card throwing technique', 'Lifting the table'], correctAnswer: 'Lifting two cards as one', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is "palming" in magic?', options: ['Slapping the table', 'A card shuffling technique', 'Secretly hiding an object in your hand', 'Showing both hands empty'], correctAnswer: 'Secretly hiding an object in your hand', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "patter" in magic?', options: ['The applause from the audience', 'The scripted talk that accompanies a trick', 'A shuffling technique', 'The sound effects used'], correctAnswer: 'The scripted talk that accompanies a trick', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Who is considered the father of modern magic?', options: ['Harry Houdini', 'Penn Jillette', 'David Copperfield', 'Jean Eugène Robert-Houdin'], correctAnswer: 'Jean Eugène Robert-Houdin', difficulty: 'hard' },
    { type: 'multiple_choice', prompt: 'What is a "sleight" in magic?', options: ['A type of card deck', 'A type of wand', 'A skillful hand movement to create an illusion', 'A magic word'], correctAnswer: 'A skillful hand movement to create an illusion', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the "French Drop" in coin magic?', options: ['Dropping a coin on purpose', 'Flipping a coin in the air', 'A French magic society', 'A fake transfer where the coin stays in the original hand'], correctAnswer: 'A fake transfer where the coin stays in the original hand', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What does "angles" mean in magic?', options: ['A type of trick', 'The positions from which the secret can be seen', 'The shape of cards', 'The way you bow'], correctAnswer: 'The positions from which the secret can be seen', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'In improv, what does "yes, and..." mean?', options: ['Say yes to everything literally', 'End the scene quickly', 'Accept and build upon what your partner offers', 'Agree then change the subject'], correctAnswer: 'Accept and build upon what your partner offers', difficulty: 'easy' },
  ],
  true_false: [
    { type: 'true_false', prompt: 'A magician should never reveal the secret behind a trick.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Misdirection only works with fast hand movements.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Harry Houdini was famous for escape tricks.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'You should always repeat the same trick twice for the same audience.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Presentation and storytelling are more important than the secret in magic.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Palming requires months of practice to do smoothly.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  match_pairs: [
    { type: 'match_pairs', prompt: 'Match the magic technique with its description', options: ['Palming', 'Hiding object in hand', 'Misdirection', 'Directing attention away', 'Force', 'Controlling spectator choice', 'Double lift', 'Lifting two cards as one'], correctAnswer: ['Palming:Hiding object in hand', 'Misdirection:Directing attention away', 'Force:Controlling spectator choice', 'Double lift:Lifting two cards as one'], difficulty: 'easy' },
    { type: 'match_pairs', prompt: 'Match the famous magician with their specialty', options: ['Houdini', 'Escape arts', 'David Blaine', 'Street magic', 'Penn & Teller', 'Comedy magic', 'Dai Vernon', 'Close-up card magic'], correctAnswer: ['Houdini:Escape arts', 'David Blaine:Street magic', 'Penn & Teller:Comedy magic', 'Dai Vernon:Close-up card magic'], difficulty: 'medium' },
  ],
  speed_sort: [
    { type: 'speed_sort', prompt: 'Order the steps of performing a magic trick', options: ['Setup/preparation', 'Patter/introduction', 'The secret move', 'The reveal/climax', 'Audience reaction'], correctAnswer: ['Setup/preparation', 'Patter/introduction', 'The secret move', 'The reveal/climax', 'Audience reaction'], difficulty: 'medium' },
    { type: 'speed_sort', prompt: 'Order card magic skills from beginner to advanced', options: ['Basic spreads', 'Simple forces', 'Double lift', 'False shuffles', 'One-hand cuts'], correctAnswer: ['Basic spreads', 'Simple forces', 'Double lift', 'False shuffles', 'One-hand cuts'], difficulty: 'medium' },
  ],
  fill_gap: [
    { type: 'fill_gap', prompt: 'The technique of secretly hiding a coin in your hand is called ___.', options: ['Palming', 'Forcing', 'Flashing', 'Ditching'], correctAnswer: 'Palming', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'When the audience accidentally sees the secret, it\'s called a ___.', options: ['Flash', 'Break', 'Snap', 'Leak'], correctAnswer: 'Flash', difficulty: 'medium' },
  ],
  swipe_judge: [
    { type: 'swipe_judge', prompt: 'Performing the same trick twice for the same audience.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing sleights in front of a mirror before performing.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Telling the audience what you\'re going to do before you do it.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using patter to build suspense and misdirect.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Revealing the secret of your trick to impress the audience.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
  ],
  memory_cards: [
    { type: 'memory_cards', prompt: 'Match magic terms', options: ['Palming', 'Palming', 'Force', 'Force', 'Sleight', 'Sleight', 'Patter', 'Patter', 'Flash', 'Flash', 'Misdirection', 'Misdirection'], correctAnswer: ['Palming', 'Force', 'Sleight', 'Patter', 'Flash', 'Misdirection'], difficulty: 'medium' },
  ],
  drag_label: [
    { type: 'drag_label', prompt: 'Label the parts of a card trick routine', options: ['Setup', 'Presentation', 'Climax', 'Clean-up'], correctAnswer: ['Setup', 'Presentation', 'Climax', 'Clean-up'], difficulty: 'easy' },
  ],
  spot_difference: [
    { type: 'spot_difference', prompt: 'Which magic advice is wrong?', options: ['Practice your sleights until they become natural and smooth', 'Always tell the audience exactly how the trick works to build trust'], correctAnswer: 'Always tell the audience exactly how the trick works to build trust', difficulty: 'easy' },
    { type: 'spot_difference', prompt: 'Which magic principle is incorrect?', options: ['Misdirection works by controlling where the audience looks', 'The faster you move your hands, the less likely anyone will notice the secret move'], correctAnswer: 'The faster you move your hands, the less likely anyone will notice the secret move', difficulty: 'medium' },
  ],
  timed_challenge: [
    { type: 'timed_challenge', prompt: 'Select all magic sleight techniques', options: ['Double lift', 'French drop', 'Classic palm', 'Watercolor wash', 'Vibrato', 'Color grading'], correctAnswer: ['Double lift', 'French drop', 'Classic palm'], difficulty: 'medium' },
  ],
  listen_pick: [
    { type: 'listen_pick', prompt: 'What is a "gimmick" in magic?', options: ['A secret device that helps create the illusion', 'The magician\'s stage name', 'A type of card deck', 'The patter script'], correctAnswer: 'A secret device that helps create the illusion', difficulty: 'easy' },
    { type: 'listen_pick', prompt: 'What is "ditching" in magic?', options: ['Secretly getting rid of an object after the trick', 'Canceling a performance', 'Dropping a prop on stage', 'Changing your act last minute'], correctAnswer: 'Secretly getting rid of an object after the trick', difficulty: 'medium' },
  ],
  before_after: [
    { type: 'before_after', prompt: 'Which is better patter for a card trick?', options: ['Pick a card, any card. OK now I\'ll find it.', 'I had a dream last night where one card kept appearing everywhere. Let me show you... pick any card and let\'s see if fate agrees.'], correctAnswer: 'I had a dream last night where one card kept appearing everywhere. Let me show you... pick any card and let\'s see if fate agrees.', difficulty: 'easy' },
  ],
};

const digitalQuestions: Record<string, GameQuestion[]> = {
  multiple_choice: [
    { type: 'multiple_choice', prompt: 'What does "ISO" control in photography?', options: ['Focus distance', 'Sensor sensitivity to light', 'Zoom level', 'Color temperature'], correctAnswer: 'Sensor sensitivity to light', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=440&h=300&fit=crop' },
    { type: 'multiple_choice', prompt: 'What is the rule of thirds?', options: ['Edit for 3 minutes max', 'Divide frame into 9 equal parts for composition', 'Use 3 colors only', 'Take 3 shots of each subject'], correctAnswer: 'Divide frame into 9 equal parts for composition', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does a wider aperture (f/1.8) produce?', options: ['Everything in focus', 'Shallow depth of field', 'Wider angle', 'Darker image'], correctAnswer: 'Shallow depth of field', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What color space is standard for web?', options: ['Adobe RGB', 'CMYK', 'ProPhoto RGB', 'sRGB'], correctAnswer: 'sRGB', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is "kerning" in design?', options: ['Font size', 'Text alignment', 'Line spacing', 'Space between individual letter pairs'], correctAnswer: 'Space between individual letter pairs', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What does FPS stand for in video?', options: ['Frames Per Second', 'File Processing Speed', 'Full Picture Standard', 'Final Pixel Size'], correctAnswer: 'Frames Per Second', difficulty: 'easy' },
  ],
  true_false: [
    { type: 'true_false', prompt: 'RAW files contain more data than JPEG files.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A higher f-number means a wider aperture opening.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
    { type: 'true_false', prompt: 'CMYK is used for digital screens.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Vector graphics lose quality when scaled up.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
  ],
  match_pairs: [
    { type: 'match_pairs', prompt: 'Match the camera setting with what it controls', options: ['Aperture', 'Depth of field', 'Shutter speed', 'Motion blur', 'ISO', 'Light sensitivity', 'White balance', 'Color temperature'], correctAnswer: ['Aperture:Depth of field', 'Shutter speed:Motion blur', 'ISO:Light sensitivity', 'White balance:Color temperature'], difficulty: 'medium' },
  ],
  speed_sort: [
    { type: 'speed_sort', prompt: 'Order the photo editing workflow', options: ['Import files', 'Color correction', 'Retouching', 'Cropping', 'Export'], correctAnswer: ['Import files', 'Color correction', 'Retouching', 'Cropping', 'Export'], difficulty: 'easy' },
  ],
  fill_gap: [
    { type: 'fill_gap', prompt: 'The three elements of the exposure triangle are aperture, shutter speed, and ___.', options: ['Focus', 'ISO', 'Zoom', 'Flash'], correctAnswer: 'ISO', difficulty: 'easy' },
  ],
  swipe_judge: [
    { type: 'swipe_judge', prompt: 'Shooting portraits at f/22 for maximum background blur.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Using golden hour light for warm, flattering portraits.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
  ],
  memory_cards: [
    { type: 'memory_cards', prompt: 'Match photography terms', options: ['ISO', 'ISO', 'Bokeh', 'Bokeh', 'HDR', 'HDR', 'RAW', 'RAW', 'JPEG', 'JPEG', 'Macro', 'Macro'], correctAnswer: ['ISO', 'Bokeh', 'HDR', 'RAW', 'JPEG', 'Macro'], difficulty: 'medium' },
  ],
  drag_label: [
    { type: 'drag_label', prompt: 'Label the parts of a camera', options: ['Lens', 'Sensor', 'Viewfinder', 'Flash'], correctAnswer: ['Lens', 'Sensor', 'Viewfinder', 'Flash'], difficulty: 'easy' },
  ],
  spot_difference: [
    { type: 'spot_difference', prompt: 'Which photography tip is wrong?', options: ['Use a tripod for long exposure shots to avoid camera shake', 'Always use the highest ISO possible for the cleanest images'], correctAnswer: 'Always use the highest ISO possible for the cleanest images', difficulty: 'easy' },
  ],
  timed_challenge: [
    { type: 'timed_challenge', prompt: 'Select all file formats for images', options: ['JPEG', 'PNG', 'TIFF', 'MP3', 'WAV', 'MIDI'], correctAnswer: ['JPEG', 'PNG', 'TIFF'], difficulty: 'easy' },
  ],
  listen_pick: [
    { type: 'listen_pick', prompt: 'Which describes "bokeh" in photography?', options: ['The aesthetic quality of out-of-focus areas', 'A type of camera lens', 'A photo editing filter', 'A camera brand'], correctAnswer: 'The aesthetic quality of out-of-focus areas', difficulty: 'medium' },
  ],
  before_after: [
    { type: 'before_after', prompt: 'Which photo composition is better?', options: ['Subject centered with cluttered background and no clear focal point', 'Subject placed off-center using rule of thirds with clean background'], correctAnswer: 'Subject placed off-center using rule of thirds with clean background', difficulty: 'easy' },
  ],
};

const allBanks: Record<SkillCategory, Record<string, GameQuestion[]>> = {
  visual_arts: visualArtsQuestions,
  music: musicQuestions,
  communication: communicationQuestions,
  performance: performanceQuestions,
  digital: digitalQuestions,
  general: visualArtsQuestions, // fallback
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDifficultyForLesson(lessonNumber: number): 'easy' | 'medium' | 'hard' {
  if (lessonNumber <= 5) return 'easy';
  if (lessonNumber <= 14) return 'medium';
  return 'hard';
}

// ──────────────── LESSON-SPECIFIC QUESTIONS ────────────────
// Each skill's questions are defined in separate files under ./questions/
// and registered into this map at module load time.

const LESSON_QUESTIONS: Record<string, Record<string, GameQuestion[]>> = {};

// Register all skill questions
registerMagicTricksQuestions(LESSON_QUESTIONS);
registerTradingQuestions(LESSON_QUESTIONS);
registerBusinessQuestions(LESSON_QUESTIONS);
registerCookingQuestions(LESSON_QUESTIONS);
registerFitnessQuestions(LESSON_QUESTIONS);
registerChessQuestions(LESSON_QUESTIONS);
registerCodingQuestions(LESSON_QUESTIONS);
registerMarketingQuestions(LESSON_QUESTIONS);
registerDrawingQuestions(LESSON_QUESTIONS);
registerGuitarQuestions(LESSON_QUESTIONS);
registerPianoQuestions(LESSON_QUESTIONS);
registerSingingQuestions(LESSON_QUESTIONS);
registerPublicSpeakingQuestions(LESSON_QUESTIONS);
registerPhotographyQuestions(LESSON_QUESTIONS);
registerDanceQuestions(LESSON_QUESTIONS);
registerStandupComedyQuestions(LESSON_QUESTIONS);
registerFashionDesignQuestions(LESSON_QUESTIONS);
registerPodcastingQuestions(LESSON_QUESTIONS);
registerMeditationQuestions(LESSON_QUESTIONS);
registerBeatboxingQuestions(LESSON_QUESTIONS);
registerFilmmakingQuestions(LESSON_QUESTIONS);
registerOnlineBusinessQuestions(LESSON_QUESTIONS);
registerAIToolsQuestions(LESSON_QUESTIONS);
registerSalesQuestions(LESSON_QUESTIONS);
registerDisciplineQuestions(LESSON_QUESTIONS);
registerBrainTrainingQuestions(LESSON_QUESTIONS);
registerMarketingAgencyQuestions(LESSON_QUESTIONS);
registerRealEstateQuestions(LESSON_QUESTIONS);
registerSideHustlesQuestions(LESSON_QUESTIONS);
registerNegotiationQuestions(LESSON_QUESTIONS);
registerBodyLanguageQuestions(LESSON_QUESTIONS);
registerPersuasionQuestions(LESSON_QUESTIONS);

export function getQuestionsForLesson(
  skillName: string,
  lessonNumber: number,
  count: number,
): GameQuestion[] {
  // First, try to get lesson-specific questions
  const skillLessons = LESSON_QUESTIONS[skillName];
  if (skillLessons) {
    // Get lesson title from the SKILL_LESSONS mapping (imported concept)
    const lessonTitles = Object.keys(skillLessons);
    const lessonIdx = Math.min(lessonNumber - 1, lessonTitles.length - 1);
    const lessonTitle = lessonTitles[lessonIdx];
    const lessonQs = skillLessons[lessonTitle];

    if (lessonQs && lessonQs.length > 0) {
      return shuffle([...lessonQs]).slice(0, count);
    }
  }

  // Fallback: use category-based questions (for skills without lesson-specific content)
  const category = getSkillCategory(skillName);
  const bank = allBanks[category];
  const maxDifficulty = getDifficultyForLesson(lessonNumber);
  const difficultyOrder = ['easy', 'medium', 'hard'] as const;
  const maxIdx = difficultyOrder.indexOf(maxDifficulty);

  const typesForLesson = shuffle(GAME_TYPES).slice(0, Math.min(count, GAME_TYPES.length));
  const questions: GameQuestion[] = [];

  for (const gameType of typesForLesson) {
    const typeQuestions = bank[gameType] || [];
    const filtered = typeQuestions.filter(
      (q) => difficultyOrder.indexOf(q.difficulty) <= maxIdx,
    );
    if (filtered.length > 0) {
      const idx = (lessonNumber + questions.length) % filtered.length;
      questions.push({ ...filtered[idx] });
    }
    if (questions.length >= count) break;
  }

  const fillers = [
    ...(bank.multiple_choice || []),
    ...(bank.true_false || []),
    ...(bank.fill_gap || []),
  ].filter((q) => difficultyOrder.indexOf(q.difficulty) <= maxIdx);

  let fillerIdx = 0;
  while (questions.length < count && fillerIdx < fillers.length) {
    const q = fillers[fillerIdx];
    if (!questions.some((existing) => existing.prompt === q.prompt)) {
      questions.push({ ...q });
    }
    fillerIdx++;
  }

  return shuffle(questions).slice(0, count);
}

export function getLessonGameCount(lessonNumber: number): number {
  if (lessonNumber <= 3) return 5;
  if (lessonNumber <= 10) return 6;
  if (lessonNumber <= 16) return 7;
  return 8;
}
