import type {PieItem, YagrPie} from '../types';

import {renderTooltip} from 'src/plugins/tooltip/render';
import placement from '../../utils/placement';
import {wrapEmitter} from 'src/utils/emitter';

export interface PieTooltipOptions {
    show?: boolean;
    className?: string;
    boundClassName?: string;
    renderClassName?: string;
    onRender?: (item: PieItem, x: number, y: number) => void;
    onDestroy?: () => void;
}

interface TooltipState {
    visible: boolean;
    pinned: boolean;
}

type TooltipEvents = {
    show: TooltipState;
    hide: TooltipState;
    pin: TooltipState;
};

export function Tooltip(opts: PieTooltipOptions) {
    const state: TooltipState = {
        visible: false,
        pinned: false,
    };

    const bound = opts.boundClassName ? document.querySelector(opts.boundClassName) || document.body : document.body;
    const renderNode = opts.renderClassName
        ? document.querySelector(opts.renderClassName) || document.body
        : document.body;

    const tOverlay = document.createElement('div');

    return (yagr: YagrPie) => {
        tOverlay.id = `${yagr.id}_tooltip`;
        tOverlay.className = `yagr-tooltip ${opts.className ?? 'yagr-tooltip_default'}`;
        tOverlay.style.display = 'none';

        renderNode.appendChild(tOverlay);

        const plugin = {
            hooks: {},
            state,
            onClick: (item: PieItem | null) => {
                state.pinned = item ? !state.pinned : false;
            },
            onItem: (item: PieItem | null, x: number, y: number) => {
                if (state.pinned) {
                    return;
                }

                if (!item) {
                    tOverlay.style.display = 'none';
                    state.visible = false;
                    return;
                }

                state.visible = true;

                const body = renderTooltip(
                    {
                        sections: [
                            {
                                name: '',
                                title: '',
                                max: 1,
                                index: false,
                                rows: [
                                    {
                                        id: item.id,
                                        displayY: item.value,
                                        seriesIdx: item.index ?? 0,
                                        rowIdx: 0,

                                        name: item.name,
                                        value: item.value,
                                        color: item.color,
                                    },
                                ],
                            },
                        ],
                    },
                    yagr,
                );
                tOverlay.innerHTML = body;
                placement(
                    tOverlay,
                    {
                        left: x,
                        top: y,
                    },
                    'right',
                    {
                        bound: bound,
                    },
                );

                tOverlay.style.display = 'block';
            },
        };

        return wrapEmitter<TooltipEvents, typeof plugin>(plugin);
    };
}
