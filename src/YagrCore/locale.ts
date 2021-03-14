const LOCALIZATIONS: Record<string, Record<string, string>> = {
    'ru': {
        'legend.hide-all-lines': 'Скрыть все линии',
        'legend.show-all-lines': 'Показать все линии',
    },
    'en': {
        'legend.hide-all-lines': 'Hide lines',
        'legend.show-all-lines': 'Show lines'
    },
};

export default (locale: keyof typeof LOCALIZATIONS | Record<string, string> = 'en') => {
    if (typeof locale !== 'string') {
        LOCALIZATIONS.custom = locale;
        locale = 'custom';
    }
    
    return (key: string) => {
        return LOCALIZATIONS[locale as string][key];
    };
};
