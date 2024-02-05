import {isNil} from '../utils/common';
import type {PieItem, YagrPie} from './types';

export const PADDING = 24;

export function drawPie(yagr: YagrPie) {
    const {radius = 1, cutout = 0, labels = false} = yagr.config.chart.appearance;
    const {canvas, ctx, config, utils} = yagr;
    const width = canvas.width;
    const height = canvas.height;

    const centerX = width / 2;
    const centerY = height / 2;
    const total = config.data.reduce((a, b) => a + (b.show ? b.value : 0), 0);

    const radiusPx = (Math.min(width, height) * radius) / 2 - PADDING;
    const cutoutPx = Math.max((Math.min(width, height) * cutout) / 2 - PADDING, 0);

    let startAngle = 0;
    let endAngle = 0;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.fillStyle = utils.colorParser.parse(utils.theme.BACKGROUND);
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    yagr.run('clear');

    for (let i = 0; i < config.data.length; i++) {
        const item = config.data[i];
        const {show, color, _focus} = item;
        let value = item.value;

        if (!show) {
            value = 0;
        }

        startAngle = endAngle;
        endAngle = endAngle + (value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radiusPx, startAngle, endAngle, false);
        ctx.arc(centerX, centerY, cutoutPx, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = _focus ? yagr.utils.colorParser.shade(color, 0.1) : color;
        ctx.fill();

        const segment = {
            start: startAngle,
            end: endAngle,
        };

        item._segment = segment;

        // render name label
        if (!config.data[i].show || !labels) {
            continue;
        }

        const label = config.data[i].name as string;
        const labelRadius = radiusPx + (cutoutPx - radiusPx) / 2;
        const labelAngle = (startAngle + endAngle) / 2;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, labelX, labelY);
        ctx.restore();
    }

    yagr.run('render');
}

export function findSegmentByCoords(yagr: YagrPie, x: number, y: number) {
    const {canvas} = yagr;
    const {radius = 1, cutout = 0} = yagr.config.chart.appearance;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const centerX = width / 2;
    const centerY = height / 2;

    const radiusPx = (Math.min(width, height) * radius) / 2 - PADDING;
    const cutoutPx = Math.max((Math.min(width, height) * cutout) / 2 - PADDING, 0);

    return yagr.config.data.find((item) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx);
        const angleNormalized = (angle + Math.PI * 2) % (Math.PI * 2);

        const matchingAngle = angleNormalized >= item._segment!.start && angleNormalized <= item._segment!.end;
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
        const inRadius = matchingAngle && distanceToCenter <= radiusPx;
        const inCutout = cutoutPx ? matchingAngle && distanceToCenter >= cutoutPx : true;

        return inRadius && inCutout;
    });
}

export function setFocusImpl(yagr: YagrPie, series: PieItem | null, state: boolean) {
    yagr.config.data.forEach((item) => {
        item._focus = series === null ? state : false;
    });

    if (!isNil(series)) {
        series._focus = state;
    }

    drawPie(yagr);

    const {config, canvas, ctx} = yagr;

    if (config.chart.appearance.accent) {
        const {radius = 1} = config.chart.appearance;

        const radiusPx = (Math.min(canvas.clientWidth, canvas.clientHeight) * radius) / 2 - PADDING;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const centerX = width / 2;
        const centerY = height / 2;

        if (series) {
            // @TODO add optimizations to avoid full redraw
            const segment = series._segment!;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radiusPx + config.chart.appearance.accent, segment.start, segment.end, false);
            ctx.arc(centerX, centerY, radiusPx, segment.end, segment.start, true);
            ctx.closePath();
            ctx.fillStyle = yagr.utils.colorParser.shade(series.color, 0.5);
            ctx.fill();
        }
    }
}

export function setVisibleImpl(yagr: YagrPie, series: PieItem | null, state: boolean) {
    if (isNil(series)) {
        yagr.config.data.forEach((item) => {
            item.show = state;
        });
    } else {
        series.show = state;
    }

    yagr.run('update');

    drawPie(yagr);
}
