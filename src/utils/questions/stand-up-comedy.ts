import type { GameQuestion } from '../gameQuestions';

type LessonMap = Record<string, Record<string, GameQuestion[]>>;

export function registerStandupComedyQuestions(LESSON_QUESTIONS: LessonMap): void {
  LESSON_QUESTIONS['Stand-up Comedy'] = {
  'What\'s Funny': [
    { type: 'multiple_choice', prompt: 'What is the core element of most comedy?', options: ['Fancy words', 'Long stories', 'Being loud', 'Subverted expectations or surprise'], correctAnswer: 'Subverted expectations or surprise', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Comedy often comes from truth and shared experiences.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Comedy = tragedy + ___, according to a famous saying.', options: ['Time', 'Money', 'Talent', 'Luck'], correctAnswer: 'Time', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Testing joke ideas by writing them down regularly.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What makes observational comedy work?', options: ['Being mean', 'Using props', 'Making things up', 'Pointing out absurdities in everyday life'], correctAnswer: 'Pointing out absurdities in everyday life', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Everyone finds exactly the same things funny.', options: ['True', 'False'], correctAnswer: 'False', difficulty: 'easy' },
  ],
  'Joke Structure': [
    { type: 'multiple_choice', prompt: 'What are the two main parts of a joke?', options: ['Start and finish', 'Setup and punchline', 'Question and answer', 'Story and moral'], correctAnswer: 'Setup and punchline', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The setup creates an expectation that the punchline subverts.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ is the funny part that breaks the audience\'s expectation.', options: ['Punchline', 'Setup', 'Tag', 'Premise'], correctAnswer: 'Punchline', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Putting the funniest word at the very end of the punchline.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is a "tag" in comedy?', options: ['A price tag', 'The title of a joke', 'An additional punchline after the main one', 'A heckler response'], correctAnswer: 'An additional punchline after the main one', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Shorter setups generally make stronger jokes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Setup/Punch': [
    { type: 'multiple_choice', prompt: 'What should the setup do?', options: ['Be very long', 'Create a clear expectation or assumption', 'Explain the punchline', 'Be funny itself'], correctAnswer: 'Create a clear expectation or assumption', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The punchline should take the audience in an unexpected direction.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The funniest word should be the ___ word of the punchline.', options: ['Last', 'First', 'Middle', 'Longest'], correctAnswer: 'Last', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Explaining why your joke is funny after telling it.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "misdirection" in comedy?', options: ['Talking too fast', 'Forgetting your jokes', 'Leading the audience to think one way, then surprising them', 'Getting lost on stage'], correctAnswer: 'Leading the audience to think one way, then surprising them', difficulty: 'easy' },
    { type: 'before_after', prompt: 'Which joke structure is tighter?', options: ['So I went to the store the other day and it was really big and I was walking around and then I found something funny...', 'I went to the store. Found a product called "I Can\'t Believe It\'s Not Butter." I can. It was easy.'], correctAnswer: 'I went to the store. Found a product called "I Can\'t Believe It\'s Not Butter." I can. It was easy.', difficulty: 'easy' },
  ],
  'Timing': [
    { type: 'multiple_choice', prompt: 'What is comedic timing?', options: ['A type of joke', 'How long your set is', 'Arriving on time', 'The rhythm and pace of delivering jokes'], correctAnswer: 'The rhythm and pace of delivering jokes', difficulty: 'easy' },
    { type: 'true_false', prompt: 'A well-placed pause before the punchline can make it funnier.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'The ___ before a punchline builds anticipation and tension.', options: ['Pause', 'Scream', 'Whisper', 'Dance'], correctAnswer: 'Pause', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Rushing through your punchline because you\'re nervous.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What should you do after a big laugh?', options: ['Wait for the laugh to peak, then continue', 'Laugh louder than the audience', 'Talk immediately', 'Leave the stage'], correctAnswer: 'Wait for the laugh to peak, then continue', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Stepping on your laughs (talking during audience laughter) hurts your set.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Personal Stories': [
    { type: 'multiple_choice', prompt: 'Why do personal stories work well in comedy?', options: ['They\'re always long', 'They\'re authentic, unique, and relatable', 'They don\'t work', 'They\'re always offensive'], correctAnswer: 'They\'re authentic, unique, and relatable', difficulty: 'easy' },
    { type: 'true_false', prompt: 'The best comedians find humor in their own real experiences.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Making yourself the ___ of the joke is usually safer than targeting others.', options: ['Butt', 'Hero', 'Villain', 'Star'], correctAnswer: 'Butt', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Embellishing details to make a true story funnier.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What is "heightening" in a comedy story?', options: ['Using a microphone', 'Exaggerating details to make them funnier', 'Standing on a box', 'Speaking louder'], correctAnswer: 'Exaggerating details to make them funnier', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Vulnerability in comedy builds connection with the audience.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Crowd Reading': [
    { type: 'multiple_choice', prompt: 'What is "reading the room"?', options: ['Gauging the audience\'s mood and adjusting', 'Reading your notes', 'Reading a book on stage', 'Counting the audience'], correctAnswer: 'Gauging the audience\'s mood and adjusting', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Different audiences may respond differently to the same jokes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A "warm" crowd laughs easily, while a "___ " crowd is harder to please.', options: ['Cold', 'Hot', 'Big', 'Small'], correctAnswer: 'Cold', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Doing your exact same set regardless of the audience reaction.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Bad practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'What should you do if a joke doesn\'t land?', options: ['Blame the audience', 'Repeat it louder', 'Move on to the next joke', 'Walk off stage'], correctAnswer: 'Move on to the next joke', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Energy level of the audience affects which jokes work best.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Callbacks': [
    { type: 'multiple_choice', prompt: 'What is a "callback" in comedy?', options: ['Referencing a joke from earlier in your set', 'A phone reference', 'Calling someone back', 'Repeating every joke twice'], correctAnswer: 'Referencing a joke from earlier in your set', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Callbacks reward attentive audience members and get bigger laughs.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'A callback creates a sense of ___ and cleverness in your set.', options: ['Continuity', 'Confusion', 'Length', 'Boredom'], correctAnswer: 'Continuity', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using a callback to close your set, tying everything together.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'When does a callback work best?', options: ['Immediately after the original joke', 'Before the original joke', 'Never', 'After enough time has passed that the audience is surprised by the reference'], correctAnswer: 'After enough time has passed that the audience is surprised by the reference', difficulty: 'medium' },
    { type: 'true_false', prompt: 'Callbacks make your set feel more planned and professional.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  'Physical Comedy': [
    { type: 'multiple_choice', prompt: 'What is physical comedy?', options: ['Exercising on stage', 'Fighting on stage', 'Using body movements and expressions for humor', 'Standing perfectly still'], correctAnswer: 'Using body movements and expressions for humor', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Facial expressions can be just as funny as verbal jokes.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
    { type: 'fill_gap', prompt: 'Physical comedy relies on ___, exaggeration, and body control.', options: ['Timing', 'Volume', 'Height', 'Weight'], correctAnswer: 'Timing', difficulty: 'easy' },
    { type: 'swipe_judge', prompt: 'Using physical comedy to enhance a verbal joke.', options: ['Good practice', 'Bad practice'], correctAnswer: 'Good practice', difficulty: 'easy' },
    { type: 'multiple_choice', prompt: 'Who is a famous physical comedian?', options: ['Mozart', 'Jim Carrey', 'Einstein', 'Shakespeare'], correctAnswer: 'Jim Carrey', difficulty: 'easy' },
    { type: 'true_false', prompt: 'Acting out a story physically makes it more vivid and funny.', options: ['True', 'False'], correctAnswer: 'True', difficulty: 'easy' },
  ],
  };
}
