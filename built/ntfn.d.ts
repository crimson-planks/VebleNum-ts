import { type CompareResult } from './index';
export declare const nonTransfiniteNumberArithmeticSymbol: unique symbol;
type nonTransfiniteNumberArithmeticMethodsObject<T> = {
    add(a: T, b: T): T;
    mul(a: T, b: T): T;
    pow(a: T, b: T): T;
    cmp(a: T, b: T): CompareResult;
};
declare global {
    interface Number {
        [nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<number>;
    }
}
export {};
