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

let c;
const createChart = (config, repeat) => {
    const d = document.createElement('div');
    d.classList.add('container');
    root.appendChild(d);
    let cfg = typeof config === 'function' ? config() : generateChart(config);

    if (cfg.settings && cfg.settings.theme === 'dark') {
       d.classList.add('dark');
    }
    console.log('cfg', cfg);
    let y = new Yagr(d, cfg);

    if (repeat) {
        setInterval(() => {
            y && y.dispose();
            cfg = typeof config === 'function' ? config() : generateChart(config);
            y = new Yagr(d, cfg);
        }, repeat);
    }

    if (!c) {
        c = true;
        document.getElementById('copy').onclick = () => {
            y.canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
        }
    }
}

// createChart({
//     length: 500, step: 50, count: 3, type: 'area', title: 'line: 500 pts / stepped',
//     config: {settings: {stacking: true}, legend: {show: true}},
//     fn: (idx, __, _, prev) => {
//         if (!idx) { return prev[idx] = getRandomInt(0, 10); }
//         return prev[idx] = prev[idx - 1] + (Math.random() > 0.5 ? 1 : 0.1) * getRandomInt(5, Math.random() > 0.5 ? 50 : 10);
//     }
// });

// createChart({
//     length: 500, step: DAY, count: 1, type: 'line', title: 'line: 500 pts / stepped',
//     config: {settings: {interpolation: 'left'}},
//     graph: (g) => {
//         g.color = 'var(--some-variable)'
//         return g;
//     },
//     fn: (idx, __, _, prev) => {
//         if (!idx) { return prev[idx] = getRandomInt(-100, 100); }
//         return prev[idx] = prev[idx - 1] + (Math.random() > 0.5 ? 1 : -1) * getRandomInt(5, Math.random() > 0.5 ? 50 : 10);
//     }
// });

// createChart({
//     length: 100, step: DAY, count: 20, type: 'line', title: 'line: 10000 pts / stepped',
//     config: {settings: {interpolation: 'left'}},
//     fn: (idx, __, _, prev) => {
//         if (!idx) { return prev[idx] = getRandomInt(-100, 100); }
//         return prev[idx] = prev[idx - 1] + (Math.random() > 0.5 ? 1 : -1) * getRandomInt(5, Math.random() > 0.5 ? 50 : 10);
//     }
// });


// createChart({
//     length: 50, step: DAY, count: 5, type: 'line', title: 'line: 50pts Sinusoid / smooth ',
//     fn: (idx, sidx) => {
//         return Math.abs(Math.sin(idx) * (sidx % 10));
//     },
//     graph: (g) => {
//         g.spanGaps = true;
//         return g
//     },
//     config: {settings: {interpolation: 'smooth'}}
// });

// createChart({
//     length: 50, step: DAY, count: 5, type: 'area', title: 'line: 50pts Sinusoid / smooth ',
//     fn: (idx, sidx) => {
//         return Math.abs(Math.sin(idx) * (sidx % 10));
//     },
//     graph: (g) => {
//         g.spanGaps = true;
//         return g
//     },
//     config: {settings: {interpolation: 'smooth'}}
// });

// createChart({
//     length: 30, step: DAY, count: 5, type: 'area', title: 'area: 30pts Sinusoid / smooth',
//     fn: (idx, sidx) => {
//         if (!sidx) {return 1};
//         const m = idx + sidx;
//         if (sidx !== 1 && m % 3 && m % 2) {return 'NIL'};
//         return Math.abs(Math.sin(idx) * (sidx % 10));
//     },
//     config: {
//         settings: {
//             interpolationValue: 'NIL'
//         },
//         cursor: {
//             snapToValues: 'left'
//         }
//     }
// });


createChart(() => ({
    chart: {type: 'area', width: 600, height: 300},
    timeline: [0, 1, 2],
    tooltip: {
        tracking: 'area',
    },
    cursor: {
        snapToValues: 'left',
        // markersSize: 12,
        y: {
            visible: true,
            style: 'dash grey 2px'
        }
    },
    legend: {show: true,},
    data: [{
        color: 'darkgreen',
        data: [10, 20, 30]
        // data: [1, 'NUN', 'NUN', 12, 'NUN', 10],
    }, {
        color: 'red',
        data: [5, 30, 22],
        // data: [1, 1, 2, '+inf', 1, 1],
        spanGaps: false,
    }, {
        color: 'rgba(32, 32, 100, 1)',
        data: [30, 2, 30],
        spanGaps: false,
    }],
    settings: {
        theme: 'light',
        stacking: true,
        drawOrder: ['series', 'axes'],
        interpolationValue: 'NUN',
        timeMultiplier: 0.001,
        nullValues: {
            '+inf': null
        },
    },
    axes: [
        {scale: 'x'},
        {scale: 'y', side: 'left'},
    ],
    scales: {
        x: {time: true},
        y: {},
    }
}));
