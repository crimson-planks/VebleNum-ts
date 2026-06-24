//generalizing arithmetic between non-transfinite numbers
/** symbol for accessing arithmetic functions */
export const nonTransfiniteNumberArithmeticSymbol = Symbol("nonTransfiniteNumberArithmeticSymbol");
/** Check if a value has the nonTransfiniteNumberArithmetic protocol*/
export function isNonTransfiniteNumber(x) {
    return x !== null && typeof x === 'object' && nonTransfiniteNumberArithmeticSymbol in x;
}
Object.defineProperty(Number.prototype, nonTransfiniteNumberArithmeticSymbol, {
    value: {
        add(a, b) { return a + b; },
        mul(a, b) { return a * b; },
        pow(a, b) { return a ** b; },
        cmp(a, b) { return a === b ? 0 : a > b ? 1 : -1; },
    },
    configurable: true, enumerable: false, writable: true
});
Object.defineProperty(BigInt.prototype, nonTransfiniteNumberArithmeticSymbol, {
    value: {
        add(a, b) { return a + b; },
        mul(a, b) { return a * b; },
        pow(a, b) { return a ** b; },
        cmp(a, b) { return a === b ? 0 : a > b ? 1 : -1; },
    },
    configurable: true, enumerable: false, writable: true
});
