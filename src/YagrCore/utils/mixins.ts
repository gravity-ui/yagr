export function applyMixins(derivedCtor: any, constructors: any[]) {
    const inits: (() => void)[] = [];

    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null),
            );

            if (baseCtor.prototype.init) {
                inits.push(baseCtor.prototype.init);
            }
        });
    });
    debugger;
    derivedCtor.prototype.initMixins = function () {
        debugger;
        inits.forEach((init) => init.call(this));
    };
}
