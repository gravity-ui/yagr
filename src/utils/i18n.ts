const LOCALIZATIONS: Record<string, Record<string, string>> = {
    ru: {
        'hide-all': 'Скрыть все',
        'show-all': 'Показать все',
        sum: 'Сумма',
        scale: 'Шкала',
        series: 'Линия',
        weekend: 'Выходной',
        nodata: 'Нет данных',
    },
    en: {
        'hide-all': 'Hide all',
        'show-all': 'Show all',
        sum: 'Total',
        scale: 'Scale',
        series: 'Series',
        weekend: 'Weekend',
        nodata: 'No data',
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
