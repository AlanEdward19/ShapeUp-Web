import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';

export const withLang = (ui) => <LanguageProvider>{ui}</LanguageProvider>;
