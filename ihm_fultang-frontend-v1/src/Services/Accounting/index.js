/**
 * Index des services de comptabilité
 * Exporte tous les services pour faciliter les imports
 */

export * as chartOfAccountsService from './chartOfAccountsService';
export * as journalEntryService from './journalEntryService';
export * as journalService from './journalService';
export * as financialReportService from './financialReportService';

// Exports par défaut
export { default as chartOfAccountsService } from './chartOfAccountsService';
export { default as journalEntryService } from './journalEntryService';
export { default as journalService } from './journalService';
export { default as financialReportService } from './financialReportService';
