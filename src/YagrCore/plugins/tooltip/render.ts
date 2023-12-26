/* eslint-disable complexity, no-nested-ternary */
import {TooltipRenderOptions, TooltipRow} from './types';
import {getOptionValue, escapeHTML} from './utils';

function renderItems(rows: TooltipRow[], opts: TooltipRenderOptions['options'], scale: string) {
    const rowsMax = rows.slice(0, getOptionValue(opts.maxLines, scale));

    return (
        rowsMax
            .map(({value, name = 'unnamed', color, active, transformed, seriesIdx}, i) => {
                const val = `
<span class="yagr-tooltip__val">${value}</span>
    ${typeof transformed === 'number' ? `<span class="yagr-tooltip__tf">${transformed.toFixed(2)}</span>` : ''}
`;
                return `
<div class="yagr-tooltip__item ${active ? '_active' : ''}" data-series="${seriesIdx}">
    ${opts.showIndicies ? `<span class="yagr-tooltip__idx">${rows.length - i}</span>` : ''}
    <span class="yagr-tooltip__mark" style="background-color: ${color}"></span>${escapeHTML(name)}&nbsp;&nbsp;${val}
</div>`;
            })
            .join('') +
        (rows.length > rowsMax.length
            ? `<div class="yagr-tooltip__item _more">+${rows.length - rowsMax.length}</div>`
            : '')
    );
}

export function renderTooltip(data: TooltipRenderOptions) {
    if (data.scales.length === 0) {
        return data.yagr.utils.i18n('nodata');
    }

    const [allTitle, sectionTitle] = data.options.title
        ? typeof data.options.title === 'string'
            ? [data.options.title, false]
            : ['', true]
        : ['', false];

    const sections = data.scales.map((x) => {
        const sectionTitleBody = getOptionValue(data.options.title, x.scale);
        const scaleBody =
            data.scales.length > 1
                ? data.options.scales
                    ? `${getOptionValue(data.options.scales, x.scale) || ''}`
                    : `${data.yagr.utils.i18n('scale')}: ${x.scale}`
                : '';
        return `
<div class="__section" data-scale=${x.scale}>
    ${sectionTitle && sectionTitleBody ? `<div class="_section_title">${sectionTitleBody}</div>` : ''}
    ${scaleBody ? `<div class="__section_scale">${scaleBody}</div>` : ''}
    <div class="__section_body">${renderItems(x.rows, data.options, x.scale)}</div>
    ${
        getOptionValue(data.options.sum, x.scale)
            ? `
        <div class="__section_sum">
            ${data.yagr.utils.i18n('sum')}: ${x.sum}
        </div>
    `
            : ''
    }
</div>`;
    });

    return `${allTitle ? `<div class="__title">${allTitle}</div>` : ''}${sections.join('')}`;
}
