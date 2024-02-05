/* eslint-disable complexity, no-nested-ternary */
import {RenderOptions, Section, TooltipRow} from './types';
import {escapeHTML} from '../../utils/html';

import type I18n from '../../utils/i18n';

function renderItems(rows: TooltipRow[], section: Section) {
    const rowsMax = rows.slice(0, section.max);

    return (
        rowsMax
            .map(({value, name = 'unnamed', color, active, transformed, seriesIdx}, i) => {
                const val = `
<span class="yagr-tooltip__val">${value}</span>
    ${typeof transformed === 'number' ? `<span class="yagr-tooltip__tf">${transformed.toFixed(2)}</span>` : ''}
`;
                return `
<div class="yagr-tooltip__item ${active ? '_active' : ''}" data-series="${seriesIdx}">
    ${section.index ? `<span class="yagr-tooltip__idx">${rows.length - i}</span>` : ''}
    <span class="yagr-tooltip__mark" style="background-color: ${color}"></span>${escapeHTML(name)}&nbsp;&nbsp;${val}
</div>`;
            })
            .join('') +
        (rows.length > rowsMax.length
            ? `<div class="yagr-tooltip__item _more">+${rows.length - rowsMax.length}</div>`
            : '')
    );
}

export function renderTooltip(
    data: RenderOptions,
    yagr: {
        utils: {
            i18n: ReturnType<typeof I18n>;
        };
    },
): string {
    if (data.empty) {
        return yagr.utils.i18n('nodata');
    }

    const [allTitle, sectionTitle] = data.title
        ? typeof data.title === 'string'
            ? [data.title, false]
            : [false, true]
        : [false, false];

    const sections = data.sections.map((sec) => {
        const sectionTitleBody = sec.title ?? '';
        const scaleBody = sec.name ? `${yagr.utils.i18n('scale')}: ${sec.name}` : '';

        return `
<div class="__section" data-section=${sec.name}>
    ${sectionTitle && sectionTitleBody ? `<div class="_section_title">${sectionTitleBody}</div>` : ''}
    ${scaleBody ? `<div class="__section_scale">${scaleBody}</div>` : ''}
    <div class="__section_body">${renderItems(sec.rows, sec)}</div>
    ${
        sec.sum
            ? `
        <div class="__section_sum">
            ${yagr.utils.i18n('sum')}: ${sec.sum}
        </div>
    `
            : ''
    }
</div>`;
    });

    return `${allTitle ? `<div class="__title">${allTitle}</div>` : ''}${sections.join('')}`;
}
