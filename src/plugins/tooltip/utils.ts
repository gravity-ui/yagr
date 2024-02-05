export function getOptionValue<T>(option: T | {[key in string]: T}, scale: string): T {
    return (typeof option === 'object' ? (option as {[key in string]: T})[scale] : option) as T;
}
