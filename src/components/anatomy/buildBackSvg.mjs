import fs from 'node:fs';

const CX = 126.35;
const front = fs.readFileSync(new URL('../../assets/anatomy/FrontViewMuscleMap.svg', import.meta.url), 'utf8');

function extract(svg, id) {
    const m = svg.match(new RegExp(`<g id="${id}"[^>]*>([\\s\\S]*?)</g>`));
    if (!m) throw new Error(`Missing ${id}`);
    return m[1].trim();
}

function tokenize(d) {
    return d.replace(/,/g, ' ').match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
}

function mapXY(d, fn) {
    const t = tokenize(d);
    const out = [];
    const arity = {
        M: 2, L: 2, T: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, A: 7, Z: 0,
        m: 2, l: 2, t: 2, h: 1, v: 1, c: 6, s: 4, q: 4, a: 7, z: 0,
    };
    let i = 0;
    while (i < t.length) {
        const cmd = t[i++];
        out.push(cmd);
        const n = arity[cmd];
        if (n == null) throw new Error(`Unknown SVG command ${cmd}`);
        if (n === 0) continue;
        while (i < t.length && !/^[A-Za-z]$/.test(t[i])) {
            const nums = t.slice(i, i + n).map(Number);
            i += n;
            if (cmd === 'H' || cmd === 'h') {
                out.push(fn(nums[0], 0)[0]);
            } else if (cmd === 'V' || cmd === 'v') {
                out.push(nums[0]);
            } else if (cmd === 'A' || cmd === 'a') {
                const [nx, ny] = fn(nums[5], nums[6]);
                out.push(nums[0], nums[1], nums[2], nums[3], nums[4], nx, ny);
            } else {
                for (let k = 0; k < nums.length; k += 2) {
                    const [nx, ny] = fn(nums[k], nums[k + 1]);
                    out.push(Number(nx.toFixed(3)), Number(ny.toFixed(3)));
                }
            }
        }
    }
    return out.join(' ').replace(/ ([A-Za-z])/g, ' $1').replace(/\s+/g, ' ').trim();
}

function translateD(d, dx, dy) {
    return mapXY(d, (x, y) => [x + dx, y + dy]);
}

function scaleAboutD(d, sx, sy, cx = CX, cy = 0) {
    return mapXY(d, (x, y) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);
}

function transformGroup(inner, fnD) {
    return inner.replace(/d="([^"]+)"/g, (_, d) => `d="${fnD(d)}"`);
}

const stroke = extract(front, 'Stroke');
const neck = extract(front, 'neck');
const triceps = extract(front, 'triceps');
const forearms = extract(front, 'forearms');
const calves = extract(front, 'calves');
const shoulders = extract(front, 'shoulders');
const quadriceps = extract(front, 'quadriceps');
const hamInner = extract(front, 'abductors');
const upperTraps = extract(front, 'traps');
const lats = transformGroup(extract(front, 'absObliques'), d => translateD(d, 0, -16));
const pecs = extract(front, 'middleChest');
const pecLower = extract(front, 'lowerChest');
const pecUpper = extract(front, 'upperChest');
const absL = extract(front, 'absLower');

const extraCalves = `
    <path d="M102.597 500.615C102.597 500.615 107.778 519.283 104.726 520.939C101.674 522.597 100.601 516.812 98.8 510.253C96.999 503.694 93.491 487.579 93.491 487.579C93.491 487.579 85.975 455.335 85.386 450.065C84.797 444.794 84.774 421.032 86.353 410.325C86.353 410.325 85.707 439.569 88.839 451.671C91.97 463.773 102.597 500.615 102.597 500.615ZM150.21 500.615C150.21 500.615 145.029 519.283 148.081 520.939C151.133 522.597 152.206 516.812 154.007 510.253C155.808 503.694 159.316 487.579 159.316 487.579C159.316 487.579 166.832 455.335 167.421 450.065C168.01 444.794 168.033 421.032 166.454 410.325C166.454 410.325 167.1 439.569 163.968 451.671C160.838 463.773 150.21 500.615 150.21 500.615Z"/>
    <path d="M89.717 406.646C89.717 406.646 95.333 413.289 97.708 423.164C99.261 429.623 113.633 515.93 113.633 515.93C113.633 515.93 112.043 518.883 108.1 508.758C104.158 498.633 96.646 474.391 95.278 470.098C93.908 465.803 90.02 453.928 89.192 440.147C88.364 426.366 86.711 406.805 89.717 406.646ZM163.09 406.646C163.09 406.646 157.474 413.289 155.099 423.164C153.546 429.623 139.174 515.93 139.174 515.93C139.174 515.93 140.764 518.883 144.707 508.758C148.649 498.633 156.161 474.391 157.529 470.098C158.899 465.803 162.787 453.928 163.615 440.147C164.443 426.366 166.097 406.805 163.09 406.646Z"/>
`;

const trapBody = transformGroup(pecs, d => translateD(scaleAboutD(d, 1.06, 0.4, CX, 138), 0, -24));
const upperBack = transformGroup(absL, d => translateD(scaleAboutD(d, 1.18, 0.7, CX, 248), 0, -82));
const middleBack = transformGroup(absL, d => translateD(scaleAboutD(d, 1.02, 0.68, CX, 248), 0, -58));
const lowerBack = transformGroup(absL, d => translateD(scaleAboutD(d, 0.78, 0.78, CX, 248), 0, -36));
const glutes = [
    transformGroup(pecUpper, d => translateD(scaleAboutD(d, 1.08, 1.05, CX, 128), 0, 98)),
    transformGroup(pecs, d => translateD(scaleAboutD(d, 1.12, 1.08, CX, 138), 0, 102)),
    transformGroup(pecLower, d => translateD(scaleAboutD(d, 1.14, 1.1, CX, 150), 0, 108)),
].join('\n      ');

const backSvg = `<svg width="249" height="558" viewBox="0 0 249 558" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="Stroke">
    ${stroke}
  </g>
  <g id="fullBody" fill="#404040">
    <g id="neck">
      ${neck}
    </g>
    <g id="lats">
      ${lats}
    </g>
    <g id="traps">
      ${upperTraps}
      ${trapBody}
    </g>
    <g id="upperBack">
      ${upperBack}
    </g>
    <g id="middleBack">
      ${middleBack}
    </g>
    <g id="lowerBack">
      ${lowerBack}
    </g>
    <g id="deltoidPosterior">
      ${shoulders}
    </g>
    <g id="triceps">
      ${triceps}
    </g>
    <g id="forearms">
      ${forearms}
    </g>
    <g id="glutes">
      ${glutes}
    </g>
    <g id="hamstrings">
      ${quadriceps}
      ${hamInner}
    </g>
    <g id="calves">
      ${calves}
      ${extraCalves}
    </g>
  </g>
</svg>
`;

fs.writeFileSync(new URL('../../assets/anatomy/BackViewMuscleMap.svg', import.meta.url), backSvg);
console.log('wrote BackViewMuscleMap.svg');
