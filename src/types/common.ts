import type ColorParser from '../utils/colors';
import type ThemedDefaults from '../utils/defaults';
import type I18n from '../utils/i18n';

export type Theme = 'light' | 'dark' | string;

export interface CommonApi {
    id: string;
    root: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    dispose(): void;
    redraw(): void;
    toDataURL(fmt?: string): string;

    setFocus(seriesId: string | null, focus: boolean): void;
    setFocus(seriesIdx: number | null, focus: boolean): void;

    setVisible(seriesId: string | null, visible: boolean): void;
    setVisible(seriesIdx: number | null, visible: boolean): void;

    setTheme(theme: Theme): void;

    utils: {
        colorParser: ColorParser;
        theme: ThemedDefaults;
        i18n: ReturnType<typeof I18n>;
    };
}

export interface CommonAppearance {
    theme: Theme;
}

/** Graph title style. To customize other properties use CSS */
export interface Title {
    text: string;
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
}

export interface CommonHooksShape<C> {
    opts?: (chart: C) => void;
    init?: (chart: C) => void;
    ready?: (chart: C) => void;
    error?: (chart: C, error: Error) => void;
    dispose?: (chart: C) => void;
    resize?: (chart: C, entries: ResizeObserverEntry[]) => void;
    clear?: (chart: C) => void;
    update?: (chart: C) => void;
}

export type CommonHooks<C> = {
    [K in keyof CommonHooksShape<C>]?: Required<CommonHooksShape<C>>[K][];
};

export interface CommonSeries {
    id: string;
    color: string;
    type: string;
    show: boolean;

    name?: string;
}

export type Plugin<C> = (chart: C) => {
    hooks: CommonHooksShape<C>;
};
