export const podcastingFr: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Podcast Concept
  'What makes a good podcast concept?': { prompt: 'Qu\'est-ce qui fait un bon concept de podcast?', options: ['Aucune planification nécessaire', 'Copier exactement un autre podcast', 'Un sujet clair qui sert un public spécifique', 'Couvrir tout'], correctAnswer: 'Un sujet clair qui sert un public spécifique' },
  'A podcast should have a clearly defined target audience.': { prompt: 'Un podcast devrait avoir un public cible clairement défini.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Your podcast ___ statement describes what your show is about and for whom.': { prompt: 'Votre énoncé de ___ de podcast décrit de quoi parle votre émission et pour qui.', options: ['Mission', 'Revenu', 'Légal', 'Technique'], correctAnswer: 'Mission' },
  'Starting a podcast without knowing your target audience.': { prompt: 'Lancer un podcast sans connaître son public cible.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What should you research before launching?': { prompt: 'Que devriez-vous rechercher avant de lancer?', options: ['Seulement l\'équipement', 'Des podcasts similaires dans votre niche', 'Seulement la musique', 'Rien'], correctAnswer: 'Des podcasts similaires dans votre niche' },
  'A unique angle helps your podcast stand out in a crowded market.': { prompt: 'Un angle unique aide votre podcast à se démarquer dans un marché saturé.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Format Choice
  'What is a common podcast format?': { prompt: 'Quel est un format de podcast courant?', options: ['Texte seulement', 'Solo, interview ou co-animé', 'Musique seulement', 'Méditation silencieuse'], correctAnswer: 'Solo, interview ou co-animé' },
  'Interview-format podcasts help bring in different perspectives.': { prompt: 'Les podcasts au format interview aident à apporter différentes perspectives.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'A ___ podcast features two or more regular hosts discussing topics.': { prompt: 'Un podcast ___ présente deux animateurs réguliers ou plus qui discutent de sujets.', options: ['Co-animé', 'Solo', 'Silencieux', 'Musical'], correctAnswer: 'Co-animé' },
  'Choosing a format that matches your strengths and topic.': { prompt: 'Choisir un format qui correspond à vos forces et à votre sujet.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What is a "narrative" podcast?': { prompt: 'Qu\'est-ce qu\'un podcast "narratif"?', options: ['Une émission en direct avec appels', 'Un podcast basé sur une histoire avec de l\'audio produit', 'Un podcast musical', 'Une discussion non scriptée'], correctAnswer: 'Un podcast basé sur une histoire avec de l\'audio produit' },
  'Episode length should match your content — not all podcasts need to be long.': { prompt: 'La durée des épisodes devrait correspondre à votre contenu — tous les podcasts n\'ont pas besoin d\'être longs.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Your Niche
  'What is a podcast niche?': { prompt: 'Qu\'est-ce qu\'une niche de podcast?', options: ['Un type de microphone', 'Un domaine de sujet spécifique sur lequel vous vous concentrez', 'Une plateforme d\'hébergement', 'Une technique d\'enregistrement'], correctAnswer: 'Un domaine de sujet spécifique sur lequel vous vous concentrez' },
  'A more specific niche often attracts a more loyal audience.': { prompt: 'Une niche plus spécifique attire souvent un public plus fidèle.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Your niche should be at the intersection of your ___ and audience demand.': { prompt: 'Votre niche devrait être à l\'intersection de votre ___ et de la demande du public.', options: ['Passion', 'Budget', 'Emplacement', 'Équipement'], correctAnswer: 'Passion' },
  'Trying to appeal to absolutely everyone with your podcast.': { prompt: 'Essayer de plaire à absolument tout le monde avec votre podcast.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'How do you validate your podcast niche?': { prompt: 'Comment validez-vous votre niche de podcast?', options: ['Copier le meilleur podcast', 'Vérifier si les gens recherchent et discutent du sujet', 'Demander à un ami', 'Ne pas valider, juste commencer'], correctAnswer: 'Vérifier si les gens recherchent et discutent du sujet' },
  'Competition in your niche proves there\'s an audience for it.': { prompt: 'La compétition dans votre niche prouve qu\'il y a un public pour ça.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Mic Setup
  'What type of microphone is best for beginners?': { prompt: 'Quel type de microphone est le meilleur pour les débutants?', options: ['Microphone à condensateur USB', 'Micro intégré du laptop', 'Écouteurs Bluetooth', 'Haut-parleur'], correctAnswer: 'Microphone à condensateur USB' },
  'A pop filter helps reduce plosive sounds (p\'s and b\'s).': { prompt: 'Un filtre anti-pop aide à réduire les sons plosifs (les p et les b).', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Speak about 4-6 ___ from the microphone for best audio.': { prompt: 'Parlez à environ 10-15 ___ du microphone pour un meilleur son.', options: ['Centimètres', 'Pieds', 'Mètres', 'Yards'], correctAnswer: 'Centimètres' },
  'Using your laptop\'s built-in microphone for your podcast.': { prompt: 'Utiliser le microphone intégré de votre laptop pour votre podcast.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is a dynamic microphone good at?': { prompt: 'En quoi un microphone dynamique excelle-t-il?', options: ['Connexion sans fil', 'Enregistrer uniquement de la musique', 'Capter tout', 'Rejeter le bruit de fond'], correctAnswer: 'Rejeter le bruit de fond' },
  'XLR microphones need an audio interface to connect to a computer.': { prompt: 'Les microphones XLR nécessitent une interface audio pour se connecter à un ordinateur.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Recording Space
  'What is the biggest enemy of good podcast audio?': { prompt: 'Quel est le plus grand ennemi d\'un bon son de podcast?', options: ['Le silence', 'L\'écho et le bruit de fond', 'Les pièces calmes', 'Les surfaces molles'], correctAnswer: 'L\'écho et le bruit de fond' },
  'A closet full of clothes can be a great recording space.': { prompt: 'Un placard plein de vêtements peut être un excellent espace d\'enregistrement.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Soft surfaces like curtains and carpets help ___ sound reflections.': { prompt: 'Les surfaces molles comme les rideaux et les tapis aident à ___ les réflexions sonores.', options: ['Absorber', 'Amplifier', 'Créer', 'Augmenter'], correctAnswer: 'Absorber' },
  'Recording in a tiled bathroom for its natural reverb.': { prompt: 'Enregistrer dans une salle de bain carrelée pour sa réverbération naturelle.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is acoustic treatment?': { prompt: 'Qu\'est-ce que le traitement acoustique?', options: ['Rendre les pièces plus bruyantes', 'Insonorisation seulement', 'Jouer de la musique', 'Ajouter des matériaux pour réduire l\'écho et améliorer le son'], correctAnswer: 'Ajouter des matériaux pour réduire l\'écho et améliorer le son' },
  'Recording away from windows reduces outside noise interference.': { prompt: 'Enregistrer loin des fenêtres réduit les interférences de bruit extérieur.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Software
  'Which is a free podcast recording/editing software?': { prompt: 'Quel est un logiciel gratuit d\'enregistrement/montage de podcast?', options: ['Audacity', 'Photoshop', 'Excel', 'Final Cut Pro'], correctAnswer: 'Audacity' },
  'GarageBand is a free option for Mac users to edit podcasts.': { prompt: 'GarageBand est une option gratuite pour les utilisateurs Mac pour monter des podcasts.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Export your podcast audio as ___ format for most hosting platforms.': { prompt: 'Exportez l\'audio de votre podcast au format ___ pour la plupart des plateformes d\'hébergement.', options: ['MP3', 'WAV', 'FLAC', 'MIDI'], correctAnswer: 'MP3' },
  'Learning basic audio editing before publishing episodes.': { prompt: 'Apprendre le montage audio de base avant de publier des épisodes.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What does "noise reduction" do in audio editing?': { prompt: 'Que fait la "réduction de bruit" dans le montage audio?', options: ['Supprime le souffle et le bourdonnement de fond', 'Ajoute de la musique', 'Rend l\'audio plus fort', 'Change votre voix'], correctAnswer: 'Supprime le souffle et le bourdonnement de fond' },
  'You need expensive software to start a podcast.': { prompt: 'Vous avez besoin d\'un logiciel coûteux pour démarrer un podcast.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },

  // Voice Training
  'How can you improve your podcast voice?': { prompt: 'Comment pouvez-vous améliorer votre voix de podcast?', options: ['Crier dans le micro', 'Pratiquer la projection, le rythme et la chaleur', 'Utiliser l\'auto-tune', 'Chuchoter tout'], correctAnswer: 'Pratiquer la projection, le rythme et la chaleur' },
  'Speaking at a varied pace keeps listeners engaged.': { prompt: 'Parler à un rythme varié garde les auditeurs engagés.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Drinking ___ helps keep your vocal cords hydrated during recording.': { prompt: 'Boire de l\' ___ aide à garder vos cordes vocales hydratées pendant l\'enregistrement.', options: ['Eau', 'Café', 'Soda', 'Lait'], correctAnswer: 'Eau' },
  'Speaking in a monotone voice throughout your podcast.': { prompt: 'Parler d\'une voix monotone tout au long de votre podcast.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is "vocal fry"?': { prompt: 'Qu\'est-ce que le "vocal fry"?', options: ['Une qualité vocale basse et craquante souvent utilisée en fin de phrase', 'Une technique de chant', 'Un effet de microphone', 'Faire frire de la nourriture'], correctAnswer: 'Une qualité vocale basse et craquante souvent utilisée en fin de phrase' },
  'Smiling while speaking can make your voice sound warmer.': { prompt: 'Sourire en parlant peut rendre votre voix plus chaleureuse.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Interview Skills
  'What is the key to a great podcast interview?': { prompt: 'Quelle est la clé d\'une excellente interview de podcast?', options: ['Lire les questions d\'un script uniquement', 'Parler plus que l\'invité', 'Interrompre souvent', 'Poser des questions ouvertes et écouter activement'], correctAnswer: 'Poser des questions ouvertes et écouter activement' },
  'Researching your guest beforehand improves interview quality.': { prompt: 'Faire des recherches sur votre invité au préalable améliore la qualité de l\'interview.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Open-ended questions start with words like "how," "why," and "___".': { prompt: 'Les questions ouvertes commencent par des mots comme "comment", "pourquoi" et "___".', options: ['Quoi', 'Est-ce', 'Fais', 'Peux'], correctAnswer: 'Quoi' },
  'Asking only yes/no questions during an interview.': { prompt: 'Poser uniquement des questions oui/non pendant une interview.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What should you do when a guest gives an interesting answer?': { prompt: 'Que devriez-vous faire quand un invité donne une réponse intéressante?', options: ['Passer immédiatement à la question suivante', 'Relancer et creuser plus profondément', 'Changer de sujet', 'Contredire'], correctAnswer: 'Relancer et creuser plus profondément' },
  'Active listening means fully concentrating on what the guest is saying.': { prompt: 'L\'écoute active signifie se concentrer pleinement sur ce que dit l\'invité.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
};
