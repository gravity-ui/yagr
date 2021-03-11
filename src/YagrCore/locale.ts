let locale = 'en-Us';

const LOCALIZATIONS: Record<string, Record<string, string>> = {
    'ru-Ru': {
        'legend.hide-all-lines': 'Скрыть все линии',
        'legend.show-all-lines': 'Показать все линии',
    },
    'en-Us': {
        'legend.hide-all-lines': 'Hide lines',
        'legend.show-all-lines': 'Show lines'
    },
};

export default (key: string) => {
    return LOCALIZATIONS[locale][key];
}

export const setLocale = (newLocale: keyof typeof LOCALIZATIONS) => {
    locale = newLocale;
}

export const setLocalization = (lang: string, localization: Record<string, string>) => {
    LOCALIZATIONS[lang] = localization;
};
