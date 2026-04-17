export const danceFr: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Rhythm Feel
  'What is rhythm in dance?': { prompt: 'Qu\'est-ce que le rythme en danse ?', options: ['La vitesse de vos mouvements', 'Bouger en accord avec le tempo de la musique', 'Un type de danse', 'Le volume de la musique'], correctAnswer: 'Bouger en accord avec le tempo de la musique' },
  'Counting beats helps you stay on rhythm.': { prompt: 'Compter les temps vous aide à rester en rythme.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Most popular music has ___ beats per measure.': { prompt: 'La plupart de la musique populaire a ___ temps par mesure.', options: ['4', '3', '5', '7'], correctAnswer: '4' },
  'Dancing without listening to the music\'s beat.': { prompt: 'Danser sans écouter le rythme de la musique.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is a "downbeat"?': { prompt: 'Qu\'est-ce qu\'un "temps fort" ?', options: ['Le dernier temps', 'Une chanson triste', 'Le premier temps accentué d\'une mesure', 'Un moment de silence'], correctAnswer: 'Le premier temps accentué d\'une mesure' },
  'Clapping along to music helps develop your sense of rhythm.': { prompt: 'Taper des mains en suivant la musique aide à développer votre sens du rythme.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Basic Steps
  'What is a "step-touch"?': { prompt: 'Qu\'est-ce qu\'un "step-touch" ?', options: ['Un saut', 'Un pas de claquettes', 'Une pirouette', 'Faire un pas sur le côté, puis amener l\'autre pied pour toucher'], correctAnswer: 'Faire un pas sur le côté, puis amener l\'autre pied pour toucher' },
  'Most dance basics can be broken into simple weight transfers.': { prompt: 'La plupart des bases de danse peuvent se décomposer en simples transferts de poids.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'A ___ is when you transfer weight from one foot to the other.': { prompt: 'Un ___ est quand vous transférez le poids d\'un pied à l\'autre.', options: ['Pas', 'Saut', 'Freeze', 'Glissé'], correctAnswer: 'Pas' },
  'Mastering basic steps before learning complex choreography.': { prompt: 'Maîtriser les pas de base avant d\'apprendre une chorégraphie complexe.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What is a "groove" in dance?': { prompt: 'Qu\'est-ce qu\'un "groove" en danse ?', options: ['Un nom de scène', 'Un type de chaussure', 'Un rebond ou balancement naturel sur la musique', 'Une fissure dans le sol'], correctAnswer: 'Un rebond ou balancement naturel sur la musique' },
  'Bouncing slightly with bent knees helps you feel the beat.': { prompt: 'Rebondir légèrement avec les genoux fléchis aide à ressentir le rythme.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Body Isolation
  'What is body isolation?': { prompt: 'Qu\'est-ce que l\'isolation corporelle ?', options: ['Danser seul', 'Rester immobile', 'Bouger une partie du corps indépendamment des autres', 'S\'étirer'], correctAnswer: 'Bouger une partie du corps indépendamment des autres' },
  'Head, chest, and hip isolations are fundamental to many dance styles.': { prompt: 'Les isolations de la tête, du torse et des hanches sont fondamentales dans de nombreux styles de danse.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  '___ isolation involves moving your ribcage side to side independently.': { prompt: 'L\'isolation du ___ consiste à bouger votre cage thoracique de gauche à droite de manière indépendante.', options: ['Torse', 'Bassin', 'Tête', 'Épaule'], correctAnswer: 'Torse' },
  'Practicing isolations slowly in front of a mirror.': { prompt: 'Pratiquer les isolations lentement devant un miroir.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'Why are isolations important in dance?': { prompt: 'Pourquoi les isolations sont-elles importantes en danse ?', options: ['Elles remplacent les étirements', 'Elles sont faciles', 'Elles ont l\'air bizarre', 'Elles développent le contrôle corporel et rendent les mouvements plus propres'], correctAnswer: 'Elles développent le contrôle corporel et rendent les mouvements plus propres' },
  'Shoulder rolls are a type of isolation exercise.': { prompt: 'Les roulements d\'épaules sont un type d\'exercice d\'isolation.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Footwork
  'What makes good footwork?': { prompt: 'Qu\'est-ce qui fait un bon jeu de pieds ?', options: ['Ne jamais bouger les pieds', 'Un placement de pieds propre et précis sur le rythme', 'Des piétinements lourds', 'Des pas aléatoires'], correctAnswer: 'Un placement de pieds propre et précis sur le rythme' },
  'Staying light on your feet helps with quick footwork.': { prompt: 'Rester léger sur ses pieds aide pour un jeu de pieds rapide.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Dancing on the ___ of your feet allows faster movement.': { prompt: 'Danser sur les ___ des pieds permet des mouvements plus rapides.', options: ['Avant-pieds', 'Talons', 'Côtés', 'Orteils seulement'], correctAnswer: 'Avant-pieds' },
  'Looking down at your feet while dancing.': { prompt: 'Regarder ses pieds en dansant.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is a "pivot"?': { prompt: 'Qu\'est-ce qu\'un "pivot" ?', options: ['Un glissé', 'Un saut', 'Tourner sur l\'avant-pied d\'un pied', 'Une chute'], correctAnswer: 'Tourner sur l\'avant-pied d\'un pied' },
  'Good footwork requires both speed and control.': { prompt: 'Un bon jeu de pieds nécessite à la fois vitesse et contrôle.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Arm Movement
  'Where do arm movements originate from?': { prompt: 'D\'où partent les mouvements de bras ?', options: ['Des coudes', 'Du tronc et des épaules', 'Des poignets seulement', 'Des doigts'], correctAnswer: 'Du tronc et des épaules' },
  'Arms should complement and enhance your body movement in dance.': { prompt: 'Les bras doivent compléter et améliorer vos mouvements de corps en danse.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Clean arm movements require ___ and intentional placement.': { prompt: 'Des mouvements de bras propres nécessitent du ___ et un placement intentionnel.', options: ['Contrôle', 'Vitesse', 'Force', 'Raideur'], correctAnswer: 'Contrôle' },
  'Letting arms hang limp and lifeless while dancing.': { prompt: 'Laisser les bras pendre mollement et sans vie en dansant.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What creates "flow" in arm movements?': { prompt: 'Qu\'est-ce qui crée le "flow" dans les mouvements de bras ?', options: ['Des transitions fluides reliant une position à la suivante', 'Agiter les bras au hasard', 'Des arrêts secs seulement', 'Garder les bras immobiles'], correctAnswer: 'Des transitions fluides reliant une position à la suivante' },
  'Finger placement and hand shapes add detail to arm movements.': { prompt: 'Le placement des doigts et les formes des mains ajoutent du détail aux mouvements de bras.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Hip-Hop Basics
  'Where did hip-hop dance originate?': { prompt: 'Où la danse hip-hop est-elle née ?', options: ['Tokyo', 'Londres', 'New York et Los Angeles', 'Paris'], correctAnswer: 'New York et Los Angeles' },
  'The "bounce" is a fundamental element of hip-hop dance.': { prompt: 'Le "bounce" est un élément fondamental de la danse hip-hop.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Hip-hop dance emphasizes ___ and musicality with the beat.': { prompt: 'La danse hip-hop met l\'accent sur le ___ et la musicalité avec le rythme.', options: ['Groove', 'Hauteur', 'Silence', 'Immobilité'], correctAnswer: 'Groove' },
  'Learning the cultural history behind hip-hop dance.': { prompt: 'Apprendre l\'histoire culturelle derrière la danse hip-hop.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What is "breaking" (breakdancing)?': { prompt: 'Qu\'est-ce que le "breaking" (breakdance) ?', options: ['Un style de hip-hop impliquant du travail au sol et des power moves', 'Une danse de couple', 'Une danse lente', 'Casser des choses'], correctAnswer: 'Un style de hip-hop impliquant du travail au sol et des power moves' },
  'Hip-hop dance includes both choreographed and freestyle elements.': { prompt: 'La danse hip-hop inclut à la fois des éléments chorégraphiés et du freestyle.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Pop & Lock
  'What is "popping"?': { prompt: 'Qu\'est-ce que le "popping" ?', options: ['Un mouvement de rotation', 'Contracter et relâcher rapidement les muscles pour créer un effet saccadé', 'Un saut', 'Éclater des ballons'], correctAnswer: 'Contracter et relâcher rapidement les muscles pour créer un effet saccadé' },
  'Locking involves freezing in a position after a quick movement.': { prompt: 'Le locking consiste à se figer dans une position après un mouvement rapide.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Popping was created by ___ Sam in Fresno, California.': { prompt: 'Le popping a été créé par ___ Sam à Fresno, Californie.', options: ['Boogaloo', 'DJ', 'MC', 'Break'], correctAnswer: 'Boogaloo' },
  'Practicing pops with each individual body part separately.': { prompt: 'Pratiquer les pops avec chaque partie du corps séparément.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What creates the "hit" in popping?': { prompt: 'Qu\'est-ce qui crée le "hit" dans le popping ?', options: ['De la musique forte', 'Une contraction musculaire sèche', 'Sauter', 'Frapper quelque chose'], correctAnswer: 'Une contraction musculaire sèche' },
  'Don Campbell is credited with creating locking.': { prompt: 'Don Campbell est reconnu comme le créateur du locking.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Wave Motion
  'What is a body wave?': { prompt: 'Qu\'est-ce qu\'une body wave ?', options: ['Un type de coiffure', 'Un mouvement fluide et séquentiel qui traverse le corps', 'Dire bonjour de la main', 'Un mouvement de saut'], correctAnswer: 'Un mouvement fluide et séquentiel qui traverse le corps' },
  'An arm wave passes movement from fingertips through the shoulders.': { prompt: 'Une arm wave fait passer le mouvement du bout des doigts jusqu\'aux épaules.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Waves require smooth ___ from one body part to the next.': { prompt: 'Les waves nécessitent un ___ fluide d\'une partie du corps à l\'autre.', options: ['Transfert', 'Saut', 'Arrêt', 'Tension'], correctAnswer: 'Transfert' },
  'Practicing waves very slowly to master the flow.': { prompt: 'Pratiquer les waves très lentement pour maîtriser le flow.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'Where does a body wave typically start?': { prompt: 'Où commence généralement une body wave ?', options: ['Les genoux', 'Les coudes', 'La tête ou le torse', 'Les pieds'], correctAnswer: 'La tête ou le torse' },
  'Isolation skills directly help improve wave movements.': { prompt: 'Les compétences en isolation aident directement à améliorer les mouvements de wave.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
};
