import { en } from './en.js';
import { ta } from './ta.js';

export const translations = {
  en,
  ta
};

export type Language = 'en' | 'ta';
export type TranslationType = typeof en;
