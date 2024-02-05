export type EventEmitterMethods<T extends Record<string, unknown>> = {
    on<K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void;
    emit<K extends keyof T>(eventName: K, data: T[K]): void;
    off<K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void;
    offAll(): void;
};

export function wrapEmitter<T extends Record<string, unknown>, O>(obj: O): EventEmitterMethods<T> & O {
    const listeners: {[K in keyof T]?: ((data: T[K]) => void)[]} = {};

    return {
        ...obj,
        on: function <K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void {
            if (!listeners[eventName]) {
                listeners[eventName] = [];
            }
            listeners[eventName]?.push(handler);
        },
        off: function <K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void {
            const handlers = listeners[eventName];
            if (handlers) {
                listeners[eventName] = handlers.filter((h) => h !== handler);
            }
        },
        emit: function <K extends keyof T>(eventName: K, data: T[K]): void {
            listeners[eventName]?.forEach((handler) => handler(data));
        },
        offAll: function (): void {
            for (const eventName in listeners) {
                if (Object.prototype.hasOwnProperty.call(listeners, eventName)) {
                    listeners[eventName] = [];
                }
            }
        },
    };
}
