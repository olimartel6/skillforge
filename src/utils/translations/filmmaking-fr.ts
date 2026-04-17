export const filmmakingFr: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Shot Composition
  'What is a "close-up" shot?': { prompt: 'Qu\'est-ce qu\'un plan "gros plan" ?', options: ['Un plan serré montrant un visage ou un détail', 'Un plan de loin', 'Un plan d\'en haut', 'Un plan de toute la scène'], correctAnswer: 'Un plan serré montrant un visage ou un détail' },
  'The rule of thirds applies to filmmaking as well as photography.': { prompt: 'La règle des tiers s\'applique au cinéma autant qu\'à la photographie.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'A ___ shot shows the entire scene and establishes the location.': { prompt: 'Un plan ___ montre toute la scène et établit le lieu.', options: ['Large/d\'ensemble', 'Gros plan', 'Moyen', 'Insert'], correctAnswer: 'Large/d\'ensemble' },
  'What is "headroom" in shot composition?': { prompt: 'Qu\'est-ce que le "headroom" en composition de plan ?', options: ['La taille de la pièce', 'Une technique d\'éclairage', 'L\'espace entre le haut de la tête et le bord du cadre', 'Un type de microphone'], correctAnswer: 'L\'espace entre le haut de la tête et le bord du cadre' },
  'Cutting off the top of someone\'s head in a medium shot.': { prompt: 'Couper le haut de la tête de quelqu\'un dans un plan moyen.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'A medium shot typically shows a person from the waist up.': { prompt: 'Un plan moyen montre généralement une personne de la taille vers le haut.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Camera Movement
  'What is a "pan"?': { prompt: 'Qu\'est-ce qu\'un "panoramique" ?', options: ['Un ustensile de cuisine', 'Déplacer la caméra vers l\'avant', 'Faire pivoter la caméra horizontalement sur un point fixe', 'Zoomer'], correctAnswer: 'Faire pivoter la caméra horizontalement sur un point fixe' },
  'A "tilt" moves the camera up or down on a fixed point.': { prompt: 'Un "tilt" déplace la caméra vers le haut ou le bas sur un point fixe.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'A ___ shot moves the entire camera alongside the subject.': { prompt: 'Un plan ___ déplace toute la caméra le long du sujet.', options: ['Travelling', 'Statique', 'Zoom', 'Panoramique'], correctAnswer: 'Travelling' },
  'What is a "dolly" in filmmaking?': { prompt: 'Qu\'est-ce qu\'un "dolly" en cinéma ?', options: ['Un type d\'objectif', 'Un jouet', 'Un outil d\'éclairage', 'Une plateforme à roues pour des mouvements de caméra fluides'], correctAnswer: 'Une plateforme à roues pour des mouvements de caméra fluides' },
  'Using a gimbal or stabilizer for smooth handheld shots.': { prompt: 'Utiliser un gimbal ou un stabilisateur pour des plans à main fluides.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'Every camera movement should serve a storytelling purpose.': { prompt: 'Chaque mouvement de caméra devrait servir un objectif narratif.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Directing Actors
  'What is the most important skill for directing actors?': { prompt: 'Quelle est la compétence la plus importante pour diriger des acteurs ?', options: ['Une communication claire et la création d\'un environnement sécurisant', 'Des connaissances techniques en caméra', 'Avoir une voix forte', 'Crier'], correctAnswer: 'Une communication claire et la création d\'un environnement sécurisant' },
  'Giving actors result-oriented direction ("be sadder") is most effective.': { prompt: 'Donner aux acteurs des indications orientées résultat ("sois plus triste") est plus efficace.', options: ['Vrai', 'Faux'], correctAnswer: 'Faux' },
  'Give actors ___ to play rather than emotions to display.': { prompt: 'Donnez aux acteurs des ___ à jouer plutôt que des émotions à afficher.', options: ['Actions/objectifs', 'Émotions', 'Répliques', 'Directions'], correctAnswer: 'Actions/objectifs' },
  'Giving direction in front of the entire crew, embarrassing the actor.': { prompt: 'Donner des indications devant toute l\'équipe, gênant l\'acteur.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What should a director do before shooting a scene?': { prompt: 'Que devrait faire un réalisateur avant de tourner une scène ?', options: ['Lire le scénario pour la première fois', 'Juste commencer à filmer', 'Discuter de l\'intention de la scène et du blocking avec les acteurs', 'Vérifier uniquement la caméra'], correctAnswer: 'Discuter de l\'intention de la scène et du blocking avec les acteurs' },
  '"Blocking" refers to planning where actors move in a scene.': { prompt: 'Le "blocking" fait référence à la planification des déplacements des acteurs dans une scène.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Lighting Scenes
  'What is three-point lighting?': { prompt: 'Qu\'est-ce que l\'éclairage trois points ?', options: ['Éclairer depuis 3 pièces différentes', 'Utiliser 3 bougies', 'Lumière principale, lumière d\'appoint et contre-jour', 'Trois projecteurs au plafond'], correctAnswer: 'Lumière principale, lumière d\'appoint et contre-jour' },
  'The key light is the main, brightest light source.': { prompt: 'La lumière principale (key light) est la source de lumière la plus brillante.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The ___ light fills in shadows created by the key light.': { prompt: 'La lumière ___ comble les ombres créées par la lumière principale.', options: ['D\'appoint', 'Arrière', 'Spot', 'Flash'], correctAnswer: 'D\'appoint' },
  'What does a backlight do?': { prompt: 'Que fait un contre-jour ?', options: ['Éclaire l\'arrière-plan', 'Crée des ombres', 'Sépare le sujet de l\'arrière-plan avec un liseré de lumière', 'Éteint les lumières'], correctAnswer: 'Sépare le sujet de l\'arrière-plan avec un liseré de lumière' },
  'Shooting an interview with harsh overhead fluorescent lighting only.': { prompt: 'Tourner une entrevue avec seulement un éclairage fluorescent dur au plafond.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'Lighting sets the mood and emotion of a scene.': { prompt: 'L\'éclairage définit l\'ambiance et l\'émotion d\'une scène.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Sound Recording
  'What is the most important element of film audio?': { prompt: 'Quel est l\'élément le plus important de l\'audio d\'un film ?', options: ['L\'enregistrement clair des dialogues', 'La musique de fond', 'Le silence', 'Les effets sonores'], correctAnswer: 'L\'enregistrement clair des dialogues' },
  'Bad audio can ruin a film more than bad video.': { prompt: 'Un mauvais son peut ruiner un film plus qu\'une mauvaise image.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'A ___ microphone (shotgun mic) is commonly used in film production.': { prompt: 'Un microphone ___ (micro canon) est couramment utilisé en production cinématographique.', options: ['Perche', 'Bureau', 'Webcam', 'Bluetooth'], correctAnswer: 'Perche' },
  'Relying only on the camera\'s built-in microphone.': { prompt: 'Se fier uniquement au microphone intégré de la caméra.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is a lavalier microphone?': { prompt: 'Qu\'est-ce qu\'un microphone cravate (lavalier) ?', options: ['Un haut-parleur sans fil', 'Un gros micro de studio', 'Un petit microphone à clip porté par l\'intervenant', 'Un microphone sur une perche'], correctAnswer: 'Un petit microphone à clip porté par l\'intervenant' },
  'Recording room tone (ambient silence) is important for editing.': { prompt: 'Enregistrer l\'ambiance de la pièce (silence ambiant) est important pour le montage.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Editing
  'What is the most common type of edit/cut?': { prompt: 'Quel est le type de coupe/montage le plus courant ?', options: ['Une coupe franche (cut sec)', 'Volet', 'Jump cut', 'Fondu au noir'], correctAnswer: 'Une coupe franche (cut sec)' },
  'A "jump cut" removes a section of time within the same shot.': { prompt: 'Un "jump cut" supprime une section de temps au sein du même plan.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The ___ cut transitions between two scenes by fading one out and the other in.': { prompt: 'La coupe ___ fait la transition entre deux scènes en fondant l\'une et en enchaînant l\'autre.', options: ['Fondu enchaîné', 'Jump', 'Franche', 'Sèche'], correctAnswer: 'Fondu enchaîné' },
  'What is an "L-cut"?': { prompt: 'Qu\'est-ce qu\'un "L-cut" ?', options: ['Une coupe en forme de L', 'L\'audio de la scène suivante commence avant que l\'image ne change', 'Couper la lettre L', 'Un type d\'effet de transition'], correctAnswer: 'L\'audio de la scène suivante commence avant que l\'image ne change' },
  'Cutting on action (during movement) for seamless transitions.': { prompt: 'Couper sur l\'action (pendant le mouvement) pour des transitions fluides.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'Pacing in editing affects the mood and energy of the film.': { prompt: 'Le rythme du montage affecte l\'ambiance et l\'énergie du film.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Color Grading
  'What is color grading?': { prompt: 'Qu\'est-ce que l\'étalonnage des couleurs ?', options: ['Ajuster les couleurs et les tons en post-production pour l\'ambiance', 'Peindre le décor', 'Un type de caméra', 'Choisir des couleurs de peinture'], correctAnswer: 'Ajuster les couleurs et les tons en post-production pour l\'ambiance' },
  'Color grading can dramatically change the mood of a scene.': { prompt: 'L\'étalonnage des couleurs peut changer radicalement l\'ambiance d\'une scène.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'Cool (blue) tones often convey ___ or sadness.': { prompt: 'Les tons froids (bleus) transmettent souvent le ___ ou la tristesse.', options: ['Froid', 'Chaleur', 'Bonheur', 'Excitation'], correctAnswer: 'Froid' },
  'What is the difference between color correction and color grading?': { prompt: 'Quelle est la différence entre la correction colorimétrique et l\'étalonnage ?', options: ['L\'étalonnage se fait en premier', 'La correction est créative', 'C\'est la même chose', 'La correction règle les problèmes, l\'étalonnage crée un look créatif'], correctAnswer: 'La correction règle les problèmes, l\'étalonnage crée un look créatif' },
  'Shooting in a flat/log profile for more grading flexibility.': { prompt: 'Tourner en profil plat/log pour plus de flexibilité d\'étalonnage.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Bonne pratique' },
  'Warm tones (orange/yellow) often feel inviting or nostalgic.': { prompt: 'Les tons chauds (orange/jaune) donnent souvent une sensation accueillante ou nostalgique.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },

  // Storytelling
  'What is the basic story structure in film?': { prompt: 'Quelle est la structure narrative de base au cinéma ?', options: ['Aucune structure nécessaire', 'Cinq scènes aléatoires', 'Trois actes : exposition, confrontation, résolution', 'Seulement le début'], correctAnswer: 'Trois actes : exposition, confrontation, résolution' },
  '"Show, don\'t tell" is a key principle of visual storytelling.': { prompt: '"Montrer, ne pas raconter" est un principe clé de la narration visuelle.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
  'The ___ is the main character\'s central problem or challenge.': { prompt: 'Le ___ est le problème ou défi central du personnage principal.', options: ['Conflit', 'Décor', 'Titre', 'Genre'], correctAnswer: 'Conflit' },
  'Having characters explain everything through dialogue instead of showing it.': { prompt: 'Faire expliquer tout par les personnages à travers le dialogue au lieu de le montrer.', options: ['Bonne pratique', 'Mauvaise pratique'], correctAnswer: 'Mauvaise pratique' },
  'What is a "character arc"?': { prompt: 'Qu\'est-ce qu\'un "arc de personnage" ?', options: ['Une technique d\'éclairage', 'Un décor', 'Comment un personnage évolue tout au long de l\'histoire', 'Un mouvement de caméra courbe'], correctAnswer: 'Comment un personnage évolue tout au long de l\'histoire' },
  'Every scene should move the story forward in some way.': { prompt: 'Chaque scène devrait faire avancer l\'histoire d\'une manière ou d\'une autre.', options: ['Vrai', 'Faux'], correctAnswer: 'Vrai' },
};
