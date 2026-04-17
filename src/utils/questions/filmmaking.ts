import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerFilmmakingQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Filmmaking'] = {
  'Shot Composition': [
    { type: 'multiple_choice', prompt: 'What is a "close-up" shot?', options: ['A tight shot showing a face or detail', 'A shot from far away', 'A shot from above', 'A shot of the whole scene'], correctAnswer: 'A tight shot showing a face or detail', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The rule of thirds applies to filmmaking as well as photography.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ shot shows the entire scene and establishes the location.', options: ['Wide/establishing', 'Close-up', 'Medium', 'Insert'], correctAnswer: 'Wide/establishing', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "headroom" in shot composition?', options: ['Room size', 'A lighting technique', 'Space between top of head and frame edge', 'A type of microphone'], correctAnswer: 'Space between top of head and frame edge', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Cutting off the top of someone\'s head in a medium shot.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A medium shot typically shows a person from the waist up.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Camera Movement': [
    { type: 'multiple_choice', prompt: 'What is a "pan"?', options: ['A cooking utensil', 'Moving the camera forward', 'Rotating the camera horizontally on a fixed point', 'Zooming in'], correctAnswer: 'Rotating the camera horizontally on a fixed point', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A "tilt" moves the camera up or down on a fixed point.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ shot moves the entire camera alongside the subject.', options: ['Tracking', 'Static', 'Zoom', 'Pan'], correctAnswer: 'Tracking', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "dolly" in filmmaking?', options: ['A type of lens', 'A toy', 'A lighting tool', 'A wheeled platform for smooth camera movement'], correctAnswer: 'A wheeled platform for smooth camera movement', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using a gimbal or stabilizer for smooth handheld shots.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Every camera movement should serve a storytelling purpose.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Directing Actors': [
    { type: 'multiple_choice', prompt: 'What is the most important skill for directing actors?', options: ['Clear communication and creating a safe environment', 'Technical camera knowledge', 'Having a loud voice', 'Yelling'], correctAnswer: 'Clear communication and creating a safe environment', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Giving actors result-oriented direction ("be sadder") is most effective.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Give actors ___ to play rather than emotions to display.', options: ['Actions/objectives', 'Emotions', 'Lines', 'Directions'], correctAnswer: 'Actions/objectives', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Giving direction in front of the entire crew, embarrassing the actor.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What should a director do before shooting a scene?', options: ['Read the script for the first time', 'Just start filming', 'Discuss the scene\'s intention and blocking with actors', 'Only check the camera'], correctAnswer: 'Discuss the scene\'s intention and blocking with actors', difficulty: 'easy' },
    { type: 'true_false', prompt: '"Blocking" refers to planning where actors move in a scene.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Lighting Scenes': [
    { type: 'multiple_choice', prompt: 'What is three-point lighting?', options: ['Lighting from 3 different rooms', 'Using 3 candles', 'Key light, fill light, and backlight', 'Three spotlights on the ceiling'], correctAnswer: 'Key light, fill light, and backlight', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The key light is the main, brightest light source.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ light fills in shadows created by the key light.', options: ['Fill', 'Back', 'Spot', 'Flash'], correctAnswer: 'Fill', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does a backlight do?', options: ['Lights up the background', 'Creates shadows', 'Separates the subject from the background with a rim of light', 'Turns off the lights'], correctAnswer: 'Separates the subject from the background with a rim of light', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Shooting an interview with harsh overhead fluorescent lighting only.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Lighting sets the mood and emotion of a scene.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Sound Recording': [
    { type: 'multiple_choice', prompt: 'What is the most important element of film audio?', options: ['Clear dialogue recording', 'Background music', 'Silence', 'Sound effects'], correctAnswer: 'Clear dialogue recording', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Bad audio can ruin a film more than bad video.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ microphone (shotgun mic) is commonly used in film production.', options: ['Boom', 'Desk', 'Webcam', 'Bluetooth'], correctAnswer: 'Boom', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Relying only on the camera\'s built-in microphone.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a lavalier microphone?', options: ['A wireless speaker', 'A large studio mic', 'A small clip-on microphone worn by the speaker', 'A microphone on a boom pole'], correctAnswer: 'A small clip-on microphone worn by the speaker', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Recording room tone (ambient silence) is important for editing.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
  ],
  'Editing': [
    { type: 'multiple_choice', prompt: 'What is the most common type of edit/cut?', options: ['A standard cut (straight cut)', 'Wipe', 'Jump cut', 'Fade to black'], correctAnswer: 'A standard cut (straight cut)', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A "jump cut" removes a section of time within the same shot.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ cut transitions between two scenes by fading one out and the other in.', options: ['Dissolve/cross', 'Jump', 'Straight', 'Hard'], correctAnswer: 'Dissolve/cross', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is an "L-cut"?', options: ['A cut shaped like L', 'Audio from the next scene starts before the video changes', 'Cutting the letter L', 'A type of transition effect'], correctAnswer: 'Audio from the next scene starts before the video changes', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Cutting on action (during movement) for seamless transitions.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Pacing in editing affects the mood and energy of the film.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Color Grading': [
    { type: 'multiple_choice', prompt: 'What is color grading?', options: ['Adjusting colors and tones in post-production for mood', 'Painting the set', 'A type of camera', 'Choosing paint colors'], correctAnswer: 'Adjusting colors and tones in post-production for mood', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Color grading can dramatically change the mood of a scene.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Cool (blue) tones often convey ___ or sadness.', options: ['Cold', 'Warmth', 'Happiness', 'Excitement'], correctAnswer: 'Cold', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is the difference between color correction and color grading?', options: ['Grading is done first', 'Correction is creative', 'They\'re the same', 'Correction fixes issues, grading creates a creative look'], correctAnswer: 'Correction fixes issues, grading creates a creative look', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Shooting in a flat/log profile for more grading flexibility.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Warm tones (orange/yellow) often feel inviting or nostalgic.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Storytelling': [
    { type: 'multiple_choice', prompt: 'What is the basic story structure in film?', options: ['No structure needed', 'Five random scenes', 'Three acts: setup, confrontation, resolution', 'Beginning only'], correctAnswer: 'Three acts: setup, confrontation, resolution', difficulty: 'easy' },
    { type: 'true_false', prompt: '"Show, don\'t tell" is a key principle of visual storytelling.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ is the main character\'s central problem or challenge.', options: ['Conflict', 'Setting', 'Title', 'Genre'], correctAnswer: 'Conflict', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Having characters explain everything through dialogue instead of showing it.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "character arc"?', options: ['A lighting technique', 'A set design', 'How a character changes throughout the story', 'A curved camera move'], correctAnswer: 'How a character changes throughout the story', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Every scene should move the story forward in some way.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  };
}
