const Yagr = window.yagr.default;

const dayFormatter = (_, ticks) => {
    return ticks.map((rawValue) => {
        return moment(rawValue).format('DD.MM.YYYY');
    });
};

const hourFormatter = (_, ticks) => {
    return ticks.map((rawValue) => {
        return moment(rawValue).format('HH:mm:ss');
    });
};

const MINUTE = 60 * 1000;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateData = ({
    length = 10,
    step = DAY,
    count = 3,
    fn = (_, __, rest) => getRandomInt(rest.range[0], rest.range[1]),
    graph = (x) => x,
    ...rest
}) => {
    const now = Date.now();
    const timeline = new Array(length).fill(null).map((_, i) => {
        return now - (length - i) * step;
    });

    const series = new Array(count).fill(null).map((_, i) => {
        return graph({
            id: i,
            name: 'Serie ' + i,
            color: `#${randomColor()}`,
            visible: true,
            data: new Array(length).fill(null).map((_, idx, prev) => fn(idx, i, rest, prev)),
        });
    });

    return {timeline, series};
};

const generateChart = ({
    type,
    title,
    config = {},
    length = 10,
    step = DAY,
    count = 3,
    range = [0, 100],
    xAxisFormatter = dayFormatter,
    fn,
    graph,
}) => {
    const {timeline, series} = generateData({length, step, count, range, fn, graph});

    const result = {
        timeline,
        data: series,
        chart: {
            ...(config.chart || {}),
            type,
            width: 700,
            height: 300,
        },
        title: {
            text: title,
        },
        axes: [
            {
                scale: 'x',
                values: xAxisFormatter,
            },
        ],
        scales: {
            ...(config.scales || {}),
            x: {
                time: true,
            },
            y: {
                type: 'linear',
                range: 'nice',
            },
        },
        cursor: {
            ...(config.cursor || {}),
            x: {
                visible: true,
                style: 'solid 2px rgba(230, 2, 7, 0.3)',
            },
        },
        settings: {
            ...(config.settings || {}),
            stacking: type === 'area' || type === 'column',
        },
        tooltip: {
            ...(config.tooltip || {}),
            enabled: true,
            total: true,
            boundClassName: '.wrapper',
            tracking: type === 'area' || type === 'column' ? 'area' : 'sticky',
        },
        legend: {
            ...(config.legend || {}),
        },
    };

    return result;
};


const createChart = (config) => {
    const d = document.createElement('div');
    d.classList.add('container');
    root.appendChild(d);
    const cfg = typeof config === 'function' ? config() : generateChart(config);
    console.log('cfg', cfg);
    if (cfg.settings && cfg.settings.theme === 'dark') {
       d.classList.add('dark');
    }
    new Yagr(d, cfg);
}

createChart({
    length: 500, step: DAY, count: 2, type: 'line', title: 'line: 500 pts / stepped',
    config: {settings: {interpolation: 'left'}},
    fn: (idx, __, _, prev) => {
        if (!idx) { return prev[idx] = getRandomInt(-100, 100); }
        return prev[idx] = prev[idx - 1] + (Math.random() > 0.5 ? 1 : -1) * getRandomInt(5, Math.random() > 0.5 ? 50 : 10);
    }
});

createChart({
    length: 100, step: DAY, count: 20, type: 'line', title: 'line: 10000 pts / stepped',
    config: {settings: {interpolation: 'left'}},
    fn: (idx, __, _, prev) => {
        if (!idx) { return prev[idx] = getRandomInt(-100, 100); }
        return prev[idx] = prev[idx - 1] + (Math.random() > 0.5 ? 1 : -1) * getRandomInt(5, Math.random() > 0.5 ? 50 : 10);
    }
});


createChart({
    length: 50, step: DAY, count: 5, type: 'line', title: 'line: 50pts Sinusoid / smooth ',
    fn: (idx, sidx) => {
        return Math.abs(Math.sin(idx) * (sidx % 10));
    },
    graph: (g) => {
        g.spanGaps = true;
        return g
    },
    config: {settings: {interpolation: 'smooth'}}
});

createChart({
    length: 50, step: DAY, count: 5, type: 'area', title: 'line: 50pts Sinusoid / smooth ',
    fn: (idx, sidx) => {
        return Math.abs(Math.sin(idx) * (sidx % 10));
    },
    graph: (g) => {
        g.spanGaps = true;
        return g
    },
    config: {settings: {interpolation: 'smooth'}}
});

createChart({
    length: 30, step: DAY, count: 5, type: 'area', title: 'area: 30pts Sinusoid / smooth',
    fn: (idx, sidx) => {
        if (!sidx) {return 1};
        const m = idx + sidx;
        if (sidx !== 1 && m % 3 && m % 2) {return 'NIL'};
        return Math.abs(Math.sin(idx) * (sidx % 10));
    },
    config: {
        settings: {
            interpolationValue: 'NIL'
        },
        cursor: {
            snapToValues: 'left'
        }
    }
});


createChart(() => {
    return {
        timeline: [0, 100, 200, 300, 400],
        data: [
            {name: 'First', data: [1, 2, 3, 4, 5], color: 'red'},
            {name: 'Second', data: [2, 4, 1, 2, 0], color: 'green'},
            {name: 'Third', data: [0, 2, 2, 3, 1], color: 'blue'},
        ],
        axes: [
            {
                scale: 'x',
                values: (u, i) => i,
                plotLines: [{
                    color: 'rgba(10, 250, 12, 0.3)',
                    value: [100, 150],
                }, {
                    color: 'rgba(242, 10, 23, 0.3)',
                    value: 310,
                    width: 10,
                }]
            },
            {
                scale: 'y',
                plotLines: [{
                    color: 'rgba(12, 33, 233, 0.3)',
                    value: 0.93,
                    width: 20,
                }]
            }
        ],
        settings: {
            locale: {
                'legend.hide-all-lines': 'Az összes vonal elrejtése',
                'legend.show-all-lines': 'Az összes vonal megjelenítése',
            }
        },
        legend: {
            show: true,
        },
    };
});

// // createChart(() => {
// //     return {
// //         timeline: new Array(7).fill('').map((_, i) => Date.now() + 1000 * i),
// //         chart: {
// //             type: 'area',
// //             padding: [12, 0, 10, 10]
// //         },
// //         data: [
// //             {
// //                 name: 'Serie 1',
// //                 data: [1, 2, 1, 2, 1, 2, 1, 2],
// //                 color: `green`,
// //             },
// //             {
// //                 name: 'Serie 2',
// //                 data: [1, 'NIL', 0, 'NIL', 1, 'NIL', 1, 'NIL'],
// //                 color: `red`,
// //             },
// //         ],
// //         settings: {
// //             stacking: true,
// //             interpolationValue: 'NIL',
// //         },
// //         axes: [
// //             {
// //                 scale: 'x',
// //                 values: hourFormatter,
// //             },
// //             {
// //                 scale: 'y',
// //                 // label: 'Label'
// //             }
// //         ],
// //         scales: {
// //             x: {
// //                 time: true,
// //             },
// //             y: {
// //                 type: 'linear',
// //                 range: 'nice',
// //                 min: 0,
// //                 max: 4
// //             },
// //         },
// //         cursor: {
// //             snapToValues: 'left',
// //         },
// //         tooltip: {
// //             enabled: true,
// //         },
// //         legend: {
// //             show: true,
// //         }
// //     }
// // }) 
