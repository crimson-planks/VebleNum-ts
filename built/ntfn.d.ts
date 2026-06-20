import { type CompareResult } from './index';
/** symbol for accessing arithmetic functions */
export declare const nonTransfiniteNumberArithmeticSymbol: unique symbol;
/** Object for the nonTransfiniteNumberArithmetic protocol */
type nonTransfiniteNumberArithmeticMethodsObject<T> = {
    add(a: T, b: T): T;
    mul(a: T, b: T): T;
    pow(a: T, b: T): T;
    cmp(a: T, b: T): CompareResult;
};
/** Object that has the nonTransfiniteNumberArithmetic protocol */
type nonTransfiniteNumber<T> = {
    [nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<T>;
};
/** Check if a value has the nonTransfiniteNumberArithmetic protocol*/
export declare function isNonTransfiniteNumber(x: unknown): x is nonTransfiniteNumber<unknown>;
declare global {
    interface Number {
        [nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<number>;
    }
    interface BigInt {
        [nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<bigint>;
    }
}
export {};
