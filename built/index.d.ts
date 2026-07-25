/** If an object has this property and its value is `true`, the object is non-tranfinite number */
export declare const isNtfn_symbol: unique symbol;
/** symbol for accessing arithmetic functions */
export declare const ntfnSymbol: unique symbol;
/** Object for the nonTransfiniteNumberArithmetic protocol */
export type ntfnArithmeticObject<T> = {
    /** fromNumber */
    fromNumber(n: number): Ntfn<T>;
    /** fromValue */
    fromValue(v: unknown): Ntfn<T>;
    /** fromValue_noAlloc */
    fromValue_noAlloc(v: unknown): Ntfn<T>;
    /** fromString */
    fromString(s: string): Ntfn<T>;
    /** isNaN */
    isNaN(v: Ntfn<T>): boolean;
    /** addition */
    add(a: Ntfn<T>, b: Ntfn<T>): Ntfn<T>;
    /** returns the successor of the value provided */
    succ(val: Ntfn<T>): Ntfn<T>;
    /** returns the predeccessor of the value provided */
    pred(val: Ntfn<T>): Ntfn<T>;
    /** multiplication */
    mul(a: Ntfn<T>, b: Ntfn<T>): Ntfn<T>;
    /** exponentiation */
    pow(a: Ntfn<T>, b: Ntfn<T>): Ntfn<T>;
    /** comparison. returns 1 if a>b, returns 0 if a===b, returns -1 if a<b */
    cmp(a: Ntfn<T>, b: Ntfn<T>): CompareResult;
    /** returns `true` if a===b */
    eq(a: Ntfn<T>, b: Ntfn<T>): boolean;
    n0: Ntfn<T>;
    n1: Ntfn<T>;
    n2: Ntfn<T>;
    n3: Ntfn<T>;
};
/** Object that has the nonTransfiniteNumberArithmetic protocol */
export type nonTransfiniteNumber<T> = T & {
    [isNtfn_symbol]: true;
    [ntfnSymbol]: ntfnArithmeticObject<T>;
};
/** Object that has the nonTransfiniteNumberArithmetic protocol; alias for nonTransfiniteNumber */
export type Ntfn<T> = nonTransfiniteNumber<T>;
/** Check if a value has the nonTransfiniteNumberArithmetic protocol
 *
 * NOTE: Only checks if the object has the `isNtfn_symbol` property which is `true`. This can result in weird behavior if an object has the `isNtfn_symbol` property but doesn't have the `ntfnSymbol` with the necessary properties.
*/
export declare function isNonTransfiniteNumber<V>(x: unknown): x is nonTransfiniteNumber<V>;
declare global {
    interface Number {
        [isNtfn_symbol]: true;
        [ntfnSymbol]: ntfnArithmeticObject<number>;
    }
    interface BigInt {
        [isNtfn_symbol]: true;
        [ntfnSymbol]: ntfnArithmeticObject<bigint>;
    }
}
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
declare abstract class VNClass<V extends {}> {
    static MAX_TERMS: number;
    abstract toStandardized(): ConcreteVN<V>;
    abstract [ntfnSymbol]: ntfnArithmeticObject<V>;
    clone<T extends VNClass<V>>(this: T): T;
    add(other: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    abstract mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    abstract pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    abstract cmp(other: ConcreteVNSource<V>): CompareResult;
    static add<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    static mul<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    static pow<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    static cmp<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): CompareResult;
    gt(other: ConcreteVNSource<V>): boolean;
    lt(other: ConcreteVNSource<V>): boolean;
    gte(other: ConcreteVNSource<V>): boolean;
    lte(other: ConcreteVNSource<V>): boolean;
    eq(other: ConcreteVNSource<V>): boolean;
    neq(other: ConcreteVNSource<V>): boolean;
}
export declare function isConcreteVN<V extends {}>(x: unknown): x is ConcreteVN<V>;
export type ConcreteVN<T extends {}> = Atom<T> | Sum<T> | Product<T> | Phi<T>;
export type ConcreteVNSource<T extends {}> = ConcreteVN<T> | Ntfn<T> | string;
/**
 * Calculates the sum of addends.
 */
declare function sumVN<V extends {}>(...addends: (Ntfn<V> | ConcreteVN<V>)[]): ConcreteVN<V>;
export declare class Atom<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: ntfnArithmeticObject<V>;
    value: Ntfn<V>;
    /**
     * Class to handle storing independent numbers
     * @param value - The value of the atom
     */
    constructor(value: Atom<V> | Ntfn<V>);
    static fromValue<V extends {}>(value: Atom<V> | Ntfn<V>): void;
    toStandardized(): Atom<V>;
    static wrapIfNumber<V extends {}>(v: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    static unwrapIfAtom<V extends {}>(a: Atom<V> | Ntfn<V>): Ntfn<V>;
    add(other: ConcreteVNSource<V>): ConcreteVN<V>;
    mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    cmp(other: ConcreteVNSource<V>): CompareResult;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
}
export declare class Sum<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: ntfnArithmeticObject<V>;
    addends: (Ntfn<V> | Product<V> | Phi<V>)[] & {
        0: Product<V> | Phi<V>;
    };
    /**
     * Class to handle sums of terms, terms are either number or Product or Phi
     */
    constructor(...args: (Ntfn<V> | Product<V> | Phi<V>)[] & {
        0: Product<V> | Phi<V>;
    });
    static fromValue: typeof sumVN;
    toStandardized(): ConcreteVN<V>;
    cmp(other: ConcreteVNSource<V>): CompareResult;
    mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    get terms(): number;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
    [Symbol.iterator](): ArrayIterator<Ntfn<V> | Product<V> | Phi<V>>;
}
/**
 * Calculate the product of an ordinal and a finite numeric
 */
declare function productVN<V extends {}>(ord: Ntfn<V> | Atom<V> | Product<V> | Phi<V>, mult: Ntfn<V> | Atom<V>): Atom<V> | Product<V> | Phi<V>;
export declare class Product<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: ntfnArithmeticObject<V>;
    ord: Phi<V>;
    mult: Ntfn<V>;
    /**
     * Class to handle products of an ordinal and a finite value
     * @param ord - Ordinal being multiplied
     * @param mult - Finite multiplier
     */
    constructor(ord: Phi<V>, mult: Ntfn<V>);
    static fromValue: typeof productVN;
    toStandardized(): ConcreteVN<V>;
    cmp(other: ConcreteVNSource<V>): CompareResult;
    mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
    pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
    toString(): string;
    toMixed(): string;
    toHTML(): string;
}
type PhiArg<V extends {}> = Ntfn<V> | Atom<V> | Sum<V> | Product<V> | Phi<V>;
/**
 * Calculates and standardizes phi of args
 */
declare function phiVN<V extends {}>(...args: PhiArg<V>[]): ConcreteVN<V>;
export declare class Phi<V extends {}> extends VNClass<V> {
    [ntfnSymbol]: ntfnArithmeticObject<V>;
    args: PhiArg<V>[];
    /**
     * Class to handle sums of terms, terms are either Sum, Product, Phi, or number
     */
    constructor(...args: PhiArg<V>[]);
    static fromValue: typeof phiVN;
    static fromValue_noStandardize<V extends {}>(...args: PhiArg<V>[]): Phi<V>;
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
    toString(): string;
    toMixed(): string;
    toHTML(): string;
    [Symbol.iterator](): ArrayIterator<PhiArg<V>>;
}
export declare function convertNumberType<TOld extends {}, TNew extends {}>(ord: Ntfn<TOld> | ConcreteVN<TOld>, ntfnObj: ntfnArithmeticObject<TNew>, convertFunction: (v: Ntfn<TOld>) => Ntfn<TNew>): ConcreteVN<TNew>;
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
    fromString<V extends {}>(str: string, ntfnObj: ntfnArithmeticObject<V>): ConcreteVN<V>;
    handleParens(str: string, sub?: boolean, replace?: string | boolean): string | true;
    needsParens(str: string, sub?: boolean): boolean;
};
export declare class VebleNumConstants<V extends {}> {
    ntfnObj: ntfnArithmeticObject<V>;
    zero: Atom<V>;
    one: Atom<V>;
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
    constructor(ntfnObj: ntfnArithmeticObject<V>);
}
/**
 * Creates the appropriate VNClass instance.
 *
 * may be called with or without `new`
 */
declare const VebleNum: (<V extends {}>(input: unknown, ntfnObj?: ntfnArithmeticObject<V>) => ConcreteVN<V>) & {
    fromString: <V extends {}>(str: string, ntfnObj: ntfnArithmeticObject<V>) => ConcreteVN<V>;
    fromValue_noAlloc<V extends {}>(v: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>): ConcreteVN<V>;
    clone<T>(input: T): T;
    isEpsilon(): boolean;
    isZeta(): boolean;
    isEta(): boolean;
    isGamma(): boolean;
    epsilon<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>): ConcreteVN<V>;
    zeta<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>): ConcreteVN<V>;
    eta<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>): ConcreteVN<V>;
    Gamma<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>): ConcreteVN<V>;
    add<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    mul<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    pow<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V>;
    cmp<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>): CompareResult;
    Atom: typeof Atom;
    Sum: typeof Sum;
    Product: typeof Product;
    Phi: typeof Phi;
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
export default VebleNum;
