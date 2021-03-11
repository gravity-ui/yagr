const NAMES = {
    size: ['height', 'width'],
    clientSize: ['clientHeight', 'clientWidth'],
    offsetSize: ['offsetHeight', 'offsetWidth'],
    maxSize: ['maxHeight', 'maxWidth'],
    before: ['top', 'left'],
    marginBefore: ['marginTop', 'marginLeft'],
    after: ['bottom', 'right'],
    marginAfter: ['marginBottom', 'marginRight'],
    scrollOffset: ['pageYOffset', 'pageXOffset'],
};

interface Props {
    size: 'height' | 'width';
    clientSize: 'clientHeight' | 'clientWidth';
    offsetSize: 'offsetHeight' | 'offsetWidth';
    maxSize: 'maxHeight' | 'maxWidth';
    before: 'top' | 'left';
    marginBefore: 'marginTop' | 'marginLeft';
    after: 'bottom' | 'right';
    marginAfter: 'marginBottom' | 'marginRight';
    scrollOffset: 'pageYOffset' | 'pageXOffset';
}

type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

type Coordinates = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

type Options = {
    bound?: Element | Range | Coordinates;
};

function normalizeRect(rect: DOMRect | ClientRect): Coordinates {
    return {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
    };
}

// eslint-disable-next-line complexity
export default function (
    overlay: HTMLElement,
    initialAnchor: Element | Range | Coordinates,
    side: Side = 'bottom',
    align: Align = 'center',
    options: Options = {},
) {
    let anchor;

    if (initialAnchor instanceof Element || initialAnchor instanceof Range) {
        anchor = normalizeRect(overlay.getBoundingClientRect());
    } else {
        anchor = initialAnchor;
    }

    const anchorRect = Object.assign({
        top: anchor.bottom || 0,
        bottom: anchor.top || 0,
        left: anchor.right || 0,
        right: anchor.left || 0,
    }, anchor);

    const boundRect = {
        top: 0,
        left: 0,
        bottom: window.innerHeight,
        right: window.innerWidth,
    };

    if (options.bound) {
        if (options.bound instanceof Element || options.bound instanceof Range) {
            options.bound = normalizeRect(options.bound.getBoundingClientRect());
        }
        Object.assign(boundRect, options.bound);
    }

    const overlayStyle = getComputedStyle(overlay);

    const {
        primary,
        secondary,
    } = Object.entries(NAMES).reduce((acc, [key, value]) => ({
        primary: {...acc.primary, [key]: value[side === 'top' || side === 'bottom' ? 0 : 1]},
        secondary: {...acc.secondary, [key]: value[side === 'top' || side === 'bottom' ? 1 : 0]},
    }), {primary: {}, secondary: {}}) as {
        primary: Props;
        secondary: Props;
    };

    overlay.style.position = 'absolute';
    overlay.style.maxWidth = '';
    overlay.style.maxHeight = '';

    // Constrain the maximum size of the popup along the secondary axis.
    const secondaryMarginBefore = parseInt(overlayStyle[secondary.marginBefore], 10);
    const secondaryMarginAfter = parseInt(overlayStyle[secondary.marginAfter], 10);
    const secondaryMargin = secondaryMarginBefore + secondaryMarginAfter;

    const secondaryMaxSize = boundRect[secondary.after] - boundRect[secondary.before] - secondaryMargin;
    const styledSecondaryMaxSize = parseInt(overlayStyle[secondary.maxSize], 10);

    if (!styledSecondaryMaxSize || secondaryMaxSize < styledSecondaryMaxSize) {
        overlay.style[secondary.maxSize] = secondaryMaxSize + 'px';
    }

    // Calculate the available room on either side of the anchor element. If
    // the size of the popup is more than is available on the given side, then we
    // will switch to the side with more room.
    const margin = parseInt(overlayStyle[primary.marginBefore], 10) + parseInt(overlayStyle[primary.marginAfter], 10);
    const roomBefore = anchorRect[primary.before] - boundRect[primary.before] - margin;
    const roomAfter = boundRect[primary.after] - anchorRect[primary.after] - margin;

    if ((side === primary.before && overlay[primary.offsetSize] > roomBefore)
        || (side === primary.after && overlay[primary.offsetSize] > roomAfter)) {
        side = roomBefore > roomAfter ? primary.before : primary.after;
    }

    // If the size of the popup exceeds the room available on this side, then
    // we will give the popup an explicit size so that it doesn't go off-screen.
    const primaryMaxSize = side === primary.before ? roomBefore : roomAfter;
    const styledPrimaryMaxSize = parseInt(overlayStyle[primary.maxSize], 10);

    if (!styledPrimaryMaxSize || primaryMaxSize < styledPrimaryMaxSize) {
        overlay.style[primary.maxSize] = primaryMaxSize + 'px';
    }

    // Set the position of the popup element along the primary axis using the
    // anchor's bounding rect. If we are working in the context of position:
    // absolute, then we will need to add the window's scroll position as well.
    const scrollOffset = window[primary.scrollOffset] as unknown as number;

    const boundPrimaryPos = (pos: number) => {
        return Math.max(
            boundRect[primary.before],
            Math.min(pos, boundRect[primary.after] - overlay[primary.offsetSize] - margin),
        );
    };

    if (side === primary.before) { // top or left
        overlay.style[primary.before] = (
            scrollOffset + boundPrimaryPos(anchorRect[primary.before] - overlay[primary.offsetSize] - margin)
        ) + 'px';
        overlay.style[primary.after] = 'auto';
    } else { // bottom or right
        overlay.style[primary.before] = (
            scrollOffset + boundPrimaryPos(anchorRect[primary.after])
        ) + 'px';
        overlay.style[primary.after] = 'auto';
    }

    // Set the position of the popup element along the secondary axis.
    const secondaryScrollOffset = window[secondary.scrollOffset] as unknown as number;

    const boundSecondaryPos = (pos: number) => {
        return Math.max(
            boundRect[secondary.before],
            Math.min(pos, boundRect[secondary.after] - overlay[secondary.offsetSize] - secondaryMargin),
        );
    };

    switch (align) {
        case 'start':
            overlay.style[secondary.before] = (
                secondaryScrollOffset + boundSecondaryPos(anchorRect[secondary.before] - secondaryMarginBefore)
            ) + 'px';
            overlay.style[secondary.after] = 'auto';
            break;

        case 'end':
            overlay.style[secondary.before] = 'auto';
            overlay.style[secondary.after] = (
                secondaryScrollOffset +
                boundSecondaryPos(
                    document.documentElement[secondary.clientSize] -
                    anchorRect[secondary.after] - secondaryMarginAfter,
                )
            ) + 'px';
            break;

        default: {
            const anchorSize = anchorRect[secondary.after] - anchorRect[secondary.before];
            overlay.style[secondary.before] = (
                secondaryScrollOffset +
                boundSecondaryPos(
                    anchorRect[secondary.before] + anchorSize / 2 -
                    overlay[secondary.offsetSize] / 2 - secondaryMarginBefore,
                )
            ) + 'px';
            overlay.style[secondary.after] = 'auto';
        }
    }

    overlay.dataset.side = side;
    overlay.dataset.align = align;
}
