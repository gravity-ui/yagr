import React from 'react';
import ReactDOM from 'react-dom';
import YagrComponent from '../../../src/react';

const CustomTooltip = React.forwardRef(function CustomTooltip(props, ref) {
    const [tState, setTState] = React.useState({
        visible: false,
    });

    const onChange = React.useCallback((state) => {
        setTState((prev) => ({...prev, ...state}));
    }, [setTState]);

    React.useImperativeHandle(ref, () => ({
        onChange,
    }));

    console.log('CustomTooltip', tState);
    if (tState.visible === false || !tState.data) {
        return null;
    }

    const styles = {
        left: tState.data.anchor.left,
        top: tState.data.anchor.top
    };

    return (
        <div className="custom-tooltip" style={styles}>
            React Tooltip: 
            <div className="custom-tooltip__content">
                X: {tState.data.x}
            </div>
            {tState.data.scales.map(({rows, scale}) => (
                <div>
                    <strong>Scale: {scale}</strong>

                    <div>
                        {rows.map(({id, name, value, color}) => (
                            <div key={id} style={{color}}>{name} = {value}</div>
                        ))}
                    </div>
                </div>
            ))}

        </div>
    );
});

function TooltipExample() {
    const yagrRef = React.useRef();
    const tooltipRef = React.useRef();

    const config = {
        timeline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        series: [
            {
                id: '1',
                name: 'Series 1',
                color: 'red',
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            },
            {
                id: '2',
                name: 'Series 2',
                color: 'magenta',
                data: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
            },
        ],
        tooltip: {
            virtual: true,
        },
    };

    React.useEffect(() => {
        if (!yagrRef.current || !tooltipRef.current) {
            return;
        }

        const yagr = yagrRef.current.yagr();

        if (!yagr) {
            return;
        }


        yagr.plugins.tooltip.on('render', (elem, data, ...rest) => {
            tooltipRef.current.onChange({...data, visible: true});
        });

        yagr.plugins.tooltip.on('show', () => {
            tooltipRef.current.onChange({visible: true});
        });

        yagr.plugins.tooltip.on('hide', () => {
            tooltipRef.current.onChange({visible: false});
        });
    }, [yagrRef.current]);

    return (
        <div className="container">
            <YagrComponent id="tooltip-test" config={config} ref={yagrRef} />
            <CustomTooltip ref={tooltipRef} />
        </div>
    );
}

ReactDOM.render(<TooltipExample />, window.document.getElementById('chart'));
