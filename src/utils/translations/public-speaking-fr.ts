export const publicSpeakingFr: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Confidence
  'What is the #1 way to build speaking confidence?': { prompt: 'Quelle est la meilleure façon de bâtir la confiance en prise de parole?', options: ['Parler doucement', 'La pratique et la préparation', 'Tout mémoriser', 'Éviter les audiences'], correctAnswer: 'La pratique et la préparation' },
  'Some nervousness before speaking is normal and even helpful.': { prompt: 'Un peu de nervosité avant de parler est normal et même utile.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Reframing nervousness as ___ can boost your performance.': { prompt: 'Recadrer la nervosité comme de l\' ___ peut améliorer votre performance.', options: ['Excitation', 'Peur', 'Ennui', 'Colère'], correctAnswer: 'Excitation' },
  'Avoiding public speaking because you\'re nervous.': { prompt: 'Éviter la prise de parole en public parce que vous êtes nerveux.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What does "power posing" before a speech do?': { prompt: 'Que fait la "power pose" avant un discours?', options: ['Peut vous aider à vous sentir plus confiant', 'Rien', 'Impressionne le public', 'Vous fatigue'], correctAnswer: 'Peut vous aider à vous sentir plus confiant' },
  'Confidence comes naturally — you either have it or you don\'t.': { prompt: 'La confiance vient naturellement — on l\'a ou on ne l\'a pas.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },

  // Eye Contact
  'How long should you hold eye contact with one person?': { prompt: 'Combien de temps devriez-vous maintenir le contact visuel avec une personne?', options: ['Tout le discours', '30 secondes', '3-5 secondes', '1 seconde'], correctAnswer: '3-5 secondes' },
  'Looking over the audience\'s heads is as good as eye contact.': { prompt: 'Regarder au-dessus des têtes du public est aussi efficace que le contact visuel.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },
  'The "triangle technique" involves looking at different ___ of the room.': { prompt: 'La "technique du triangle" consiste à regarder différentes ___ de la salle.', options: ['Sections', 'Murs', 'Lumières', 'Caméras'], correctAnswer: 'Sections' },
  'Staring at your notes the entire time while speaking.': { prompt: 'Fixer vos notes tout le temps pendant que vous parlez.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What does good eye contact convey?': { prompt: 'Que transmet un bon contact visuel?', options: ['De l\'agressivité', 'De la nervosité', 'De la confiance et de la connexion', 'De l\'ennui'], correctAnswer: 'De la confiance et de la connexion' },
  'You should make eye contact with people in all parts of the room.': { prompt: 'Vous devriez établir un contact visuel avec les gens dans toutes les parties de la salle.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Voice Power
  'What makes a powerful speaking voice?': { prompt: 'Qu\'est-ce qui fait une voix puissante en prise de parole?', options: ['Projection, clarté et variation', 'Chuchoter', 'Parler très vite', 'Crier'], correctAnswer: 'Projection, clarté et variation' },
  'Speaking in a monotone keeps the audience engaged.': { prompt: 'Parler d\'un ton monotone garde le public engagé.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },
  'Varying your ___ keeps listeners engaged and emphasizes key points.': { prompt: 'Varier votre ___ garde les auditeurs engagés et met en valeur les points clés.', options: ['Ton', 'Tenue', 'Diapositives', 'Siège'], correctAnswer: 'Ton' },
  'Speaking so quietly that the back row can\'t hear you.': { prompt: 'Parler si doucement que le dernier rang ne peut pas vous entendre.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is "vocal projection"?': { prompt: 'Qu\'est-ce que la "projection vocale"?', options: ['Parler clairement pour que tout le monde entende sans crier', 'Hurler', 'Chuchoter fort', 'Utiliser un mégaphone'], correctAnswer: 'Parler clairement pour que tout le monde entende sans crier' },
  'Diaphragmatic breathing helps with vocal projection.': { prompt: 'La respiration diaphragmatique aide à la projection vocale.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Body Language
  'What percentage of communication is non-verbal?': { prompt: 'Quel pourcentage de la communication est non verbale?', options: ['Plus de 50%', '30%', '10%', '5%'], correctAnswer: 'Plus de 50%' },
  'Crossed arms signal openness to the audience.': { prompt: 'Les bras croisés signalent l\'ouverture au public.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },
  'Open ___ make you appear more confident and approachable.': { prompt: 'Des ___ ouverts vous font paraître plus confiant et accessible.', options: ['Gestes', 'Livres', 'Courriels', 'Notes'], correctAnswer: 'Gestes' },
  'Standing still with hands in pockets during a presentation.': { prompt: 'Rester immobile avec les mains dans les poches pendant une présentation.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is purposeful movement on stage?': { prompt: 'Qu\'est-ce que le mouvement intentionnel sur scène?', options: ['Faire les cent pas nerveusement', 'Rester parfaitement immobile', 'Se déplacer intentionnellement pour engager différentes parties du public', 'Courir partout'], correctAnswer: 'Se déplacer intentionnellement pour engager différentes parties du public' },
  'Smiling makes you appear more likable and trustworthy.': { prompt: 'Sourire vous rend plus sympathique et digne de confiance.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Storytelling
  'Why are stories effective in speeches?': { prompt: 'Pourquoi les histoires sont-elles efficaces dans les discours?', options: ['Elles créent une connexion émotionnelle et sont mémorables', 'Elles perdent du temps', 'Elles confondent les gens', 'Elles remplacent les faits'], correctAnswer: 'Elles créent une connexion émotionnelle et sont mémorables' },
  'Personal stories are more engaging than abstract facts alone.': { prompt: 'Les histoires personnelles sont plus engageantes que les faits abstraits seuls.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Every good story has a beginning, ___, and end.': { prompt: 'Toute bonne histoire a un début, un ___ et une fin.', options: ['Milieu', 'Pause', 'Blague', 'Diapositive'], correctAnswer: 'Milieu' },
  'Adding specific sensory details to make stories vivid.': { prompt: 'Ajouter des détails sensoriels spécifiques pour rendre les histoires vivantes.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'What makes a story relatable?': { prompt: 'Qu\'est-ce qui rend une histoire accessible?', options: ['Des émotions et expériences universelles', 'Être très longue', 'Utiliser des grands mots', 'Du jargon complexe'], correctAnswer: 'Des émotions et expériences universelles' },
  'Vulnerability in stories builds trust with the audience.': { prompt: 'La vulnérabilité dans les histoires bâtit la confiance avec le public.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Opening Hooks
  'What is an "opening hook"?': { prompt: 'Qu\'est-ce qu\'une "accroche d\'ouverture"?', options: ['Votre présentation de nom', 'Un début captivant qui attire l\'attention', 'Le titre de votre discours', 'Une référence à la pêche'], correctAnswer: 'Un début captivant qui attire l\'attention' },
  'Starting with "Today I\'m going to talk about..." is a strong hook.': { prompt: 'Commencer par "Aujourd\'hui je vais vous parler de..." est une bonne accroche.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },
  'A surprising ___ can be a powerful opening hook.': { prompt: 'Une ___ surprenante peut être une accroche d\'ouverture puissante.', options: ['Statistique', 'Toux', 'Chuchotement', 'Pause'], correctAnswer: 'Statistique' },
  'Opening a speech with an apology for being nervous.': { prompt: 'Ouvrir un discours avec des excuses pour être nerveux.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'Which is the strongest opening?': { prompt: 'Quelle est l\'ouverture la plus forte?', options: ['Une question puissante qui fait réfléchir', 'Euh, alors, bonjour à tous...', 'Lire l\'ordre du jour', 'Lister vos diplômes'], correctAnswer: 'Une question puissante qui fait réfléchir' },
  'Which speech opening is better?': { prompt: 'Quelle ouverture de discours est meilleure?', options: ['Alors, euh, aujourd\'hui je veux parler du changement climatique...', 'Et si je vous disais que les 8 dernières années ont été les plus chaudes jamais enregistrées?'], correctAnswer: 'Et si je vous disais que les 8 dernières années ont été les plus chaudes jamais enregistrées?' },

  // Structure
  'What is the basic structure of a speech?': { prompt: 'Quelle est la structure de base d\'un discours?', options: ['Juste le corps', 'Introduction, corps, conclusion', 'Des points aléatoires', 'Début et fin'], correctAnswer: 'Introduction, corps, conclusion' },
  'Having 3 main points is a classic and effective structure.': { prompt: 'Avoir 3 points principaux est une structure classique et efficace.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'A clear ___ statement tells the audience what your speech is about.': { prompt: 'Un énoncé de ___ clair dit au public de quoi parle votre discours.', options: ['Thèse', 'Hasard', 'Final', 'Ouverture'], correctAnswer: 'Thèse' },
  'Jumping between topics without transitions.': { prompt: 'Sauter entre les sujets sans transitions.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What should the conclusion do?': { prompt: 'Que devrait faire la conclusion?', options: ['Résumer les points clés et terminer avec un appel à l\'action', 'Juste arrêter de parler', 'Introduire de nouveaux sujets', 'S\'excuser pour la durée'], correctAnswer: 'Résumer les points clés et terminer avec un appel à l\'action' },
  'Transitions between sections help the audience follow your speech.': { prompt: 'Les transitions entre les sections aident le public à suivre votre discours.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Pausing
  'What is the power of a pause in speaking?': { prompt: 'Quel est le pouvoir d\'une pause dans la prise de parole?', options: ['Ça perd du temps', 'Ça montre que vous avez oublié', 'Ça ennuie le public', 'Ça crée de l\'emphase et laisse les idées se déposer'], correctAnswer: 'Ça crée de l\'emphase et laisse les idées se déposer' },
  'Filler words like "um" and "uh" are better than pausing.': { prompt: 'Les mots de remplissage comme "euh" et "hum" sont mieux que de faire une pause.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },
  'Pausing before a key point builds ___ and anticipation.': { prompt: 'Faire une pause avant un point clé crée du ___ et de l\'anticipation.', options: ['Suspense', 'Ennui', 'Confusion', 'Colère'], correctAnswer: 'Suspense' },
  'Replacing "um" and "uh" with a confident silence.': { prompt: 'Remplacer les "euh" et "hum" par un silence confiant.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'When should you pause during a speech?': { prompt: 'Quand devriez-vous faire une pause pendant un discours?', options: ['Jamais', 'Seulement à la fin', 'Après les points importants et avant les transitions', 'À chaque autre mot'], correctAnswer: 'Après les points importants et avant les transitions' },
  'A 2-3 second pause feels longer to the speaker than the audience.': { prompt: 'Une pause de 2-3 secondes semble plus longue pour l\'orateur que pour le public.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
};
