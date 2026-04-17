import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerFashionDesignQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Fashion Design'] = {
  'Fashion History': [
    { type: 'multiple_choice', prompt: 'Who is known as the "father of haute couture"?', options: ['Ralph Lauren', 'Gianni Versace', 'Coco Chanel', 'Charles Frederick Worth'], correctAnswer: 'Charles Frederick Worth', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Fashion trends are cyclical — old styles often come back.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Coco Chanel popularized the "little ___ dress" in the 1920s.', options: ['Black', 'Red', 'White', 'Blue'], correctAnswer: 'Black', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Studying fashion history for design inspiration.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What does "haute couture" mean?', options: ['Cheap fashion', 'High-end custom-made fashion', 'Fast fashion', 'Street wear'], correctAnswer: 'High-end custom-made fashion', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The miniskirt became iconic in the 1960s.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Sketching': [
    { type: 'multiple_choice', prompt: 'What is a fashion "croquis"?', options: ['A fabric type', 'A pattern tool', 'A figure template for designing garments on', 'A sewing technique'], correctAnswer: 'A figure template for designing garments on', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Fashion figures are typically drawn 9-10 heads tall (elongated).', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Fashion sketches emphasize the ___ over realistic body proportions.', options: ['Garment', 'Face', 'Background', 'Shadow'], correctAnswer: 'Garment', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Sketching design ideas quickly before refining them.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What are "flats" in fashion design?', options: ['Apartments', 'Flat shoes', 'Technical drawings showing garment construction details', 'Ironed clothes'], correctAnswer: 'Technical drawings showing garment construction details', difficulty: 'medium' },
    { type: 'true_false', prompt: 'You need to be a great artist to start fashion sketching.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
  ],
  'Color Theory': [
    { type: 'multiple_choice', prompt: 'What are the primary colors?', options: ['Green, orange, purple', 'Black, white, gray', 'Pink, teal, gold', 'Red, yellow, blue'], correctAnswer: 'Red, yellow, blue', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Complementary colors are opposite each other on the color wheel.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: '___ colors (next to each other on the wheel) create harmonious outfits.', options: ['Analogous', 'Complementary', 'Triadic', 'Random'], correctAnswer: 'Analogous', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Using a color wheel when planning a collection\'s palette.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "monochromatic" color scheme?', options: ['Using only black and white', 'Using random colors', 'Using all colors', 'Using variations of a single color'], correctAnswer: 'Using variations of a single color', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Warm colors include red, orange, and yellow.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Fabric Types': [
    { type: 'multiple_choice', prompt: 'Which fabric is most breathable?', options: ['Acrylic', 'Polyester', 'Nylon', 'Cotton'], correctAnswer: 'Cotton', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Silk is a natural fiber produced by silkworms.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: '___ is a stretchy synthetic fabric often used in activewear.', options: ['Spandex', 'Wool', 'Linen', 'Silk'], correctAnswer: 'Spandex', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is denim made from?', options: ['Silk', 'Wool', 'Sturdy cotton twill', 'Polyester'], correctAnswer: 'Sturdy cotton twill', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Choosing fabric based on the garment\'s function and design.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Linen wrinkles easily but is excellent for hot weather.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Body Proportions': [
    { type: 'multiple_choice', prompt: 'Why do designers study body proportions?', options: ['It\'s not important', 'To create well-fitting garments for different body types', 'To judge people', 'For fun only'], correctAnswer: 'To create well-fitting garments for different body types', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Good design flatters the wearer\'s body type.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ is the narrowest part of the torso, important for fit.', options: ['Waist', 'Chest', 'Hip', 'Shoulder'], correctAnswer: 'Waist', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Designing only for one body type and ignoring others.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What are key body measurements for garment making?', options: ['Head circumference', 'Shoe size only', 'Height only', 'Bust, waist, and hips'], correctAnswer: 'Bust, waist, and hips', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Inclusive sizing is becoming more important in modern fashion.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Silhouettes': [
    { type: 'multiple_choice', prompt: 'What is a silhouette in fashion?', options: ['A color scheme', 'A fabric type', 'A shadow', 'The overall shape or outline of a garment on the body'], correctAnswer: 'The overall shape or outline of a garment on the body', difficulty: 'easy' },
    { type: 'true_false', prompt: 'An A-line silhouette is fitted at the top and flares at the bottom.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ silhouette follows the body\'s natural curves closely.', options: ['Fitted', 'Oversized', 'Boxy', 'Flared'], correctAnswer: 'Fitted', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Considering the silhouette before adding details to a design.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is an "empire waist" silhouette?', options: ['Low waist at hips', 'Waistline just below the bust', 'Waist at natural position', 'No waistline'], correctAnswer: 'Waistline just below the bust', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Different silhouettes suit different body types.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Pattern Making': [
    { type: 'multiple_choice', prompt: 'What is a pattern in fashion design?', options: ['A template used to cut fabric pieces for a garment', 'A printed fabric', 'A design sketch', 'A color scheme'], correctAnswer: 'A template used to cut fabric pieces for a garment', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Patterns include seam allowances for sewing.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A ___ is a test garment made from cheap fabric to check fit.', options: ['Muslin/toile', 'Prototype', 'Sample', 'Draft'], correctAnswer: 'Muslin/toile', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Making a test garment before cutting expensive fabric.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What are "darts" in pattern making?', options: ['Triangular folds sewn into fabric for shaping', 'Decorative pins', 'A type of stitch', 'Throwing weapons'], correctAnswer: 'Triangular folds sewn into fabric for shaping', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Grading a pattern means scaling it up or down for different sizes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
  ],
  'Draping': [
    { type: 'multiple_choice', prompt: 'What is draping in fashion design?', options: ['Folding laundry', 'Hanging curtains', 'Arranging fabric on a dress form to create designs', 'Drawing on fabric'], correctAnswer: 'Arranging fabric on a dress form to create designs', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Draping allows you to see how fabric falls and moves in 3D.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A dress ___ is a mannequin used for draping fabric.', options: ['Form', 'Model', 'Frame', 'Stand'], correctAnswer: 'Form', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Understanding how different fabrics drape before designing with them.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which fabric drapes best for flowing garments?', options: ['Canvas', 'Silk or chiffon', 'Felt', 'Denim'], correctAnswer: 'Silk or chiffon', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The bias grain (45 degree angle) makes fabric drape more fluidly.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'medium' },
  ],
  };
}
