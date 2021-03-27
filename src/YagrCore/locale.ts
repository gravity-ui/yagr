const LOCALIZATIONS: Record<string, Record<string, string>> = {
    'ru': {
        'hide-all': 'Скрыть все линии',
        'show-all': 'Показать все линии',
    },
    'en': {
        'hide-all': 'Hide lines',
        'show-all': 'Show lines'
    },
};

export default (locale: keyof typeof LOCALIZATIONS | Record<string, string> = 'en') => {
    if (typeof locale !== 'string') {
        LOCALIZATIONS.custom = locale;
        locale = 'custom';
    }
    
    return (key: string) => {
        return LOCALIZATIONS[locale as string][key] || key;
    };
};
