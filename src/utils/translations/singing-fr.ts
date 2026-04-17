export const singingFr: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Breathing
  'Where should you breathe from when singing?': { prompt: 'D\'où devriez-vous respirer en chantant?', options: ['Diaphragme', 'Nez seulement', 'Poitrine seulement', 'Gorge'], correctAnswer: 'Diaphragme' },
  'Diaphragmatic breathing uses the belly, not just the chest.': { prompt: 'La respiration diaphragmatique utilise le ventre, pas seulement la poitrine.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The ___ is a dome-shaped muscle below the lungs that controls breathing.': { prompt: 'Le ___ est un muscle en forme de dôme sous les poumons qui contrôle la respiration.', options: ['Diaphragme', 'Larynx', 'Pharynx', 'Trachée'], correctAnswer: 'Diaphragme' },
  'Raising your shoulders when taking a breath to sing.': { prompt: 'Lever les épaules en prenant une respiration pour chanter.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What happens to your belly during a good singing breath?': { prompt: 'Que se passe-t-il avec votre ventre pendant une bonne respiration de chant?', options: ['Il se contracte', 'Rien', 'Il se gonfle vers l\'extérieur', 'Il se rentre'], correctAnswer: 'Il se gonfle vers l\'extérieur' },
  'Breath control is the foundation of good singing technique.': { prompt: 'Le contrôle du souffle est la base d\'une bonne technique de chant.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Pitch Basics
  'What is pitch?': { prompt: 'Qu\'est-ce que la hauteur tonale?', options: ['Le rythme', 'À quel point une note sonne haute ou basse', 'Le volume', 'La vitesse d\'une chanson'], correctAnswer: 'À quel point une note sonne haute ou basse' },
  'Singing "on pitch" means hitting the correct note.': { prompt: 'Chanter "juste" signifie atteindre la bonne note.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Singing below the correct note is called singing ___.': { prompt: 'Chanter en dessous de la note correcte s\'appelle chanter ___.', options: ['Bémol', 'Dièse', 'Fort', 'Vite'], correctAnswer: 'Bémol' },
  'Using a piano or tuner app to check your pitch.': { prompt: 'Utiliser un piano ou une application d\'accordeur pour vérifier sa justesse.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What does "singing sharp" mean?': { prompt: 'Que signifie "chanter dièse"?', options: ['Chanter légèrement au-dessus de la note correcte', 'Chanter fort', 'Chanter trop bas', 'Chanter dans une tonalité mineure'], correctAnswer: 'Chanter légèrement au-dessus de la note correcte' },
  'Ear training helps improve pitch accuracy over time.': { prompt: 'L\'entraînement de l\'oreille aide à améliorer la justesse au fil du temps.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Vocal Range
  'What is vocal range?': { prompt: 'Qu\'est-ce que la tessiture vocale?', options: ['À quelle vitesse vous pouvez chanter', 'L\'étendue de votre note la plus basse à la plus haute', 'Votre genre préféré', 'À quel point vous pouvez chanter fort'], correctAnswer: 'L\'étendue de votre note la plus basse à la plus haute' },
  'Soprano is the highest common female voice type.': { prompt: 'Soprano est le type de voix féminine commune le plus aigu.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The lowest common male voice type is ___.': { prompt: 'Le type de voix masculine commune le plus grave est ___.', options: ['Basse', 'Ténor', 'Alto', 'Soprano'], correctAnswer: 'Basse' },
  'What is a tenor?': { prompt: 'Qu\'est-ce qu\'un ténor?', options: ['La voix féminine la plus grave', 'Un tempo de chanson', 'La voix masculine commune la plus aiguë', 'Un instrument'], correctAnswer: 'La voix masculine commune la plus aiguë' },
  'Forcing yourself to sing notes outside your comfortable range.': { prompt: 'Se forcer à chanter des notes hors de sa tessiture confortable.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'Your vocal range can expand with proper training.': { prompt: 'Votre tessiture vocale peut s\'étendre avec un entraînement approprié.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Warm-Ups
  'Why are vocal warm-ups important?': { prompt: 'Pourquoi les échauffements vocaux sont-ils importants?', options: ['Ils perdent du temps', 'Ils préparent les cordes vocales et préviennent les tensions', 'Ils vous rendent plus fort', 'Ils changent votre tessiture'], correctAnswer: 'Ils préparent les cordes vocales et préviennent les tensions' },
  'Lip trills are a common vocal warm-up exercise.': { prompt: 'Les trilles des lèvres sont un exercice d\'échauffement vocal courant.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Singing ___ up and down is a basic warm-up exercise.': { prompt: 'Chanter des ___ de haut en bas est un exercice d\'échauffement de base.', options: ['Gammes', 'Chansons', 'Paroles', 'Mots'], correctAnswer: 'Gammes' },
  'Singing at full power without warming up first.': { prompt: 'Chanter à pleine puissance sans s\'échauffer d\'abord.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'How long should a vocal warm-up last?': { prompt: 'Combien de temps devrait durer un échauffement vocal?', options: ['5 secondes', '10-15 minutes', 'Pas de temps nécessaire', '1 heure'], correctAnswer: '10-15 minutes' },
  'Humming is a gentle and effective vocal warm-up.': { prompt: 'Fredonner est un échauffement vocal doux et efficace.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Vowel Shapes
  'Why are vowel shapes important in singing?': { prompt: 'Pourquoi les formes de voyelles sont-elles importantes en chant?', options: ['Elles sont jolies', 'Elles affectent la qualité du timbre et la résonance', 'Elles changent les paroles', 'Elles n\'ont pas d\'importance'], correctAnswer: 'Elles affectent la qualité du timbre et la résonance' },
  'Tall, open vowels produce a richer singing tone.': { prompt: 'Les voyelles hautes et ouvertes produisent un timbre de chant plus riche.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The five primary vowels in singing are A, E, I, O, and ___.': { prompt: 'Les cinq voyelles principales en chant sont A, E, I, O et ___.', options: ['U', 'Y', 'W', 'R'], correctAnswer: 'U' },
  'Modifying vowels slightly on high notes for easier singing.': { prompt: 'Modifier légèrement les voyelles sur les notes aiguës pour chanter plus facilement.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What does "open throat" mean in singing?': { prompt: 'Que signifie "gorge ouverte" en chant?', options: ['Chanter la bouche fermée', 'Crier', 'Respirer par la bouche', 'Un pharynx détendu et ouvert pour une meilleure résonance'], correctAnswer: 'Un pharynx détendu et ouvert pour une meilleure résonance' },
  'Jaw tension hurts vowel production.': { prompt: 'La tension de la mâchoire nuit à la production des voyelles.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Head Voice
  'What is head voice?': { prompt: 'Qu\'est-ce que la voix de tête?', options: ['La voix parlée', 'Le registre plus léger et aigu de la voix', 'Penser à chanter', 'Chuchoter'], correctAnswer: 'Le registre plus léger et aigu de la voix' },
  'Head voice vibrations are felt mostly in the head/skull area.': { prompt: 'Les vibrations de la voix de tête se ressentent principalement dans la zone de la tête/crâne.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Head voice is used for ___ notes in your range.': { prompt: 'La voix de tête est utilisée pour les notes ___ de votre tessiture.', options: ['Aiguës', 'Graves', 'Moyennes', 'Toutes'], correctAnswer: 'Aiguës' },
  'Straining to hit high notes instead of switching to head voice.': { prompt: 'Forcer pour atteindre les notes aiguës au lieu de passer en voix de tête.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'Head voice sounds _____ compared to chest voice.': { prompt: 'La voix de tête sonne _____ comparée à la voix de poitrine.', options: ['Exactement pareil', 'Plus grave', 'Plus lourde et forte', 'Plus légère et aérienne'], correctAnswer: 'Plus légère et aérienne' },
  'Falsetto and head voice are exactly the same thing.': { prompt: 'Le falsetto et la voix de tête sont exactement la même chose.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },

  // Chest Voice
  'What is chest voice?': { prompt: 'Qu\'est-ce que la voix de poitrine?', options: ['Chuchoter', 'Synonyme de voix de tête', 'Le registre plus plein et grave utilisé pour parler et chanter dans les graves', 'Seulement pour les hommes'], correctAnswer: 'Le registre plus plein et grave utilisé pour parler et chanter dans les graves' },
  'Chest voice vibrations are felt in the chest area.': { prompt: 'Les vibrations de la voix de poitrine se ressentent dans la zone de la poitrine.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Chest voice uses thicker vocal cord vibration for a ___ sound.': { prompt: 'La voix de poitrine utilise une vibration plus épaisse des cordes vocales pour un son plus ___.', options: ['Riche', 'Mince', 'Léger', 'Doux'], correctAnswer: 'Riche' },
  'Pushing chest voice too high instead of blending into mix voice.': { prompt: 'Pousser la voix de poitrine trop haut au lieu de passer en voix mixte.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'Most pop and rock singing is primarily in which voice?': { prompt: 'La majorité du chant pop et rock est principalement dans quelle voix?', options: ['Voix de poitrine et mixte', 'Falsetto', 'Registre sifflet', 'Voix de tête'], correctAnswer: 'Voix de poitrine et mixte' },
  'Everyone has a chest voice, regardless of voice type.': { prompt: 'Tout le monde a une voix de poitrine, quel que soit le type de voix.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Mix Voice
  'What is mix voice?': { prompt: 'Qu\'est-ce que la voix mixte?', options: ['Un type de microphone', 'Chanter deux notes à la fois', 'Un mélange des qualités de voix de poitrine et de tête', 'Seulement pour l\'opéra'], correctAnswer: 'Un mélange des qualités de voix de poitrine et de tête' },
  'Mix voice allows you to sing higher without straining.': { prompt: 'La voix mixte vous permet de chanter plus aigu sans forcer.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Mix voice bridges the ___ between chest and head voice.': { prompt: 'La voix mixte comble le ___ entre la voix de poitrine et la voix de tête.', options: ['Fossé', 'Clé', 'Note', 'Rythme'], correctAnswer: 'Fossé' },
  'Practicing smoothly transitioning between chest and head voice.': { prompt: 'Pratiquer la transition fluide entre la voix de poitrine et la voix de tête.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'Where does the "break" or "passaggio" occur?': { prompt: 'Où se produit la "cassure" ou le "passaggio"?', options: ['À votre note la plus basse', 'Là où la voix de poitrine fait la transition vers la voix de tête', 'À la fin d\'une chanson', 'Quand vous manquez de souffle'], correctAnswer: 'Là où la voix de poitrine fait la transition vers la voix de tête' },
  'Training mix voice helps eliminate the vocal "break".': { prompt: 'Entraîner la voix mixte aide à éliminer la "cassure" vocale.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
};
