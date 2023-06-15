import React from 'react';

import Yagr, {YagrMeta} from './YagrCore';
import {MinimalValidConfig} from './YagrCore/types';

export interface YagrChartProps {
    /** Chart ID */
    id: string;
    /** Config of chart */
    config: MinimalValidConfig;
    /** Root component class name */
    className?: string;
    /** Debug data */
    debug?: {
        filename: string;
    };

    /** Fires after chart has drawn */
    onChartLoad?: (chart: Yagr, meta: YagrMeta) => void;
    /** Fires on every range selection */
    onSelect?: (from: number, to: number) => void;
}

export default function YagrChartComponent({id, config, className = '', debug, onChartLoad, onSelect}: YagrChartProps) {
    const chartRef = React.useRef<HTMLDivElement>(null);
    const chart = React.useRef<Yagr | undefined>(undefined);

    const initChart = React.useCallback(() => {
        if (chartRef.current) {
            chart.current = new Yagr(chartRef.current, config);

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
        }
    }, [config, onChartLoad, onSelect]);

    React.useEffect(() => {
        chart.current?.setConfig(config);
    }, [config]);

    React.useEffect(() => {
        initChart();
        return () => chart.current?.dispose();
    }, [initChart]);

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
}

YagrChartComponent.React = React;
