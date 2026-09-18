export const translateKnown = (t, key, fallback) => {
    const translated = t(key);
    if (translated === key) return fallback == null ? '' : String(fallback);
    return translated;
};

const firstWordSlug = (value) => String(value ?? '').toLowerCase().split(' ')[0];

export const phaseLabel = (t, phase) => {
    const raw = phase == null ? '' : String(phase);
    const slug = firstWordSlug(raw);
    if (!slug) return raw;
    return translateKnown(t, `pro.builder.phase.${slug}`, raw);
};

export const difficultyLabel = (t, difficulty) => {
    const raw = difficulty == null ? '' : String(difficulty);
    const slug = firstWordSlug(raw);
    if (!slug) return raw;
    return translateKnown(t, `client.training.difficulty.${slug}`, raw);
};
