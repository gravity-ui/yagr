const m = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
});

global.window = {
    matchMedia: m,
};
global.matchMedia = m;
HTMLCanvasElement.prototype.getContext = () => {};
global.ResizeObserver = class ResizeObserver {
    observe() {}
};
