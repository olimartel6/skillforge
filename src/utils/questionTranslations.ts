import { currentLanguage } from '../i18n';
import type { GameQuestion } from './gameQuestions';
import { allTranslations } from './translations';

/**
 * Translates a GameQuestion based on the current device language.
 * For 'en', returns the question as-is.
 * For 'fr' and 'es', looks up translations by English prompt text.
 */
export function translateQuestion(question: GameQuestion): GameQuestion {
  if (currentLanguage === 'en') return question;

  const lang = currentLanguage as 'fr' | 'es';
  const translations = allTranslations[lang];
  if (!translations) return question;

  const t = translations[question.prompt];
  if (!t) return question;

  const translated: GameQuestion = { ...question, prompt: t.prompt };

  if (t.options && question.options) {
    translated.options = t.options;
  }

  if (t.correctAnswer !== undefined) {
    translated.correctAnswer = t.correctAnswer;
  }

  return translated;
}

/**
 * Translates an array of GameQuestions.
 */
export function translateQuestions(questions: GameQuestion[]): GameQuestion[] {
  if (currentLanguage === 'en') return questions;
  return questions.map(translateQuestion);
}
