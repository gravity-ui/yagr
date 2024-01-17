import type ColorParser from '../utils/colors';
import type ThemedDefaults from '../utils/defaults';
import type I18n from '../utils/i18n';

export type Theme = 'light' | 'dark' | string;

export interface CommonApi {
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

export type CommonHookHandlerArg<T, C> = T & {chart: C};

export type Hook<A> = ((a: A) => void)[];

export type LoadHandlerArg<C> = CommonHookHandlerArg<{}, C>;
export type ErrorHandlerArg<C> = CommonHookHandlerArg<{error: Error}, C>;
export type InitHandlerArg<C> = CommonHookHandlerArg<{}, C>;
export type DisposeHandlerArg<C> = CommonHookHandlerArg<{}, C>;
export type ResizeHandlerArg<C> = CommonHookHandlerArg<{entries: ResizeObserverEntry[]}, C>;

export interface CommonHooks<C> {
    load?: Hook<LoadHandlerArg<C>>;
    error?: Hook<ErrorHandlerArg<C>>;
    init?: Hook<InitHandlerArg<C>>;
    dispose?: Hook<DisposeHandlerArg<C>>;
    resize?: Hook<ResizeHandlerArg<C>>;
}

export interface CommonSeries {
    id: string;
    color: string;
    type: string;
    show: boolean;

    name?: string;
}
