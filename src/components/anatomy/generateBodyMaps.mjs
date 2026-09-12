import fs from 'node:fs';

const FRONT_MAP = {
    middleChest: { id: 'MiddleChest' },
    lowerChest: { id: 'LowerChest' },
    upperChest: { id: 'UpperChest' },
    shoulders: { id: 'DeltoidAnterior', ids: ['DeltoidAnterior', 'DeltoidLateral'] },
    triceps: { id: 'Triceps' },
    absUpper: { id: 'AbsUpper' },
    absLower: { id: 'AbsLower' },
    calves: { id: 'Calves' },
    abductors: { id: 'HipFlexors' },
    quadriceps: { id: 'Quadriceps' },
    forearms: { id: 'Forearms' },
    traps: { id: 'Traps' },
    biceps: { id: 'Biceps' },
    absObliques: { id: 'AbsObliques' },
    hipFlexors: { id: 'HipFlexors' },
};

const BACK_MAP = {
    lats: { id: 'Lats' },
    traps: { id: 'Traps' },
    upperBack: { id: 'UpperBack' },
    middleBack: { id: 'MiddleBack' },
    lowerBack: { id: 'LowerBack' },
    deltoidPosterior: { id: 'DeltoidPosterior', ids: ['DeltoidPosterior', 'DeltoidLateral'] },
    triceps: { id: 'Triceps' },
    forearms: { id: 'Forearms' },
    glutes: { id: 'Glutes' },
    hamstrings: { id: 'Hamstrings' },
    calves: { id: 'Calves' },
};

function extract(svg, id) {
    const m = svg.match(new RegExp(`<g id="${id}"[^>]*>([\\s\\S]*?)</g>`));
    if (!m) throw new Error(`Missing group ${id}`);
    return m[1].trim();
}

function toJsxPaths(inner) {
    return inner
        .replace(/\sfill="[^"]*"/g, '')
        .replace(/\sstroke="[^"]*"/g, '')
        .replace(/stroke-miterlimit="/g, 'strokeMiterlimit="')
        .replace(/\/>/g, ' />')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => `                ${line}`)
        .join('\n');
}

function wrapGroups(svg, map) {
    return Object.entries(map).map(([svgId, meta]) => {
        const inner = toJsxPaths(extract(svg, svgId));
        const idsProp = meta.ids ? ` ids={${JSON.stringify(meta.ids)}}` : '';
        const labelExpr = meta.ids
            ? `[labels?.${meta.ids[0]}, labels?.${meta.ids[1]}].filter(Boolean).join(' / ')`
            : `labels?.${meta.id}`;
        return `                <RegionGroup id="${meta.id}"${idsProp} hits={hits} maxHits={maxHits} label={${labelExpr}}>\n${inner}\n                </RegionGroup>`;
    }).join('\n');
}

function fileFor(name, svg, map, aria, extraMuscle = '') {
    const silhouette = toJsxPaths(extract(svg, 'Stroke'));
    let neck = '';
    try {
        neck = toJsxPaths(extract(svg, 'neck'));
    } catch {
        neck = '';
    }
    return `import React from 'react';
import { RegionGroup } from './AnatomyPrimitives';

export default function ${name}({ hits, maxHits, labels }) {
    return (
        <svg
            className="su-body-map-svg"
            viewBox="0 0 249 558"
            role="img"
            aria-label={${aria}}
        >
            <g className="silhouette">
${silhouette}
            </g>
            <g className="muscles">
                ${neck ? `<g className="is-idle">
${neck}
                </g>` : ''}
${extraMuscle}
${wrapGroups(svg, map)}
            </g>
        </svg>
    );
}
`;
}

const front = fs.readFileSync(new URL('../../assets/anatomy/FrontViewMuscleMap.svg', import.meta.url), 'utf8');
const back = fs.readFileSync(new URL('../../assets/anatomy/BackViewMuscleMap.svg', import.meta.url), 'utf8');
const outDir = new URL('./', import.meta.url);

const extraFrontCalves = `                <RegionGroup id="Calves" hits={hits} maxHits={maxHits} label={labels?.Calves}>
                <path d="M102.597 500.615C102.597 500.615 107.778 519.283 104.726 520.939C101.674 522.597 100.601 516.812 98.8 510.253C96.999 503.694 93.491 487.579 93.491 487.579C93.491 487.579 85.975 455.335 85.386 450.065C84.797 444.794 84.774 421.032 86.353 410.325C86.353 410.325 85.707 439.569 88.839 451.671C91.97 463.773 102.597 500.615 102.597 500.615ZM150.21 500.615C150.21 500.615 145.029 519.283 148.081 520.939C151.133 522.597 152.206 516.812 154.007 510.253C155.808 503.694 159.316 487.579 159.316 487.579C159.316 487.579 166.832 455.335 167.421 450.065C168.01 444.794 168.033 421.032 166.454 410.325C166.454 410.325 167.1 439.569 163.968 451.671C160.838 463.773 150.21 500.615 150.21 500.615Z" />
                <path d="M89.717 406.646C89.717 406.646 95.333 413.289 97.708 423.164C99.261 429.623 113.633 515.93 113.633 515.93C113.633 515.93 112.043 518.883 108.1 508.758C104.158 498.633 96.646 474.391 95.278 470.098C93.908 465.803 90.02 453.928 89.192 440.147C88.364 426.366 86.711 406.805 89.717 406.646ZM163.09 406.646C163.09 406.646 157.474 413.289 155.099 423.164C153.546 429.623 139.174 515.93 139.174 515.93C139.174 515.93 140.764 518.883 144.707 508.758C148.649 498.633 156.161 474.391 157.529 470.098C158.899 465.803 162.787 453.928 163.615 440.147C164.443 426.366 166.097 406.805 163.09 406.646Z" />
                </RegionGroup>`;

fs.writeFileSync(new URL('BodyMapFront.jsx', outDir), fileFor('BodyMapFront', front, FRONT_MAP, "labels?.front || 'Front body map'", extraFrontCalves));
fs.writeFileSync(new URL('BodyMapBack.jsx', outDir), fileFor('BodyMapBack', back, BACK_MAP, "labels?.back || 'Back body map'"));
console.log('wrote BodyMapFront.jsx and BodyMapBack.jsx');
