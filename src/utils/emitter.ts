type EventEmitterMethods<T extends Record<string, unknown>> = {
    on<K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void;
    emit<K extends keyof T>(eventName: K, data: T[K]): void;
    off<K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void;
};

export function createEmitter<T extends Record<string, unknown>>(): EventEmitterMethods<T> {
    const listeners: {[K in keyof T]?: ((data: T[K]) => void)[]} = {};

    return {
        on: function <K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void {
            if (!listeners[eventName]) {
                listeners[eventName] = [];
            }
            listeners[eventName]?.push(handler);
        },

        emit: function <K extends keyof T>(eventName: K, data: T[K]): void {
            listeners[eventName]?.forEach((handler) => handler(data));
        },

        off: function <K extends keyof T>(eventName: K, handler: (data: T[K]) => void): void {
            const handlers = listeners[eventName];
            if (handlers) {
                listeners[eventName] = handlers.filter((h) => h !== handler);
            }
        },
    };
}
