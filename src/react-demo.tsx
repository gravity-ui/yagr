// import React from 'react';

import Yagr, { YagrMeta } from './YagrCore';
import type { MinimalValidConfig } from './YagrCore/types';

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

export default (React: any) => {
    return class YagrChartComponent extends React.Component<YagrChartProps, never> {
        chart?: Yagr;
        charRef = React.createRef();

        componentDidMount() {
            this.initChart();
        }

        componentDidUpdate() {
            if (this.chart) {
                this.chart.dispose();
            }

            this.initChart();
        }

        componentWillUnmount() {
            if (this.chart) {
                this.chart.dispose();
            }
        }

        render() {
            const { id, className } = this.props;
            return <div id={id} onClick={this.onClick} className={`yagr ${className || ''}`} ref={this.charRef} />;
        }

        onClick = (event: React.MouseEvent) => {
            if (this.chart && (event.ctrlKey || event.metaKey) && event.shiftKey) {
                const dataUrl = this.chart.toDataUrl().replace('image/png', 'image/octet-stream');
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = (this.props.debug?.filename || this.chart.id) + '.png';
                a.click();
            }
        };

        initChart() {
            if (!this.charRef.current) {
                return;
            }
            const { onChartLoad, config, onSelect } = this.props;

            config.hooks = config.hooks || {};
            const hooks = config.hooks;

            if (onChartLoad) {
                const load = hooks.load || [];
                load.push(({ chart, meta }: any) => {
                    onChartLoad(chart, meta);
                });
                hooks.load = load;
            }

            if (onSelect) {
                const selection = hooks.onSelect || [];
                selection.push(({ from, to }: any) => onSelect(from, to));
                hooks.onSelect = selection;
            }

            this.chart = new Yagr(this.charRef.current, this.props.config);
        }
    };
};
