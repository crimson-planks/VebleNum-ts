export type CompareResult = -1 | 0 | 1;
declare abstract class VNClass {
    static MAX_TERMS: number;
    abstract standardize(): void;
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
declare class Atom<V extends number> extends VNClass {
    value: V;
    /**
     * Class to handle storing independent numbers
     * @param value - The value of the atom
     */
    constructor(value: Atom<V> | V);
    standardize(): void;
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
declare class Sum extends VNClass {
    addends: (number | Product | Phi)[] & {
        0: Product | Phi;
    };
    /**
     * Class to handle sums of terms, terms are either number or Product or Phi
     */
    constructor(...args: (number | Product | Phi)[] & {
        0: Product | Phi;
    });
    standardize(): void;
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
declare class Product extends VNClass {
    ord: Phi;
    mult: number;
    /**
     * Class to handle products of an ordinal and a finite value
     * @param ord - Ordinal being multiplied
     * @param mult - Finite multiplier
     */
    constructor(ord: Phi, mult: number);
    standardize(): void;
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
declare class Phi extends VNClass {
    args: PhiArg[];
    /**
     * Class to handle sums of terms, terms are either Sum, Product or Phi
     * @param {...Sum|Product|Phi}
     */
    constructor(...args: PhiArg[]);
    static fromValue_noStandard(...args: PhiArg[]): Phi;
    standardize(): void;
    cmp(other: ConcreteVNSource): CompareResult;
    isFixedPoint(a: (PhiArg | '_')[]): boolean;
    lexcmp(other: string | Phi): 0 | 1 | -1;
    mul(other: ConcreteVNSource): ConcreteVN;
    pow(other: ConcreteVNSource): ConcreteVN;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
}
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
