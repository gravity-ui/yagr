import React from 'react';
import ReactDOM from 'react-dom';
import YagrComponent, {useTooltipState} from '../../../src/react';

const CustomTooltip = React.forwardRef(function CustomTooltip(props, ref) {
    const [tState, setTState] = React.useState({
        state: {
            visible: false,
        },
    });

    const onChange = React.useCallback(
        (state) => {
            setTState((prev) => ({...prev, ...state}));
        },
        [setTState],
    );

    React.useImperativeHandle(ref, () => ({
        onChange,
    }));

    if (tState.state.visible === false || !tState.data) {
        return null;
    }

    const styles = {
        left: tState.data.anchor.left,
        top: tState.data.anchor.top,
    };

    return (
        <div className="custom-tooltip" style={styles}>
            React Tooltip:
            <div className="custom-tooltip__content">X: {tState.data.x}</div>
            {tState.data.scales.map(({rows, scale}) => (
                <div>
                    <strong>Scale: {scale}</strong>

                    <div>
                        {rows.map(({id, active, name, value, color}) => (
                            <div key={id} style={{color}}>
                                {active ? (
                                    <strong>
                                        {name} = {value}
                                    </strong>
                                ) : (
                                    name + ' = ' + value
                                )}
                            </div>
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
        timeline: new Array(500).fill(0).map((_, i) => (i + 5) * 500 * 20),
        series: new Array(20).fill(0).map((_, i) => ({
            id: i.toString(),
            name: 'Series ' + i,
            color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
            data: new Array(500).fill(0).map((_, j) => Math.sin(j / 50 + i * 2)),
        })),
        tooltip: {
            virtual: true,
        },
    };

    useTooltipState(yagrRef, tooltipRef);

    return (
        <div className="container">
            <YagrComponent id="tooltip-test" config={config} ref={yagrRef} />
            <CustomTooltip ref={tooltipRef} />
        </div>
    );
}

ReactDOM.render(<TooltipExample />, window.document.getElementById('chart'));
