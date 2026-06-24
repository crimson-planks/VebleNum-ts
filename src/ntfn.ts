import {type CompareResult} from './index'
//generalizing arithmetic between non-transfinite numbers
/** symbol for accessing arithmetic functions */
export const nonTransfiniteNumberArithmeticSymbol = Symbol("nonTransfiniteNumberArithmeticSymbol");
/** Object for the nonTransfiniteNumberArithmetic protocol */
type nonTransfiniteNumberArithmeticMethodsObject<T> = {
	add(a: T,b: T): T;
	mul(a: T,b: T): T;
	pow(a: T,b: T): T;
	cmp(a: T,b: T): CompareResult;
}
/** Object that has the nonTransfiniteNumberArithmetic protocol */
type nonTransfiniteNumber<T> = {
	[nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<T>;
};

/** Check if a value has the nonTransfiniteNumberArithmetic protocol*/
export function isNonTransfiniteNumber(x: unknown): x is nonTransfiniteNumber<unknown>{
	return x!==null&&typeof x==='object' && nonTransfiniteNumberArithmeticSymbol in x;
}
declare global{
	interface Number{
		[nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<number>
	}
	interface BigInt{
		[nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<bigint>
	}
}
Object.defineProperty(Number.prototype,nonTransfiniteNumberArithmeticSymbol,{
	value: {
		add(a,b){return a+b},
		mul(a,b){return a*b},
		pow(a,b){return a**b},
		cmp(a,b){return a===b?0:a>b?1:-1},
	} satisfies nonTransfiniteNumberArithmeticMethodsObject<number>,
	configurable: true, enumerable: false, writable: true
});
Object.defineProperty(BigInt.prototype,nonTransfiniteNumberArithmeticSymbol,{
	value: {
		add(a,b){return a+b},
		mul(a,b){return a*b},
		pow(a,b){return a**b},
		cmp(a,b){return a===b?0:a>b?1:-1},
	} satisfies nonTransfiniteNumberArithmeticMethodsObject<bigint>,
	configurable: true, enumerable: false, writable: true
});