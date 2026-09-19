import React from 'react';

export const VIEW_W = 249;
export const VIEW_H = 558;

export function Mirror({ children }) {
    const nodes = React.Children.toArray(children);
    return (
        <>
            <g>{nodes}</g>
            <g transform={`translate(${VIEW_W} 0) scale(-1 1)`}>
                {nodes.map((node, i) => React.cloneElement(node, { key: `mirror-${i}` }))}
            </g>
        </>
    );
}

export function RegionGroup({ id, ids, hits, maxHits, label, children }) {
    const regionIds = ids?.length ? ids : [id];
    const n = Math.max(0, ...regionIds.map(regionId => hits[regionId] || 0));
    const active = n > 0;
    const fill = active ? 'var(--map-hit, #e06c43)' : 'var(--map-idle, #9a8b82)';
    const intensity = maxHits > 0 ? n / maxHits : 0;
    return (
        <g
            data-region={regionIds.join(' ')}
            className={active ? 'is-hit' : undefined}
            fill={fill}
            style={{ fill, ...(active ? { ['--hit']: String(intensity) } : {}) }}
        >
            {label ? <title>{label}</title> : null}
            {React.Children.map(children, (child) => (
                React.isValidElement(child) && child.type === 'path'
                    ? React.cloneElement(child, { fill, style: { fill } })
                    : child
            ))}
        </g>
    );
}
