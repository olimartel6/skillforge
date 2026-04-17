export const beatboxingFr: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Basic Beats
  'What are the 3 basic beatbox sounds?': { prompt: 'Quels sont les 3 sons de base du beatbox ?', options: ['Basse, aigus, médiums', 'Clap, snap, stomp', 'Kick (B), hi-hat (T), snare (Pf/K)', 'Hum, sifflement, clic'], correctAnswer: 'Kick (B), hi-hat (T), snare (Pf/K)' },
  'Beatboxing uses only the mouth, lips, and throat to create sounds.': { prompt: 'Le beatbox utilise uniquement la bouche, les lèvres et la gorge pour créer des sons.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The basic kick drum sound is made with the letter ___.': { prompt: 'Le son de base de la grosse caisse se fait avec la lettre ___.', options: ['B', 'T', 'K', 'S'], correctAnswer: 'B' },
  'Practicing basic sounds slowly before trying fast beats.': { prompt: 'Pratiquer les sons de base lentement avant d\'essayer des rythmes rapides.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What is the standard 4-beat pattern in beatboxing?': { prompt: 'Quel est le pattern standard à 4 temps en beatbox ?', options: ['B-T-K-T (kick-hat-snare-hat)', 'Que des kicks', 'Seulement la respiration', 'Des sons aléatoires'], correctAnswer: 'B-T-K-T (kick-hat-snare-hat)' },
  'Beatboxing originated in hip-hop culture.': { prompt: 'Le beatbox est né dans la culture hip-hop.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Hi-Hat
  'How do you make a basic hi-hat sound?': { prompt: 'Comment fait-on un son de hi-hat de base ?', options: ['Fredonner fort', 'Taper des mains', 'Un "ts" ou "t" sec avec la langue derrière les dents', 'Dire "boom"'], correctAnswer: 'Un "ts" ou "t" sec avec la langue derrière les dents' },
  'The hi-hat keeps the rhythm between kick and snare.': { prompt: 'Le hi-hat maintient le rythme entre le kick et le snare.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'An open hi-hat sound is longer, while a closed hi-hat is ___.': { prompt: 'Un hi-hat ouvert est plus long, tandis qu\'un hi-hat fermé est ___.', options: ['Court', 'Plus fort', 'Plus grave', 'Silencieux'], correctAnswer: 'Court' },
  'Practicing hi-hat sounds at a consistent tempo.': { prompt: 'Pratiquer les sons de hi-hat à un tempo constant.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What creates variation in hi-hat patterns?': { prompt: 'Qu\'est-ce qui crée de la variation dans les patterns de hi-hat ?', options: ['Les rendre tous identiques', 'Ne pas les utiliser', 'Mélanger hi-hats ouverts et fermés avec différents rythmes', 'Le volume seulement'], correctAnswer: 'Mélanger hi-hats ouverts et fermés avec différents rythmes' },
  'The hi-hat is the most frequently used sound in a basic beat.': { prompt: 'Le hi-hat est le son le plus fréquemment utilisé dans un beat de base.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Snare
  'How is a basic snare sound made?': { prompt: 'Comment fait-on un son de snare de base ?', options: ['En fredonnant', 'Un "pf" ou "kh" sec en poussant l\'air vers l\'extérieur', 'En disant "boom"', 'En claquant la langue'], correctAnswer: 'Un "pf" ou "kh" sec en poussant l\'air vers l\'extérieur' },
  'The snare typically falls on beats 2 and 4 in a standard pattern.': { prompt: 'Le snare tombe généralement sur les temps 2 et 4 dans un pattern standard.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The "pf" snare is made by pushing air through closed ___.': { prompt: 'Le snare "pf" se fait en poussant l\'air à travers les ___ fermées.', options: ['Lèvres', 'Dents', 'Narines', 'Yeux'], correctAnswer: 'Lèvres' },
  'Making your snare sound punchy and distinct from other sounds.': { prompt: 'Rendre votre son de snare percutant et distinct des autres sons.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What makes a good snare sound?': { prompt: 'Qu\'est-ce qui fait un bon son de snare ?', options: ['Être soufflé', 'Être silencieux', 'Une attaque nette et percutante', 'Être identique au kick'], correctAnswer: 'Une attaque nette et percutante' },
  'There are multiple ways to make snare sounds in beatboxing.': { prompt: 'Il existe plusieurs façons de faire des sons de snare en beatbox.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Bass Drop
  'What is a "bass drop" in beatboxing?': { prompt: 'Qu\'est-ce qu\'un "bass drop" en beatbox ?', options: ['Un son grave et profond fait avec la gorge ou les lèvres', 'Un son de claquement', 'Un cri aigu', 'Laisser tomber une guitare basse'], correctAnswer: 'Un son grave et profond fait avec la gorge ou les lèvres' },
  'Lip bass uses lip vibration to create a deep bass sound.': { prompt: 'Le lip bass utilise la vibration des lèvres pour créer un son de basse profond.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The lip ___ is one of the most popular bass sounds in beatboxing.': { prompt: 'Le lip ___ est l\'un des sons de basse les plus populaires en beatbox.', options: ['Roll', 'Click', 'Pop', 'Snap'], correctAnswer: 'Roll' },
  'Straining your throat to make bass sounds louder.': { prompt: 'Forcer sa gorge pour rendre les sons de basse plus forts.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'Where does the vibration come from in lip bass?': { prompt: 'D\'où vient la vibration dans le lip bass ?', options: ['Vibration lâche des lèvres, similaire au son d\'un bateau à moteur', 'Du nez', 'Des dents', 'De la langue'], correctAnswer: 'Vibration lâche des lèvres, similaire au son d\'un bateau à moteur' },
  'Bass sounds add depth and power to beatbox patterns.': { prompt: 'Les sons de basse ajoutent de la profondeur et de la puissance aux patterns de beatbox.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Patterns
  'What is a beatbox pattern?': { prompt: 'Qu\'est-ce qu\'un pattern de beatbox ?', options: ['Un type de microphone', 'Une séquence répétée de sons formant un rythme', 'Un pas de danse', 'Un motif vestimentaire'], correctAnswer: 'Une séquence répétée de sons formant un rythme' },
  'The basic "boots and cats" phrase mimics a drum pattern.': { prompt: 'L\'expression de base "boots and cats" imite un pattern de batterie.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'A ___ is one complete cycle of your beat pattern.': { prompt: 'Une ___ est un cycle complet de votre pattern rythmique.', options: ['Mesure', 'Ligne', 'Ronde', 'Série'], correctAnswer: 'Mesure' },
  'Mastering one pattern before learning the next.': { prompt: 'Maîtriser un pattern avant d\'apprendre le suivant.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'How do you make patterns more interesting?': { prompt: 'Comment rendre les patterns plus intéressants ?', options: ['Ajouter des variations, des fills et de nouveaux sons', 'Les simplifier', 'Les garder exactement identiques', 'Accélérer seulement'], correctAnswer: 'Ajouter des variations, des fills et de nouveaux sons' },
  'Practicing with a metronome helps keep your patterns in time.': { prompt: 'S\'entraîner avec un métronome aide à garder vos patterns en rythme.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Vocal Scratching
  'What does vocal scratching imitate?': { prompt: 'Qu\'est-ce que le vocal scratching imite ?', options: ['Les sons de scratch de platine DJ', 'Un chat qui griffe', 'Des sons d\'écriture', 'Se gratter une démangeaison'], correctAnswer: 'Les sons de scratch de platine DJ' },
  'Vocal scratching adds a DJ-like element to beatboxing.': { prompt: 'Le vocal scratching ajoute un élément de DJ au beatbox.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Vocal scratches use ___ movements with vocalized sounds.': { prompt: 'Les scratches vocaux utilisent des mouvements de ___ avec des sons vocalisés.', options: ['Langue', 'Main', 'Pied', 'Tête'], correctAnswer: 'Langue' },
  'Practicing scratch sounds slowly to get the technique right.': { prompt: 'Pratiquer les sons de scratch lentement pour maîtriser la technique.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What makes a scratch sound realistic?': { prompt: 'Qu\'est-ce qui rend un son de scratch réaliste ?', options: ['Être très fort', 'Un glissement de hauteur fluide et une bonne forme de bouche', 'Utiliser ses mains', 'Chanter une note'], correctAnswer: 'Un glissement de hauteur fluide et une bonne forme de bouche' },
  'Inward and outward scratches create different textures.': { prompt: 'Les scratches vers l\'intérieur et vers l\'extérieur créent des textures différentes.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Throat Bass
  'Where does throat bass vibration originate?': { prompt: 'D\'où provient la vibration du throat bass ?', options: ['De la langue', 'Des lèvres', 'De la gorge/zone des cordes vocales', 'Du nez'], correctAnswer: 'De la gorge/zone des cordes vocales' },
  'Throat bass should not cause pain if done correctly.': { prompt: 'Le throat bass ne devrait pas causer de douleur s\'il est fait correctement.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Throat bass creates a deep ___ vibration in the throat.': { prompt: 'Le throat bass crée une vibration ___ profonde dans la gorge.', options: ['Grondante', 'Aiguë', 'Silencieuse', 'Sifflante'], correctAnswer: 'Grondante' },
  'Forcing throat bass for long periods when it hurts.': { prompt: 'Forcer le throat bass pendant de longues périodes quand ça fait mal.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'How should you practice throat bass as a beginner?': { prompt: 'Comment devriez-vous pratiquer le throat bass en tant que débutant ?', options: ['Doucement et en courtes sessions', 'Jamais seul', 'Seulement quand on est malade', 'À pleine puissance immédiatement'], correctAnswer: 'Doucement et en courtes sessions' },
  'Staying hydrated helps protect your throat when practicing bass sounds.': { prompt: 'Rester hydraté aide à protéger votre gorge lors de la pratique des sons de basse.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Looping
  'What is "looping" in beatboxing?': { prompt: 'Qu\'est-ce que le "looping" en beatbox ?', options: ['Courir en cercles', 'Un type de basse', 'Enregistrer un pattern et superposer d\'autres sons par-dessus', 'Répéter le même son'], correctAnswer: 'Enregistrer un pattern et superposer d\'autres sons par-dessus' },
  'A loop station/pedal lets you build beats by layering recordings.': { prompt: 'Une loop station/pédale vous permet de construire des beats en superposant des enregistrements.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'When looping, timing and ___ are critical for clean loops.': { prompt: 'En looping, le timing et la ___ sont essentiels pour des boucles propres.', options: ['Précision', 'Volume', 'Vitesse', 'Silence'], correctAnswer: 'Précision' },
  'Practicing your loop timing without a loop station first.': { prompt: 'Pratiquer votre timing de boucle sans loop station d\'abord.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What is the first layer usually in a loop?': { prompt: 'Quelle est généralement la première couche dans une boucle ?', options: ['Les voix', 'La basse seulement', 'Une mélodie', 'Le pattern de batterie de base'], correctAnswer: 'Le pattern de batterie de base' },
  'Popular loop stations include the Boss RC series.': { prompt: 'Les loop stations populaires incluent la série Boss RC.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
};
