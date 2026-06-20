export type CompareResult = -1 | 0 | 1;
declare abstract class VNClass {
    static MAX_TERMS: number;
    abstract toStandardized(): ConcreteVN;
    clone<T extends VNClass>(this: T): T;
    add(other: number | ConcreteVN): ConcreteVN;
    abstract mul(other: ConcreteVNSource): ConcreteVN;
    abstract pow(other: ConcreteVNSource): ConcreteVN;
    abstract cmp(other: ConcreteVNSource): CompareResult;
    static add(a: number | ConcreteVN, b: number | ConcreteVN): ConcreteVN;
    static mul(a: number | ConcreteVN, b: number | ConcreteVN): ConcreteVN;
    static pow(a: number | ConcreteVN, b: number | ConcreteVN): ConcreteVN;
    static cmp(a: number | ConcreteVN, b: number | ConcreteVN): CompareResult;
    gt(other: ConcreteVNSource): boolean;
    lt(other: ConcreteVNSource): boolean;
    gte(other: ConcreteVNSource): boolean;
    lte(other: ConcreteVNSource): boolean;
    eq(other: ConcreteVNSource): boolean;
    neq(other: ConcreteVNSource): boolean;
}
type ConcreteVN = Atom<number> | Sum | Product | Phi;
type ConcreteVNSource = ConcreteVN | number | string;
declare function sumVN(...addends: (number | ConcreteVN)[]): ConcreteVN;
export declare class Atom<V extends number> extends VNClass {
    value: V;
    /**
     * Class to handle storing independent numbers
     * @param value - The value of the atom
     */
    constructor(value: Atom<V> | V);
    toStandardized(): Atom<number>;
    static wrapIfNumber<T extends ConcreteVN>(v: number | T): Atom<number> | T;
    static unwrap<T extends number>(a: Atom<T> | T): T;
    add(other: ConcreteVNSource): ConcreteVN;
    mul(other: ConcreteVNSource): ConcreteVN;
    pow(other: ConcreteVNSource): ConcreteVN;
    cmp(other: ConcreteVNSource): CompareResult;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
}
export declare class Sum extends VNClass {
    addends: (number | Product | Phi)[] & {
        0: Product | Phi;
    };
    /**
     * Class to handle sums of terms, terms are either number or Product or Phi
     */
    constructor(...args: (number | Product | Phi)[] & {
        0: Product | Phi;
    });
    toStandardized(): ConcreteVN;
    cmp(other: ConcreteVNSource): CompareResult;
    mul(other: ConcreteVNSource): ConcreteVN;
    pow(other: ConcreteVNSource): ConcreteVN;
    get terms(): number;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
    [Symbol.iterator](): ArrayIterator<number | Product | Phi>;
}
declare function productVN(ord: number | Atom<number> | Product | Phi, mult: number | Atom<number>): Atom<number> | Product | Phi;
export declare class Product extends VNClass {
    ord: Phi;
    mult: number;
    /**
     * Class to handle products of an ordinal and a finite value
     * @param ord - Ordinal being multiplied
     * @param mult - Finite multiplier
     */
    constructor(ord: Phi, mult: number);
    toStandardized(): ConcreteVN;
    cmp(other: ConcreteVNSource): CompareResult;
    mul(other: ConcreteVNSource): ConcreteVN;
    pow(other: ConcreteVNSource): ConcreteVN;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
}
type PhiArg = number | Atom<number> | Sum | Product | Phi;
declare function phiVN(...args: PhiArg[]): Atom<number> | Phi;
declare function phiVN(...args: [0]): Atom<1>;
export declare class Phi extends VNClass {
    args: PhiArg[];
    /**
     * Class to handle sums of terms, terms are either Sum, Product, Phi, or number
     */
    constructor(...args: PhiArg[]);
    static fromValue_noStandard(...args: PhiArg[]): Phi;
    toStandardized(): Atom<number> | Phi;
    cmp(other: ConcreteVNSource): CompareResult;
    /**
     * is `this` fixed point of a?
     *
     * Substitute the argument '\_' of `a` with `this`, then check if the result is equal to `this`
     *
     * (example) if a === [1,0,0,'_',0] -> returns true iff phi(1,0,0,this,0) === this
     */
    isFixedPoint(a: (PhiArg | '_')[]): boolean;
    lexcmp(other: string | Phi): 0 | 1 | -1;
    mul(other: ConcreteVNSource): ConcreteVN;
    pow(other: ConcreteVNSource): ConcreteVN;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
    [Symbol.iterator](): ArrayIterator<PhiArg>;
}
type Operator = '+' | '*' | '^';
type ParserToken = {
    type: 0 | 1;
    value: string;
    args: number;
} | {
    type: 2;
    value: Operator;
    args: number;
};
export declare const Parser: {
    TYPES: Readonly<{
        readonly LITERAL: 0;
        readonly IDENTIFIER: 1;
        readonly OPERATOR: 2;
    }>;
    isNumber(char: string): boolean;
    isOperator(char: string): char is Operator;
    tokenize(str: string): ParserToken[];
    ASSOC: {
        readonly "+": "left";
        readonly "*": "left";
        readonly "^": "right";
    };
    PREC: {
        readonly "+": 2;
        readonly "*": 3;
        readonly "^": 4;
    };
    parse(tokens: ParserToken[]): ParserToken[];
    fixUnaryRegExp: RegExp;
    fixUnary(str: string): string;
    fromString(str: string): ConcreteVN;
    handleParens(str: string, sub?: boolean, replace?: string | boolean): string | true;
    needsParens(str: string, sub?: boolean): boolean;
};
declare const VebleNum: ((input: unknown) => ConcreteVN) & {
    fromString: (str: string) => ConcreteVN;
    clone<T>(input: T): T;
    isEpsilon(): boolean;
    isZeta(): boolean;
    isEta(): boolean;
    isGamma(): boolean;
    epsilon(n: ConcreteVNSource): Atom<number> | Phi;
    zeta(n: ConcreteVNSource): Atom<number> | Phi;
    eta(n: ConcreteVNSource): Atom<number> | Phi;
    Gamma(n: ConcreteVNSource): Atom<number> | Phi;
    sum: typeof sumVN;
    product: typeof productVN;
    phi: typeof phiVN;
    add(a: number | ConcreteVN, b: number | ConcreteVN): ConcreteVN;
    mul(a: number | ConcreteVN, b: number | ConcreteVN): ConcreteVN;
    pow(a: number | ConcreteVN, b: number | ConcreteVN): ConcreteVN;
    cmp(a: number | ConcreteVN, b: number | ConcreteVN): CompareResult;
    zero: Atom<0>;
    one: Atom<1>;
    w: Phi;
    omega: Phi;
    Least_Transfinite_Ordinal: Phi;
    e0: Phi;
    epsilon0: Phi;
    Small_Cantor_Ordinal: Phi;
    z0: Phi;
    zeta0: Phi;
    Cantor_Ordinal: Phi;
    n0: Phi;
    eta0: Phi;
    G0: Phi;
    Gamma0: Phi;
    Feferman_Schutte_Ordinal: Phi;
    Ackermann: Phi;
};
export default VebleNum;
