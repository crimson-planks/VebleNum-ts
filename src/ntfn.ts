import {type CompareResult} from './index'
//generalizing arithmetic between non-transfinite numbers
export const nonTransfiniteNumberArithmeticSymbol = Symbol("nonTransfiniteNumberArithmeticSymbol");
type nonTransfiniteNumberArithmeticMethodsObject<T> = {
	add(a: T,b: T): T;
	mul(a: T,b: T): T;
	pow(a: T,b: T): T;
	cmp(a: T,b: T): CompareResult;
}
type nonTransfiniteNumber<T> = {
	[nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<T>;
};

declare global{
	interface Number{
		[nonTransfiniteNumberArithmeticSymbol]: nonTransfiniteNumberArithmeticMethodsObject<number>
	}
}
Object.defineProperty(Number.prototype,nonTransfiniteNumberArithmeticSymbol,{
	value: {
		add(a:number,b:number){return a+b},
		mul(a:number,b:number){return a*b},
		pow(a:number,b:number){return a**b},
		cmp(a:number,b:number){return a===b?0:a>b?1:-1},
	} satisfies nonTransfiniteNumberArithmeticMethodsObject<number>,
	configurable: true, enumerable: false, writable: true
})

// Check if a number has the nonTransfiniteNumberArithmetic protocol
function isNonTransfiniteNumber(x: unknown): x is nonTransfiniteNumber<unknown>{
	return x!==null&&typeof x==='object' && nonTransfiniteNumberArithmeticSymbol in x
	       && x[nonTransfiniteNumberArithmeticSymbol]!==null&&typeof x[nonTransfiniteNumberArithmeticSymbol]==='object'
		   && 'add' in x[nonTransfiniteNumberArithmeticSymbol] && typeof x[nonTransfiniteNumberArithmeticSymbol].add==='function'
		   && 'mul' in x[nonTransfiniteNumberArithmeticSymbol] && typeof x[nonTransfiniteNumberArithmeticSymbol].mul==='function'
		   && 'pow' in x[nonTransfiniteNumberArithmeticSymbol] && typeof x[nonTransfiniteNumberArithmeticSymbol].pow==='function'
		   && 'cmp' in x[nonTransfiniteNumberArithmeticSymbol] && typeof x[nonTransfiniteNumberArithmeticSymbol].cmp==='function';
}
