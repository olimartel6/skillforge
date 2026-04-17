import { tradingFr } from './trading-fr';
import { tradingEs } from './trading-es';
import { businessFr } from './business-fr';
import { businessEs } from './business-es';
import { aiToolsFr } from './ai-tools-fr';
import { aiToolsEs } from './ai-tools-es';
import { salesFr } from './sales-fr';
import { salesEs } from './sales-es';
import { disciplineFr } from './discipline-fr';
import { disciplineEs } from './discipline-es';
import { brainFr } from './brain-fr';
import { brainEs } from './brain-es';
import { codingFr } from './coding-fr';
import { codingEs } from './coding-es';
import { marketingFr } from './marketing-fr';
import { marketingEs } from './marketing-es';
import { marketingAgencyFr } from './marketing-agency-fr';
import { marketingAgencyEs } from './marketing-agency-es';
import { negotiationFr } from './negotiation-fr';
import { negotiationEs } from './negotiation-es';
import { persuasionFr } from './persuasion-fr';
import { persuasionEs } from './persuasion-es';
import { sideHustlesFr } from './side-hustles-fr';
import { sideHustlesEs } from './side-hustles-es';
import { realEstateFr } from './real-estate-fr';
import { realEstateEs } from './real-estate-es';
import { bodyLanguageFr } from './body-language-fr';
import { bodyLanguageEs } from './body-language-es';
// New translations
import { beatboxingFr } from './beatboxing-fr';
import { danceFr } from './dance-fr';
import { fashionDesignFr } from './fashion-design-fr';
import { filmmakingFr } from './filmmaking-fr';
import { podcastingFr } from './podcasting-fr';
import { publicSpeakingFr } from './public-speaking-fr';
import { singingFr } from './singing-fr';
import { standUpComedyFr } from './stand-up-comedy-fr';
import { magicTricksFr } from './magic-tricks-fr';
import { chessFr } from './chess-fr';
import { cookingFr } from './cooking-fr';
import { drawingFr } from './drawing-fr';
import { fitnessFr } from './fitness-fr';
import { guitarFr } from './guitar-fr';
import { meditationFr } from './meditation-fr';
import { photographyFr } from './photography-fr';
import { pianoFr } from './piano-fr';
import { onlineBusinessFr } from './online-business-fr';

type TranslationEntry = { prompt: string; options?: string[]; correctAnswer?: string | string[] };

export const allTranslations: Record<'fr' | 'es', Record<string, TranslationEntry>> = {
  fr: {
    ...tradingFr,
    ...businessFr,
    ...aiToolsFr,
    ...salesFr,
    ...disciplineFr,
    ...brainFr,
    ...codingFr,
    ...marketingFr,
    ...marketingAgencyFr,
    ...negotiationFr,
    ...persuasionFr,
    ...sideHustlesFr,
    ...realEstateFr,
    ...bodyLanguageFr,
    ...beatboxingFr,
    ...danceFr,
    ...fashionDesignFr,
    ...filmmakingFr,
    ...podcastingFr,
    ...publicSpeakingFr,
    ...singingFr,
    ...standUpComedyFr,
    ...magicTricksFr,
    ...chessFr,
    ...cookingFr,
    ...drawingFr,
    ...fitnessFr,
    ...guitarFr,
    ...meditationFr,
    ...photographyFr,
    ...pianoFr,
    ...onlineBusinessFr,
  },
  es: {
    ...tradingEs,
    ...businessEs,
    ...aiToolsEs,
    ...salesEs,
    ...disciplineEs,
    ...brainEs,
    ...codingEs,
    ...marketingEs,
    ...marketingAgencyEs,
    ...negotiationEs,
    ...persuasionEs,
    ...sideHustlesEs,
    ...realEstateEs,
    ...bodyLanguageEs,
  },
};
