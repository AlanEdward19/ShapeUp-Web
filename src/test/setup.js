import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
    window.matchMedia = () => ({
        matches: false,
        media: '',
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() { return false },
    })
}
