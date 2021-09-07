/* eslint-disable complexity, no-nested-ternary */
import {TooltipRenderOptions, TooltipRow} from './types';

function renderItems(rows: TooltipRow[], opts: TooltipRenderOptions['options']) {
    return rows
        .map(({value, name, color, active, transformed, seriesIdx}, i) => {
            const val = `
<span class="yagr-tooltip__val">${value}</span>
    ${typeof transformed === 'number' ? `<span class="yagr_tooltip__tf${transformed.toFixed(2)}</span>` : ''}
`;
            return `
<div class="yagr-tooltip__item ${active ? '_active' : ''}" data-series="${seriesIdx}">
    ${opts.showIndicies ? `<span class="yagr-tooltip__idx">${rows.length - i}</span>` : ''}
    <span class="yagr-tooltip__mark" style="background-color: ${color}"></span>${name}&nbsp;&nbsp;${val}
</div>`;
        })
        .join('');
}

export function renderTooltip(data: TooltipRenderOptions) {
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
                    : `${data.yagr.i18n('scale')}: ${x.scale}`
                : '';
        return `
<div class="__section">
    ${sectionTitle && sectionTitleBody ? `<div class="_section_title">${sectionTitleBody}</div>` : ''}
    ${scaleBody ? `<div class="__section_scale">${scaleBody}</div>` : ''}
    <div class="__section_body">${renderItems(x.rows, data.options)}</div>
    ${
        x.sum
            ? `
        <div class="__section_sum">
            ${data.yagr.i18n('sum')}: ${x.sum}
        </div>
    `
            : ''
    }
</div>`;
    });

    return `${allTitle ? `<div class="__title">${allTitle}</div>` : ''}${sections.join('')}`;
}

function getOptionValue<T>(option: T | {[key in string]: T}, scale: string): T {
    return (typeof option === 'object' ? (option as {[key in string]: T})[scale] : option) as T;
}
