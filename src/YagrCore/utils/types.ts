import type {Scale as uScale, DrawOrderKey as uDrawOrderKey, Axis as uAxis} from 'uplot';

export const DrawOrderKey: Record<keyof typeof uDrawOrderKey, uDrawOrderKey> = {
    Series: 'series' as uDrawOrderKey.Series,
    Axes: 'axes' as uDrawOrderKey.Axes,
};

interface YScale {
    Distr: Record<keyof typeof uScale.Distr, uScale.Distr>;
}

export const Scale: YScale = {
    Distr: {
        Linear: 1 as uScale.Distr.Linear,
        Ordinal: 2 as uScale.Distr.Ordinal,
        Logarithmic: 3 as uScale.Distr.Logarithmic,
        ArcSinh: 4 as uScale.Distr.ArcSinh,
    },
};

interface YAxis {
    Side: Record<keyof typeof uAxis.Side, uAxis.Side>;
    Align: Record<keyof typeof uAxis.Align, uAxis.Align>;
}

export const Axis: YAxis = {
    Side: {
        Top: 0 as uAxis.Side.Top,
        Right: 1 as uAxis.Side.Right,
        Bottom: 2 as uAxis.Side.Bottom,
        Left: 3 as uAxis.Side.Left,
    },
    Align: {
        Right: 0 as uAxis.Align.Right,
        Left: 1 as uAxis.Align.Left,
    },
};
