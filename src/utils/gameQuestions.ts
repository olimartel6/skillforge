export interface GameQuestion {
  type: string;
  prompt: string;
  options?: string[];
  correctAnswer: string | number | string[];
  image?: string;
  difficulty: 'easy' | 'medium' | 'hard';
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
    { type: 'multiple_choice', prompt: 'Which color do you get by mixing red and blue?', options: ['Green', 'Purple', 'Orange', 'Brown'], correctAnswer: 'Purple', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=440&h=300&fit=crop' },
    { type: 'multiple_choice', prompt: 'What is chiaroscuro?', options: ['A type of paint', 'Use of strong contrast between light and dark', 'A sculpting technique', 'A canvas material'], correctAnswer: 'Use of strong contrast between light and dark', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'Which pencil grade is the softest?', options: ['2H', 'HB', '6B', '4H'], correctAnswer: '6B', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the vanishing point?', options: ['Where parallel lines appear to converge', 'The center of a canvas', 'A blending technique', 'The darkest area of a drawing'], correctAnswer: 'Where parallel lines appear to converge', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is cross-hatching used for?', options: ['Creating color gradients', 'Building tone through intersecting lines', 'Erasing mistakes', 'Stretching canvas'], correctAnswer: 'Building tone through intersecting lines', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which is a warm color?', options: ['Blue', 'Green', 'Orange', 'Violet'], correctAnswer: 'Orange', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "value" refer to in art?', options: ['The price of art', 'The lightness or darkness of a color', 'The size of a painting', 'The style of an artist'], correctAnswer: 'The lightness or darkness of a color', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is a complementary color to blue?', options: ['Green', 'Red', 'Orange', 'Yellow'], correctAnswer: 'Orange', difficulty: 'medium' },
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
    { type: 'multiple_choice', prompt: 'How many notes are in a standard major scale?', options: ['5', '7', '8', '12'], correctAnswer: '7', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "forte" mean in music?', options: ['Slow', 'Fast', 'Loud', 'Soft'], correctAnswer: 'Loud', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which interval is called a "perfect fifth"?', options: ['C to E', 'C to F', 'C to G', 'C to A'], correctAnswer: 'C to G', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What time signature is a waltz typically in?', options: ['2/4', '3/4', '4/4', '6/8'], correctAnswer: '3/4', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "legato" mean?', options: ['Short and detached', 'Smooth and connected', 'Gradually louder', 'Very fast'], correctAnswer: 'Smooth and connected', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'Which chord is made up of the notes C, E, and G?', options: ['C minor', 'C major', 'C diminished', 'C augmented'], correctAnswer: 'C major', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is syncopation?', options: ['Playing in unison', 'Emphasis on off-beats', 'Playing very quietly', 'A type of scale'], correctAnswer: 'Emphasis on off-beats', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'How many frets does a standard guitar typically have?', options: ['18-20', '21-24', '12-14', '28-30'], correctAnswer: '21-24', difficulty: 'medium' },
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
    { type: 'multiple_choice', prompt: 'What is the ideal number of main points in a presentation?', options: ['1-2', '3-5', '8-10', '12+'], correctAnswer: '3-5', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "ethos" in rhetoric?', options: ['Appeal to emotion', 'Appeal to logic', 'Appeal to credibility', 'Appeal to time'], correctAnswer: 'Appeal to credibility', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What percentage of communication is non-verbal?', options: ['10-20%', '30-40%', '55-65%', '80-90%'], correctAnswer: '55-65%', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is active listening?', options: ['Waiting for your turn to speak', 'Fully concentrating and responding to the speaker', 'Taking notes during conversation', 'Repeating everything back word for word'], correctAnswer: 'Fully concentrating and responding to the speaker', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which is NOT a persuasion technique?', options: ['Social proof', 'Reciprocity', 'Randomization', 'Scarcity'], correctAnswer: 'Randomization', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is the "rule of three" in public speaking?', options: ['Speak for 3 minutes max', 'Use 3 main points for impact', 'Repeat each point 3 times', 'Practice 3 times before presenting'], correctAnswer: 'Use 3 main points for impact', difficulty: 'easy' },
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
    { type: 'multiple_choice', prompt: 'What is "blocking" in theater?', options: ['Forgetting your lines', 'The planned movement of actors on stage', 'A vocal warm-up', 'A type of stage lighting'], correctAnswer: 'The planned movement of actors on stage', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the key principle of misdirection in magic?', options: ['Moving very fast', 'Directing the audience\'s attention away from the secret move', 'Using very large props', 'Speaking loudly'], correctAnswer: 'Directing the audience\'s attention away from the secret move', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "force" in card magic?', options: ['Bending the cards', 'Making someone pick a specific card while they think it\'s free choice', 'Throwing cards at the audience', 'Stacking the deck visibly'], correctAnswer: 'Making someone pick a specific card while they think it\'s free choice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "double lift" in card magic?', options: ['Lifting two cards as one', 'Picking up the deck twice', 'A card throwing technique', 'Lifting the table'], correctAnswer: 'Lifting two cards as one', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is "palming" in magic?', options: ['Slapping the table', 'Secretly hiding an object in your hand', 'Showing both hands empty', 'A card shuffling technique'], correctAnswer: 'Secretly hiding an object in your hand', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "patter" in magic?', options: ['The sound effects used', 'The scripted talk that accompanies a trick', 'A shuffling technique', 'The applause from the audience'], correctAnswer: 'The scripted talk that accompanies a trick', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Who is considered the father of modern magic?', options: ['David Copperfield', 'Jean Eugène Robert-Houdin', 'Harry Houdini', 'Penn Jillette'], correctAnswer: 'Jean Eugène Robert-Houdin', difficulty: 'hard' },
    { type: 'multiple_choice', prompt: 'What is a "sleight" in magic?', options: ['A type of wand', 'A skillful hand movement to create an illusion', 'A magic word', 'A type of card deck'], correctAnswer: 'A skillful hand movement to create an illusion', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the "French Drop" in coin magic?', options: ['Dropping a coin on purpose', 'A fake transfer where the coin stays in the original hand', 'Flipping a coin in the air', 'A French magic society'], correctAnswer: 'A fake transfer where the coin stays in the original hand', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What does "angles" mean in magic?', options: ['The shape of cards', 'The positions from which the secret can be seen', 'The way you bow', 'A type of trick'], correctAnswer: 'The positions from which the secret can be seen', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'In improv, what does "yes, and..." mean?', options: ['Agree then change the subject', 'Accept and build upon what your partner offers', 'Say yes to everything literally', 'End the scene quickly'], correctAnswer: 'Accept and build upon what your partner offers', difficulty: 'easy' },
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
    { type: 'multiple_choice', prompt: 'What does "ISO" control in photography?', options: ['Focus distance', 'Sensor sensitivity to light', 'Color temperature', 'Zoom level'], correctAnswer: 'Sensor sensitivity to light', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=440&h=300&fit=crop' },
    { type: 'multiple_choice', prompt: 'What is the rule of thirds?', options: ['Use 3 colors only', 'Divide frame into 9 equal parts for composition', 'Take 3 shots of each subject', 'Edit for 3 minutes max'], correctAnswer: 'Divide frame into 9 equal parts for composition', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does a wider aperture (f/1.8) produce?', options: ['Everything in focus', 'Shallow depth of field', 'Darker image', 'Wider angle'], correctAnswer: 'Shallow depth of field', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What color space is standard for web?', options: ['CMYK', 'sRGB', 'Adobe RGB', 'ProPhoto RGB'], correctAnswer: 'sRGB', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What is "kerning" in design?', options: ['Line spacing', 'Space between individual letter pairs', 'Font size', 'Text alignment'], correctAnswer: 'Space between individual letter pairs', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'What does FPS stand for in video?', options: ['Frames Per Second', 'Full Picture Standard', 'File Processing Speed', 'Final Pixel Size'], correctAnswer: 'Frames Per Second', difficulty: 'easy' },
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
// Each lesson topic maps to focused questions about that specific subject

const LESSON_QUESTIONS: Record<string, Record<string, GameQuestion[]>> = {
  'Magic Tricks': {
    'Magic Basics': [
      { type: 'multiple_choice', prompt: 'What is the #1 rule of magic?', options: ['Move fast', 'Never reveal the secret', 'Use expensive props', 'Wear a cape'], correctAnswer: 'Never reveal the secret', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1542379653-b928db1aee4a?w=440&h=300&fit=crop' },
      { type: 'true_false', prompt: 'Magic is mostly about speed of hands.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What are the 3 parts of any magic trick?', options: ['Setup, Performance, Applause', 'The Pledge, The Turn, The Prestige', 'Shuffle, Cut, Deal', 'Intro, Middle, End'], correctAnswer: 'The Pledge, The Turn, The Prestige', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Practicing in front of a mirror before performing.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should always tell the audience what you\'re about to do.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "gimmick" in magic?', options: ['A joke you tell', 'A secret device that helps the trick', 'Your stage outfit', 'A type of card'], correctAnswer: 'A secret device that helps the trick', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The story a magician tells during a trick is called ___.', options: ['Patter', 'Script', 'Lyrics', 'Plot'], correctAnswer: 'Patter', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which intro is better for a magic show?', options: ['I\'m going to do a trick now.', 'Have you ever had a moment where the impossible became real? Watch closely...'], correctAnswer: 'Have you ever had a moment where the impossible became real? Watch closely...', difficulty: 'easy' },
    ],
    'Card Fundamentals': [
      { type: 'multiple_choice', prompt: 'How many cards are in a standard deck?', options: ['48', '50', '52', '54'], correctAnswer: '52', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1529480780361-ba1eb4a44de8?w=440&h=300&fit=crop' },
      { type: 'multiple_choice', prompt: 'What are the 4 suits in a deck?', options: ['Hearts, Diamonds, Clubs, Spades', 'Hearts, Stars, Moons, Suns', 'Red, Blue, Green, Yellow', 'Aces, Kings, Queens, Jacks'], correctAnswer: 'Hearts, Diamonds, Clubs, Spades', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A "bridge" is a way to shuffle cards by bending them.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "spread" in card magic?', options: ['Throwing cards everywhere', 'Fanning cards face-up on a table', 'Cutting the deck', 'Dealing to players'], correctAnswer: 'Fanning cards face-up on a table', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The top card of the deck is important because most ___ start there.', options: ['Controls', 'Shuffles', 'Bets', 'Games'], correctAnswer: 'Controls', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Bending someone else\'s cards without permission.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "key card"?', options: ['The most expensive card', 'A card you secretly know the position of', 'The Ace of Spades', 'A card with a mark'], correctAnswer: 'A card you secretly know the position of', difficulty: 'medium' },
      { type: 'true_false', prompt: 'You should always use a brand new deck for performances.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    ],
    'Coin Tricks': [
      { type: 'multiple_choice', prompt: 'What is the "French Drop"?', options: ['Dropping a French coin', 'A fake transfer where the coin stays hidden', 'Flipping a coin in the air', 'A coin vanish using a table'], correctAnswer: 'A fake transfer where the coin stays hidden', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1618060932014-4deda4932554?w=440&h=300&fit=crop' },
      { type: 'true_false', prompt: 'Larger coins are easier for beginners to palm.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What size coin is most popular for magic?', options: ['Dime', 'Quarter', 'Half Dollar', 'Penny'], correctAnswer: 'Half Dollar', difficulty: 'medium' },
      { type: 'fill_gap', prompt: 'Hiding a coin in the curl of your fingers is called ___ palm.', options: ['Classic', 'French', 'English', 'Finger'], correctAnswer: 'Classic', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Looking at your hand where the coin is hidden.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Where should you look during a coin vanish?', options: ['At the hand the audience thinks holds the coin', 'At the hand secretly holding the coin', 'At the floor', 'At the ceiling'], correctAnswer: 'At the hand the audience thinks holds the coin', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The "Muscle Pass" launches a coin from your palm using muscle tension.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'hard' },
      { type: 'before_after', prompt: 'Which coin vanish presentation is better?', options: ['Watch, I\'ll make this coin disappear. *does move*', 'Hold out your hand... feel the weight of the coin... now slowly close your fingers... open them. It\'s gone.'], correctAnswer: 'Hold out your hand... feel the weight of the coin... now slowly close your fingers... open them. It\'s gone.', difficulty: 'medium' },
    ],
    'Misdirection': [
      { type: 'multiple_choice', prompt: 'What is misdirection?', options: ['Moving really fast', 'Controlling where the audience looks', 'Using smoke and mirrors', 'Talking very loudly'], correctAnswer: 'Controlling where the audience looks', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=440&h=300&fit=crop' },
      { type: 'true_false', prompt: 'People naturally look where you look.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Which is the strongest form of misdirection?', options: ['Loud noises', 'Natural attention management', 'Bright lights', 'Confusing patter'], correctAnswer: 'Natural attention management', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Saying "don\'t look at my left hand" during a trick.', options: ['Good misdirection', 'Bad misdirection'], correctAnswer: 'Bad misdirection', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The moment when the secret move happens is called the ___ moment.', options: ['Off-beat', 'High-beat', 'Secret', 'Silent'], correctAnswer: 'Off-beat', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'When should you do the secret move?', options: ['When everyone is watching closely', 'During a moment of relaxation or laughter', 'At the very beginning', 'Never — use gimmicks instead'], correctAnswer: 'During a moment of relaxation or laughter', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Humor is a powerful misdirection tool.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which uses better misdirection?', options: ['*Stares at hands while doing the move*', '*Makes a joke, audience laughs, does the move during the laugh*'], correctAnswer: '*Makes a joke, audience laughs, does the move during the laugh*', difficulty: 'easy' },
    ],
    'The Double Lift': [
      { type: 'multiple_choice', prompt: 'What is a double lift?', options: ['Picking up the whole deck', 'Lifting two cards as if they were one', 'Lifting a card with two hands', 'Flipping the deck over twice'], correctAnswer: 'Lifting two cards as if they were one', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The double lift is one of the most important sleights in card magic.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How do you prepare for a double lift?', options: ['Get a "break" above the top two cards', 'Bend the whole deck', 'Lick your fingers', 'Shake the deck'], correctAnswer: 'Get a "break" above the top two cards', difficulty: 'medium' },
      { type: 'fill_gap', prompt: 'A small gap held by your pinky between cards is called a ___.', options: ['Break', 'Split', 'Gap', 'Hold'], correctAnswer: 'Break', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Practicing the double lift at the same speed as turning a single card.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A double lift should look exactly like turning one card over.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What famous trick relies heavily on the double lift?', options: ['Ambitious Card routine', 'Cup and Balls', 'Rope Cut', 'Coin Vanish'], correctAnswer: 'Ambitious Card routine', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Lifting the cards at a different speed than a normal single flip.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    ],
    'Palming': [
      { type: 'multiple_choice', prompt: 'What is palming?', options: ['Clapping your hands', 'Secretly hiding an object in your hand', 'Showing both hands empty', 'A type of card cut'], correctAnswer: 'Secretly hiding an object in your hand', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Which palm hides a card in the center of your palm?', options: ['Classic palm', 'Finger palm', 'Gambler\'s cop', 'Tenkai palm'], correctAnswer: 'Classic palm', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Your hand should look tense and closed when palming.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The ___ palm holds the card using just the fingers, not the palm itself.', options: ['Finger', 'Classic', 'Back', 'Side'], correctAnswer: 'Finger', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Keeping your palming hand in a natural position at your side.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Squeezing the card tightly so it doesn\'t fall.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should practice palming while watching TV to build muscle memory.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What should your palming hand look like?', options: ['Completely flat and open', 'Clenched in a fist', 'Naturally relaxed, slightly curved', 'Pointing at something'], correctAnswer: 'Naturally relaxed, slightly curved', difficulty: 'easy' },
    ],
    'Forces': [
      { type: 'multiple_choice', prompt: 'What is a "force" in magic?', options: ['Making someone pick a specific card while they feel free', 'Pushing someone to volunteer', 'Bending a card with force', 'Using physical strength in tricks'], correctAnswer: 'Making someone pick a specific card while they feel free', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is the "Hindu Shuffle Force"?', options: ['A force using a Hindu prayer', 'Running packets off the deck, stopping when told', 'A force invented in India', 'Spreading cards on a Hindu rug'], correctAnswer: 'Running packets off the deck, stopping when told', difficulty: 'medium' },
      { type: 'true_false', prompt: 'The Classic Force requires no skill — anyone can do it.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The simplest force is the ___ force, where you just ask them to say "stop".', options: ['Riffle', 'Classic', 'Hindu', 'Slip'], correctAnswer: 'Riffle', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Having a backup plan if the force fails.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What makes a force convincing?', options: ['Going very fast', 'Making the spectator truly feel they had a free choice', 'Using multiple decks', 'Telling them which card to pick'], correctAnswer: 'Making the spectator truly feel they had a free choice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'If a force fails, you should tell the audience and try again.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which force presentation is better?', options: ['Pick this card. No, this one. Take it.', 'Fan through the cards... whenever you feel like it, touch any card that calls to you.'], correctAnswer: 'Fan through the cards... whenever you feel like it, touch any card that calls to you.', difficulty: 'easy' },
    ],
  },
  'Trading': {
    'Market Basics': [
      { type: 'multiple_choice', prompt: 'What is a stock?', options: ['A type of bond', 'Ownership share in a company', 'A government loan', 'A savings account'], correctAnswer: 'Ownership share in a company', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The stock market is open 24/7.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does NYSE stand for?', options: ['New York Stock Exchange', 'National Yield Stock Entity', 'New Yield Securities Exchange', 'North York Stock Exchange'], correctAnswer: 'New York Stock Exchange', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Buying low and selling high is the basic goal of ___.', options: ['Trading', 'Banking', 'Lending', 'Saving'], correctAnswer: 'Trading', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Investing money you can\'t afford to lose.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a broker?', options: ['A broken stock', 'An intermediary who executes trades', 'A type of bond', 'A market regulator'], correctAnswer: 'An intermediary who executes trades', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A dividend is a payment companies make to shareholders.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Bull vs Bear': [
      { type: 'multiple_choice', prompt: 'What is a bull market?', options: ['Prices are falling', 'Prices are rising', 'Market is closed', 'Market is flat'], correctAnswer: 'Prices are rising', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A bear market means prices are going up.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ market is defined by a 20%+ decline from recent highs.', options: ['Bear', 'Bull', 'Flat', 'Dead'], correctAnswer: 'Bear', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Panic selling when the market drops 5%.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "bearish" mean?', options: ['Expecting prices to rise', 'Expecting prices to fall', 'Neutral outlook', 'Wanting to buy'], correctAnswer: 'Expecting prices to fall', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Bull markets typically last longer than bear markets.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'before_after', prompt: 'Which trading mindset is better?', options: ['The market is crashing! Sell everything now!', 'The market is down — let me review my strategy and fundamentals.'], correctAnswer: 'The market is down — let me review my strategy and fundamentals.', difficulty: 'easy' },
    ],
    'Chart Reading': [
      { type: 'multiple_choice', prompt: 'What does the X-axis usually show on a stock chart?', options: ['Price', 'Volume', 'Time', 'Profit'], correctAnswer: 'Time', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A line chart connects closing prices over time.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does the Y-axis show on a price chart?', options: ['Time', 'Price', 'Volume', 'News'], correctAnswer: 'Price', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ chart uses colored bars to show open, high, low, close.', options: ['Candlestick', 'Pie', 'Scatter', 'Dot'], correctAnswer: 'Candlestick', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Making decisions based on a single chart timeframe.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'What timeframe is best for day trading charts?', options: ['Monthly', 'Weekly', '1-minute to 15-minute', 'Yearly'], correctAnswer: '1-minute to 15-minute', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Volume bars appear below the price chart typically.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Candlesticks': [
      { type: 'multiple_choice', prompt: 'What does a green/white candle mean?', options: ['Price went down', 'Price went up', 'Market closed', 'No trades'], correctAnswer: 'Price went up', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A red/black candle means the price closed lower than it opened.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The thin lines above and below a candle are called ___.', options: ['Wicks', 'Stems', 'Lines', 'Bars'], correctAnswer: 'Wicks', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "doji" candle?', options: ['A very tall candle', 'A candle where open and close are nearly equal', 'A candle with no wick', 'A holiday candle'], correctAnswer: 'A candle where open and close are nearly equal', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Using a single candlestick to predict the entire market.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does a long lower wick suggest?', options: ['Strong selling', 'Buyers pushed price back up', 'Market is closed', 'No interest'], correctAnswer: 'Buyers pushed price back up', difficulty: 'medium' },
      { type: 'true_false', prompt: 'A "hammer" candle has a small body and long lower wick.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    ],
    'Support & Resist.': [
      { type: 'multiple_choice', prompt: 'What is a support level?', options: ['Where price tends to stop falling', 'Where price always rises', 'The highest price ever', 'A government price floor'], correctAnswer: 'Where price tends to stop falling', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Resistance is a price level where selling pressure tends to emerge.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'When price breaks through resistance, it often becomes new ___.', options: ['Support', 'Resistance', 'Volume', 'Trend'], correctAnswer: 'Support', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'How do you identify support levels?', options: ['Random guess', 'Look for price bouncing off the same level multiple times', 'Ask a friend', 'Check the news'], correctAnswer: 'Look for price bouncing off the same level multiple times', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Buying right at resistance without confirmation.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Support and resistance levels are exact prices, never zones.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
      { type: 'before_after', prompt: 'Which approach to support/resistance is better?', options: ['The support is exactly $50.00, I\'ll buy at that cent.', 'Support zone is around $49.50-$50.50, I\'ll watch for confirmation.'], correctAnswer: 'Support zone is around $49.50-$50.50, I\'ll watch for confirmation.', difficulty: 'medium' },
    ],
    'Volume Analysis': [
      { type: 'multiple_choice', prompt: 'What does volume measure?', options: ['Price change', 'Number of shares traded', 'Company profit', 'Market hours'], correctAnswer: 'Number of shares traded', difficulty: 'easy' },
      { type: 'true_false', prompt: 'High volume confirms a price move\'s strength.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A price rise on low volume may indicate a ___ move.', options: ['Weak', 'Strong', 'Fast', 'Permanent'], correctAnswer: 'Weak', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Ignoring volume when analyzing a breakout.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does a volume spike usually indicate?', options: ['Nothing important', 'Increased interest or a significant event', 'Market is closing', 'A glitch'], correctAnswer: 'Increased interest or a significant event', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Average volume helps compare today\'s activity to normal levels.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Moving Averages': [
      { type: 'multiple_choice', prompt: 'What is a moving average?', options: ['The highest price', 'Average price over a set period', 'Tomorrow\'s predicted price', 'The opening price'], correctAnswer: 'Average price over a set period', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The 200-day moving average is commonly used for long-term trends.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A "golden cross" occurs when the 50-day MA crosses ___ the 200-day MA.', options: ['Above', 'Below', 'Through', 'Around'], correctAnswer: 'Above', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'What is a "death cross"?', options: ['When a stock reaches $0', 'When 50-day MA crosses below 200-day MA', 'When the market closes', 'A type of candlestick'], correctAnswer: 'When 50-day MA crosses below 200-day MA', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Using moving averages as the only indicator for trades.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'medium' },
      { type: 'true_false', prompt: 'An EMA reacts faster to price changes than an SMA.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'What does SMA stand for?', options: ['Stock Market Average', 'Simple Moving Average', 'Standard Market Analysis', 'Short-term Moving Asset'], correctAnswer: 'Simple Moving Average', difficulty: 'easy' },
    ],
    'Risk Management': [
      { type: 'multiple_choice', prompt: 'What is a stop-loss order?', options: ['An order to buy more', 'An order that sells when price hits a set low', 'A limit on trading hours', 'A broker fee'], correctAnswer: 'An order that sells when price hits a set low', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should risk no more than 1-2% of your account on one trade.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The risk-to-___ ratio compares potential loss to potential gain.', options: ['Reward', 'Return', 'Revenue', 'Rate'], correctAnswer: 'Reward', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Putting all your money into one stock.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is diversification?', options: ['Buying one stock', 'Spreading investments across different assets', 'Selling everything', 'Day trading'], correctAnswer: 'Spreading investments across different assets', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which risk approach is better?', options: ['I feel lucky, going all in on this hot tip!', 'I\'ll risk 2% of my account and set a stop-loss.'], correctAnswer: 'I\'ll risk 2% of my account and set a stop-loss.', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Position sizing means deciding how much to invest in each trade.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
  },
  'Business': {
    'Entrepreneur Mind': [
      { type: 'multiple_choice', prompt: 'What defines an entrepreneur?', options: ['Someone with a job', 'Someone who starts and runs a business', 'A manager at a corporation', 'A freelancer only'], correctAnswer: 'Someone who starts and runs a business', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Failure is a normal part of entrepreneurship.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A growth ___ means believing abilities can be developed over time.', options: ['Mindset', 'Plan', 'Rate', 'Chart'], correctAnswer: 'Mindset', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Waiting for the "perfect" idea before starting anything.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is "bootstrapping"?', options: ['Wearing boots to work', 'Self-funding your business without investors', 'Getting a bank loan', 'Hiring a large team first'], correctAnswer: 'Self-funding your business without investors', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Entrepreneurs must do everything alone to succeed.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which entrepreneurial mindset is better?', options: ['I failed once, so I\'m not cut out for this.', 'I failed once — now I know what doesn\'t work.'], correctAnswer: 'I failed once — now I know what doesn\'t work.', difficulty: 'easy' },
    ],
    'Finding Ideas': [
      { type: 'multiple_choice', prompt: 'Where do the best business ideas come from?', options: ['Copying competitors exactly', 'Solving real problems people have', 'Random brainstorming only', 'Buying ideas online'], correctAnswer: 'Solving real problems people have', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A good business idea must be completely original.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A pain ___ is a specific problem your customers experience.', options: ['Point', 'Level', 'Score', 'Zone'], correctAnswer: 'Point', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Asking potential customers about their problems before building.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "niche" market?', options: ['The biggest market possible', 'A small, specialized segment of the market', 'A market that doesn\'t exist', 'Any online market'], correctAnswer: 'A small, specialized segment of the market', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Your own frustrations can be a source of business ideas.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Validation': [
      { type: 'multiple_choice', prompt: 'What is idea validation?', options: ['Patenting your idea', 'Testing if people actually want your product', 'Getting a business license', 'Writing a business plan'], correctAnswer: 'Testing if people actually want your product', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should build the full product before validating the idea.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A landing page can help ___ interest before building a product.', options: ['Test', 'Hide', 'Reduce', 'Block'], correctAnswer: 'Test', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Spending 6 months building without talking to customers.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is the cheapest way to validate a business idea?', options: ['Build the full product', 'Talk to potential customers', 'Hire a consultant', 'Run TV ads'], correctAnswer: 'Talk to potential customers', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Pre-orders are a strong form of validation.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'before_after', prompt: 'Which validation approach is better?', options: ['I think this is a great idea, let\'s build it!', 'Let me talk to 20 potential customers first.'], correctAnswer: 'Let me talk to 20 potential customers first.', difficulty: 'easy' },
    ],
    'Business Model': [
      { type: 'multiple_choice', prompt: 'What is a business model?', options: ['A fashion model for business', 'How a company creates and captures value', 'A business card design', 'The company logo'], correctAnswer: 'How a company creates and captures value', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Subscription is a type of business model.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ model charges users a recurring fee for access.', options: ['Subscription', 'Wholesale', 'Auction', 'Barter'], correctAnswer: 'Subscription', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "freemium" model?', options: ['Everything is free', 'Basic features free, premium features paid', 'Only paid options', 'A free trial only'], correctAnswer: 'Basic features free, premium features paid', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Having multiple revenue streams in your business.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Every business must use the same business model.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does B2B mean?', options: ['Back to Basics', 'Business to Business', 'Buy to Build', 'Brand to Brand'], correctAnswer: 'Business to Business', difficulty: 'easy' },
    ],
    'Target Market': [
      { type: 'multiple_choice', prompt: 'What is a target market?', options: ['Everyone in the world', 'The specific group most likely to buy your product', 'Your competitors', 'People who dislike your product'], correctAnswer: 'The specific group most likely to buy your product', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Trying to sell to "everyone" is a good strategy.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A buyer ___ is a fictional representation of your ideal customer.', options: ['Persona', 'Profile', 'Picture', 'Plan'], correctAnswer: 'Persona', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Defining your customer by age, interests, and problems.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is market segmentation?', options: ['Ignoring the market', 'Dividing the market into distinct groups', 'Merging all customers together', 'Copying a competitor\'s market'], correctAnswer: 'Dividing the market into distinct groups', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Demographics include age, gender, and income level.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'MVP Building': [
      { type: 'multiple_choice', prompt: 'What does MVP stand for?', options: ['Most Valuable Player', 'Minimum Viable Product', 'Maximum Value Proposition', 'Market Value Price'], correctAnswer: 'Minimum Viable Product', difficulty: 'easy' },
      { type: 'true_false', prompt: 'An MVP should have every possible feature.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'An MVP includes only the ___ features needed to test your idea.', options: ['Core', 'All', 'Best', 'Extra'], correctAnswer: 'Core', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Launching a simple version to get feedback quickly.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Who popularized the concept of MVP?', options: ['Steve Jobs', 'Eric Ries', 'Elon Musk', 'Mark Zuckerberg'], correctAnswer: 'Eric Ries', difficulty: 'medium' },
      { type: 'before_after', prompt: 'Which MVP approach is better?', options: ['Let me spend a year making it perfect before anyone sees it.', 'Let me launch a basic version this month and learn from users.'], correctAnswer: 'Let me launch a basic version this month and learn from users.', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The goal of an MVP is to learn, not to impress.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Sales 101': [
      { type: 'multiple_choice', prompt: 'What is the first step in selling?', options: ['Closing the deal', 'Understanding the customer\'s needs', 'Quoting a price', 'Sending an invoice'], correctAnswer: 'Understanding the customer\'s needs', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Good salespeople talk more than they listen.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A sales ___ is the series of steps from first contact to purchase.', options: ['Funnel', 'Ladder', 'Wheel', 'Chain'], correctAnswer: 'Funnel', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Pressuring someone to buy immediately.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "cold call"?', options: ['Calling in winter', 'Contacting someone who doesn\'t expect your call', 'A follow-up call', 'Calling your best customer'], correctAnswer: 'Contacting someone who doesn\'t expect your call', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Follow-up is one of the most important parts of sales.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which sales approach is better?', options: ['Buy this now, it\'s the best product ever!', 'What problem are you trying to solve? Let me see if we can help.'], correctAnswer: 'What problem are you trying to solve? Let me see if we can help.', difficulty: 'easy' },
    ],
    'Pitching': [
      { type: 'multiple_choice', prompt: 'What is an elevator pitch?', options: ['Selling elevators', 'A 30-60 second business summary', 'A long presentation', 'A written proposal'], correctAnswer: 'A 30-60 second business summary', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A pitch deck should typically have 10-15 slides.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Investors want to know your problem, solution, and ___ model.', options: ['Business', 'Fashion', 'Color', 'Building'], correctAnswer: 'Business', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Reading directly from your slides during a pitch.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What should a pitch start with?', options: ['Your revenue numbers', 'The problem you\'re solving', 'Your team bios', 'A joke'], correctAnswer: 'The problem you\'re solving', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Showing traction (users, revenue) strengthens a pitch.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which pitch opening is better?', options: ['Our company was founded in 2024 and we have 3 employees...', '40% of small businesses fail because they can\'t manage cash flow. We fix that.'], correctAnswer: '40% of small businesses fail because they can\'t manage cash flow. We fix that.', difficulty: 'easy' },
    ],
  },
  'Cooking': {
    'Kitchen Setup': [
      { type: 'multiple_choice', prompt: 'What is "mise en place"?', options: ['A French dessert', 'Everything in its place — prepping before cooking', 'A type of oven', 'A cooking technique'], correctAnswer: 'Everything in its place — prepping before cooking', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should read the full recipe before starting to cook.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A cutting ___ is essential for safe food preparation.', options: ['Board', 'Table', 'Cloth', 'Wire'], correctAnswer: 'Board', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Keeping your kitchen counter cluttered while cooking.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Which is a must-have kitchen tool?', options: ['Sous vide machine', 'Chef\'s knife', 'Pasta maker', 'Blowtorch'], correctAnswer: 'Chef\'s knife', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Wooden and plastic cutting boards are both acceptable for home use.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Knife Skills': [
      { type: 'multiple_choice', prompt: 'What is the "claw grip" used for?', options: ['Opening jars', 'Holding food safely while cutting', 'Sharpening knives', 'Stirring soup'], correctAnswer: 'Holding food safely while cutting', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A dull knife is safer than a sharp knife.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The ___ grip keeps fingertips curled back when holding food.', options: ['Claw', 'Bear', 'Pinch', 'Fist'], correctAnswer: 'Claw', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How should you hold a chef\'s knife?', options: ['By the blade', 'Pinch the blade base with thumb and index finger', 'Grip the handle end only', 'Hold it loosely'], correctAnswer: 'Pinch the blade base with thumb and index finger', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Catching a falling knife.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A rocking motion is common when using a chef\'s knife.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a honing steel used for?', options: ['Cutting food', 'Realigning the knife blade edge', 'Measuring ingredients', 'Tenderizing meat'], correctAnswer: 'Realigning the knife blade edge', difficulty: 'medium' },
      { type: 'before_after', prompt: 'Which knife practice is better?', options: ['Toss the knife in the sink with other dishes.', 'Wash and dry the knife immediately, store it properly.'], correctAnswer: 'Wash and dry the knife immediately, store it properly.', difficulty: 'easy' },
    ],
    'Heat Control': [
      { type: 'multiple_choice', prompt: 'What does "medium heat" generally mean?', options: ['Maximum flame', 'About halfway on the dial', 'The lowest setting', 'Off'], correctAnswer: 'About halfway on the dial', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Higher heat always means faster, better cooking.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Preheating a pan before adding oil helps prevent food from ___.', options: ['Sticking', 'Floating', 'Shrinking', 'Freezing'], correctAnswer: 'Sticking', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Cranking heat to max to cook everything faster.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is "carryover cooking"?', options: ['Cooking in a carry-on bag', 'Food continues cooking after removed from heat', 'Cooking in batches', 'Reheating leftovers'], correctAnswer: 'Food continues cooking after removed from heat', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Oil should shimmer before adding food to a hot pan.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Basic Cuts': [
      { type: 'multiple_choice', prompt: 'What is a "julienne" cut?', options: ['Large cubes', 'Thin matchstick strips', 'Rough chop', 'Paper-thin slices'], correctAnswer: 'Thin matchstick strips', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A "dice" means cutting food into small cubes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Cutting herbs by rolling and slicing thinly is called ___.', options: ['Chiffonade', 'Julienne', 'Brunoise', 'Mince'], correctAnswer: 'Chiffonade', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'What is a "brunoise"?', options: ['A very fine dice (1-2mm cubes)', 'A large rough chop', 'Slicing on the bias', 'Tearing by hand'], correctAnswer: 'A very fine dice (1-2mm cubes)', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Cutting vegetables into uniform sizes for even cooking.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A "mince" is larger than a "dice".', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "bias cut" mean?', options: ['Cutting straight down', 'Cutting at a diagonal angle', 'Cutting in circles', 'Tearing with hands'], correctAnswer: 'Cutting at a diagonal angle', difficulty: 'easy' },
    ],
    'Seasoning': [
      { type: 'multiple_choice', prompt: 'When should you season during cooking?', options: ['Only at the end', 'Only at the start', 'In layers throughout cooking', 'Never'], correctAnswer: 'In layers throughout cooking', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Kosher salt and table salt measure the same by volume.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
      { type: 'fill_gap', prompt: '___ brings out the natural flavor of almost every food.', options: ['Salt', 'Sugar', 'Pepper', 'Garlic'], correctAnswer: 'Salt', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Tasting your food as you cook and adjusting seasoning.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does acid (like lemon juice) do to a dish?', options: ['Makes it sweeter', 'Brightens and balances flavors', 'Makes it spicier', 'Thickens the sauce'], correctAnswer: 'Brightens and balances flavors', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Dried herbs are typically added earlier than fresh herbs.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'before_after', prompt: 'Which seasoning approach is better?', options: ['Dump all the salt in at the end.', 'Season lightly at each step and taste as you go.'], correctAnswer: 'Season lightly at each step and taste as you go.', difficulty: 'easy' },
    ],
    'Sautéing': [
      { type: 'multiple_choice', prompt: 'What does "sauté" mean in French?', options: ['To bake', 'To jump', 'To boil', 'To freeze'], correctAnswer: 'To jump', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Sautéing uses high heat and a small amount of fat.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'When sautéing, don\'t ___ the pan or food won\'t brown.', options: ['Overcrowd', 'Heat', 'Oil', 'Cover'], correctAnswer: 'Overcrowd', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Constantly stirring vegetables when trying to get a sear.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'What type of pan is best for sautéing?', options: ['Deep stock pot', 'Wide, flat-bottomed skillet', 'Narrow saucepan', 'Baking sheet'], correctAnswer: 'Wide, flat-bottomed skillet', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Food should be dry before sautéing for best browning.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    ],
    'Boiling & Steam': [
      { type: 'multiple_choice', prompt: 'At what temp does water boil at sea level?', options: ['100°C / 212°F', '90°C / 194°F', '80°C / 176°F', '120°C / 248°F'], correctAnswer: '100°C / 212°F', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A "simmer" has smaller, gentler bubbles than a full boil.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Shocking vegetables in ice water after boiling is called ___.', options: ['Blanching', 'Steaming', 'Braising', 'Poaching'], correctAnswer: 'Blanching', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Adding pasta to water before it reaches a full boil.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is the advantage of steaming over boiling?', options: ['It\'s faster', 'It retains more nutrients', 'It adds more flavor', 'It uses more water'], correctAnswer: 'It retains more nutrients', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Salting water raises its boiling point significantly.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
    ],
    'Roasting': [
      { type: 'multiple_choice', prompt: 'What temperature range is typical for roasting?', options: ['100-150°C', '200-230°C / 400-450°F', '50-80°C', '300-350°C'], correctAnswer: '200-230°C / 400-450°F', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Roasting uses dry heat in an oven.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The ___ reaction creates browning and flavor in roasted foods.', options: ['Maillard', 'Chemical', 'Boiling', 'Cooling'], correctAnswer: 'Maillard', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Opening the oven door every 2 minutes to check on food.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Why should you preheat the oven before roasting?', options: ['To save electricity', 'For even cooking from the start', 'It doesn\'t matter', 'To dry out the food'], correctAnswer: 'For even cooking from the start', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Resting meat after roasting helps retain juices.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which roasting approach is better?', options: ['Pile everything together tightly on a small pan.', 'Spread food in a single layer with space for air circulation.'], correctAnswer: 'Spread food in a single layer with space for air circulation.', difficulty: 'easy' },
    ],
  },
  'Fitness': {
    'Body Basics': [
      { type: 'multiple_choice', prompt: 'How many major muscle groups does the body have?', options: ['3', '6', '11', '20'], correctAnswer: '11', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Muscles grow during rest, not during exercise.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The largest muscle in the body is the gluteus ___.', options: ['Maximus', 'Medius', 'Minimus', 'Major'], correctAnswer: 'Maximus', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Skipping rest days to train every single day.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does BMR stand for?', options: ['Body Mass Ratio', 'Basal Metabolic Rate', 'Basic Muscle Response', 'Body Movement Rate'], correctAnswer: 'Basal Metabolic Rate', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Hydration is important for muscle function.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Warm-Up': [
      { type: 'multiple_choice', prompt: 'Why is warming up important?', options: ['To waste time', 'To increase blood flow and prevent injury', 'To show off', 'It\'s not important'], correctAnswer: 'To increase blood flow and prevent injury', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Static stretching is the best warm-up before exercise.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: '___ stretching involves movement and is best for warm-ups.', options: ['Dynamic', 'Static', 'Passive', 'Extreme'], correctAnswer: 'Dynamic', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Jumping straight into heavy lifting without warming up.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How long should a warm-up typically last?', options: ['30 seconds', '5-10 minutes', '30 minutes', '1 hour'], correctAnswer: '5-10 minutes', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Arm circles are an example of a dynamic warm-up.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does a warm-up increase in your muscles?', options: ['Size', 'Temperature and blood flow', 'Weight', 'Soreness'], correctAnswer: 'Temperature and blood flow', difficulty: 'easy' },
    ],
    'Push-Ups': [
      { type: 'multiple_choice', prompt: 'Which muscles do push-ups primarily work?', options: ['Legs and glutes', 'Chest, shoulders, and triceps', 'Back and biceps', 'Only abs'], correctAnswer: 'Chest, shoulders, and triceps', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Your body should form a straight line during a push-up.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Hands should be placed roughly ___ width apart for standard push-ups.', options: ['Shoulder', 'Hip', 'Head', 'Knee'], correctAnswer: 'Shoulder', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Letting your hips sag during push-ups.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a good push-up modification for beginners?', options: ['One-arm push-ups', 'Knee push-ups', 'Clapping push-ups', 'Handstand push-ups'], correctAnswer: 'Knee push-ups', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should hold your breath during push-ups.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which push-up form is better?', options: ['Elbows flaring out at 90 degrees from body.', 'Elbows at about 45 degrees from the body.'], correctAnswer: 'Elbows at about 45 degrees from the body.', difficulty: 'easy' },
    ],
    'Squats': [
      { type: 'multiple_choice', prompt: 'Which muscles do squats primarily target?', options: ['Arms and shoulders', 'Quads, glutes, and hamstrings', 'Chest and back', 'Only calves'], correctAnswer: 'Quads, glutes, and hamstrings', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Your knees should cave inward during squats.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Keep your ___ on the ground throughout the squat.', options: ['Heels', 'Toes', 'Hands', 'Knees'], correctAnswer: 'Heels', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Knees tracking over your toes in the same direction.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How deep should a proper squat go?', options: ['Just a slight bend', 'Thighs parallel to the floor or below', 'Knees locked out', 'Barely moving'], correctAnswer: 'Thighs parallel to the floor or below', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Looking up at the ceiling is the best head position for squats.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    ],
    'Core Work': [
      { type: 'multiple_choice', prompt: 'What is your "core"?', options: ['Only your abs', 'Muscles around your trunk including abs, back, and hips', 'Only your back', 'Your arms and legs'], correctAnswer: 'Muscles around your trunk including abs, back, and hips', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Planks are an effective core exercise.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ hold works the core by maintaining a static position.', options: ['Plank', 'Squat', 'Push-up', 'Lunge'], correctAnswer: 'Plank', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Doing hundreds of crunches daily for a "six-pack".', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How long should beginners hold a plank?', options: ['5 seconds', '20-30 seconds', '5 minutes', '10 minutes'], correctAnswer: '20-30 seconds', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Core strength helps prevent lower back pain.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Which is a core exercise?', options: ['Bicep curl', 'Dead bug', 'Bench press', 'Calf raise'], correctAnswer: 'Dead bug', difficulty: 'easy' },
    ],
    'Flexibility': [
      { type: 'multiple_choice', prompt: 'When is static stretching most beneficial?', options: ['Before exercise', 'After exercise during cool-down', 'During intense lifting', 'Never'], correctAnswer: 'After exercise during cool-down', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Stretching should be painful to be effective.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Hold a static stretch for at least ___ seconds for benefit.', options: ['15-30', '1-2', '60-90', '120'], correctAnswer: '15-30', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Bouncing aggressively during a stretch.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does flexibility training improve?', options: ['Muscle size only', 'Range of motion in joints', 'Running speed only', 'Bone density'], correctAnswer: 'Range of motion in joints', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Flexibility naturally decreases with age if not maintained.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Cardio Intro': [
      { type: 'multiple_choice', prompt: 'What does "cardio" primarily train?', options: ['Biceps', 'Heart and lungs', 'Only legs', 'Flexibility'], correctAnswer: 'Heart and lungs', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Walking counts as cardio exercise.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Cardio stands for ___ exercise.', options: ['Cardiovascular', 'Cardinal', 'Careful', 'Carbohydrate'], correctAnswer: 'Cardiovascular', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Starting with a 60-minute run on your first day.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a good resting heart rate for adults?', options: ['100-120 bpm', '60-100 bpm', '30-40 bpm', '150+ bpm'], correctAnswer: '60-100 bpm', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should be able to hold a conversation during moderate cardio.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'HIIT Basics': [
      { type: 'multiple_choice', prompt: 'What does HIIT stand for?', options: ['Heavy Intense Interval Training', 'High Intensity Interval Training', 'Hard Impact Intense Training', 'High Impact Indoor Training'], correctAnswer: 'High Intensity Interval Training', difficulty: 'easy' },
      { type: 'true_false', prompt: 'HIIT alternates between intense effort and rest periods.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A typical HIIT session lasts ___ minutes.', options: ['15-30', '60-90', '5', '120'], correctAnswer: '15-30', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Doing HIIT every single day without rest.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is the "afterburn effect" of HIIT?', options: ['Feeling sore', 'Continued calorie burning after exercise', 'Getting sunburned', 'Muscle cramps'], correctAnswer: 'Continued calorie burning after exercise', difficulty: 'medium' },
      { type: 'true_false', prompt: 'HIIT is suitable for complete beginners without modification.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which HIIT approach is better for beginners?', options: ['Go all-out for 60 seconds, rest 10 seconds, repeat 20 times.', '30 seconds work, 30 seconds rest, start with 10 minutes total.'], correctAnswer: '30 seconds work, 30 seconds rest, start with 10 minutes total.', difficulty: 'easy' },
    ],
  },
  'Chess': {
    'The Board': [
      { type: 'multiple_choice', prompt: 'How many squares are on a chess board?', options: ['32', '48', '64', '100'], correctAnswer: '64', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The board has an equal number of light and dark squares.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Each player starts with ___ pieces.', options: ['16', '12', '20', '8'], correctAnswer: '16', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What should be in the bottom-right corner?', options: ['A dark square', 'A light square', 'Either color', 'No square'], correctAnswer: 'A light square', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Setting up the board with a dark square on the right.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Columns on the board are called "files" (a-h).', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What are horizontal rows called in chess?', options: ['Files', 'Ranks', 'Columns', 'Lines'], correctAnswer: 'Ranks', difficulty: 'easy' },
    ],
    'Piece Moves': [
      { type: 'multiple_choice', prompt: 'How does a knight move?', options: ['Diagonally only', 'In an L-shape', 'Straight lines only', 'One square any direction'], correctAnswer: 'In an L-shape', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A bishop can only move diagonally.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The ___ can move any number of squares in any direction.', options: ['Queen', 'King', 'Pawn', 'Knight'], correctAnswer: 'Queen', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How does a pawn capture?', options: ['Straight forward', 'Diagonally forward one square', 'Sideways', 'Backward'], correctAnswer: 'Diagonally forward one square', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Moving your king into check.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A rook moves in straight lines — horizontally or vertically.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Which piece can jump over others?', options: ['Bishop', 'Rook', 'Knight', 'Queen'], correctAnswer: 'Knight', difficulty: 'easy' },
    ],
    'Check & Mate': [
      { type: 'multiple_choice', prompt: 'What is "check"?', options: ['Winning the game', 'The king is under attack', 'Capturing a piece', 'A draw'], correctAnswer: 'The king is under attack', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Checkmate ends the game immediately.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'In checkmate, the king is in check and has no ___ escape.', options: ['Legal', 'Quick', 'Easy', 'Safe'], correctAnswer: 'Legal', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What are the 3 ways to get out of check?', options: ['Move, block, or capture the attacker', 'Resign, draw, or forfeit', 'Castle, promote, or en passant', 'Jump, duck, or dodge'], correctAnswer: 'Move, block, or capture the attacker', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Saying "check" out loud in casual games.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Stalemate is the same as checkmate.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    ],
    'Piece Values': [
      { type: 'multiple_choice', prompt: 'How many points is a queen worth?', options: ['3', '5', '9', '12'], correctAnswer: '9', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A knight and bishop are worth about the same (3 points).', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A rook is worth ___ points.', options: ['5', '3', '9', '1'], correctAnswer: '5', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a pawn worth?', options: ['0 points', '1 point', '2 points', '3 points'], correctAnswer: '1 point', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Trading your queen for a pawn.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Two rooks (10 pts) are generally stronger than one queen (9 pts).', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'Trading a bishop (3) for a rook (5) is called what?', options: ['A blunder', 'Winning the exchange', 'A sacrifice', 'A gambit'], correctAnswer: 'Winning the exchange', difficulty: 'medium' },
    ],
    'Opening Basics': [
      { type: 'multiple_choice', prompt: 'What is the main goal of the opening?', options: ['Checkmate immediately', 'Develop pieces and control center', 'Trade all pieces', 'Move only pawns'], correctAnswer: 'Develop pieces and control center', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Moving the same piece twice in the opening is usually bad.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The most popular first move in chess is ___.', options: ['e4', 'a3', 'h4', 'f3'], correctAnswer: 'e4', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Bringing your queen out very early in the opening.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "castling" achieve?', options: ['Captures a piece', 'Protects the king and activates the rook', 'Promotes a pawn', 'Forces a draw'], correctAnswer: 'Protects the king and activates the rook', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Knights should generally be developed before bishops.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    ],
    'Center Control': [
      { type: 'multiple_choice', prompt: 'Which squares form the center of the board?', options: ['a1, a2, b1, b2', 'e4, d4, e5, d5', 'h7, h8, g7, g8', 'c3, c6, f3, f6'], correctAnswer: 'e4, d4, e5, d5', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Controlling the center gives your pieces more mobility.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Pieces in the ___ control more squares than on the edges.', options: ['Center', 'Corner', 'Back rank', 'Side'], correctAnswer: 'Center', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Placing all your pieces on the edge of the board.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How many squares does a knight control from the center?', options: ['2', '4', '8', '6'], correctAnswer: '8', difficulty: 'medium' },
      { type: 'true_false', prompt: 'A knight on the rim is dim (edge knights are weak).', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Pins & Forks': [
      { type: 'multiple_choice', prompt: 'What is a "fork" in chess?', options: ['A utensil', 'One piece attacking two or more pieces at once', 'A type of opening', 'Splitting the board in half'], correctAnswer: 'One piece attacking two or more pieces at once', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A knight fork can attack a king and queen simultaneously.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ prevents a piece from moving because it would expose a more valuable piece.', options: ['Pin', 'Fork', 'Skewer', 'Check'], correctAnswer: 'Pin', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Which piece is most famous for forks?', options: ['Bishop', 'Rook', 'Knight', 'Pawn'], correctAnswer: 'Knight', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Looking for fork opportunities every move.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'An absolute pin involves the king — the pinned piece cannot move.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'In a pin, which piece is behind the pinned piece?', options: ['A less valuable piece', 'A more valuable piece', 'No piece', 'A pawn always'], correctAnswer: 'A more valuable piece', difficulty: 'easy' },
    ],
    'Skewers': [
      { type: 'multiple_choice', prompt: 'What is a skewer in chess?', options: ['A type of food', 'Attacking a valuable piece that must move, exposing a piece behind it', 'A defensive move', 'A type of checkmate'], correctAnswer: 'Attacking a valuable piece that must move, exposing a piece behind it', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A skewer is like a reverse pin.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'In a skewer, the more valuable piece is in ___ of the less valuable one.', options: ['Front', 'Back', 'Above', 'Below'], correctAnswer: 'Front', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'Which pieces can deliver skewers?', options: ['Only knights', 'Bishops, rooks, and queens (line pieces)', 'Only pawns', 'Only the king'], correctAnswer: 'Bishops, rooks, and queens (line pieces)', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Placing your king and queen on the same line as an opponent\'s bishop.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A skewer targeting the king forces the king to move.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
  },
  'Coding': {
    'What is Code?': [
      { type: 'multiple_choice', prompt: 'What is computer code?', options: ['A secret language', 'Instructions that tell a computer what to do', 'Random numbers', 'A type of hardware'], correctAnswer: 'Instructions that tell a computer what to do', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Computers understand human language directly.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ is a step-by-step set of instructions to solve a problem.', options: ['Algorithm', 'Variable', 'Function', 'Loop'], correctAnswer: 'Algorithm', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Which of these is a programming language?', options: ['HTML only', 'Python', 'Photoshop', 'Windows'], correctAnswer: 'Python', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Writing comments in your code to explain what it does.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A "bug" is an error in code.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Variables': [
      { type: 'multiple_choice', prompt: 'What is a variable?', options: ['A fixed number', 'A named container that stores data', 'A type of loop', 'A programming language'], correctAnswer: 'A named container that stores data', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Variable names can start with a number.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'let age = 25; — "age" is the variable ___.', options: ['Name', 'Type', 'Value', 'Function'], correctAnswer: 'Name', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "let x = 10" do?', options: ['Deletes x', 'Creates a variable x with value 10', 'Prints 10', 'Loops 10 times'], correctAnswer: 'Creates a variable x with value 10', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Naming a variable "x" instead of "userAge".', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A variable\'s value can be changed after it is created.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which variable name is better?', options: ['let a = 5;', 'let itemCount = 5;'], correctAnswer: 'let itemCount = 5;', difficulty: 'easy' },
    ],
    'Data Types': [
      { type: 'multiple_choice', prompt: 'Which is a string data type?', options: ['42', 'true', '"Hello"', '3.14'], correctAnswer: '"Hello"', difficulty: 'easy' },
      { type: 'true_false', prompt: '"42" (in quotes) is a string, not a number.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ data type is either true or false.', options: ['Boolean', 'String', 'Number', 'Array'], correctAnswer: 'Boolean', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What data type is 3.14?', options: ['String', 'Boolean', 'Number (float)', 'Array'], correctAnswer: 'Number (float)', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Checking the data type before performing operations.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'null means a variable has no value assigned intentionally.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'What is the result of "5" + 3 in JavaScript?', options: ['8', '"53"', 'Error', '15'], correctAnswer: '"53"', difficulty: 'medium' },
    ],
    'If/Else': [
      { type: 'multiple_choice', prompt: 'What does an if statement do?', options: ['Repeats code', 'Runs code only if a condition is true', 'Defines a variable', 'Stops the program'], correctAnswer: 'Runs code only if a condition is true', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The else block runs when the if condition is false.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'if (age >= 18) means: if age is ___ or equal to 18.', options: ['Greater than', 'Less than', 'Not', 'Divided by'], correctAnswer: 'Greater than', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "===" check in JavaScript?', options: ['Assignment', 'Strict equality (value and type)', 'Greater than', 'Not equal'], correctAnswer: 'Strict equality (value and type)', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Using deeply nested if/else (5+ levels deep).', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'medium' },
      { type: 'true_false', prompt: '"else if" lets you check multiple conditions in sequence.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Loops': [
      { type: 'multiple_choice', prompt: 'What does a loop do?', options: ['Runs code once', 'Repeats code multiple times', 'Defines a variable', 'Ends the program'], correctAnswer: 'Repeats code multiple times', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A "for" loop runs a set number of times.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A loop that never stops is called an ___ loop.', options: ['Infinite', 'Empty', 'Broken', 'Final'], correctAnswer: 'Infinite', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "while (true)" create?', options: ['A one-time run', 'An infinite loop', 'An error always', 'A variable'], correctAnswer: 'An infinite loop', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Always including a way to exit your loop.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A "while" loop checks its condition before each iteration.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "break" do inside a loop?', options: ['Pauses the loop', 'Exits the loop immediately', 'Restarts the loop', 'Crashes the program'], correctAnswer: 'Exits the loop immediately', difficulty: 'easy' },
    ],
    'Functions': [
      { type: 'multiple_choice', prompt: 'What is a function?', options: ['A variable type', 'A reusable block of code', 'A loop type', 'A data file'], correctAnswer: 'A reusable block of code', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Functions can accept inputs called "parameters".', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A function sends back a value using the ___ keyword.', options: ['Return', 'Print', 'Send', 'Output'], correctAnswer: 'Return', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is "calling" a function?', options: ['Defining it', 'Deleting it', 'Executing/running it', 'Renaming it'], correctAnswer: 'Executing/running it', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Writing a function that does 10 different things.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A function should ideally do one thing well.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which function name is better?', options: ['function doStuff()', 'function calculateTotal()'], correctAnswer: 'function calculateTotal()', difficulty: 'easy' },
    ],
    'Arrays': [
      { type: 'multiple_choice', prompt: 'What is an array?', options: ['A single value', 'An ordered list of values', 'A type of loop', 'A function'], correctAnswer: 'An ordered list of values', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Array indexes start at 0 in most languages.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The ___ of an array is how many items it contains.', options: ['Length', 'Width', 'Height', 'Size'], correctAnswer: 'Length', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is fruits[0] if fruits = ["apple", "banana"]?', options: ['banana', 'apple', 'undefined', 'error'], correctAnswer: 'apple', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Using .push() to add an item to an array.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'An array can hold different data types.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How do you find the last index of an array with 5 items?', options: ['5', '4', '6', '0'], correctAnswer: '4', difficulty: 'easy' },
    ],
    'Objects': [
      { type: 'multiple_choice', prompt: 'What is an object in programming?', options: ['A physical item', 'A collection of key-value pairs', 'A number', 'A loop'], correctAnswer: 'A collection of key-value pairs', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Objects store data as key-value pairs.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'In {name: "Alice"}, "name" is the ___ and "Alice" is the value.', options: ['Key', 'Index', 'Type', 'Array'], correctAnswer: 'Key', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How do you access person.name?', options: ['Dot notation', 'Slash notation', 'Star notation', 'Hash notation'], correctAnswer: 'Dot notation', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Using objects to group related data together.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Objects can contain other objects inside them.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
  },
  'Marketing': {
    'Marketing 101': [
      { type: 'multiple_choice', prompt: 'What are the 4 Ps of marketing?', options: ['Price, Place, Product, Promotion', 'People, Plans, Profits, Process', 'Print, Post, Publish, Pay', 'Product, Profit, Plan, Purchase'], correctAnswer: 'Price, Place, Product, Promotion', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Marketing and advertising are the same thing.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Marketing is about creating ___ for your target audience.', options: ['Value', 'Noise', 'Confusion', 'Discounts'], correctAnswer: 'Value', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Focusing only on selling without understanding customer needs.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "call to action" (CTA)?', options: ['A phone call', 'A prompt telling the audience what to do next', 'A type of ad', 'A marketing budget'], correctAnswer: 'A prompt telling the audience what to do next', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Understanding your customer is the foundation of marketing.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Target Audience': [
      { type: 'multiple_choice', prompt: 'What is a target audience?', options: ['Everyone online', 'The specific group your marketing aims to reach', 'Your competitors', 'Your employees'], correctAnswer: 'The specific group your marketing aims to reach', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A narrow target audience is usually more effective than "everyone".', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: '___ are statistical characteristics like age, gender, and location.', options: ['Demographics', 'Psychographics', 'Analytics', 'Metrics'], correctAnswer: 'Demographics', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Creating content without knowing who it\'s for.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What are psychographics?', options: ['Physical traits', 'Values, interests, and lifestyle of your audience', 'Website analytics', 'Sales data'], correctAnswer: 'Values, interests, and lifestyle of your audience', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Surveys and interviews help define your target audience.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Brand Identity': [
      { type: 'multiple_choice', prompt: 'What is brand identity?', options: ['Just a logo', 'The visual and emotional elements that define your brand', 'Your product price', 'Your company address'], correctAnswer: 'The visual and emotional elements that define your brand', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A brand is just a logo and color scheme.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Brand ___ is how people perceive and feel about your brand.', options: ['Perception', 'Price', 'Product', 'Profit'], correctAnswer: 'Perception', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Using consistent colors and fonts across all platforms.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a brand "voice"?', options: ['A podcast', 'The consistent personality and tone in communications', 'A voicemail', 'A radio ad'], correctAnswer: 'The consistent personality and tone in communications', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Consistency builds brand recognition and trust.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which brand approach is better?', options: ['Different colors, fonts, and tone on every post.', 'Consistent visual style and voice across all content.'], correctAnswer: 'Consistent visual style and voice across all content.', difficulty: 'easy' },
    ],
    'Content Types': [
      { type: 'multiple_choice', prompt: 'Which is a type of content marketing?', options: ['TV repair', 'Blog posts, videos, and infographics', 'Accounting', 'Physical mail only'], correctAnswer: 'Blog posts, videos, and infographics', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Video content gets higher engagement than text on most platforms.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Short-form ___ content (Reels, TikToks) is among the most popular formats.', options: ['Video', 'Text', 'Audio', 'PDF'], correctAnswer: 'Video', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Repurposing one piece of content across multiple platforms.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is "evergreen" content?', options: ['Content about trees', 'Content that stays relevant over time', 'Seasonal content only', 'Content posted in December'], correctAnswer: 'Content that stays relevant over time', difficulty: 'easy' },
      { type: 'true_false', prompt: 'User-generated content can boost brand trust.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Social Media': [
      { type: 'multiple_choice', prompt: 'What is "organic reach"?', options: ['Reach from paid ads', 'People who see your content without paid promotion', 'Gardening tips', 'A type of food blog'], correctAnswer: 'People who see your content without paid promotion', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Engagement rate is more important than follower count.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A content ___ helps you plan and schedule posts in advance.', options: ['Calendar', 'Folder', 'Album', 'Binder'], correctAnswer: 'Calendar', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Posting the same content on all platforms without adapting it.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is "engagement" on social media?', options: ['Getting married', 'Likes, comments, shares, and saves', 'Logging in', 'Following people'], correctAnswer: 'Likes, comments, shares, and saves', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Posting consistently matters more than posting a lot at once.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Instagram': [
      { type: 'multiple_choice', prompt: 'What is the ideal Instagram Reel length for engagement?', options: ['3-5 minutes', '7-15 seconds', '60-90 seconds', '30 minutes'], correctAnswer: '7-15 seconds', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Hashtags help people discover your Instagram content.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Instagram ___ disappear after 24 hours.', options: ['Stories', 'Reels', 'Posts', 'Guides'], correctAnswer: 'Stories', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Using 30 random hashtags on every post.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is an Instagram carousel?', options: ['A merry-go-round', 'A post with multiple swipeable images', 'A video format', 'A filter'], correctAnswer: 'A post with multiple swipeable images', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Carousels tend to get higher engagement than single image posts.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'TikTok': [
      { type: 'multiple_choice', prompt: 'What makes TikTok content go viral?', options: ['Long intros', 'A strong hook in the first 1-2 seconds', 'Professional cameras only', 'Lots of text'], correctAnswer: 'A strong hook in the first 1-2 seconds', difficulty: 'easy' },
      { type: 'true_false', prompt: 'TikTok\'s algorithm favors content quality over follower count.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Trending ___ can boost your TikTok\'s visibility.', options: ['Sounds', 'Colors', 'Fonts', 'Links'], correctAnswer: 'Sounds', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Jumping on trends while they\'re still early.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is the "For You Page" (FYP)?', options: ['Your profile page', 'A personalized feed of recommended content', 'A settings page', 'A messaging feature'], correctAnswer: 'A personalized feed of recommended content', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Watch time percentage matters more than total views on TikTok.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    ],
    'YouTube': [
      { type: 'multiple_choice', prompt: 'What is CTR on YouTube?', options: ['Content Transfer Rate', 'Click-Through Rate on thumbnails', 'Channel Total Revenue', 'Creative Trend Rating'], correctAnswer: 'Click-Through Rate on thumbnails', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Thumbnails are one of the most important factors for YouTube views.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'YouTube ___ retention measures how long viewers watch your video.', options: ['Audience', 'Channel', 'Creator', 'Platform'], correctAnswer: 'Audience', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Creating clickbait titles that don\'t match the content.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is YouTube SEO?', options: ['A video format', 'Optimizing titles and descriptions for search', 'A camera setting', 'A monetization method'], correctAnswer: 'Optimizing titles and descriptions for search', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The first 30 seconds of a YouTube video are critical for retention.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'before_after', prompt: 'Which YouTube title is better?', options: ['My Video About Cooking Stuff Idk', '5 Cooking Mistakes Ruining Your Food (Easy Fixes)'], correctAnswer: '5 Cooking Mistakes Ruining Your Food (Easy Fixes)', difficulty: 'easy' },
    ],
  },
  'Drawing': {
    'Line Basics': [
      { type: 'multiple_choice', prompt: 'What is the most fundamental element of drawing?', options: ['Color', 'The line', 'Texture', 'Shading'], correctAnswer: 'The line', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Drawing from the shoulder gives smoother, longer lines.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Drawing with your ___ produces smoother lines than from the wrist.', options: ['Shoulder', 'Elbow', 'Fingers', 'Thumb'], correctAnswer: 'Shoulder', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Drawing one confident stroke instead of many sketchy lines.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "line weight" refer to?', options: ['How heavy your pencil is', 'The thickness/darkness variation of a line', 'The length of a line', 'The color of a line'], correctAnswer: 'The thickness/darkness variation of a line', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Varying line weight adds depth and interest to drawings.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Shapes & Forms': [
      { type: 'multiple_choice', prompt: 'What are the basic shapes in drawing?', options: ['Only circles', 'Circle, square, triangle', 'Hexagon and octagon only', 'Only rectangles'], correctAnswer: 'Circle, square, triangle', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Complex objects can be broken down into basic shapes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A sphere is the 3D ___ of a circle.', options: ['Form', 'Shape', 'Line', 'Shadow'], correctAnswer: 'Form', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What turns a flat circle into a 3D sphere?', options: ['Color', 'Shading and highlights', 'A bigger circle', 'An outline'], correctAnswer: 'Shading and highlights', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Starting a complex drawing with basic shape guidelines.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A cylinder is made from a rectangle and two ellipses.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Light & Shadow': [
      { type: 'multiple_choice', prompt: 'What is the darkest area on a lit object called?', options: ['Highlight', 'Core shadow', 'Reflected light', 'Cast shadow'], correctAnswer: 'Core shadow', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Light source direction determines where shadows fall.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The ___ is the brightest spot where light hits directly.', options: ['Highlight', 'Shadow', 'Midtone', 'Edge'], correctAnswer: 'Highlight', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is a "cast shadow"?', options: ['Shadow on the object itself', 'Shadow projected onto a surface by the object', 'A shadow you throw', 'A dark outline'], correctAnswer: 'Shadow projected onto a surface by the object', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Using a single consistent light source in your drawing.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Reflected light appears on the shadow side, bounced from nearby surfaces.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'What is the area between light and shadow called?', options: ['Highlight', 'Core shadow', 'Midtone/halftone', 'Cast shadow'], correctAnswer: 'Midtone/halftone', difficulty: 'medium' },
    ],
    'Proportions': [
      { type: 'multiple_choice', prompt: 'How many "heads tall" is an average adult figure?', options: ['5', '6', '7.5-8', '10'], correctAnswer: '7.5-8', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Eyes are roughly at the halfway point of the head.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'An adult face is about ___ eye-widths wide.', options: ['Five', 'Three', 'Seven', 'Two'], correctAnswer: 'Five', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Measuring proportions by comparing body parts to each other.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Where do fingertips reach when arms hang down?', options: ['The waist', 'The knees', 'Mid-thigh', 'The hips'], correctAnswer: 'Mid-thigh', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Children have proportionally larger heads compared to their bodies.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Texture': [
      { type: 'multiple_choice', prompt: 'How do you create texture in drawing?', options: ['Using only one technique', 'Varying marks like hatching, stippling, or cross-hatching', 'Drawing only outlines', 'Using a ruler'], correctAnswer: 'Varying marks like hatching, stippling, or cross-hatching', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Stippling uses dots to create tone and texture.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: '___ uses parallel lines to create shading.', options: ['Hatching', 'Stippling', 'Blending', 'Erasing'], correctAnswer: 'Hatching', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is cross-hatching?', options: ['Erasing lines', 'Overlapping sets of parallel lines at angles', 'Drawing circles', 'Blending with fingers'], correctAnswer: 'Overlapping sets of parallel lines at angles', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Practicing different texture techniques on scrap paper.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Smooth textures use tighter, more uniform marks.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Perspective': [
      { type: 'multiple_choice', prompt: 'What is one-point perspective?', options: ['Using one pencil', 'All lines converge to a single vanishing point', 'Drawing only one object', 'Looking with one eye'], correctAnswer: 'All lines converge to a single vanishing point', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The horizon line represents the viewer\'s eye level.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Lines going into the distance meet at a ___ point.', options: ['Vanishing', 'Starting', 'Ending', 'Focal'], correctAnswer: 'Vanishing', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Two-point perspective uses how many vanishing points?', options: ['One', 'Two', 'Three', 'None'], correctAnswer: 'Two', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Using a ruler for perspective guidelines.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Objects appear smaller as they move away from the viewer.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Faces': [
      { type: 'multiple_choice', prompt: 'Where are the eyes positioned on the head?', options: ['Top third', 'Halfway down', 'Bottom third', 'Near the forehead'], correctAnswer: 'Halfway down', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The nose ends roughly halfway between eyes and chin.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The space between the eyes is about one ___ width.', options: ['Eye', 'Nose', 'Mouth', 'Ear'], correctAnswer: 'Eye', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Where is the mouth typically placed?', options: ['Halfway between nose and chin', 'Right below the nose', 'At the chin', 'One-third between nose and chin'], correctAnswer: 'One-third between nose and chin', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Starting a face drawing with a circle and guidelines.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Ears align roughly from eyebrow to nose bottom.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Hands & Feet': [
      { type: 'multiple_choice', prompt: 'What is the best way to practice drawing hands?', options: ['Avoid them', 'Draw your own hand in different poses', 'Trace photos only', 'Skip them forever'], correctAnswer: 'Draw your own hand in different poses', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The hand is roughly the same length as the face.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Simplify the hand into a ___ shape for the palm and cylinders for fingers.', options: ['Box/rectangle', 'Circle', 'Triangle', 'Star'], correctAnswer: 'Box/rectangle', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Breaking the hand into simple shapes before adding details.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How many joints does each finger have?', options: ['1', '2', '3', '4'], correctAnswer: '3', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The foot is roughly the same length as the forearm.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    ],
  },
  'Guitar': {
    'Holding Guitar': [
      { type: 'multiple_choice', prompt: 'How should you sit when holding a guitar?', options: ['Slouched back', 'Upright with guitar on your leg', 'Lying down', 'Standing on one foot'], correctAnswer: 'Upright with guitar on your leg', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The neck of the guitar should point downward.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Your ___ hand strums while the other hand frets the notes.', options: ['Dominant', 'Left', 'Smaller', 'Weaker'], correctAnswer: 'Dominant', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Gripping the guitar neck tightly with your whole palm.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'Where should your thumb be on the back of the neck?', options: ['Over the top', 'Roughly behind the middle of the neck', 'On the side', 'Not touching'], correctAnswer: 'Roughly behind the middle of the neck', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A guitar strap helps maintain proper posture while standing.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Open Chords': [
      { type: 'multiple_choice', prompt: 'What is an open chord?', options: ['A broken chord', 'A chord using open (unfretted) strings', 'A chord played at the 12th fret', 'A chord with no sound'], correctAnswer: 'A chord using open (unfretted) strings', difficulty: 'easy' },
      { type: 'true_false', prompt: 'G, C, D, E, and A are common beginner open chords.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Press your fingertips just ___ the fret for the cleanest sound.', options: ['Behind', 'On top of', 'Far from', 'Below'], correctAnswer: 'Behind', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Pressing fingers flat across multiple strings unintentionally.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'How many notes make up a basic chord?', options: ['1', '2', 'At least 3', '7'], correctAnswer: 'At least 3', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should check each string rings clearly when learning chords.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Strumming': [
      { type: 'multiple_choice', prompt: 'What should drive the strumming motion?', options: ['Fingers', 'Wrist', 'Shoulder', 'Elbow'], correctAnswer: 'Wrist', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Strumming patterns combine downstrokes and upstrokes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The most basic strumming pattern is all ___ strokes.', options: ['Down', 'Up', 'Side', 'Muted'], correctAnswer: 'Down', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Keeping a steady rhythm even if you miss some strings.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What helps keep time while strumming?', options: ['Playing faster', 'Using a metronome', 'Closing your eyes', 'Skipping beats'], correctAnswer: 'Using a metronome', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Your strumming arm should keep moving even on silent beats.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    ],
    'Finger Exercises': [
      { type: 'multiple_choice', prompt: 'What does the "spider walk" exercise train?', options: ['Speed only', 'Finger independence and dexterity', 'Singing', 'Ear training'], correctAnswer: 'Finger independence and dexterity', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Finger exercises should be practiced slowly first, then speed up.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Practice with a ___ to build speed gradually.', options: ['Metronome', 'Timer', 'Tuner', 'Capo'], correctAnswer: 'Metronome', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Practicing finger exercises until your hand hurts badly.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is "1-2-3-4" chromatic exercise?', options: ['A song', 'Playing each fret in order across strings', 'A chord progression', 'A tuning method'], correctAnswer: 'Playing each fret in order across strings', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Short daily practice is better than one long session per week.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Power Chords': [
      { type: 'multiple_choice', prompt: 'How many notes make a power chord?', options: ['1', '2 (root and fifth)', '4', '6'], correctAnswer: '2 (root and fifth)', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Power chords are neither major nor minor.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Power chords are commonly used in ___ music.', options: ['Rock', 'Classical', 'Jazz', 'Baroque'], correctAnswer: 'Rock', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Muting unused strings when playing power chords.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What strings typically make a power chord on the E string?', options: ['All 6 strings', 'Low E and A string (same fret pattern)', 'Only the high E', 'Strings 3 and 4'], correctAnswer: 'Low E and A string (same fret pattern)', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Power chords are moveable shapes on the fretboard.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Reading Tabs': [
      { type: 'multiple_choice', prompt: 'How many lines does a guitar tab have?', options: ['4', '5', '6', '8'], correctAnswer: '6', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The bottom line of a tab represents the lowest (thickest) string.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Numbers on tab lines represent ___ to press.', options: ['Frets', 'Strings', 'Fingers', 'Notes'], correctAnswer: 'Frets', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What does "0" mean on a tab?', options: ['Don\'t play', 'Play the open string', 'Mute the string', 'Use a capo'], correctAnswer: 'Play the open string', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Learning to read both tabs and standard notation over time.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Tab shows you rhythm/timing by default.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'medium' },
    ],
    'Barre Chords': [
      { type: 'multiple_choice', prompt: 'What is a barre chord?', options: ['A chord at a bar', 'A chord where one finger presses all strings across a fret', 'An open chord', 'A broken chord'], correctAnswer: 'A chord where one finger presses all strings across a fret', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Barre chords are harder than open chords for beginners.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The ___ finger usually forms the barre across the fret.', options: ['Index', 'Middle', 'Ring', 'Pinky'], correctAnswer: 'Index', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Using the side/edge of your index finger for the barre.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'An F major barre chord is based on which open chord shape?', options: ['A shape', 'E shape', 'D shape', 'G shape'], correctAnswer: 'E shape', difficulty: 'medium' },
      { type: 'true_false', prompt: 'Barre chords can be moved up and down the neck to change key.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Minor Scale': [
      { type: 'multiple_choice', prompt: 'What mood does a minor scale typically convey?', options: ['Happy and bright', 'Sad or dark', 'Angry', 'No emotion'], correctAnswer: 'Sad or dark', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The natural minor scale has 7 notes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A minor is the ___ minor key (no sharps or flats).', options: ['Natural', 'Sharp', 'Flat', 'Double'], correctAnswer: 'Natural', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'The minor pentatonic scale is crucial for which genre?', options: ['Classical', 'Blues and rock', 'Polka', 'Marching band'], correctAnswer: 'Blues and rock', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Practicing scales slowly before increasing speed.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The minor pentatonic has 5 notes per octave.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
  },
  'Piano': {
    'Keyboard Layout': [
      { type: 'multiple_choice', prompt: 'How many white keys are in one octave?', options: ['5', '7', '8', '12'], correctAnswer: '7', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A full-size piano has 88 keys.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Black keys are grouped in sets of ___ and 3.', options: ['2', '4', '5', '1'], correctAnswer: '2', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What note is to the left of the group of 2 black keys?', options: ['D', 'C', 'E', 'F'], correctAnswer: 'C', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Finding Middle C as a reference point on the keyboard.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Moving right on the keyboard makes notes higher in pitch.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Basic Scales': [
      { type: 'multiple_choice', prompt: 'How many notes are in a major scale?', options: ['5', '6', '7', '8'], correctAnswer: '7', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The C major scale uses only white keys.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The C major scale starts and ends on ___.', options: ['C', 'D', 'G', 'A'], correctAnswer: 'C', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is the pattern for a major scale?', options: ['All whole steps', 'W-W-H-W-W-W-H', 'H-H-W-H-H-W-H', 'Random'], correctAnswer: 'W-W-H-W-W-W-H', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Practicing scales with each hand separately first.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'A half step is the distance between two adjacent keys.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Simple Chords': [
      { type: 'multiple_choice', prompt: 'How many notes make a triad chord?', options: ['2', '3', '4', '5'], correctAnswer: '3', difficulty: 'easy' },
      { type: 'true_false', prompt: 'C major chord uses the notes C, E, and G.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'A ___ chord sounds happy, while a minor chord sounds sad.', options: ['Major', 'Sharp', 'Flat', 'Diminished'], correctAnswer: 'Major', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What makes a minor chord different from major?', options: ['It\'s louder', 'The middle note is lowered by a half step', 'It has more notes', 'It\'s played faster'], correctAnswer: 'The middle note is lowered by a half step', difficulty: 'medium' },
      { type: 'swipe_judge', prompt: 'Pressing all chord notes simultaneously with even pressure.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You can play chords with either hand.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Hand Position': [
      { type: 'multiple_choice', prompt: 'How should your fingers be curved at the piano?', options: ['Completely flat', 'Gently curved as if holding a ball', 'Bent backward', 'Stiff and straight'], correctAnswer: 'Gently curved as if holding a ball', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Wrists should be level with the keyboard, not dropped or raised.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Fingers are numbered 1 (thumb) through ___ (pinky).', options: ['5', '4', '3', '10'], correctAnswer: '5', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Tensing your shoulders while playing piano.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What is the correct bench height?', options: ['As low as possible', 'Forearms roughly parallel to the keyboard', 'As high as possible', 'It doesn\'t matter'], correctAnswer: 'Forearms roughly parallel to the keyboard', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Playing with flat fingers reduces speed and control.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Right Hand': [
      { type: 'multiple_choice', prompt: 'What does the right hand typically play?', options: ['Bass notes', 'Melody', 'Only chords', 'Nothing'], correctAnswer: 'Melody', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The right hand usually plays in the treble clef.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The treble clef is also called the ___ clef.', options: ['G', 'F', 'C', 'D'], correctAnswer: 'G', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Practicing the right hand alone before adding the left.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'In C position, what note does the right thumb play?', options: ['G', 'D', 'C', 'F'], correctAnswer: 'C', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Each finger should stay over its assigned key in basic position.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Left Hand': [
      { type: 'multiple_choice', prompt: 'What does the left hand typically play?', options: ['Melody', 'Bass and accompaniment', 'Only scales', 'Nothing'], correctAnswer: 'Bass and accompaniment', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The left hand usually reads the bass clef.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'The bass clef is also called the ___ clef.', options: ['F', 'G', 'C', 'B'], correctAnswer: 'F', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Neglecting left hand practice because it\'s harder.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'In C position, the left pinky (finger 5) plays which note?', options: ['C', 'G', 'D', 'F'], correctAnswer: 'C', difficulty: 'easy' },
      { type: 'true_false', prompt: 'The left hand pinky is finger 5 and thumb is finger 1.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Both Hands': [
      { type: 'multiple_choice', prompt: 'What is the biggest challenge of playing with both hands?', options: ['Finding the keys', 'Coordination and independence', 'Reading music', 'Sitting properly'], correctAnswer: 'Coordination and independence', difficulty: 'easy' },
      { type: 'true_false', prompt: 'You should master each hand separately before combining them.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'Start ___ when combining hands, then gradually speed up.', options: ['Slowly', 'Fast', 'Loudly', 'Quietly'], correctAnswer: 'Slowly', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Practicing hands together from the very start of a new piece.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
      { type: 'multiple_choice', prompt: 'What helps synchronize both hands?', options: ['Playing faster', 'Practicing with a metronome', 'Closing your eyes', 'Only playing one hand'], correctAnswer: 'Practicing with a metronome', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Breaking a piece into small sections makes hands-together practice easier.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    ],
    'Chord Inversions': [
      { type: 'multiple_choice', prompt: 'What is a chord inversion?', options: ['Playing a chord backward', 'Rearranging which note is on the bottom', 'Playing a chord louder', 'Adding more notes'], correctAnswer: 'Rearranging which note is on the bottom', difficulty: 'easy' },
      { type: 'true_false', prompt: 'Root position means the root note is on the bottom.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
      { type: 'fill_gap', prompt: 'First inversion has the ___ of the chord as the lowest note.', options: ['Third', 'Fifth', 'Root', 'Seventh'], correctAnswer: 'Third', difficulty: 'medium' },
      { type: 'multiple_choice', prompt: 'Why use chord inversions?', options: ['To play louder', 'For smoother transitions between chords', 'To play faster', 'They sound different entirely'], correctAnswer: 'For smoother transitions between chords', difficulty: 'easy' },
      { type: 'swipe_judge', prompt: 'Learning inversions to minimize hand movement between chords.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
      { type: 'true_false', prompt: 'C/E means C chord with E as the bass note (first inversion).', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
    ],
  },
};

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
