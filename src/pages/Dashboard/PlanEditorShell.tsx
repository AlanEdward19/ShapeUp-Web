/**
 * T19 destination for the former Builder.
 * Production PlanEditor lives in ClientDetail (native BlockCard/SetRow); this shell is the
 * migrated public entry so callers and docs no longer point at Builder.
 */
export { PlanEditor as PlanEditorShell, PlanEditor as default } from './ClientDetail';
