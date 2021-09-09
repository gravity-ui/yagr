function of(n, start = 1) {
    return new Array(n).fill('').map((_, i) => {
        return start - 1000 * (n - i);
    })
}
