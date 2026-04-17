import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerMagicTricksQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Magic Tricks'] = {
  'Magic Basics': [
    { type: 'multiple_choice', prompt: 'What is the #1 rule of magic?', options: ['Wear a cape', 'Move fast', 'Use expensive props', 'Never reveal the secret'], correctAnswer: 'Never reveal the secret', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1542379653-b928db1aee4a?w=440&h=300&fit=crop' },
    { type: 'true_false', prompt: 'Magic is mostly about speed of hands.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What are the 3 parts of any magic trick?', options: ['Setup, Performance, Applause', 'The Pledge, The Turn, The Prestige', 'Intro, Middle, End', 'Shuffle, Cut, Deal'], correctAnswer: 'The Pledge, The Turn, The Prestige', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Practicing in front of a mirror before performing.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'You should always tell the audience what you\'re about to do.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "gimmick" in magic?', options: ['A joke you tell', 'A type of card', 'A secret device that helps the trick', 'Your stage outfit'], correctAnswer: 'A secret device that helps the trick', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The story a magician tells during a trick is called ___.', options: ['Patter', 'Script', 'Lyrics', 'Plot'], correctAnswer: 'Patter', difficulty: 'easy' },
    { type: 'before_after', prompt: 'Which intro is better for a magic show?', options: ['I\'m going to do a trick now.', 'Have you ever had a moment where the impossible became real? Watch closely...'], correctAnswer: 'Have you ever had a moment where the impossible became real? Watch closely...', difficulty: 'easy' },
  ],
  'Card Fundamentals': [
    { type: 'multiple_choice', prompt: 'How many cards are in a standard deck?', options: ['54', '50', '52', '48'], correctAnswer: '52', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1529480780361-ba1eb4a44de8?w=440&h=300&fit=crop' },
    { type: 'multiple_choice', prompt: 'What are the 4 suits in a deck?', options: ['Hearts, Stars, Moons, Suns', 'Red, Blue, Green, Yellow', 'Aces, Kings, Queens, Jacks', 'Hearts, Diamonds, Clubs, Spades'], correctAnswer: 'Hearts, Diamonds, Clubs, Spades', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A "bridge" is a way to shuffle cards by bending them.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "spread" in card magic?', options: ['Fanning cards face-up on a table', 'Throwing cards everywhere', 'Cutting the deck', 'Dealing to players'], correctAnswer: 'Fanning cards face-up on a table', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The top card of the deck is important because most ___ start there.', options: ['Controls', 'Shuffles', 'Bets', 'Games'], correctAnswer: 'Controls', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Bending someone else\'s cards without permission.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "key card"?', options: ['A card you secretly know the position of', 'A card with a mark', 'The most expensive card', 'The Ace of Spades'], correctAnswer: 'A card you secretly know the position of', difficulty: 'medium' },
    { type: 'true_false', prompt: 'You should always use a brand new deck for performances.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
  ],
  'Coin Tricks': [
    { type: 'multiple_choice', prompt: 'What is the "French Drop"?', options: ['A fake transfer where the coin stays hidden', 'A coin vanish using a table', 'Flipping a coin in the air', 'Dropping a French coin'], correctAnswer: 'A fake transfer where the coin stays hidden', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1618060932014-4deda4932554?w=440&h=300&fit=crop' },
    { type: 'true_false', prompt: 'Larger coins are easier for beginners to palm.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What size coin is most popular for magic?', options: ['Dime', 'Penny', 'Quarter', 'Half Dollar'], correctAnswer: 'Half Dollar', difficulty: 'medium' },
    { type: 'fill_gap', prompt: 'Hiding a coin in the curl of your fingers is called ___ palm.', options: ['Classic', 'French', 'English', 'Finger'], correctAnswer: 'Classic', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Looking at your hand where the coin is hidden.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Where should you look during a coin vanish?', options: ['At the hand secretly holding the coin', 'At the floor', 'At the ceiling', 'At the hand the audience thinks holds the coin'], correctAnswer: 'At the hand the audience thinks holds the coin', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The "Muscle Pass" launches a coin from your palm using muscle tension.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'hard' },
    { type: 'before_after', prompt: 'Which coin vanish presentation is better?', options: ['Watch, I\'ll make this coin disappear. *does move*', 'Hold out your hand... feel the weight of the coin... now slowly close your fingers... open them. It\'s gone.'], correctAnswer: 'Hold out your hand... feel the weight of the coin... now slowly close your fingers... open them. It\'s gone.', difficulty: 'medium' },
  ],
  'Misdirection': [
    { type: 'multiple_choice', prompt: 'What is misdirection?', options: ['Moving really fast', 'Controlling where the audience looks', 'Using smoke and mirrors', 'Talking very loudly'], correctAnswer: 'Controlling where the audience looks', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=440&h=300&fit=crop' },
    { type: 'true_false', prompt: 'People naturally look where you look.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Which is the strongest form of misdirection?', options: ['Loud noises', 'Natural attention management', 'Confusing patter', 'Bright lights'], correctAnswer: 'Natural attention management', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Saying "don\'t look at my left hand" during a trick.', options: ['Good misdirection', 'Bad misdirection'], correctAnswer: 'Bad misdirection', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The moment when the secret move happens is called the ___ moment.', options: ['Off-beat', 'High-beat', 'Secret', 'Silent'], correctAnswer: 'Off-beat', difficulty: 'medium' },
    { type: 'multiple_choice', prompt: 'When should you do the secret move?', options: ['Never — use gimmicks instead', 'When everyone is watching closely', 'At the very beginning', 'During a moment of relaxation or laughter'], correctAnswer: 'During a moment of relaxation or laughter', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Humor is a powerful misdirection tool.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'before_after', prompt: 'Which uses better misdirection?', options: ['*Stares at hands while doing the move*', '*Makes a joke, audience laughs, does the move during the laugh*'], correctAnswer: '*Makes a joke, audience laughs, does the move during the laugh*', difficulty: 'easy' },
  ],
  'The Double Lift': [
    { type: 'multiple_choice', prompt: 'What is a double lift?', options: ['Picking up the whole deck', 'Lifting a card with two hands', 'Flipping the deck over twice', 'Lifting two cards as if they were one'], correctAnswer: 'Lifting two cards as if they were one', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The double lift is one of the most important sleights in card magic.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'How do you prepare for a double lift?', options: ['Shake the deck', 'Lick your fingers', 'Get a "break" above the top two cards', 'Bend the whole deck'], correctAnswer: 'Get a "break" above the top two cards', difficulty: 'medium' },
    { type: 'fill_gap', prompt: 'A small gap held by your pinky between cards is called a ___.', options: ['Break', 'Split', 'Gap', 'Hold'], correctAnswer: 'Break', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Practicing the double lift at the same speed as turning a single card.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A double lift should look exactly like turning one card over.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What famous trick relies heavily on the double lift?', options: ['Ambitious Card routine', 'Coin Vanish', 'Rope Cut', 'Cup and Balls'], correctAnswer: 'Ambitious Card routine', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Lifting the cards at a different speed than a normal single flip.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
  ],
  'Palming': [
    { type: 'multiple_choice', prompt: 'What is palming?', options: ['Clapping your hands', 'A type of card cut', 'Secretly hiding an object in your hand', 'Showing both hands empty'], correctAnswer: 'Secretly hiding an object in your hand', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=440&h=300&fit=crop' },
    { type: 'multiple_choice', prompt: 'Which palm hides a card in the center of your palm?', options: ['Finger palm', 'Tenkai palm', 'Gambler\'s cop', 'Classic palm'], correctAnswer: 'Classic palm', difficulty: 'medium', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=440&h=300&fit=crop' },
    { type: 'true_false', prompt: 'Your hand should look tense and closed when palming.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ palm holds the card using just the fingers, not the palm itself.', options: ['Finger', 'Classic', 'Back', 'Side'], correctAnswer: 'Finger', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Keeping your palming hand in a natural position at your side.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Good technique', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Squeezing the card tightly so it doesn\'t fall.', options: ['Good technique', 'Bad technique'], correctAnswer: 'Bad technique', difficulty: 'easy' },
    { type: 'true_false', prompt: 'You should practice palming while watching TV to build muscle memory.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What should your palming hand look like?', options: ['Naturally relaxed, slightly curved', 'Pointing at something', 'Clenched in a fist', 'Completely flat and open'], correctAnswer: 'Naturally relaxed, slightly curved', difficulty: 'easy' },
  ],
  'Forces': [
    { type: 'multiple_choice', prompt: 'What is a "force" in magic?', options: ['Pushing someone to volunteer', 'Using physical strength in tricks', 'Making someone pick a specific card while they feel free', 'Bending a card with force'], correctAnswer: 'Making someone pick a specific card while they feel free', difficulty: 'easy', image: 'https://images.unsplash.com/photo-1529480780361-ba1eb4a44de8?w=440&h=300&fit=crop' },
    { type: 'multiple_choice', prompt: 'What is the "Hindu Shuffle Force"?', options: ['A force invented in India', 'Running packets off the deck, stopping when told', 'Spreading cards on a Hindu rug', 'A force using a Hindu prayer'], correctAnswer: 'Running packets off the deck, stopping when told', difficulty: 'medium', image: 'https://images.unsplash.com/photo-1529480780361-ba1eb4a44de8?w=440&h=300&fit=crop' },
    { type: 'true_false', prompt: 'The Classic Force requires no skill — anyone can do it.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The simplest force is the ___ force, where you just ask them to say "stop".', options: ['Riffle', 'Classic', 'Hindu', 'Slip'], correctAnswer: 'Riffle', difficulty: 'medium' },
    { type: 'swipe_judge', prompt: 'Having a backup plan if the force fails.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What makes a force convincing?', options: ['Making the spectator truly feel they had a free choice', 'Telling them which card to pick', 'Using multiple decks', 'Going very fast'], correctAnswer: 'Making the spectator truly feel they had a free choice', difficulty: 'easy' },
    { type: 'true_false', prompt: 'If a force fails, you should tell the audience and try again.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
    { type: 'before_after', prompt: 'Which force presentation is better?', options: ['Pick this card. No, this one. Take it.', 'Fan through the cards... whenever you feel like it, touch any card that calls to you.'], correctAnswer: 'Fan through the cards... whenever you feel like it, touch any card that calls to you.', difficulty: 'easy' },
  ],
  };
}
