import type { ReactNode } from 'react';

export type DiaryDayRenderState = Record<string, unknown>;

declare const DiaryDay: (props?: { renderView?: (state: DiaryDayRenderState) => ReactNode }) => ReactNode;
export default DiaryDay;
