/**
 * T19 destination for the former stitch Builder.
 * Production PlanEditor lives in ClientDetail (native BlockCard/SetRow); this shell is the
 * migrated public entry so callers and docs no longer point at src/stitch/Builder.
 */
export { PlanEditor as PlanEditorShell, PlanEditor as default } from './ClientDetail';
