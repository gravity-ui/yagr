import {isNil} from '../utils/common';
import type {PieSeries, YagrPie} from './types';

export const PADDING = 24;

export function drawPie(yagr: YagrPie) {
    const {radius = 1, cutout = 0} = yagr.config.chart.appearance;
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

    for (let i = 0; i < config.data.length; i++) {
        let value = config.data[i].value;
        if (!config.data[i].show) {
            value = 0;
        }

        startAngle = endAngle;
        endAngle = endAngle + (value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radiusPx, startAngle, endAngle, false);
        ctx.arc(centerX, centerY, cutoutPx, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = config.data[i]._focus
            ? yagr.utils.colorParser.shade(config.data[i].color, 0.1)
            : config.data[i].color;
        ctx.fill();

        const segment = {
            start: startAngle,
            end: endAngle,
        };

        config.data[i]._segment = segment;
    }
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

export function setFocusImpl(yagr: YagrPie, series: PieSeries | null, state: boolean) {
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

export function setVisibleImpl(yagr: YagrPie, series: PieSeries | null, state: boolean) {
    if (isNil(series)) {
        yagr.config.data.forEach((item) => {
            item.show = state;
        });
    } else {
        series.show = state;
    }

    drawPie(yagr);
}
