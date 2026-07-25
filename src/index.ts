"use strict";

//generalizing arithmetic between non-transfinite numbers

/** If an object has this property and its value is `true`, the object is non-tranfinite number */
export const isNtfn_symbol = Symbol("isNtfn");
/** symbol for accessing arithmetic functions */
export const ntfnSymbol = Symbol("ntfn");
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
	add(a: Ntfn<T>,b: Ntfn<T>): Ntfn<T>;
	/** returns the successor of the value provided */
	succ(val: Ntfn<T>): Ntfn<T>;
	/** returns the predeccessor of the value provided */
	pred(val: Ntfn<T>): Ntfn<T>;
	/** multiplication */
	mul(a: Ntfn<T>,b: Ntfn<T>): Ntfn<T>;
	/** exponentiation */
	pow(a: Ntfn<T>,b: Ntfn<T>): Ntfn<T>;
	/** comparison. returns 1 if a>b, returns 0 if a===b, returns -1 if a<b */
	cmp(a: Ntfn<T>,b: Ntfn<T>): CompareResult;
	/** returns `true` if a===b */
	eq(a: Ntfn<T>,b: Ntfn<T>): boolean;
	n0: Ntfn<T>;
	n1: Ntfn<T>;
	n2: Ntfn<T>;
	n3: Ntfn<T>;
}
/** Object that has the nonTransfiniteNumberArithmetic protocol */
export type nonTransfiniteNumber<T> = T & {
	[isNtfn_symbol]: true;
	[ntfnSymbol]: ntfnArithmeticObject<T>;
};
/** Object that has the nonTransfiniteNumberArithmetic protocol; alias for nonTransfiniteNumber */
export type Ntfn<T> = nonTransfiniteNumber<T>
/** Check if a value has the nonTransfiniteNumberArithmetic protocol
 * 
 * NOTE: Only checks if the object has the `isNtfn_symbol` property which is `true`. This can result in weird behavior if an object has the `isNtfn_symbol` property but doesn't have the `ntfnSymbol` with the necessary properties.
*/
export function isNonTransfiniteNumber<V>(x: unknown): x is nonTransfiniteNumber<V>{
	//@ts-expect-error ...
	return x!=undefined && x[isNtfn_symbol]===true;
}
declare global{
	interface Number{
		[isNtfn_symbol]: true;
		[ntfnSymbol]: ntfnArithmeticObject<number>;
	}
	interface BigInt{
		[isNtfn_symbol]: true;
		[ntfnSymbol]: ntfnArithmeticObject<bigint>
	}
}
Number.prototype[isNtfn_symbol]=true;
Object.defineProperty(Number.prototype,ntfnSymbol,{
	value: {
		fromNumber: Number,
		fromValue: Number,
		fromValue_noAlloc: Number,
		fromString: Number,
		isNaN: Number.isNaN,
		add(a,b){return a+b},
		succ(val){return val+1},
		pred(val){return val-1},
		mul(a,b){return a*b},
		pow(a,b){return a**b},
		cmp(a,b){return a===b?0:a>b?1:-1},
		eq(a,b){return a===b},
		n0: 0,
		n1: 1,
		n2: 2,
		n3: 3,
	} satisfies ntfnArithmeticObject<number>,
	configurable: true, enumerable: false, writable: true
});
BigInt.prototype[isNtfn_symbol]=true;
Object.defineProperty(BigInt.prototype,ntfnSymbol,{
	value: {
		fromNumber: BigInt,
		fromValue: BigInt,
		fromValue_noAlloc: BigInt,
		fromString: BigInt,
		isNaN(){return false},
		add(a,b){return a+b},
		succ(val){return val+1n},
		pred(val){return val-1n},
		mul(a,b){return a*b},
		pow(a,b){return a**b},
		cmp(a,b){return a===b?0:a>b?1:-1},
		eq(a,b){return a===b},
		n0: 0n,
		n1: 1n,
		n2: 2n,
		n3: 3n,
	} satisfies ntfnArithmeticObject<bigint>,
	configurable: true, enumerable: false, writable: true
});

export type CompareResult = -1 | 0 | 1;

export class VN_TooManyTermsError extends Error{
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
	constructor(){
		super("Too many terms, reduce exponent");
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/captureStackTrace
		if("captureStackTrace" in Error&&typeof Error.captureStackTrace==='function'){
			Error.captureStackTrace(this,VN_TooManyTermsError)
		}
		this.name='VN_TooManyTermsError'
	}
};
export class VN_ParserError extends Error{
	constructor(message?: string){
		super(message);
		if("captureStackTrace" in Error&&typeof Error.captureStackTrace === 'function'){
			Error.captureStackTrace(this,VN_ParserError)
		}
		this.name='VN_ParserError'
	}
}
/**
 * Set the type of an object
 * @param obj
 * @param type - The type to set `obj` to
 */
function setType<P extends object | null>(obj:{},type: {prototype: P}): asserts this is P {
	Object.setPrototypeOf(obj, type.prototype);
}
/**
 * Class that all the VebleNum objects have in the prototype chain.
 * 
 * Users of the library should not create instances of this class or inherit from this class
 */
abstract class VNClass<V extends {}> {
	static MAX_TERMS = 200;

	abstract toStandardized(): ConcreteVN<V>;
	abstract [ntfnSymbol]: ntfnArithmeticObject<V>;
	clone<T extends VNClass<V>>(this: T): T {
		// Making TS happy; obj.[[Prototype]] will eventually be a subtype of VNClass
		const obj = {} as T;
		for (const i in this) {
			if (this[i]!==null&&typeof this[i] === 'object') obj[i] = VebleNum.clone(this[i]);
			else obj[i] = this[i];
		}
		obj[ntfnSymbol]=this[ntfnSymbol];
		//VNClass.prototype.setType<T>.call(obj,this.constructor);

		setType<T>(obj,this.constructor);

		return obj;
	}

	add(other: Ntfn<V> | ConcreteVN<V>): ConcreteVN<V> {
		other = VebleNum.fromValue_noAlloc(other);
		if(!isConcreteVN<V>(this)) throw TypeError("this is not ConcreteVN")
		return sumVN(this,other);
	}
	abstract mul(other: ConcreteVNSource<V>): ConcreteVN<V>;
	abstract pow(other: ConcreteVNSource<V>): ConcreteVN<V>;
	abstract cmp(other: ConcreteVNSource<V>): CompareResult;
	static add<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		a = VebleNum.fromValue_noAlloc(a);
		b = VebleNum.fromValue_noAlloc(b);
		return a.add(b);
	}
	
	static mul<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		a = VebleNum.fromValue_noAlloc(a);
		b = VebleNum.fromValue_noAlloc(b);
		return a.mul(b);
	}
	static pow<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		a = VebleNum.fromValue_noAlloc(a);
		b = VebleNum.fromValue_noAlloc(b);
		return a.pow(b);
	}
	static cmp<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		a = VebleNum.fromValue_noAlloc(a);
		b = VebleNum.fromValue_noAlloc(b);
		return a.cmp(b);
	}

	gt(other: ConcreteVNSource<V>) {
		return this.cmp(other) === 1;
	}
	lt(other: ConcreteVNSource<V>) {
		return this.cmp(other) === -1;
	}
	gte(other: ConcreteVNSource<V>) {
		return this.cmp(other) >= 0;
	}
	lte(other: ConcreteVNSource<V>) {
		return this.cmp(other) <= 0;
	}
	eq(other: ConcreteVNSource<V>) {
		return this.cmp(other) === 0;
	}
	neq(other: ConcreteVNSource<V>) {
		return this.cmp(other) !== 0;
	}
}

export function isConcreteVN<V extends {}>(x: unknown): x is ConcreteVN<V>{
	return x instanceof Atom || x instanceof Sum || x instanceof Product || x instanceof Phi;
}
export type ConcreteVN<T extends {}> = Atom<T> | Sum<T> | Product<T> | Phi<T>;
export type ConcreteVNSource<T extends {}> = ConcreteVN<T> | Ntfn<T> | string;
/* reason for making sum, product, phi standalone functions
   It's unintuitive and harder to type check when calling `new Sum()` and getting something that isn't Sum
*/
/**
 * Calculates the sum of addends.
 */
function sumVN<V extends {}>(...addends: (Ntfn<V>|ConcreteVN<V>)[]): ConcreteVN<V>{
	const work1Arr: (Ntfn<V>|ConcreteVN<V>|(Ntfn<V>|ConcreteVN<V>)[])[] = [];
	for (let addend of addends) {
		if (isConcreteVN(addend)) addend = addend.toStandardized();
		// Flatten sums into the array
		if (addend instanceof Sum) {
			work1Arr.push(addend.addends);
		}
		// Turn Atoms into numbers
		else if (addend instanceof Atom)
			work1Arr.push(addend.value);
		else work1Arr.push(addend);
	}
	//console.log(`work1Arr: ${work1Arr}`);
	// Sum is flattened

	const work2Arr = work1Arr.flat() as (Ntfn<V> | Exclude<ConcreteVN<V>,Sum<V>>)[];

	// Merge final numbers
	while (
		work2Arr.length >= 2 &&
		isNonTransfiniteNumber<V>(work2Arr[work2Arr.length - 1]) &&
		isNonTransfiniteNumber<V>(work2Arr[work2Arr.length - 2])
	){
		//@ts-expect-error see while condition
		work2Arr[work2Arr.length - 2] = (work2Arr[work2Arr.length - 2] as Ntfn<V>)[ntfnSymbol].add(work2Arr[work2Arr.length - 2] as Ntfn<V>,work2Arr.pop()!);
	}

	// Convert to an Atom when necessary
	if (work2Arr.length === 1 && isNonTransfiniteNumber(work2Arr[0])) {
		return new Atom<V>(work2Arr[0]);
	}
	//console.log(`work2Arr: ${work2Arr}`);
	const work3Arr: (Ntfn<V> | ConcreteVN<V> | undefined)[] = [...work2Arr];
	// Remove redundant terms
	for (let i = 0; i < work3Arr.length - 1; i++) {
		const curr=work3Arr[i];
		if(curr===undefined) continue;
		//finite ordinal + transfinite ordinal -> the same transfinite ordinal
		if(isNonTransfiniteNumber<V>(curr)){work3Arr[i]=undefined;continue}
		//undefined is only used as padding for removed elements during this current, so next wont be null.
		const next = work3Arr[i+1]!;
		if (curr.cmp(next) === -1) {
			if (curr instanceof Product) {
				if (next instanceof Product) {
					if (
						curr.ord.cmp(next.ord) ===
						0
					)
						continue;
					work3Arr[i]=undefined;
					continue;
				}
				if (curr.ord.cmp(next) === 0)
					continue;
				work3Arr[i]=undefined;
				continue;
			}
			if (next instanceof Product) {
				if (curr.cmp(next.ord) === 0)
					continue;
				work3Arr[i]=undefined;
				continue;
			}
			if (curr.cmp(next) === 0) continue;
			work3Arr[i]=undefined;
			continue;
		}
	}
	//console.log(`work3Arr: ${work3Arr}`);
	const work4Arr = work3Arr.filter((v)=>v!==undefined) as (Ntfn<V>|Exclude<ConcreteVN<V>,Sum<V>>|undefined)[];

	// Collect like terms
	for (let i = 0; i < work4Arr.length - 1; i++) {
		const curr=work4Arr[i] as ConcreteVN<V> | undefined;
		if(curr===undefined) continue;
		//same reason for non-undefined as above.
		const next = work4Arr[i+1]!;
		// If they're equal just merge into a Product
		if (next instanceof VNClass && curr.cmp(next) === 0) {
			work4Arr[i + 1] = productVN(next, next[ntfnSymbol].n2);
			work4Arr[i]=undefined;
			continue;
		}
		// If the current one is a Product...
		if (curr instanceof Product) {
			// ...and the next one is a Product...
			if (next instanceof Product) {
				// ...if they're Products of the same ordinal then merge
				if (curr.ord.cmp(next.ord) === 0) {
					work4Arr[i + 1] = new Product(
						next.ord,
						curr.mult[ntfnSymbol].add(curr.mult,next.mult)
					);
					work4Arr[i]=undefined;
				}
				continue;
			}
			// ...and the next one is not but they are like terms then merge
			if (next instanceof VNClass && curr.ord.cmp(next) === 0) {
				work4Arr[i + 1] = productVN(
					next,
					curr.mult[ntfnSymbol].succ(curr.mult)
				);
				work4Arr[i]=undefined;
			}
			continue;
		}
		// If the current one isn't a Product...
		if (next instanceof Product) {
			// ...if they're like terms then merge
			if (curr.cmp(next.ord) === 0) {
				work4Arr[i + 1] = new Product(
					next.ord,
					next.mult[ntfnSymbol].succ(next.mult)
				);
				work4Arr[i]=undefined;
			}
		}
	}
	//console.log(`work4Arr: ${work4Arr}`);
	const work5Arr = work4Arr.filter((v)=>v!==undefined) as (Ntfn<V> | Exclude<ConcreteVN<V>,Sum<V>>)[];
	// Remove outer Sum to simplify single term
	if (work5Arr.length === 1) {
		//the number case is handled above
		return work5Arr[0] as Exclude<typeof work5Arr[0],Ntfn<V>>;
	}
	//console.log(`work5Arr: ${work5Arr}`);
	if(!(work5Arr[0] instanceof Product || work5Arr[0] instanceof Phi)) throw Error();
	//@ts-expect-error work5Arr[0]
	return new Sum(...work5Arr);
}

export class Atom<V extends {}> extends VNClass<V> {
	[ntfnSymbol]: ntfnArithmeticObject<V>;
	value: Ntfn<V>;
	/**
	 * Class to handle storing independent numbers
	 * @param value - The value of the atom
	 */
	constructor(value: Atom<V> | Ntfn<V>) {
		super();

		this[ntfnSymbol] = value[ntfnSymbol];
		this.value = isNonTransfiniteNumber(value) ? value : value.value;
	}
	static fromValue<V extends {}>(value: Atom<V> | Ntfn<V>) {
		isNonTransfiniteNumber(value) ? new Atom(value) : value.clone();
	}

	toStandardized(): Atom<V> {
		return this.clone();
	}
	static wrapIfNumber<V extends {}>(v: Ntfn<V> | ConcreteVN<V>){
		return isNonTransfiniteNumber(v) ? new Atom(v) : v;
	}
	static unwrapIfAtom<V extends {}>(a: Atom<V> | Ntfn<V>): Ntfn<V>{
		return isNonTransfiniteNumber(a) ? a : a instanceof Atom ? a.value : a;
	}
	add(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (isNonTransfiniteNumber(other)) return new Atom(this.value[ntfnSymbol].add(this.value,other));
		if (other instanceof Atom) return new Atom(this.value[ntfnSymbol].add(this.value,other.value));
		return other;
	}

	mul(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (isNonTransfiniteNumber<V>(other)) return new Atom(this.value[ntfnSymbol].mul(this.value,other));
		if (other instanceof Atom) return new Atom(this.value[ntfnSymbol].mul(this.value,other.value));
		if (this.value[ntfnSymbol].eq(this.value,this.value[ntfnSymbol].n1)) return other.clone();
		if (this.value[ntfnSymbol].eq(this.value,this.value[ntfnSymbol].n0)) return new Atom(this.value[ntfnSymbol].n0);
		return other.clone();
	}

	pow(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (other instanceof Sum) {
			let p: ConcreteVN<V> = new Atom(this[ntfnSymbol].n1);
			for (const i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		// other is ω^α (α>1)
		if (
			other instanceof Phi &&
			other.args.length === 1 &&
			new Atom(this[ntfnSymbol].n1).cmp(other.args[0]) === -1
		) {
			// if ω<=α (other>=ω^ω)
			if (new Phi(this[ntfnSymbol].n1).cmp(other.args[0]) < 1)
				return new Phi(other.clone());
			// if 1<α<ω: then α is number or Atom
			const o = other.clone();
			o.args[0] =  this[ntfnSymbol].pred(Atom.unwrapIfAtom(o.args[0] as Ntfn<V> | Atom<V>));
			return new Phi(o);
		}
		if (isNonTransfiniteNumber(other)) return new Atom(this[ntfnSymbol].pow(this.value, other));
		if (other instanceof Atom) return new Atom(this[ntfnSymbol].pow(this.value, other.value));
		if (this[ntfnSymbol].eq(this.value, this[ntfnSymbol].n1)) return new Atom(this[ntfnSymbol].n1);
		if (this[ntfnSymbol].eq(this.value, this[ntfnSymbol].n0)) return new Atom(this[ntfnSymbol].n0);
		return other.clone();
	}

	cmp(other: ConcreteVNSource<V>): CompareResult {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if(other instanceof Atom) other = other.value;
		if (isNonTransfiniteNumber(other))
			return this[ntfnSymbol].cmp(this.value,other)
		return -1;
	}

	toString() {
		return this.value.toString();
	}
	toMixed() {
		return this.value.toString();
	}
	toHTML() {
		return this.value.toString();
	}
};

export class Sum<V extends {}> extends VNClass<V> {
	[ntfnSymbol]: ntfnArithmeticObject<V>;
	addends: (Ntfn<V>|Product<V>|Phi<V>)[] & {0: Product<V>|Phi<V>}
	/**
	 * Class to handle sums of terms, terms are either number or Product or Phi
	 */
	constructor(...args: (Ntfn<V>|Product<V>|Phi<V>)[] & {0: Product<V>|Phi<V>}) {
		super();

		this[ntfnSymbol] = args[0][ntfnSymbol];
		this.addends = args;
	}
	static fromValue = sumVN;

	toStandardized(): ConcreteVN<V> {
		return sumVN(...this.addends);
	}

	cmp(other: ConcreteVNSource<V>): CompareResult {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		// Standard Sums are always greater than Atoms
		if (isNonTransfiniteNumber(other) || other instanceof Atom) return 1;

		// If other > first term then -1, if other === first term then 1, or other < first term then 1
		if (other instanceof Product || other instanceof Phi){
			//the first term of Sum is never number; number becomes Atom.
			return (this.addends[0]!).cmp(other) === -1 ? -1 : 1;
		}
		if(!(other instanceof Sum)) throw TypeError(`Invalid Sum.prototype.cmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
		// Compare with other terms
		for (let i = 0; i < Math.min(this.terms, other.terms); i++) {
			if (isNonTransfiniteNumber(this.addends[i])) {
				if (isNonTransfiniteNumber(other.addends[i]))
					return this.addends[i] > other.addends[i]
						? 1
						: this.addends[i] < other.addends[i]
						? -1
						: 0;
				return -1;
			}
			if (isNonTransfiniteNumber(other.addends[i])) return 1;
			//ok typescript, there is a type guard for number right above.
			const c = (this.addends[i] as Exclude<typeof this.addends[number],Ntfn<V>>).cmp(other.addends[i]);
			if (c !== 0) return c;
		}
		if (this.terms > other.terms) return 1;
		if (this.terms < other.terms) return -1;
		return 0;
	}

	mul(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (isNonTransfiniteNumber(other)) other = new Atom(other);
		if (other instanceof Atom && other[ntfnSymbol].eq(other.value,this[ntfnSymbol].n1)) return this.clone();
		if (other instanceof Atom && other[ntfnSymbol].eq(other.value,this[ntfnSymbol].n0)) return new Atom(this[ntfnSymbol].n0);
		if (other instanceof Sum)
			return sumVN(...other.addends.map(e => this.mul(e)));
		const t = this.addends[0]!;
		if (!(other instanceof Atom)) return t.mul(other);
		return sumVN(t.mul(other), ...this.addends.slice(1));
	}

	pow(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if(!(this instanceof Sum)) throw TypeError(`this (${this}) is not Sum`);
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (other instanceof Sum) {
			let p: ConcreteVN<V> = new Atom(this[ntfnSymbol].n1);
			for (const i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		if (isNonTransfiniteNumber(other)) other = new Atom(other);
		if (other instanceof Atom && other[ntfnSymbol].eq(other.value, this[ntfnSymbol].n1)) return this.clone();
		if (other instanceof Atom && other[ntfnSymbol].eq(other.value, this[ntfnSymbol].n0)) return new Atom(this[ntfnSymbol].n1);
		if (other instanceof Atom) {
			if (Number(other.value) > VNClass.MAX_TERMS - 1)
				throw new VN_TooManyTermsError();
			let t: ConcreteVN<V> = this.clone();
			for (let i = 0; i < Number(other.value) - 1; i++) t = t.mul(this);
			return t;
		}
		const t = this.addends[0];
		if (t instanceof Atom) return t.pow(other);
		return t.pow(other);
	}

	// Count the number of terms
	get terms() {
		return this.addends.length;
	}

	toString() {
		return this.addends.join("+");
	}
	toMixed() {
		return this.addends
			.map(e => {
				if (isNonTransfiniteNumber(e)) return new Atom(e).toMixed();
				return e.toMixed();
			})
			.join("+");
	}
	toHTML() {
		return this.addends
			.map(e => {
				if (isNonTransfiniteNumber(e)) return new Atom(e).toHTML();
				return e.toHTML();
			})
			.join("+");
	}

	[Symbol.iterator]() {
		return this.addends[Symbol.iterator]();
	}
}
/**
 * Calculate the product of an ordinal and a finite numeric
 */
function productVN<V extends {}>(ord: Ntfn<V> | Atom<V> | Product<V> | Phi<V>, mult: Ntfn<V> | Atom<V>){
	// Turn Atoms into numbers
	if (ord instanceof Atom) ord = ord.value;
	if (mult instanceof Atom) mult = mult.value;

	// Convert to a single Atom where possible
	if (isNonTransfiniteNumber(ord)) {
		return new Atom(ord[ntfnSymbol].mul(ord,mult));
	}

	// Simply x0 and x1
	if (mult[ntfnSymbol].eq(mult,mult[ntfnSymbol].n0)) {
		return new Atom(mult[ntfnSymbol].n0);
	}
	if (mult[ntfnSymbol].eq(mult,mult[ntfnSymbol].n1)) {
		return ord.clone();
	}

	// Simplify nested products
	if (ord instanceof Product) {
		mult = mult[ntfnSymbol].mul(mult,ord.mult);
		ord = ord.ord;
	}
	//if(!(ord instanceof Phi)) throw new TypeError(`Invalid mulVN argument(ord): ${ord} ([[prototype]]: ${Object.getPrototypeOf(ord)})`);;
	return new Product(ord,mult);
}
export class Product<V extends {}> extends VNClass<V> {
	[ntfnSymbol]: ntfnArithmeticObject<V>;
	ord: Phi<V>;
	mult: Ntfn<V>;
	/**
	 * Class to handle products of an ordinal and a finite value
	 * @param ord - Ordinal being multiplied
	 * @param mult - Finite multiplier
	 */
	constructor(ord: Phi<V>, mult: Ntfn<V>) {
		super();

		this[ntfnSymbol]=mult[ntfnSymbol];
		this.ord = ord;
		this.mult = mult;
	}

	static fromValue = productVN;

	toStandardized(): ConcreteVN<V> {
		return productVN(this.ord,this.mult);
	}

	cmp(other: ConcreteVNSource<V>): CompareResult {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		// All standard products are greater than finite Atoms
		if (isNonTransfiniteNumber(other) || other instanceof Atom) return 1;
		// Inverted comparison for Sum
		if (other instanceof Sum) return -other.cmp(this) as CompareResult;
		// If other > ord then -1, if other === ord then 1, or other < ord then 1
		if (other instanceof Phi) return this.ord.cmp(other) === -1 ? -1 : 1;
		if(!(other instanceof Product)) throw new TypeError(`Invalid Product.prototype.cmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
		// Handle comparison with other Products
		const oc = this.ord.cmp(other.ord);
		if (oc !== 0) return oc;
		return this.mult > other.mult ? 1 : this.mult < other.mult ? -1 : 0;
	}

	mul(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (other instanceof Atom) other = other.value;
		if (other instanceof Sum)
			return sumVN(...other.addends.map(e => this.mul(e)));
		if (isNonTransfiniteNumber(other)){
			if (other[ntfnSymbol].eq(other,other[ntfnSymbol].n1)) return this.clone();
			if (other[ntfnSymbol].eq(other,other[ntfnSymbol].n0)) return new Atom(other[ntfnSymbol].n0);
			return productVN(this.ord.mul(other) as Phi<V>, this.mult);
		}
		return this.ord.mul(other);
	}

	pow(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (other instanceof Sum) {
			let p: ConcreteVN<V> = new Atom(this[ntfnSymbol].n1);
			for (const i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		if (other instanceof Atom) other = other.value;
		if (isNonTransfiniteNumber(other)) {
			if(other[ntfnSymbol].eq(other,other[ntfnSymbol].n1)) return this.clone();
			if(other[ntfnSymbol].eq(other,other[ntfnSymbol].n0)) return new Atom(other[ntfnSymbol].n1)
			other = new Atom(other);
		};
		if (other instanceof Atom)
			return productVN(this.ord.pow(other) as Phi<V>, this.mult);
		return this.ord.pow(other);
	}

	toString() {
		return (
			Parser.handleParens(this.ord.toString()) +
			"*" +
			this.mult.toString()
		);
	}
	toMixed() {
		return (
			Parser.handleParens(this.ord.toMixed()) + "*" + this.mult.toString()
		);
	}
	toHTML() {
		return (
			Parser.handleParens(this.ord.toMixed(), false, this.ord.toHTML()) +
			"*" +
			this.mult.toString()
		);
	}
}

type PhiArg<V extends {}> = Ntfn<V>|Atom<V>|Sum<V>|Product<V>|Phi<V>;
function isPhiArg<V extends {}>(x:unknown): x is PhiArg<V>{
	return isNonTransfiniteNumber<V>(x)||x instanceof Atom||x instanceof Sum||x instanceof Product||x instanceof Phi;
}
/**
 * Calculates and standardizes phi of args
 */
function phiVN<V extends {}>(...args: PhiArg<V>[]): ConcreteVN<V>{
	if(args.length<=0) throw TypeError("args cannot be empty");
	const ntfnObj = args[0][ntfnSymbol];
	// Convert Atoms to numbers
	for (const i in args) if (args[i] instanceof Atom) args[i] = args[i].value;
	// Remove redundant 0s
	while (isNonTransfiniteNumber(args[0]) && ntfnObj.eq(args[0],ntfnObj.n0) && args.length > 1) args.shift();

	// Convert phi(0) to 1
	if (isNonTransfiniteNumber(args[0]) && ntfnObj.eq(args[0],ntfnObj.n0)) {
		return new Atom(ntfnObj.n0);
	}

	// Deal with fixed points
	for (const i in args) {
		if (!(args[i] instanceof Phi)) continue;
		const a: (PhiArg<V>|'_')[] = [...args];
		a[i] = "_";
		if (args[i].isFixedPoint(a)) args = args[i].args;
	}

	for (const i in args)
		if (
			args[i] instanceof VNClass &&
			!(args[i] instanceof Atom)
		)
			args[i] = args[i].toStandardized();
	return new Phi(...args);
}
export class Phi<V extends {}> extends VNClass<V> {
	[ntfnSymbol]: ntfnArithmeticObject<V>;
	args: PhiArg<V>[];
	/**
	 * Class to handle sums of terms, terms are either Sum, Product, Phi, or number
	 */
	constructor(...args: PhiArg<V>[]) {
		super();
		if(args.length<=0) throw TypeError("args cannot be empty");
		this[ntfnSymbol]=args[0][ntfnSymbol];
		//console.dir(this[ntfnSymbol])
		this.args = args;
	}

	static fromValue = phiVN;
	static fromValue_noStandardize<V extends {}>(...args: PhiArg<V>[]) {
		const t = new Phi<V>(...args);
		//t.standardize(true);
		
		// Convert Atoms to numbers
		for (const i in args) if (args[i] instanceof Atom) args[i] = args[i].value;
		return t;
	}

	toStandardized() {
		return phiVN(...this.args);
	}

	cmp(other: ConcreteVNSource<V>): CompareResult {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		// Standard Phis are always greater than Atoms
		if (isNonTransfiniteNumber<V>(other) || other instanceof Atom) return 1;
		// Inverted comparisons for Sum and Product
		if (other instanceof Sum || other instanceof Product)
			return -other.cmp(this) as CompareResult;
		/**
		 * the basic comparison algorithm alone is just
		 * φ(X) > φ(Y) iff the sum of args in X is greater than φ(Y)
		 * or
		 * (X is lexicographically greater than Y and φ(X) is greater than the sum of args in Y)
		 */
		if(!(other instanceof Phi)) throw new TypeError(`Invalid Phi.prototype.cmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
		const sumthis = sumVN(...this.args);
		const sumother = sumVN(...other.args);
		if (
			sumthis.cmp(other) === 1 ||
			((sumother instanceof Atom || sumother.cmp(this) === -1) &&
				this.lexcmp(other) === 1)
		)
			return 1;
		if (
			sumother.cmp(this) === 1 ||
			((sumthis instanceof Atom || sumthis.cmp(other) === -1) &&
				other.lexcmp(this) === 1)
		)
			return -1;
		return 0;
	}
	/**
	 * is `this` fixed point of a?
	 * 
	 * Substitute the argument '\_' of `a` with `this`, then check if the result is equal to `this`
	 * 
	 * (example) if a === [1,0,0,'_',0] -> returns true iff phi(1,0,0,this,0) === this
	 */
	isFixedPoint(a: (PhiArg<V>|'_')[]) {
		const index = a.indexOf("_");
		for (let i = index + 1; i < a.length; i++) {
			if(a[i] === '_') throw TypeError("More than 1 '_' found");
			if ((!isNonTransfiniteNumber<V>(a[i])) || !(this[ntfnSymbol].eq(a[i] as Ntfn<V>,this[ntfnSymbol].n0))) return false;}
		if (a.length > this.args.length) return false;
		if (this.args.length > a.length) return true;
		for (const i in a) {
			if (a[i] === "_") break;
			let cmp: CompareResult;
			if (this.args[i] instanceof VNClass) {
				cmp = this.args[i].cmp(
					a[i] instanceof VNClass ? a[i] : new Atom(a[i])
				);
			} else {
				if (a[i] instanceof VNClass) {
					cmp = -a[i].cmp(Atom.wrapIfNumber(this.args[i])) as CompareResult;
				} else
					cmp =
						this.args[i] > a[i] ? 1 : this.args[i] < a[i] ? -1 : 0;
			}
			if (cmp === -1) return false;
			if (cmp === 1) return true;
		}
		return false;
	}

	lexcmp(other: string | Phi<V>) {
		if (typeof other === "string") {
			const fsother = Parser.fromString<V>(other,this[ntfnSymbol]);
			if(!(fsother instanceof Phi)) throw TypeError(`Invalid Phi.prototype.lexcmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
			other = fsother;
		}
		// In lexicographical comparison, longer = bigger
		if (this.args.length > other.args.length) return 1;
		if (this.args.length < other.args.length) return -1;
		// Iterate to check term by term
		for (let i = 0; i < this.args.length; i++) {
			// Compare numbers
			if (isNonTransfiniteNumber(this.args[i])) {
				if (isNonTransfiniteNumber(other.args[i])) {
					if (this[ntfnSymbol].eq(this.args[i] as Ntfn<V>, other.args[i] as Ntfn<V>)) continue;
					return this.args[i] > other.args[i]
						? 1
						: this.args[i] < other.args[i]
						? -1
						: 0;
				}
				return -1;
			}
			if (isNonTransfiniteNumber(other.args[i])) return 1;
			// Compare infinite terms
			// the number check is above.
			const c = (this.args[i] as Exclude<typeof this.args[number],Ntfn<V>>).cmp(other.args[i]);
			if (c !== 0) return c;
		}
		// Return 0 if they're equal
		return 0;
	}

	mul(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (other instanceof Atom) other = other.value;
		if(isNonTransfiniteNumber(other)){
			if (other[ntfnSymbol].eq(other,other[ntfnSymbol].n1)) return this.clone();
			if (other[ntfnSymbol].eq(other,other[ntfnSymbol].n0)) return new Atom(this[ntfnSymbol].n0);
			return productVN(new Phi(...this.args), other);
		}
		if (other instanceof Sum)
			return sumVN(...other.addends.map(e => this.mul(e)));
		if (other instanceof Product)
			return productVN(this.mul(other.ord) as Phi<V>, other.mult);
		let t: Phi<V> = this.clone();
		if(!(other instanceof Phi)) throw new TypeError(`Invalid Phi.prototype.mul argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
		if (this.args.length > 1) t = Phi.fromValue_noStandardize(this);
		if (other.args.length > 1) other = Phi.fromValue_noStandardize(other);
		t.args[0] = Atom.wrapIfNumber(t.args[0]);
		if(!(other instanceof Phi)) throw new TypeError(`Invalid Phi.prototype.mul argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
		other.args[0]=Atom.wrapIfNumber(other.args[0]);
		return phiVN(t.args[0].add(other.args[0]) as PhiArg<V>);
	}

	pow(other: ConcreteVNSource<V>): ConcreteVN<V> {
		if (typeof other === "string") other = Parser.fromString(other,this[ntfnSymbol]);
		if (other instanceof Sum) {
			let p: ConcreteVN<V> = new Atom(this[ntfnSymbol].n1);
			for (const i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		if (other instanceof Atom) other = other.value;
		if(isNonTransfiniteNumber(other)){
			if (this[ntfnSymbol].eq(other,this[ntfnSymbol].n1)) return this.clone();
			if (this[ntfnSymbol].eq(other,this[ntfnSymbol].n0)) return new Atom(this[ntfnSymbol].n1);
		}
		let t: ConcreteVN<V> = this.clone();
		if (this.args.length > 1) t = Phi.fromValue_noStandardize(this.clone());
		if (isNonTransfiniteNumber(t.args[0])) t.args[0] = new Atom(t.args[0]);
		//TODO: figure out how to organize class hierachy (if it should even exist)
		t.args[0] = t.args[0].mul(other);
		t = t.toStandardized();
		//console.log("Phi.pow end")
		return t;
	}

	toString(): string {
		return "phi(" + this.args.join(",") + ")";
	}

	toMixed(): string {
		// ntfn will be converted to Atom in the next line
		const t_args = [...this.args] as (Exclude<PhiArg<V>,Ntfn<V>>)[];
		for (const i in t_args)
			//@ts-expect-error change ntfn to Atom
			if (isNonTransfiniteNumber(t_args[i])) t_args[i] = new Atom<V>(t_args[i]);
		if (t_args.length === 1) {
			if (t_args[0] instanceof Atom && this[ntfnSymbol].eq(t_args[0].value, this[ntfnSymbol].n1)) return "w";
			const s = Parser.handleParens(t_args[0].toMixed());
			return `w^${s}`;
		}
		if (t_args.length === 2 && t_args[0] instanceof Atom){
			if (this[ntfnSymbol].eq(t_args[0].value, this[ntfnSymbol].n1)) {
				const s = Parser.handleParens(t_args[1].toMixed(), true);
				return `e${s}`;
			}
			if (this[ntfnSymbol].eq(t_args[0].value, this[ntfnSymbol].n2)) {
				const s = Parser.handleParens(t_args[1].toMixed(), true);
				return `z${s}`;
			}
			if (this[ntfnSymbol].eq(t_args[0].value, this[ntfnSymbol].n3)) {
				const s = Parser.handleParens(t_args[1].toMixed(), true);
				return `n${s}`;
			}
		}
		if (t_args.length === 3 && t_args[0] instanceof Atom && this[ntfnSymbol].eq(t_args[0].value, this[ntfnSymbol].n1)
			 && t_args[1] instanceof Atom && this[ntfnSymbol].eq(t_args[1].value, this[ntfnSymbol].n0)) {
			const s = Parser.handleParens(t_args[2].toMixed(), true);
			return `G${s}`;
		}
		return "phi(" + t_args.map(e => e?.toMixed()) + ")";
	}

	toHTML(): string {
		//console.log(`toHTML() called on ${this}, this[ntfnSymbol]===${JSON.stringify(this[ntfnSymbol])}`)
		// same reason as Phi.prototype.toMixed
		const t_args = [...this.args] as Exclude<PhiArg<V>,Ntfn<V>>[]
		for (const i in t_args)
			//@ts-expect-error change ntfn to Atom
			if (isNonTransfiniteNumber(t_args[i])) t_args[i] = new Atom(t_args[i]);
		if (t_args.length === 1) {
			if (t_args[0] instanceof Atom && this[ntfnSymbol].eq(t_args[0].value, this[ntfnSymbol].n1)) return "&omega;";
			const s: string = t_args[0].toHTML();
			return `&omega;<sup>${s}</sup>`;
		}
		if(t_args[0] instanceof Atom){
			if(t_args.length === 2){
				if (this[ntfnSymbol].eq(t_args[0].value,this[ntfnSymbol].n1)) {
					const s = t_args[1].toHTML();
					return `&epsilon;<sub>${s}</sub>`;
				}
				if (this[ntfnSymbol].eq(t_args[0].value,this[ntfnSymbol].n2)) {
					const s = t_args[1].toHTML();
					return `&zeta;<sub>${s}</sub>`;
				}
				if (this[ntfnSymbol].eq(t_args[0].value,this[ntfnSymbol].n3)) {
					const s = t_args[1].toHTML();
					return `&eta;<sub>${s}</sub>`;
				}
			}
			if (t_args.length === 3 && this[ntfnSymbol].eq(t_args[0].value, this[ntfnSymbol].n1)
				&& t_args[1] instanceof Atom && this[ntfnSymbol].eq(t_args[1].value, this[ntfnSymbol].n0)) {
				const s = t_args[2].toHTML();
				return `&Gamma;<sub>${s}</sub>`;
			}
		}
		return "&phi;(" + t_args.map(e => e.toHTML()) + ")";
	}

	[Symbol.iterator]() {
		return this.args[Symbol.iterator]();
	}
}
export function convertNumberType<TOld extends {}, TNew extends {}>(ord: Ntfn<TOld>|ConcreteVN<TOld>, ntfnObj: ntfnArithmeticObject<TNew>, convertFunction: (v: Ntfn<TOld>) => Ntfn<TNew>): ConcreteVN<TNew>{
	if(isNonTransfiniteNumber<TOld>(ord)){
		return new Atom(convertFunction(ord));
	}
	if(!isConcreteVN(ord)) throw TypeError("ord is not ConcreteVN");
	if(ord instanceof Atom){
		return new Atom(convertFunction(ord.value));
	}
	if(ord instanceof Sum){
		//@ts-expect-error too lazy to write out the types
		return new Sum(...ord.addends.map((v)=>convertNumberType(v,ntfnObj,convertFunction)))
	}
	if(ord instanceof Product){
		return new Product<TNew>(convertNumberType(ord.ord,ntfnObj,convertFunction) as Phi<TNew>,convertFunction(ord.mult));
	}
	if(ord instanceof Phi){
		return new Phi(...ord.args.map((v)=>convertNumberType(v,ntfnObj,convertFunction)));
	}
	ord satisfies never;
	throw TypeError("ord is not ConcreteVN");
}
type Operator = '+'|'*'|'^'|','|'('|')'|'['|']';
type BinaryOperator = '+'|'*'|'^';
/*class ParserTokenC<T extends TokenType> {
	type: T;
	value: T extends 2? Operator:string;
	args: number;
	constructor(type: T, value: T extends 2? Operator:string, args = 0) {
		this.type = type;
		this.value = value;
		this.args = args;
	}
};*/

type ParserToken ={
	type: 0|1,
	value: string,
	args: number
} | {
	type: 2,
	value: Operator,
	args: number
}

export const Parser = {
	TYPES: Object.freeze({
		LITERAL: 0,
		IDENTIFIER: 1,
		OPERATOR: 2,
	} as const),

	addParensToUnaryOperator(str: string): string{
		const stack: string[] = [];
		const rsltBuilder: string[] = [];
		//translated from fixUnary.go
		let bracketCount = 0;
		let mayNeedOpenParen = false;
		for(const c of str){
			if(c==='['){
				bracketCount++;
			} else if(c===']'){
				bracketCount--;
			} else if(bracketCount>0){
				rsltBuilder.push(c);
				continue;
			}
			if(mayNeedOpenParen && c !== '(' && c != '['){
				rsltBuilder.push('(')
			}
			mayNeedOpenParen=false;
			if(c !== ')' && c !== ']' && c !== '+' && c !== '*' && c !== '^'){
				rsltBuilder.push(c);
			}
			if(c === 'e' || c === 'z' || c === 'n' || c === 'G'){
				mayNeedOpenParen = true
			}
			switch(c){
				case 'e': case 'z': case 'n': case 'G': case '(': case '[':
					stack.push(c);
					break;
				case ')': case ']': case '+': case '*': case '^': {
					let lasti = stack.length-1;
					for(;lasti>=0&&
						(stack[lasti]==='e'||stack[lasti]==='z'||stack[lasti]==='n'||stack[lasti]==='G');lasti--){
						rsltBuilder.push(')');

					}
					rsltBuilder.push(c)
					if((c === ')' || c === ']')&&lasti>=0&&(stack[lasti]==='('||stack[lasti]==='[')){
						lasti--;
						if(lasti>=0&&stack[lasti]==='e'||stack[lasti]==='z'||stack[lasti]==='n'||stack[lasti]==='G'){
							lasti--;
						}
					}
					stack.length = lasti+1;
				}
			}
		}
		let stacki = stack.length-1;
		for(;stacki>=0;stacki--){
			if(stack[stacki]==='e'||stack[stacki]==='z'||stack[stacki]==='n'||stack[stacki]==='G'||stack[stacki]==='('){
				rsltBuilder.push(')')
			}
			if(stack[stacki]==='['){
				rsltBuilder.push(']')
			}
		}
		return rsltBuilder.join('')
	},

	isNumber(char: string) {
		return /[0-9w]/.test(char);
	},

	isOperator(char: string): char is Operator {
		return /[+*^()\[\],]/.test(char);
	},

	tokenize(str: string) {
		str.replace(/([-/])/, function (_match, c1) {
			throw new VN_ParserError(`Unknown char: "${c1}"`);
		});
		const tokens: ParserToken[] = [];
		let numbuff: string[] = [];
		let idbuff: string[] = [];
		let bracketLayerCount=0;
		for (let i = 0; i < str.length; i++) {
			const char = str[i];
			const type = Parser.isNumber(char)||(bracketLayerCount>0&&!(char===']'&&bracketLayerCount===1))
				? 0
				: Parser.isOperator(char)
				? 2
				: 1;
			if(char==='[') bracketLayerCount++;
			else if(char===']') bracketLayerCount--;
			if (numbuff.length > 0 && type !== 0) {
				tokens.push(
					{type:Parser.TYPES.LITERAL, value:numbuff.join(""),args:0}
				);
				numbuff = [];
			}
			if (idbuff.length > 0 && type !== 1) {
				tokens.push(
					{type:Parser.TYPES.IDENTIFIER, value:idbuff.join(""),args:0}
				);
				idbuff = [];
			}
			if (type === 0) numbuff.push(char);
			else if (type === 1) idbuff.push(char);
			//type === 2 (Operator)
			else {
				if(bracketLayerCount<0) throw new VN_ParserError("Mismatched brackets");
				if(!(char==='+'||char==='*'||char==='^'||char===','||char==='('||char===')'||char==='['||char===']')) throw new VN_ParserError(`Invalid OPERATOR: ${char}`)
				tokens.push({type:Parser.TYPES.OPERATOR, value: char,args:0});
			}
		}
		if (numbuff.length > 0)
			tokens.push(
				{type:Parser.TYPES.LITERAL, value:numbuff.join(""),args:0}
			);
		if (idbuff.length > 0)
			tokens.push(
				{type:Parser.TYPES.IDENTIFIER, value:idbuff.join(""),args:0}
			);
		if(bracketLayerCount!==0) throw new VN_ParserError("Mismatched brackets")
		return tokens;
	},

	ASSOC: {
		"+": "left",
		"*": "left",
		"^": "right",
	} as const,

	PREC: {
		"+": 2,
		"*": 3,
		"^": 4,
	} as const,

	parse(tokens: ParserToken[]) {
		const output: ParserToken[] = [];
		const stack: ParserToken[] = [];
		const were_values: boolean[] = [];
		const arg_count: number[] = [];
		while (tokens.length > 0) {
			const token = tokens.shift();
			if(token==undefined) throw new VN_ParserError(`Ran out of tokens`);
			if (token.type === Parser.TYPES.LITERAL) {
				output.push(token);
				if (were_values.length > 0) {
					were_values.pop();
					were_values.push(true);
				}
			} else if (token.type === Parser.TYPES.IDENTIFIER) {
				stack.push(token);
				arg_count.push(0);
				if (were_values.length > 0) {
					were_values.pop();
					were_values.push(true);
				}
				were_values.push(false);
			} else if (token.value === ",") {
				let mismatched = true;
				while (stack.length > 0) {
					if (stack[stack.length - 1].value !== "(")
						// since stack.length>0, stack.pop() !== undefined
						output.push(stack.pop()!);
					else {
						mismatched = false;
						break;
					}
				}
				if (mismatched) throw new VN_ParserError("Mismatched parenthesis");
				if (were_values.pop()) {
					arg_count[arg_count.length - 1]++;
					were_values.push(false);
				}
			} else if (token.value === "(" || token.value === "[") stack.push(token);
			else if (token.value === ")" || token.value === "]") {
				const correspondingChar = token.value===']'?'[':'('
				const otherTypeChar = token.value===']'?'(':'['
				let mismatched = true;
				while (stack.length > 0) {
					if(stack[stack.length - 1].value === otherTypeChar) break;
					if (stack[stack.length - 1].value !== correspondingChar)
						// since stack.length>0, stack.pop() !== undefined
						output.push(stack.pop()!);
					else {
						mismatched = false;
						break;
					}
				}
				if (mismatched) throw new VN_ParserError(`Mismatched ${token.value===']'?"brackets":"parenthesis"}`);
				stack.pop();
				if (
					stack.length > 0 &&
					stack[stack.length - 1].type === Parser.TYPES.IDENTIFIER
				) {
					//see previous condition for nonnull assertion.
					const f = stack.pop()!;
					let a = arg_count.pop();
					if(a===undefined) throw new VN_ParserError("arg_count is empty");
					if (were_values.pop()) a++;
					f.args = a;
					output.push(f);
				}
			} else if (token.type === Parser.TYPES.OPERATOR) {
				while (
					stack.length > 0 &&
					stack[stack.length - 1].type === Parser.TYPES.OPERATOR &&
					((Parser.ASSOC[token.value] === "left" &&
						Parser.PREC[token.value] <=
							Parser.PREC[stack[stack.length - 1].value as BinaryOperator]) ||
						(Parser.ASSOC[token.value] === "right" &&
							Parser.PREC[token.value] <
								Parser.PREC[stack[stack.length - 1].value as BinaryOperator]))
				)
					output.push(stack.pop()!);
				stack.push(token);
			}
		}
		while (stack.length > 0) {
			const op = stack.pop()!;
			if (/[()]/.test(op.value)) throw new VN_ParserError("Mismatched parenthesis");
			output.push(op);
		}
		return output;
	},

	fromString<V extends {}>(str: string, ntfnObj: ntfnArithmeticObject<V>): ConcreteVN<V> {
		str = Parser.addParensToUnaryOperator(str);
		const tokens = Parser.tokenize(str);
		const rpn = Parser.parse(tokens);
		const args: ConcreteVN<V>[] = [];
		while (rpn.length > 0) {
			const token = rpn.shift()!;
			if (token.type === Parser.TYPES.LITERAL) {
				if (token.value === "w") args.push(new Phi(ntfnObj.n1));
				else {
					const f = ntfnObj.fromString(token.value);
					if (!ntfnObj.isNaN(f)) args.push(new Atom(f));
					else throw new VN_ParserError(`Unknown token: ${token.value}`);
				}
			} else if (token.type === Parser.TYPES.OPERATOR) {
				const a1 = args.pop();
				const a2 = args.pop();
				if(a1===undefined||a2===undefined) throw new VN_ParserError(`Invalid OPERATOR ${token.value}`);
				if (token.value === "+") args.push(a2.add(a1));
				else if (token.value === "*") args.push(a2.mul(a1));
				else if (token.value === "^") args.push(a2.pow(a1));
			} else if (token.type === Parser.TYPES.IDENTIFIER) {
				const a: ConcreteVN<V>[] = [];
				for (let i = 0; i < token.args; i++) {
					const p = args.pop();
					if(p===undefined) throw new VN_ParserError('args is empty');
					a.push(p);
				}
				if (token.value === "e") args.push(phiVN(ntfnObj.n1, a[0]));
				else if (token.value === "z") args.push(phiVN(ntfnObj.n2, a[0]));
				else if (token.value === "n") args.push(phiVN(ntfnObj.n3, a[0]));
				else if (token.value === "G") args.push(phiVN(ntfnObj.n1, ntfnObj.n0, a[0]));
				else if (token.value === "phi" || token.value === "p")
					args.push(phiVN(...a.reverse()));
				else throw new VN_ParserError(`Invalid IDENTIFIER ${token.value}`);
			}
		}
		return args[0]??new Atom(0);
	},

	handleParens(str: string, sub = false, replace: string | boolean = false) {
		if (Parser.needsParens(str, sub))
			return `(${replace !== false ? replace : str})`;
		return replace !== false ? replace : str;
	},

	needsParens(str: string, sub: boolean = false) {
		const t = Parser.parse(Parser.tokenize(Parser.addParensToUnaryOperator(str)))
			.map(e => e.value)
			.join("");
		if (t.endsWith("+") || t.endsWith("*") || (sub && t.endsWith("^")))
			return true;
		return false;
	},
};

export class VebleNumConstants<V extends {}>{
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
	
	constructor(ntfnObj: ntfnArithmeticObject<V>) {
		this.ntfnObj = ntfnObj;

		this.zero = new Atom(ntfnObj.n0);
		this.one = new Atom(ntfnObj.n1);
		this.w = new Phi(ntfnObj.n1);
		this.omega = new Phi(ntfnObj.n1);
		this.Least_Transfinite_Ordinal = new Phi(ntfnObj.n1);
		this.e0 = new Phi(ntfnObj.n1,ntfnObj.n0);
		this.epsilon0 = new Phi(ntfnObj.n1,ntfnObj.n0);
		this.Small_Cantor_Ordinal = new Phi(ntfnObj.n1, ntfnObj.n0);
		this.z0 = new Phi(ntfnObj.n2, ntfnObj.n0);
		this.zeta0 = new Phi(ntfnObj.n2, ntfnObj.n0);
		this.Cantor_Ordinal = new Phi(ntfnObj.n2, ntfnObj.n0);
		this.n0 = new Phi(ntfnObj.n3, ntfnObj.n0);
		this.eta0 = new Phi(ntfnObj.n3, ntfnObj.n0);
		this.G0 = new Phi(ntfnObj.n1, ntfnObj.n0, ntfnObj.n0);
		this.Gamma0 = new Phi(ntfnObj.n1, ntfnObj.n0, ntfnObj.n0);
		this.Feferman_Schutte_Ordinal = new Phi(ntfnObj.n1, ntfnObj.n0, ntfnObj.n0);
		this.Ackermann = new Phi(ntfnObj.n1, ntfnObj.n0, ntfnObj.n0, ntfnObj.n0);

	}
}

/**
 * Creates the appropriate VNClass instance.
 * 
 * may be called with or without `new`
 */
const VebleNum = Object.assign(function VebleNum<V extends {}>(input: unknown,ntfnObj?: ntfnArithmeticObject<V>): ConcreteVN<V> {
	if (isNonTransfiniteNumber<V>(input)) return new Atom(input);
	if (isConcreteVN<V>(input)) return input.clone();
	if(typeof ntfnObj!=='object') throw TypeError("ntfnObj couldn't be inferred but also not given");
	if (typeof input === 'string'){
		return Parser.fromString<V>(input.replace(/\s/g, ""),ntfnObj);
	}
	return new Atom(ntfnObj.n0);
}, {
	fromString: Parser.fromString,
	fromValue_noAlloc<V extends {}>(v: ConcreteVNSource<V>,ntfnObj?: ntfnArithmeticObject<V>){
		if(isConcreteVN(v)) return v;
		return VebleNum(v,ntfnObj)
	},
	clone<T>(input: T): T {
		if (input == null || typeof input !== 'object') return input;
		if (input instanceof VNClass) return input.clone();
		if (Array.isArray(input)) {
			const c: unknown[] = [];
			for (let i=0;i<input.length;i++) {
				if(input[i] !== null&&typeof input[i] === 'object') c.push(VebleNum.clone(input[i]));
				else c.push(input[i]);
			}
			return c as T;
		}

		const c = Object.create(Object.getPrototypeOf(input)) as typeof input;
		for (const i in input) { 
			//if (i === "clone") continue;
			c[i] = typeof input[i]==='object' && input !== null ? VebleNum.clone(input[i]) : input[i];
		}
		return c;

	},
	isEpsilon(): boolean {
		return this instanceof Phi && this.args.length >= 2;
	},
	isZeta(): boolean {
		return (
			this instanceof Phi &&
			(this.args.length >= 3 ||
				(this.args.length === 2 && new Atom(2).cmp(this.args[0]) < 1))
		);
	},
	isEta(): boolean {
		return (
			this instanceof Phi &&
			(this.args.length >= 3 ||
				(this.args.length === 2 && new Atom(3).cmp(this.args[0]) < 1))
		);
	},
	isGamma(): boolean {
		return this instanceof Phi && this.args.length >= 3;
	},
	epsilon<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>) {
		n = VebleNum.fromValue_noAlloc(n,ntfnObj);
		if(!isPhiArg(n)) throw new TypeError(`Invalid VebleNum.epsilon argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
		return phiVN<V>(n[ntfnSymbol].n1, n);
	},
	zeta<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>) {
		n = VebleNum.fromValue_noAlloc(n,ntfnObj);
		if(!isPhiArg(n)) throw new TypeError(`Invalid VebleNum.zeta argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
		return phiVN<V>(n[ntfnSymbol].n2, n);
	},
	eta<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>) {
		n = VebleNum.fromValue_noAlloc(n,ntfnObj);
		if(!isPhiArg(n)) throw new TypeError(`Invalid VebleNum.eta argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
		return phiVN<V>(n[ntfnSymbol].n3, n);
	},
	Gamma<V extends {}>(n: ConcreteVNSource<V>, ntfnObj?: ntfnArithmeticObject<V>) {
		n = VebleNum.fromValue_noAlloc(n,ntfnObj);
		if(!isPhiArg(n)) throw new TypeError(`Invalid VebleNum.Gamma argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
		return phiVN<V>(n[ntfnSymbol].n1, n[ntfnSymbol].n0, n);
	},
	add<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		if (isNonTransfiniteNumber(a)) a = new Atom(a);
		else if (!(a instanceof VNClass)) a = VebleNum(a);
		return a.add(b);
	},
	
	mul<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		if (isNonTransfiniteNumber(a)) a = new Atom(a);
		if (!(a instanceof VNClass)) a = VebleNum(a);
		if (isNonTransfiniteNumber(b)) b = new Atom(b);
		if (!(b instanceof VNClass)) b = VebleNum(b);
		return a.mul(b);
	},
	pow<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		if (isNonTransfiniteNumber(a)) a = new Atom(a);
		else if (!(a instanceof VNClass)) a = VebleNum(a);
		if (isNonTransfiniteNumber(b)) b = new Atom(b);
		if (!(b instanceof VNClass)) b = VebleNum(b);
		return a.pow(b);
	},
	cmp<V extends {}>(a: Ntfn<V> | ConcreteVN<V>, b: Ntfn<V> | ConcreteVN<V>) {
		if (isNonTransfiniteNumber(a)) a = new Atom(a);
		else if (!(a instanceof VNClass)) a = VebleNum(a);
		return a.cmp(b);
	},
	Atom,
	Sum,
	Product,
	Phi,
	
	zero: new Atom(0),
	one: new Atom(1),
	w: new Phi(1),
	omega: new Phi(1),
	Least_Transfinite_Ordinal: new Phi(1),
	e0: new Phi(1, 0),
	epsilon0: new Phi(1, 0),
	Small_Cantor_Ordinal: new Phi(1, 0),
	z0: new Phi(2, 0),
	zeta0: new Phi(2, 0),
	Cantor_Ordinal: new Phi(2, 0),
	n0: new Phi(3, 0),
	eta0: new Phi(3, 0),
	G0: new Phi(1, 0, 0),
	Gamma0: new Phi(1, 0, 0),
	Feferman_Schutte_Ordinal: new Phi(1, 0, 0),
	Ackermann: new Phi(1, 0, 0, 0),
});

export default VebleNum;