export const px = (x: number) => x + 'px';

export const html = <T extends HTMLElement>(
    tag: string,
    attrs: Record<string, string | Record<string, string>> = {},
    content?: string | HTMLElement,
): T => {
    const el = document.createElement(tag) as T;
    Object.keys(attrs).forEach((key) => {
        const attr = attrs[key];
        el.setAttribute(
            key,
            typeof attr === 'object'
                ? Object.entries(attr)
                      .map(([a, b]) => `${a}:${b}`)
                      .join(';')
                : attr,
        );
    });
    if (content) {
        if (typeof content === 'string') {
            el.innerHTML = content;
        } else {
            el.appendChild(content);
        }
    }

    return el;
};
