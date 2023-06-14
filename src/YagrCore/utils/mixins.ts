import Yagr from '..';

type YagrConstructor = new (...args: any[]) => Yagr;
type YMixin = new () => unknown;

export function applyMixins(derivedCtor: YagrConstructor, constructors: YMixin[]) {
    const inits: (() => void)[] = [];

    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null),
            );
        });

        if (baseCtor.prototype.initMixin) {
            inits.push(baseCtor.prototype.initMixin);
        }
    });

    derivedCtor.prototype.initMixins = function () {
        inits.forEach((init) => init.call(this));
    };
}
