export const tradingFr: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Market Basics
  'What is a stock?': { prompt: "Qu'est-ce qu'une action?", options: ["Un type d'obligation", "Une part de propriété dans une entreprise", "Un prêt gouvernemental", "Un compte d'épargne"], correctAnswer: "Une part de propriété dans une entreprise" },
  'The stock market is open 24/7.': { prompt: "Le marché boursier est ouvert 24h/24, 7j/7.", options: ["Vrai", "Faux"], correctAnswer: "Faux" },
  'What does NYSE stand for?': { prompt: "Que signifie NYSE?", options: ["New York Stock Exchange", "National Yield Stock Entity", "New Yield Securities Exchange", "North York Stock Exchange"], correctAnswer: "New York Stock Exchange" },
  'Buying low and selling high is the basic goal of ___.': { prompt: "Acheter bas et vendre haut est l'objectif de base du ___.", options: ["Trading", "Bancaire", "Prêt", "Épargne"], correctAnswer: "Trading" },
  "Investing money you can't afford to lose.": { prompt: "Investir de l'argent que vous ne pouvez pas vous permettre de perdre.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'What is a broker?': { prompt: "Qu'est-ce qu'un courtier?", options: ["Une action cassée", "Un intermédiaire qui exécute des transactions", "Un type d'obligation", "Un régulateur de marché"], correctAnswer: "Un intermédiaire qui exécute des transactions" },
  'A dividend is a payment companies make to shareholders.': { prompt: "Un dividende est un paiement que les entreprises versent aux actionnaires.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },

  // Bull vs Bear
  'What is a bull market?': { prompt: "Qu'est-ce qu'un marché haussier (bull market)?", options: ["Les prix baissent", "Les prix montent", "Le marché est fermé", "Le marché est stable"], correctAnswer: "Les prix montent" },
  'A bear market means prices are going up.': { prompt: "Un marché baissier (bear market) signifie que les prix montent.", options: ["Vrai", "Faux"], correctAnswer: "Faux" },
  'A ___ market is defined by a 20%+ decline from recent highs.': { prompt: "Un marché ___ est défini par une baisse de 20%+ par rapport aux récents sommets.", options: ["Baissier", "Haussier", "Stable", "Mort"], correctAnswer: "Baissier" },
  'Panic selling when the market drops 5%.': { prompt: "Vendre en panique quand le marché baisse de 5%.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'What does "bearish" mean?': { prompt: 'Que signifie "bearish"?', options: ["S'attendre à une hausse des prix", "S'attendre à une baisse des prix", "Perspective neutre", "Vouloir acheter"], correctAnswer: "S'attendre à une baisse des prix" },
  'Bear markets typically last longer than bull markets.': { prompt: "Les marchés haussiers durent généralement plus longtemps que les marchés baissiers.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'Which trading mindset is better?': { prompt: "Quel état d'esprit de trading est meilleur?", options: ["Le marché s'effondre! Tout vendre maintenant!", "Le marché est en baisse — laissez-moi revoir ma stratégie et mes fondamentaux."], correctAnswer: "Le marché est en baisse — laissez-moi revoir ma stratégie et mes fondamentaux." },

  // Chart Reading
  'What does the X-axis usually show on a stock chart?': { prompt: "Que montre généralement l'axe X sur un graphique boursier?", options: ["Prix", "Volume", "Temps", "Profit"], correctAnswer: "Temps" },
  'A line chart connects closing prices over time.': { prompt: "Un graphique en ligne relie les prix de clôture dans le temps.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'What does the Y-axis show on a price chart?': { prompt: "Que montre l'axe Y sur un graphique de prix?", options: ["Temps", "Prix", "Volume", "Nouvelles"], correctAnswer: "Prix" },
  'A ___ chart uses colored bars to show open, high, low, close.': { prompt: "Un graphique en ___ utilise des barres colorées pour montrer l'ouverture, le haut, le bas et la clôture.", options: ["Chandeliers", "Camembert", "Nuage de points", "Points"], correctAnswer: "Chandeliers" },
  'Making decisions based on a single chart timeframe.': { prompt: "Prendre des décisions basées sur une seule unité de temps.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'What timeframe is best for day trading charts?': { prompt: "Quelle unité de temps est la meilleure pour le day trading?", options: ["Mensuel", "Hebdomadaire", "1 minute à 15 minutes", "Annuel"], correctAnswer: "1 minute à 15 minutes" },
  'Volume bars appear above the price chart typically.': { prompt: "Les barres de volume apparaissent généralement sous le graphique des prix.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },

  // Candlesticks
  'What does a green/white candle mean?': { prompt: "Que signifie une bougie verte/blanche?", options: ["Le prix a baissé", "Le prix a monté", "Le marché est fermé", "Aucune transaction"], correctAnswer: "Le prix a monté" },
  'A red/black candle means the price closed higher than it opened.': { prompt: "Une bougie rouge/noire signifie que le prix a clôturé plus bas qu'à l'ouverture.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'The thin lines above and below a candle are called ___.': { prompt: "Les fines lignes au-dessus et en dessous d'une bougie s'appellent des ___.", options: ["Mèches", "Tiges", "Lignes", "Barres"], correctAnswer: "Mèches" },
  'What is a "doji" candle?': { prompt: 'Qu\'est-ce qu\'une bougie "doji"?', options: ["Une très grande bougie", "Une bougie où l'ouverture et la clôture sont presque égales", "Une bougie sans mèche", "Une bougie de fête"], correctAnswer: "Une bougie où l'ouverture et la clôture sont presque égales" },
  'Using a single candlestick to predict the entire market.': { prompt: "Utiliser une seule bougie pour prédire l'ensemble du marché.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'What does a long lower wick suggest?': { prompt: "Que suggère une longue mèche inférieure?", options: ["Forte vente", "Les acheteurs ont repoussé le prix vers le haut", "Le marché est fermé", "Aucun intérêt"], correctAnswer: "Les acheteurs ont repoussé le prix vers le haut" },
  'A "hammer" candle has a small body and long lower wick.': { prompt: 'Une bougie "marteau" a un petit corps et une longue mèche inférieure.', options: ["Vrai", "Faux"], correctAnswer: "Vrai" },

  // Support & Resistance
  'What is a support level?': { prompt: "Qu'est-ce qu'un niveau de support?", options: ["Là où le prix tend à arrêter de baisser", "Là où le prix monte toujours", "Le prix le plus élevé jamais atteint", "Un plancher de prix gouvernemental"], correctAnswer: "Là où le prix tend à arrêter de baisser" },
  'Resistance is a price level where selling pressure tends to emerge.': { prompt: "La résistance est un niveau de prix où la pression vendeuse tend à apparaître.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'When price breaks through resistance, it often becomes new ___.': { prompt: "Quand le prix franchit la résistance, elle devient souvent un nouveau ___.", options: ["Support", "Résistance", "Volume", "Tendance"], correctAnswer: "Support" },
  'How do you identify support levels?': { prompt: "Comment identifier les niveaux de support?", options: ["Au hasard", "Chercher les rebonds du prix au même niveau plusieurs fois", "Demander à un ami", "Vérifier les nouvelles"], correctAnswer: "Chercher les rebonds du prix au même niveau plusieurs fois" },
  'Buying right at resistance without confirmation.': { prompt: "Acheter directement à la résistance sans confirmation.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'Support and resistance levels are exact prices, never zones.': { prompt: "Les niveaux de support et résistance sont des prix exacts, jamais des zones.", options: ["Vrai", "Faux"], correctAnswer: "Faux" },
  'Which approach to support/resistance is better?': { prompt: "Quelle approche du support/résistance est meilleure?", options: ["Le support est exactement à 50,00$, j'achète à ce centime.", "La zone de support est autour de 49,50$-50,50$, je vais attendre une confirmation."], correctAnswer: "La zone de support est autour de 49,50$-50,50$, je vais attendre une confirmation." },

  // Volume Analysis
  'What does volume measure?': { prompt: "Que mesure le volume?", options: ["Le changement de prix", "Le nombre d'actions échangées", "Le profit de l'entreprise", "Les heures de marché"], correctAnswer: "Le nombre d'actions échangées" },
  "High volume confirms a price move's strength.": { prompt: "Un volume élevé confirme la force d'un mouvement de prix.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'A price rise on low volume may indicate a ___ move.': { prompt: "Une hausse de prix avec un faible volume peut indiquer un mouvement ___.", options: ["Faible", "Fort", "Rapide", "Permanent"], correctAnswer: "Faible" },
  'Ignoring volume when analyzing a breakout.': { prompt: "Ignorer le volume lors de l'analyse d'une cassure.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'What does a volume spike usually indicate?': { prompt: "Que signifie généralement un pic de volume?", options: ["Rien d'important", "Un intérêt accru ou un événement significatif", "Le marché ferme", "Un bug"], correctAnswer: "Un intérêt accru ou un événement significatif" },
  "Average volume helps compare today's activity to normal levels.": { prompt: "Le volume moyen aide à comparer l'activité du jour aux niveaux normaux.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },

  // Moving Averages
  'What is a moving average?': { prompt: "Qu'est-ce qu'une moyenne mobile?", options: ["Le prix le plus élevé", "Le prix moyen sur une période donnée", "Le prix prédit de demain", "Le prix d'ouverture"], correctAnswer: "Le prix moyen sur une période donnée" },
  'The 200-day moving average is commonly used for intraday trading.': { prompt: "La moyenne mobile à 200 jours est couramment utilisée pour les tendances à long terme.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'A "golden cross" occurs when the 50-day MA crosses ___ the 200-day MA.': { prompt: 'Un "golden cross" se produit quand la MM 50 jours croise ___ la MM 200 jours.', options: ["Au-dessus de", "En dessous de", "À travers", "Autour de"], correctAnswer: "Au-dessus de" },
  'What is a "death cross"?': { prompt: 'Qu\'est-ce qu\'un "death cross"?', options: ["Quand une action atteint 0$", "Quand la MM 50 jours croise sous la MM 200 jours", "Quand le marché ferme", "Un type de chandelier"], correctAnswer: "Quand la MM 50 jours croise sous la MM 200 jours" },
  'Using moving averages as the only indicator for trades.': { prompt: "Utiliser les moyennes mobiles comme seul indicateur pour les transactions.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'An SMA reacts faster to price changes than an EMA.': { prompt: "Une EMA réagit plus vite aux changements de prix qu'une SMA.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'What does SMA stand for?': { prompt: "Que signifie SMA?", options: ["Stock Market Average", "Simple Moving Average", "Standard Market Analysis", "Short-term Moving Asset"], correctAnswer: "Simple Moving Average" },

  // Risk Management
  'What is a stop-loss order?': { prompt: "Qu'est-ce qu'un ordre stop-loss?", options: ["Un ordre d'achat supplémentaire", "Un ordre qui vend quand le prix atteint un bas fixé", "Une limite sur les heures de trading", "Des frais de courtier"], correctAnswer: "Un ordre qui vend quand le prix atteint un bas fixé" },
  'You should risk no more than 1-2% of your account on one trade.': { prompt: "Vous ne devriez pas risquer plus de 1-2% de votre compte sur une seule transaction.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
  'The risk-to-___ ratio compares potential loss to potential gain.': { prompt: "Le ratio risque-___ compare la perte potentielle au gain potentiel.", options: ["Récompense", "Rendement", "Revenu", "Taux"], correctAnswer: "Récompense" },
  'Putting all your money into one stock.': { prompt: "Mettre tout votre argent dans une seule action.", options: ["Bonne pratique", "Mauvaise pratique"], correctAnswer: "Mauvaise pratique" },
  'What is diversification?': { prompt: "Qu'est-ce que la diversification?", options: ["Acheter une seule action", "Répartir les investissements entre différents actifs", "Tout vendre", "Le day trading"], correctAnswer: "Répartir les investissements entre différents actifs" },
  'Which risk approach is better?': { prompt: "Quelle approche du risque est meilleure?", options: ["Je me sens chanceux, je mets tout sur ce tuyau!", "Je vais risquer 2% de mon compte et placer un stop-loss."], correctAnswer: "Je vais risquer 2% de mon compte et placer un stop-loss." },
  'Position sizing means deciding how much to invest in each trade.': { prompt: "Le dimensionnement de position consiste à décider combien investir dans chaque transaction.", options: ["Vrai", "Faux"], correctAnswer: "Vrai" },
};

export default tradingFr;
