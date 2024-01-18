import React from 'react';
import ReactDOM from 'react-dom';
import YagrComponent from '../../../src/react';
import Yagr from '../../../src';

let tstart = Date.now();

class YagrOld extends React.Component {
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
        const {id, className} = this.props;

        return (
            <div id={id} onClick={this.onClick} className={`yagr ${className || ''}`} ref={this.charRef} />
        );
    }

    onClick = (event) => {
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
        const {onChartLoad, config, onSelect} = this.props;

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

        this.chart = new Yagr(this.charRef.current, this.props.config);
    }
}

const prepData = {
    timelines: new Array(500)
        .fill(0)
        .map((_, i) => new Array(20).fill(0).map((_, j) => (i + 5) * 500 * 20 + j * 1000)),
    series: new Array(500).fill(0).map((_, i) =>
        new Array(15).fill(0).map((_, j) => ({
            data: new Array(20).fill(0).map((_, j) => Math.random() * 1000),
            id: `${j}`,
            color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
        })),
    ),
};

function Perf() {
    const [config, setConfig] = React.useState({
        timeline: prepData.timelines[0],
        series: prepData.series[0],
        hooks: {
            onSelect: [
                ({from, to}) => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - onSelect. from=${from}, to=${to} \n`;
                },
            ],
            processed: [
                ({meta}) => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - processed. time=${meta.processTime}ms. Passed: ${tpassed}ms\n`;
                },
            ],
            inited: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - inited. Passed: ${tpassed}ms\n`;
                },
            ],
            dispose: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - dispose. Passed: ${tpassed}ms\n`;
                },
            ],
            resize: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - resize. Passed: ${tpassed}ms\n`;
                },
            ],
            stage: [
                ({stage}) => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - stage=${stage}. Passed: ${tpassed}ms\n`;
                },
            ],
            ready: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - ready. Passed: ${tpassed}ms\n`;
                },
            ],
            load: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace.innerHTML += ` - load. Passed: ${tpassed}ms\n`;
                },
            ],
        },
        legend: {
            behaviour: 'extended',
            position: 'bottom',
            show: false,
        },
    });

    const startPerf = React.useCallback(() => {
        let i = 1;
        let id = setInterval(() => {
            if (!prepData.timelines[i]) {
                return clearInterval(id);
            }
            hooktrace.innerHTML = '';
            setConfig((prev) => ({
                ...prev,
                timeline: prepData.timelines[i],
                series: prepData.series[i],
            }));
            i++;
        }, 300);
    }, [config, setConfig]);

    const random = React.useCallback(() => {
        const randIdx = Math.floor(Math.random() * prepData.timelines.length);
        setConfig((prev) => ({
            ...prev,
            timeline: prepData.timelines[randIdx],
            series: prepData.series[randIdx],
        }));
    }, [config, setConfig]);

    const toggleLegend = React.useCallback(() => {
        setConfig((prev) => ({
            ...prev,
            legend: {
                ...prev.legend,
                show: !prev.legend.show,
            }
        }))
    });

    return (
        <div className="container">
            <YagrComponent config={config} />
            <button onClick={startPerf}>Start</button>
            <button onClick={random}>Random</button>
            <button onClick={() => (hooktrace.innerHTML = '')}>Clear</button>
            <button onClick={toggleLegend}>Turn legend {config.legend.show ? 'off' : 'on'}</button>
        </div>
    );
}

function PerfOld() {
    const [config, setConfig] = React.useState({
        timeline: prepData.timelines[0],
        series: prepData.series[0],
        hooks: {
            onSelect: [
                ({from, to}) => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - onSelect. from=${from}, to=${to} \n`;
                },
            ],
            processed: [
                ({meta}) => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - processed. time=${meta.processTime}ms. Passed: ${tpassed}ms\n`;
                },
            ],
            inited: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - inited. Passed: ${tpassed}ms\n`;
                },
            ],
            dispose: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - dispose. Passed: ${tpassed}ms\n`;
                },
            ],
            resize: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - resize. Passed: ${tpassed}ms\n`;
                },
            ],
            stage: [
                ({stage}) => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - stage=${stage}. Passed: ${tpassed}ms\n`;
                },
            ],
            ready: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - ready. Passed: ${tpassed}ms\n`;
                },
            ],
            load: [
                () => {
                    const tpassed = Date.now() - tstart;
                    hooktrace2.innerHTML += ` - load. Passed: ${tpassed}ms\n`;
                },
            ],
        },
    });

    const startPerf = React.useCallback(() => {
        let i = 1;
        let id = setInterval(() => {
            if (!prepData.timelines[i]) {
                return clearInterval(id);
            }
            hooktrace2.innerHTML = '';
            setConfig((prev) => ({
                ...prev,
                timeline: prepData.timelines[i],
                series: prepData.series[i],
            }));
            i++;
        }, 300);
    }, [config, setConfig]);

    const random = React.useCallback(() => {
        const randIdx = Math.floor(Math.random() * prepData.timelines.length);
        setConfig((prev) => ({
            ...prev,
            timeline: prepData.timelines[randIdx],
            series: prepData.series[randIdx],
        }));
    }, [config, setConfig]);

    return (
        <div className="container">
            <YagrOld config={config} />
            <button onClick={startPerf}>Start</button>
            <button onClick={random}>Random</button>
            <button onClick={() => (hooktrace2.innerHTML = '')}>Clear</button>
        </div>
    );
}

ReactDOM.render(<Perf />, chart1);
ReactDOM.render(<PerfOld />, chart2);
