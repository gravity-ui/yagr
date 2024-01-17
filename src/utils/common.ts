export function debounce<T extends Array<unknown> = []>(func: (...args: T) => void, timeout = 300) {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: T) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), timeout);
    };
}

export function isNil(v: unknown): v is null | undefined {
    return v === null || v === undefined;
}

export const microTask =
    typeof queueMicrotask === 'undefined' ? (fn: () => void) => Promise.resolve().then(fn) : queueMicrotask;
