import * as React from 'react';

import Yagr, {YagrMeta} from './YagrCore';
import type {MinimalValidConfig} from './YagrCore/types';
import type {TooltipHandlerData} from './types';

export interface YagrChartProps {
    /** Chart ID */
    id: string;
    /** Config of chart */
    config: MinimalValidConfig;
    /** Root component class name */
    className?: string;
    /** Update strategy */
    update?: 'dynamic' | 'hard';
    /** Debug data */
    debug?: {
        filename: string;
    };

    /** Fires after chart has drawn */
    onChartLoad?: (chart: Yagr, meta: YagrMeta) => void;
    /** Fires on every range selection */
    onSelect?: (from: number, to: number) => void;
}

export interface YagrReactRef {
    yagr: () => Yagr | undefined;
    domElement: () => HTMLDivElement | null;
}

// eslint-disable-next-line prefer-arrow-callback
export default React.forwardRef(function YagrReact(
    {id, config, className = '', debug, onChartLoad, onSelect, update = 'dynamic'}: YagrChartProps,
    ref,
) {
    const chartRef = React.useRef<HTMLDivElement>(null);
    const chart = React.useRef<Yagr>();

    React.useImperativeHandle(ref, () => ({
        yagr: () => chart.current,
        domElement: () => chartRef.current,
    }));

    const initChart = React.useCallback(() => {
        if (chartRef.current) {
            config.hooks = config.hooks || {};
            const hooks = config.hooks;

            if (onChartLoad) {
                const load = hooks.load || [];
                load.push(({chart, meta}) => {
                    onChartLoad(chart, meta);
                });
                hooks.load = load;
            }

            if (onSelect) {
                const selection = hooks.onSelect || [];
                selection.push(({from, to}) => onSelect(from, to));
                hooks.onSelect = selection;
            }

            chart.current = new Yagr(chartRef.current, config);
        }
    }, []);

    React.useEffect(() => {
        config && chart.current?.setConfig(config, update === 'hard');
    }, [config]);

    React.useEffect(() => {
        initChart();
        return () => chart.current?.dispose();
    }, []);

    const onClick = React.useCallback(
        (event: React.MouseEvent) => {
            if (chart.current && (event.ctrlKey || event.metaKey) && event.shiftKey) {
                const dataUrl = chart.current.toDataUrl().replace('image/png', 'image/octet-stream');
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = (debug?.filename || chart.current.id) + '.png';
                a.click();
            }
        },
        [id, chart],
    );

    return <div id={id} onClick={onClick} className={`yagr ${className}`} ref={chartRef} />;
});

interface CustomTooltip {
    onChange: (data: TooltipHandlerData) => void;
}

export const useTooltipState = (
    yagrRef: React.MutableRefObject<YagrReactRef | null>,
    tooltipRef: React.RefObject<CustomTooltip>,
) => {
    React.useEffect(() => {
        if (!yagrRef.current || !tooltipRef.current) {
            return;
        }

        const tooltip = tooltipRef.current;
        const yagr = yagrRef.current.yagr();

        if (!yagr || !yagr?.plugins?.tooltip) {
            return;
        }

        yagr.plugins.tooltip.on('render', (_, data) => {
            tooltip.onChange(data);
        });

        yagr.plugins.tooltip.on('show', (_, data) => {
            tooltip.onChange(data);
        });

        yagr.plugins.tooltip.on('show', (_, data) => {
            tooltip.onChange(data);
        });
    }, [yagrRef.current]);
};
