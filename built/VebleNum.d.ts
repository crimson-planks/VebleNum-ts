/** symbol for accessing non-transfinite arithmetic functions */
export declare const ntfnSymbol: unique symbol;
/** Object for non-transfinite number arithmetic */
export type Ntfna<T> = {
    /** fromNumber */
    fromNumber(n: number): T;
    /** fromValue */
    fromValue(v: unknown): T;
    /** fromValue_noAlloc */
    fromValue_noAlloc(v: unknown): T;
    /** fromString */
    fromString(s: string): T;
    is(v: unknown): v is T;
    /** isFinite */
    isFinite(v: T): boolean;
    /** addition */
    add(a: T, b: T): T;
    /** returns the successor of the value provided */
    succ(val: T): T;
    /** returns the predeccessor of the value provided */
    pred(val: T): T;
    /** multiplication */
    mul(a: T, b: T): T;
    /** exponentiation */
    pow(a: T, b: T): T;
    /** comparison. returns 1 if a>b, returns 0 if a===b, returns -1 if a<b */
    cmp(a: T, b: T): CompareResult;
    /** returns `true` if a===b */
    eq(a: T, b: T): boolean;
    n0: T;
    n1: T;
    n2: T;
    n3: T;
};
export declare const numberNtfna: Ntfna<number>;
export declare const bigintNtfna: Ntfna<bigint>;
export type CompareResult = -1 | 0 | 1;
export declare class VN_TooManyTermsError extends Error {
    constructor();
}
export declare class VN_ParserError extends Error {
    constructor(message?: string);
}
/**
 * Class that all the VebleNum objects have in the prototype chain.
 *
 * Users of the library should not create instances of this class or inherit from this class
 */
export declare abstract class VNClass<V extends {}> {
    static MAX_TERMS: number;
    static DEBUG: boolean;
    abstract toStandardized(): ConcreteVN<V>;
    abstract [ntfnSymbol]: Ntfna<V>;
    clone<T extends VNClass<V>>(this: T): T;
    add(other: V | ConcreteVN<V>): ConcreteVN<V>;
    abstract mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    abstract pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    abstract cmp(other: ConcreteVNSource<V>): CompareResult;
    gt(other: ConcreteVNSource<V>): boolean;
    lt(other: ConcreteVNSource<V>): boolean;
    gte(other: ConcreteVNSource<V>): boolean;
    lte(other: ConcreteVNSource<V>): boolean;
    eq(other: ConcreteVNSource<V>): boolean;
    neq(other: ConcreteVNSource<V>): boolean;
    abstract toString(customToStringFunc?: (v: V) => string): string;
    abstract toMixed(customToStringFunc?: (v: V) => string): string;
    abstract toHTML(customToStringFunc?: (v: V) => string): string;
}
export declare function isConcreteVN<V extends {}>(x: unknown): x is ConcreteVN<V>;
export type ConcreteVN<T extends {}> = Atom<T> | Sum<T> | Product<T> | Phi<T>;
export type ConcreteVNSource<T extends {}> = ConcreteVN<T> | T | string;
/**
 * Calculates the sum of addends.
 */
export declare function sumVN<V extends {}>(ntfna: Ntfna<V>, ...addends: (V | ConcreteVN<V>)[]): ConcreteVN<V>;
export declare class Atom<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: Ntfna<V>;
    value: V;
    /**
     * Class to handle storing independent numbers
     * @param value - The value of the atom
     */
    constructor(ntfna: Ntfna<V>, value: Atom<V> | V);
    static fromValue<V extends {}>(ntfna: Ntfna<V>, value: Atom<V> | V): void;
    toStandardized(): Atom<V>;
    static wrapIfNumber<V extends {}>(ntfna: Ntfna<V>, v: V | ConcreteVN<V>): ConcreteVN<V>;
    static unwrapIfAtom<V extends {}>(a: Atom<V> | V): V;
    add(other: ConcreteVNSource<V>): ConcreteVN<V>;
    mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    cmp(other: ConcreteVNSource<V>): CompareResult;
    toString(customToStringFunc?: (v: V) => string): string;
    toMixed(customToStringFunc?: (v: V) => string): string;
    toHTML(customToStringFunc?: (v: V) => string): string;
}
export declare class Sum<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: Ntfna<V>;
    addends: (V | Product<V> | Phi<V>)[] & {
        0: Product<V> | Phi<V>;
    };
    /**
     * Class to handle sums of terms, terms are either number or Product or Phi
     */
    constructor(...args: (V | Product<V> | Phi<V>)[] & {
        0: Product<V> | Phi<V>;
    });
    static fromValue: typeof sumVN;
    toStandardized(): ConcreteVN<V>;
    cmp(other: ConcreteVNSource<V>): CompareResult;
    mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    get terms(): number;
    toString(customToStringFunc?: (v: V) => string): string;
    toMixed(customToStringFunc?: (v: V) => string): string;
    toHTML(customToStringFunc?: (v: V) => string): string;
    [Symbol.iterator](): ArrayIterator<V | Product<V> | Phi<V>>;
}
/**
 * Calculate the product of an ordinal and a finite numeric
 */
export declare function productVN<V extends {}>(ntfna: Ntfna<V>, ord: V | Atom<V> | Product<V> | Phi<V>, mult: V | Atom<V>): Atom<V> | Product<V> | Phi<V>;
export declare class Product<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: Ntfna<V>;
    ord: Phi<V>;
    mult: V;
    /**
     * Class to handle products of an ordinal and a finite value
     * @param ntfna
     * @param ord - Ordinal being multiplied
     * @param mult - Finite multiplier
     */
    constructor(ntfna: Ntfna<V>, ord: Phi<V>, mult: V);
    static fromValue: typeof productVN;
    toStandardized(): ConcreteVN<V>;
    cmp(other: ConcreteVNSource<V>): CompareResult;
    mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    toString(customToStringFunc?: (v: V) => string): string;
    toMixed(customToStringFunc?: (v: V) => string): string;
    toHTML(customToStringFunc?: (v: V) => string): string;
}
type PhiArg<V extends {}> = V | Atom<V> | Sum<V> | Product<V> | Phi<V>;
/**
 * Calculates and standardizes phi of args
 */
export declare function phiVN<V extends {}>(ntfna: Ntfna<V>, ...args: PhiArg<V>[]): ConcreteVN<V>;
export declare class Phi<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: Ntfna<V>;
    args: PhiArg<V>[];
    /**
     * Class to handle sums of terms, terms are either Sum, Product, Phi, or number
     */
    constructor(ntfna: Ntfna<V>, ...args: PhiArg<V>[]);
    static fromValue: typeof phiVN;
    static fromValue_noStandardize<V extends {}>(ntfna: Ntfna<V>, ...args: PhiArg<V>[]): Phi<V>;
    toStandardized(): ConcreteVN<V>;
    cmp(other: ConcreteVNSource<V>): CompareResult;
    /**
     * is `this` fixed point of a?
     *
     * Substitute the argument '\_' of `a` with `this`, then check if the result is equal to `this`
     *
     * (example) if a === [1,0,0,'_',0] -> returns true iff phi(1,0,0,this,0) === this
     */
    isFixedPoint(a: (PhiArg<V> | '_')[]): boolean;
    lexcmp(other: string | Phi<V>): 0 | 1 | -1;
    mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    toString(customToStringFunc?: (v: V) => string): string;
    toMixed(customToStringFunc?: (v: V) => string): string;
    toHTML(customToStringFunc?: (v: V) => string): string;
    [Symbol.iterator](): ArrayIterator<PhiArg<V>>;
}
export declare function convertNumberType<TOld extends {}, TNew extends {}>(oldNtfna: Ntfna<TOld>, newNtfna: Ntfna<TNew>, ord: TOld | ConcreteVN<TOld>, convertFunction: (v: TOld) => TNew): ConcreteVN<TNew>;
type Operator = '+' | '*' | '^' | ',' | '(' | ')' | '[' | ']';
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
    addParensToUnaryOperator(str: string): string;
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
    fromString<V extends {}>(ntfna: Ntfna<V>, str: string, customFromStringFunc?: (v: string) => V): ConcreteVN<V>;
    handleParens(str: string, sub?: boolean, replace?: string | false): string;
    needsParens(str: string, sub?: boolean): boolean;
    handleNumericBrackets(numericStr: string): string;
};
/**
 * Creates the appropriate VNClass instance.
 *
 * may be called with or without `new`
 */
declare const VebleNum: (<V extends {}>(ntfna: Ntfna<V>, input: unknown) => ConcreteVN<V>) & {
    fromString: <V extends {}>(ntfna: Ntfna<V>, str: string, customFromStringFunc?: (v: string) => V) => ConcreteVN<V>;
    fromValue_noAlloc<V extends {}>(ntfna: Ntfna<V>, v: ConcreteVNSource<V>): ConcreteVN<V>;
    clone<T>(input: T): T;
    isEpsilon<V extends {}>(ntfna: Ntfna<V>, ord: ConcreteVN<V>): boolean;
    isZeta<V extends {}>(ntfna: Ntfna<V>, ord: ConcreteVN<V>): boolean;
    isEta<V extends {}>(ntfna: Ntfna<V>, ord: ConcreteVN<V>): boolean;
    isGamma<V extends {}>(ntfna: Ntfna<V>, ord: ConcreteVN<V>): boolean;
    epsilon<V extends {}>(ntfna: Ntfna<V>, n: ConcreteVNSource<V>): ConcreteVN<V>;
    zeta<V extends {}>(ntfna: Ntfna<V>, n: ConcreteVNSource<V>): ConcreteVN<V>;
    eta<V extends {}>(ntfna: Ntfna<V>, n: ConcreteVNSource<V>): ConcreteVN<V>;
    Gamma<V extends {}>(ntfna: Ntfna<V>, n: ConcreteVNSource<V>): ConcreteVN<V>;
    add<V extends {}>(ntfna: Ntfna<V>, a: V | ConcreteVN<V>, b: V | ConcreteVN<V>): ConcreteVN<V>;
    mul<V extends {}>(ntfna: Ntfna<V>, a: V | ConcreteVN<V>, b: V | ConcreteVN<V>): ConcreteVN<V>;
    pow<V extends {}>(ntfna: Ntfna<V>, a: V | ConcreteVN<V>, b: V | ConcreteVN<V>): ConcreteVN<V>;
    cmp<V extends {}>(ntfna: Ntfna<V>, a: V | ConcreteVN<V>, b: V | ConcreteVN<V>): CompareResult;
    Atom: typeof Atom;
    Sum: typeof Sum;
    Product: typeof Product;
    Phi: typeof Phi;
    sumVN: typeof sumVN;
    productVN: typeof productVN;
    phiVN: typeof phiVN;
    zero: Atom<number>;
    one: Atom<number>;
    w: Phi<number>;
    omega: Phi<number>;
    Least_Transfinite_Ordinal: Phi<number>;
    e0: Phi<number>;
    epsilon0: Phi<number>;
    Small_Cantor_Ordinal: Phi<number>;
    z0: Phi<number>;
    zeta0: Phi<number>;
    Cantor_Ordinal: Phi<number>;
    n0: Phi<number>;
    eta0: Phi<number>;
    G0: Phi<number>;
    Gamma0: Phi<number>;
    Feferman_Schutte_Ordinal: Phi<number>;
    Ackermann: Phi<number>;
};
export declare class VebleNumConstants<V extends {}> {
    ntfna: Ntfna<V>;
    zero: Atom<V>;
    one: Atom<V>;
    two: Atom<V>;
    three: Atom<V>;
    w: Phi<V>;
    omega: Phi<V>;
    Least_Transfinite_Ordinal: Phi<V>;
    e0: Phi<V>;
    epsilon0: Phi<V>;
    Small_Cantor_Ordinal: Phi<V>;
    z0: Phi<V>;
    zeta0: Phi<V>;
    Cantor_Ordinal: Phi<V>;
    n0: Phi<V>;
    eta0: Phi<V>;
    G0: Phi<V>;
    Gamma0: Phi<V>;
    Feferman_Schutte_Ordinal: Phi<V>;
    Ackermann: Phi<V>;
    sumVN: (...addends: (V | ConcreteVN<V>)[]) => ConcreteVN<V>;
    productVN: (ord: V | Atom<V> | Product<V> | Phi<V>, mult: V | Atom<V>) => Atom<V> | Product<V> | Phi<V>;
    phiVN: (...args: PhiArg<V>[]) => ConcreteVN<V>;
    constructor(ntfna: Ntfna<V>);
}
export default VebleNum;
