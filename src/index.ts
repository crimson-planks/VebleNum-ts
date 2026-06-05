;"use strict";
type VNClassSource = VNClass | number | string;
type CompareResult = -1 | 0 | 1;
abstract class VNClass {
	/**
	 * Set the type of this instance
	 * @param type - The type to set `this` to
	 */
	setType<P extends object | null>(type: {prototype: P}): asserts this is P {
		Object.setPrototypeOf(this, type.prototype);
	}

	static MAX_TERMS = 200;

	standardize(){

	};

	static clone(input: unknown): any {
		if (input===null || typeof input!=='object') return input;
		if (input instanceof VNClass) return input.clone();
		if (Array.isArray(input)) {
			let c: unknown[] = [];
			for (let i=0;i<input.length;i++) {
				if(input[i]!==null&&typeof input[i]==='object') c.push(VNClass.clone(input[i]));
				else c.push(input[i]);
			}
			return c;
		}

		let c = Object.create(Object.getPrototypeOf(input)) as typeof input;
		for (let i in input) { 
			//if (i == "clone") continue;
			//@ts-ignore input[i]
			c[i] = typeof input[i]==='object' && input!==null ? VNClass.clone(input[i]) : input[i];
		}
		return c;

	}
	clone<T extends VNClass>(this: T): T {
		// Making TS happy; obj.[[Prototype]] will eventually be a subtype of VNClass.
		let obj: VNClass = {} as VNClass;
		for (let i in this) {
			//@ts-ignore
			if (this[i]!==null&&typeof this[i] === 'object') obj[i] = VNClass.clone(this[i]);
			//@ts-ignore
			else obj[i] = this[i];
		}
		//VNClass.prototype.setType<T>.bind(obj)(this.constructor);

		obj.setType<T>(this.constructor);

		if (!(obj instanceof Atom)) obj.standardize();
		return obj;
	}

	add(other: number | VNClass): VNClass {
		if (!(other instanceof VNClass)) {
			if (typeof other == "number") other = new Atom(other);
			else other = new VebleNum(other);
		}
		return sumVN(this,other);
	}

	isEpsilon() {
		return this instanceof Phi && this.args.length >= 2;
	}

	isZeta() {
		return (
			this instanceof Phi &&
			(this.args.length >= 3 ||
				(this.args.length == 2 && new Atom(2).cmp(this.args[0]) < 1))
		);
	}

	isEta() {
		return (
			this instanceof Phi &&
			(this.args.length >= 3 ||
				(this.args.length == 2 && new Atom(3).cmp(this.args[0]) < 1))
		);
	}

	isGamma() {
		return this instanceof Phi && this.args.length >= 3;
	}

	static add(a: number | VNClass, b: number | VNClass) {
		if (!(a instanceof VNClass)) {
			if (typeof a == "number") a = new Atom(a);
			else a = new VebleNum(a);
		}
		return a.add(b);
	}
	abstract mul(other: VNClassSource): VNClass;
	static mul(a: number | VNClass, b: number | VNClass) {
		if (!(a instanceof VNClass)) {
			if (typeof a == "number") a = new Atom(a);
			else a = new VebleNum(a);
		}
		if (!(b instanceof VNClass)) {
			if (typeof b == "number") b = new Atom(b);
			else b = new VebleNum(b);
		}
		return a.mul(b);
	}
	abstract pow(other: VNClassSource): VNClass;
	static pow(a: number | VNClass, b: number | VNClass) {
		if (!(a instanceof VNClass)) {
			if (typeof a == "number") a = new Atom(a);
			else a = new VebleNum(a);
		}
		if (!(b instanceof VNClass)) {
			if (typeof b == "number") b = new Atom(b);
			else b = new VebleNum(b);
		}
		return a.pow(b);
	}
	abstract cmp(other: VNClassSource): CompareResult;
	static cmp(a: number | VNClass, b: number | VNClass) {
		if (!(a instanceof VNClass)) {
			if (typeof a == "number") a = new Atom(a);
			else a = new VebleNum(a);
		}
		return a.cmp(b);
	}

	static epsilon(n: VNClassSource) {
		if (!(n instanceof VNClass)) {
			if (typeof n == "number") n = new Atom(n);
			else n = new VebleNum(n);
		}
		return new Phi(1, n);
	}
	static zeta(n: VNClassSource) {
		if (!(n instanceof VNClass)) {
			if (typeof n == "number") n = new Atom(n);
			else n = new VebleNum(n);
		}
		return new Phi(2, n);
	}
	static eta(n: VNClassSource) {
		if (!(n instanceof VNClass)) {
			if (typeof n == "number") n = new Atom(n);
			else n = new VebleNum(n);
		}
		return new Phi(3, n);
	}
	static Gamma(n: VNClassSource) {
		if (!(n instanceof VNClass)) {
			if (typeof n == "number") n = new Atom(n);
			else n = new VebleNum(n);
		}
		return new Phi(1, 0, n);
	}

	gt(other: VNClassSource) {
		return this.cmp(other) === 1;
	}
	lt(other: VNClassSource) {
		return this.cmp(other) === -1;
	}
	gte(other: VNClassSource) {
		return this.cmp(other) > -1;
	}
	lte(other: VNClassSource) {
		return this.cmp(other) > 1;
	}
	eq(other: VNClassSource) {
		return this.cmp(other) === 0;
	}
	neq(other: VNClassSource) {
		return this.cmp(other) !== 0;
	}
}

//class CloneTemplate extends VNClass {}

function sumVN(...addends: (number|VNClass)[]): VNClass{
	const work1Arr: (VNClass | number | (VNClass | number)[])[] = [];
	for (let addend of addends) {
		if (
			addend instanceof VNClass &&
			!(addend instanceof Atom)
		)
			addend.standardize();
		// Flatten sums into the array
		if (addend instanceof Sum) {
			work1Arr.push(addend.addends);
		}
		// Turn Atoms into numbers
		if (addend instanceof Atom)
			work1Arr.push(addend.value);
	}
	const work2Arr: (number | VNClass)[] = work1Arr.flat();

	// Merge final numbers
	while (
		work2Arr.length >= 2 &&
		typeof work2Arr[work2Arr.length - 1] == "number" &&
		typeof work2Arr[work2Arr.length - 2] == "number"
	){
		//@ts-ignore
		work2Arr[work2Arr.length - 2] += work2Arr.pop();
	}

	// Convert to an Atom when necessary
	if (work2Arr.length == 1 && typeof work2Arr[0] == "number") {
		return new Atom(work2Arr[0]);
	}
	const work3Arr: (number | VNClass | null)[] = [...work2Arr];
	// Remove redundant terms
	for (let i = 0; i < work3Arr.length - 1; i++) {
		const curr=work3Arr[i];
		if(curr===null) continue;
		//finite ordinal + transfinite ordinal -> the same transfinite ordinal
		if(typeof curr==='number'){work3Arr[i]=null;continue}
		//null is only used as padding for removed elements during this current, so next wont be null.
		const next = work3Arr[i+1]!;
		if (curr.cmp(next) == -1) {
			if (curr instanceof Product) {
				if (next instanceof Product) {
					if (
						curr.ord.cmp(next.ord) ===
						0
					)
						continue;
					work3Arr[i]=null;
					continue;
				}
				if (curr.ord.cmp(next) === 0)
					continue;
				work3Arr[i]=null;
				continue;
			}
			if (next instanceof Product) {
				if (curr.cmp(next.ord) === 0)
					continue;
				work3Arr[i]=null;
				continue;
			}
			if (curr.cmp(next) === 0) continue;
			work3Arr[i]=null;
			continue;
		}
	}
	const work4Arr: (number|VNClass|null)[] = work3Arr.filter((v)=>v!==null)

	// Collect like terms
	for (let i = 0; i < work4Arr.length - 1; i++) {
		const curr=work4Arr[i] as VNClass | null;
		if(curr===null) continue;
		//same reason for non-null as above.
		const next = work4Arr[i+1]!;
		// If they're equal just merge into a Product
		if (next instanceof VNClass && curr.cmp(next) === 0) {
			work4Arr[i + 1] = new Product(next, 2);
			work4Arr[i]=null;
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
						curr.mult + next.mult
					);
					work4Arr[i]=null;
				}
				continue;
			}
			// ...and the next one is not but they are like terms then merge
			if (next instanceof VNClass && curr.ord.cmp(next) === 0) {
				work4Arr[i + 1] = new Product(
					next,
					curr.mult + 1
				);
				work4Arr[i]=null;
			}
			continue;
		}
		// If the current one isn't a Product...
		if (next instanceof Product) {
			// ...if they're like terms then merge
			if (curr.cmp(next.ord) === 0) {
				work4Arr[i + 1] = new Product(
					next.ord,
					1 + next.mult
				);
				work4Arr[i]=null;
			}
		}
	}
	const work5Arr: (number | VNClass)[] = work4Arr.filter((v)=>v!==null);
	// Remove outer Sum to simplify single term
	if (work5Arr.length === 1) {
		//the number case is handled above
		return work5Arr[0] as VNClass;
	}
	return new Sum(...(work5Arr as ((number|Product|Phi)[])&{0:Product|Phi}));
}
class Atom extends VNClass {
	value: number;
	/**
	 * Class to handle storing independent numbers
	 * @param {Number} value - The value of the atom
	 */
	constructor(value: Atom | number) {
		super();

		this.value = typeof value==='number' ? value : value.value;
	}
	standardize(): void {}
	static wrapIfNumber(v: number | VNClass){
		return typeof v==='number' ? new Atom(v) : v;
	}
	static unwrap(a: Atom|number): number{
		return typeof a==='number' ? a : a.value;
	}
	add(other: VNClassSource): VNClass {
		if (typeof other == "string") other = Parser.fromString(other);
		if (typeof other == "number") return new Atom(this.value + other);
		if (other instanceof Atom) return new Atom(this.value + other.value);
		return other;
	}

	mul(other: VNClassSource): VNClass {
		if (typeof other === "string") other = Parser.fromString(other);
		if (typeof other == "number") return new Atom(this.value * other);
		if (other instanceof Atom) return new Atom(this.value * other.value);
		if (this.value == 1) return other.clone();
		if (this.value == 0) return new Atom(0);
		return other.clone();
	}

	pow(other: VNClassSource): VNClass {
		if (typeof other == "string") other = Parser.fromString(other);
		if (other instanceof Sum) {
			let p: VNClass = new Atom(1);
			for (let i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		//other is ω^α (α>1)
		if (
			other instanceof Phi &&
			other.args.length == 1 &&
			new Atom(1).cmp(other.args[0]) == -1
		) {
			//if ω<=α (other>=ω^ω)
			if (new Phi(1).cmp(other.args[0]) < 1)
				return new Phi(other.clone());
			//if 1<α<ω: then α is number or Atom
			let o = other.clone();
			o.args[0] =  Atom.unwrap(o.args[0] as number | Atom) - 1;
			return new Phi(o);
		}
		if (typeof other === "number") return new Atom(this.value ** other);
		if (other instanceof Atom) return new Atom(this.value ** other.value);
		if (this.value === 1) return new Atom(1);
		if (this.value === 0) return new Atom(0);
		return other.clone();
	}

	cmp(other: VNClassSource): CompareResult {
		if (typeof other == "string") other = Parser.fromString(other);
		if (typeof other == "number")
			return this.value > other ? 1 : this.value < other ? -1 : 0;
		if (other instanceof Atom)
			return this.value > other.value
				? 1
				: this.value < other.value
				? -1
				: 0;
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
}

class Sum extends VNClass {
	addends: (number|Product|Phi)[] & {0?: Product|Phi}
	/**
	 * Class to handle sums of terms, terms are either number or Product or Phi
	 */
	constructor(...args: (number|Product|Phi)[] & {0?: Product|Phi}) {
		super();
		this.addends = args;

		this.standardize();
	}

	standardize() {
	}

	cmp(other: VNClassSource): CompareResult {
		if (typeof other === "string") other = Parser.fromString(other);
		// Standard Sums are always greater than Atoms
		if (typeof other === "number" || other instanceof Atom) return 1;

		// If other > first term then -1, if other == first term then 1, or other < first term then 1
		if (other instanceof Product || other instanceof Phi){
			//the first term of Sum is never number; number becomes Atom.
			return (this.addends[0]!).cmp(other) === -1 ? -1 : 1;
		}
		if(!(other instanceof Sum)) throw TypeError(`Invalid Sum.cmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
		// Compare with other terms
		for (let i = 0; i < Math.min(this.terms, other.terms); i++) {
			if (typeof this.addends[i] == "number") {
				if (typeof other.addends[i] == "number")
					return this.addends[i] > other.addends[i]
						? 1
						: this.addends[i] < other.addends[i]
						? -1
						: 0;
				return -1;
			}
			if (typeof other.addends[i] == "number") return 1;
			//ok typescript, there is a type guard for number right above.
			let c = (this.addends[i] as Exclude<typeof this.addends[number],number>).cmp(other.addends[i]);
			if (c !== 0) return c;
		}
		if (this.terms > other.terms) return 1;
		if (this.terms < other.terms) return -1;
		return 0;
	}

	mul(other: VNClassSource): VNClass {
		if (typeof other == "string") other = Parser.fromString(other);
		if (other === 1 || (other instanceof Atom && other.value === 1)) return this.clone();
		if (other === 0 || (other instanceof Atom && other.value === 0)) return new Atom(0);
		if (typeof other == "number") other = new Atom(other);
		if (other instanceof Sum)
			return sumVN(...other.addends.map(e => this.mul(e)));
		let t = this.addends[0]!;
		if (!(other instanceof Atom)) return t.mul(other);
		return sumVN(Atom.wrapIfNumber(t).mul(other), ...this.addends.slice(1));
	}

	pow(other) {
		if (typeof other == "string") other = Parser.fromString(other);
		if (other instanceof Sum) {
			let p = new Atom(1);
			for (let i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		if (other == 1 || other.value == 1) return this.clone();
		if (other == 0 || other.value == 0) return new Atom(1);
		if (typeof other == "number") other = new Atom(other);
		if (other instanceof Atom) {
			if (other.value > VNClass.MAX_TERMS - 1)
				throw "Too many terms, reduce exponent";
			let t = this.clone();
			for (let i = 0; i < other.value - 1; i++) t = t.mul(this);
			return t;
		}
		let t = this.addends[0];
		if (typeof t == "number") return new Atom(t).pow(other);
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
				if (typeof e == "number") return new Atom(e).toMixed();
				return e.toMixed();
			})
			.join("+");
	}
	toHTML() {
		return this.addends
			.map(e => {
				if (typeof e == "number") return new Atom(e).toHTML();
				return e.toHTML();
			})
			.join("+");
	}

	[Symbol.iterator]() {
		return this.addends[Symbol.iterator]();
	}
}

class Product extends VNClass {
	ord: Phi;
	mult: number;
	/**
	 * Class to handle products of an ordinal and a finite value
	 * @param {Phi} ord - Ordinal being multiplied
	 * @param {Number} mult - Finite multiplier
	 */
	constructor(ord: Phi, mult: number) {
		super();
		this.ord = ord;
		this.mult = mult;

		this.standardize();
	}

	standardize() {
		// Turn Atoms into numbers
		if (this.ord instanceof Atom) this.ord = this.ord.value;
		if (this.mult instanceof Atom) this.mult = this.mult.value;

		// Convert to a single Atom where possible
		if (typeof this.ord == "number") {
			this.value = this.ord * this.mult;
			delete this.ord;
			delete this.mult;
			this.setType(Atom);
		}

		// Simply x0 and x1
		if (this.mult == 0) {
			this.value = 0;
			delete this.ord;
			delete this.mult;
			this.setType(Atom);
		}
		if (this.mult == 1) {
			let o = this.ord;
			delete this.ord;
			delete this.mult;
			for (let i in o) this[i] = o[i];
			this.setType(o.__proto__.constructor);
		}

		// Simplify nested products
		if (this.ord instanceof Product) {
			this.mult = this.mult * this.ord.mult;
			this.ord = this.ord.ord;
		}
	}

	cmp(other) {
		if (typeof other == "string") other = Parser.fromString(other);
		// All standard products are greater than finite Atoms
		if (typeof other == "number" || other instanceof Atom) return 1;
		// Inverted comparison for Sum
		if (other instanceof Sum) return -other.cmp(this);
		// If other > ord then -1, if other == ord then 1, or other < ord then 1
		if (other instanceof Phi) return this.ord.cmp(other) == -1 ? -1 : 1;
		// Handle comparison with other Products
		let oc = this.ord.cmp(other.ord);
		if (oc !== 0) return oc;
		return this.mult > other.mult ? 1 : this.mult < other.mult ? -1 : 0;
	}

	mul(other) {
		if (typeof other == "string") other = Parser.fromString(other);
		if (other == 1 || other.value == 1) return this.clone();
		if (other == 0 || other.value == 0) return new Atom(0);
		if (other instanceof Atom) other = other.value;
		if (other instanceof Sum)
			return new Sum(...other.addends.map(e => this.mul(e)));
		if (typeof other == "number")
			return new Product(this.ord.mul(other), this.mult);
		return this.ord.mul(other);
	}

	pow(other) {
		if (typeof other == "string") other = Parser.fromString(other);
		if (other instanceof Sum) {
			let p = new Atom(1);
			for (let i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		if (other == 1 || other.value == 1) return this.clone();
		if (other == 0 || other.value == 0) return new Atom(1);
		if (typeof other == "number") other = new Atom(other);
		if (other instanceof Atom)
			return new Product(this.ord.pow(other), this.mult);
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
function phiVN(){

}
class Phi extends VNClass {
	args: (number|Atom|Sum|Product|Phi)[];
	/**
	 * Class to handle sums of terms, terms are either Sum, Product or Phi
	 * @param {...Sum|Product|Phi}
	 */
	constructor(...args: (number|Atom|Sum|Product|Phi)[]) {
		super();
		this.args = args;

		this.standardize();
	}

	static noStandard(...args: (number|Atom|Sum|Product|Phi)[]) {
		let t = new Phi();
		t.args = args;
		t.standardize(true);
		return t;
	}

	standardize(ns = false) {
		// Convert Atoms to numbers
		for (let i in this.args)
			if (this.args[i] instanceof Atom) this.args[i] = this.args[i].value;

		if (!ns) {
			// Remove redundant 0s
			while (this.args[0] == 0 && this.args.length > 1) this.args.shift();

			// Convert phi(0) to 1
			if (this.args[0] == 0) {
				this.setType(Atom);
				this.value = 1;
				delete this.args;
			}

			// Deal with fixed points
			for (let i in this.args) {
				if (!(this.args[i] instanceof Phi)) continue;
				let a = [...this.args];
				a[i] = "_";
				if (this.args[i].isFixedPoint(a)) this.args = this.args[i].args;
			}

			for (let i in this.args)
				if (
					this.args[i] instanceof VNClass &&
					!(this.args[i] instanceof Atom)
				)
					this.args[i].standardize();
		}
	}

	cmp(other: VNClassSource) {
		if (typeof other == "string") other = Parser.fromString(other);
		// Standard Phis are always greater than Atoms
		if (typeof other == "number" || other instanceof Atom) return 1;
		// Inverted comparisons for Sum and Product
		if (other instanceof Sum || other instanceof Product)
			return -other.cmp(this);
		/**
		 * the basic comparison algorithm alone is just
		 * φ(X) > φ(Y) iff the sum of args in X is greater than φ(Y)
		 * or
		 * (X is lexicographically greater than Y and φ(X) is greater than the sum of args in Y)
		 */
		let sumthis = new Sum(...this.args);
		let sumother = new Sum(...other.args);
		if (
			sumthis.cmp(other) == 1 ||
			((sumother instanceof Atom || sumother.cmp(this) == -1) &&
				this.lexcmp(other) == 1)
		)
			return 1;
		if (
			sumother.cmp(this) == 1 ||
			((sumthis instanceof Atom || sumthis.cmp(other) == -1) &&
				other.lexcmp(this) == 1)
		)
			return -1;
		return 0;
	}

	isFixedPoint(a) {
		// Args like [1,0,0,'_',0] for fixed point of a -> phi(1,0,0,a,0)
		let index = a.indexOf("_");
		for (let i = index + 1; i < a.length; i++) if (a[i] !== 0) return false;
		if (a.length > this.args.length) return false;
		if (this.args.length > a.length) return true;
		for (let i in a) {
			if (a[i] == "_") break;
			let cmp;
			if (this.args[i] instanceof VNClass) {
				cmp = this.args[i].cmp(
					a[i] instanceof VNClass ? a[i] : new Atom(a[i])
				);
			} else {
				if (a[i] instanceof VNClass) {
					cmp = -a[i].cmp(
						this.args[i] instanceof VNClass
							? this.args[i]
							: new Atom(this.args[i])
					);
				} else
					cmp =
						this.args[i] > a[i] ? 1 : this.args[i] < a[i] ? -1 : 0;
			}
			if (cmp == -1) return false;
			if (cmp == 1) return true;
		}
		return false;
	}

	lexcmp(other) {
		if (typeof other == "string") other = Parser.fromString(other);
		// In lexicographical comparison, longer = bigger
		if (this.args.length > other.args.length) return 1;
		if (this.args.length < other.args.length) return -1;
		// Iterate to check term by term
		for (let i = 0; i < this.args.length; i++) {
			// Compare numbers
			if (typeof this.args[i] == "number") {
				if (typeof other.args[i] == "number") {
					if (this.args[i] == other.args[i]) continue;
					return this.args[i] > other.args[i]
						? 1
						: this.args[i] < other.args[i]
						? -1
						: 0;
				}
				return -1;
			}
			if (typeof other.args[i] == "number") return 1;
			// Compare infinite terms
			let c = this.args[i].cmp(other.args[i]);
			if (c !== 0) return c;
		}
		// Return 0 if they're equal
		return 0;
	}

	mul(other) {
		if (typeof other == "string") other = Parser.fromString(other);
		if (other == 1 || other.value == 1) return this.clone();
		if (other == 0 || other.value == 0) return new Atom(0);
		if (other instanceof Atom) other = other.value;
		if (typeof other == "number")
			return new Product(new Phi(...this.args), other);
		if (other instanceof Sum)
			return new Sum(...other.addends.map(e => this.mul(e)));
		if (other instanceof Product)
			return new Product(this.mul(other.ord), other.mult);
		let t = this.clone();
		if (this.args.length > 1) t = Phi.noStandard(this);
		if (other.args.length > 1) other = Phi.noStandard(other);
		if (typeof t.args[0] == "number") t.args[0] = new Atom(t.args[0]);
		if (typeof other.args[0] == "number")
			other.args[0] = new Atom(other.args[0]);
		return new Phi(t.args[0].add(other.args[0]));
	}

	pow(other) {
		if (typeof other == "string") other = Parser.fromString(other);
		if (other instanceof Sum) {
			let p = new Atom(1);
			for (let i of other.addends) p = p.mul(this.pow(i));
			return p;
		}
		if (other instanceof Product)
			return this.pow(other.ord).pow(other.mult);
		if (other == 1 || other.value == 1) return this.clone();
		if (other == 0 || other.value == 0) return new Atom(1);
		if (other instanceof Atom) other = other.value;
		let t = this.clone();
		if (this.args.length > 1) t = Phi.noStandard(this.clone());
		if (typeof t.args[0] == "number") t.args[0] = new Atom(t.args[0]);
		t.args[0] = t.args[0].mul(other);
		t.standardize();
		return t;
	}

	toString() {
		return "phi(" + this.args.join(",") + ")";
	}

	toMixed() {
		let t = this.clone();
		for (let i in t.args)
			if (typeof t.args[i] == "number") t.args[i] = new Atom(t.args[i]);
		if (t.args.length == 1) {
			if (t.args[0] == 1) return "w";
			let s = Parser.handleParens(t.args[0].toMixed());
			return `w^${s}`;
		}
		if (t.args.length == 2 && t.args[0] == 1) {
			let s = Parser.handleParens(t.args[1].toMixed(), true);
			return `e${s}`;
		}
		if (t.args.length == 2 && t.args[0] == 2) {
			let s = Parser.handleParens(t.args[1].toMixed(), true);
			return `z${s}`;
		}
		if (t.args.length == 2 && t.args[0] == 3) {
			let s = Parser.handleParens(t.args[1].toMixed(), true);
			return `n${s}`;
		}
		if (t.args.length == 3 && t.args[0] == 1 && t.args[1] == 0) {
			let s = Parser.handleParens(t.args[2].toMixed(), true);
			return `G${s}`;
		}
		return "phi(" + t.args.map(e => e?.toMixed()) + ")";
	}

	toHTML() {
		let t = this.clone();
		for (let i in t.args)
			if (typeof t.args[i] == "number") t.args[i] = new Atom(t.args[i]);
		if (t.args.length == 1) {
			if (t.args[0] == 1) return "&omega;";
			let s = t.args[0].toHTML();
			return `&omega;<sup>${s}</sup>`;
		}
		if (t.args.length == 2 && t.args[0] == 1) {
			let s = t.args[1].toHTML();
			return `&epsilon;<sub>${s}</sub>`;
		}
		if (t.args.length == 2 && t.args[0] == 2) {
			let s = t.args[1].toHTML();
			return `&zeta;<sub>${s}</sub>`;
		}
		if (t.args.length == 2 && t.args[0] == 3) {
			let s = t.args[1].toHTML();
			return `&eta;<sub>${s}</sub>`;
		}
		if (t.args.length == 3 && t.args[0] == 1 && t.args[1] == 0) {
			let s = t.args[2].toHTML();
			return `&Gamma;<sub>${s}</sub>`;
		}
		return "&phi;(" + t.args.map(e => e?.toHTML()) + ")";
	}

	[Symbol.iterator]() {
		return this.addends[Symbol.iterator]();
	}
}

class Parser {
	static Token = class {
		constructor(type, value, args = 0) {
			this.type = type;
			this.value = value;
			this.args = args;
		}
	};

	static TYPES = {
		LITERAL: 0,
		IDENTIFIER: 1,
		OPERATOR: 2,
	};

	static isNumber(char) {
		return /[0-9w]/.test(char);
	}

	static isOperator(char) {
		return /[+*^(),]/.test(char);
	}

	static tokenize(str) {
		str.replace(/([-/])/, function (_match, c1) {
			throw 'Unknown char: "' + c1 + '"';
		});
		let tokens = [];
		let numbuff = [];
		let idbuff = [];
		for (let i = 0; i < str.length; i++) {
			let char = str[i];
			let type = Parser.isNumber(char)
				? 0
				: Parser.isOperator(char)
				? 2
				: 1;
			if (numbuff.length > 0 && type !== 0) {
				tokens.push(
					new Parser.Token(Parser.TYPES.LITERAL, numbuff.join(""))
				);
				numbuff = [];
			}
			if (idbuff.length > 0 && type !== 1) {
				tokens.push(
					new Parser.Token(Parser.TYPES.IDENTIFIER, idbuff.join(""))
				);
				idbuff = [];
			}
			if (type == 0) numbuff.push(char);
			else if (type == 1) idbuff.push(char);
			else tokens.push(new Parser.Token(Parser.TYPES.OPERATOR, char));
		}
		if (numbuff.length > 0)
			tokens.push(
				new Parser.Token(Parser.TYPES.LITERAL, numbuff.join(""))
			);
		if (idbuff.length > 0)
			tokens.push(
				new Parser.Token(Parser.TYPES.IDENTIFIER, idbuff.join(""))
			);
		return tokens;
	}

	static ASSOC = {
		"+": "left",
		"*": "left",
		"^": "right",
	};

	static PREC = {
		"+": 2,
		"*": 3,
		"^": 4,
	};

	static parse(tokens) {
		let output = [];
		let stack = [];
		let were_values = [];
		let arg_count = [];
		while (tokens.length > 0) {
			let token = tokens.shift();
			if (token.type == Parser.TYPES.LITERAL) {
				output.push(token);
				if (were_values.length > 0) {
					were_values.pop();
					were_values.push(true);
				}
			} else if (token.type == Parser.TYPES.IDENTIFIER) {
				stack.push(token);
				arg_count.push(0);
				if (were_values.length > 0) {
					were_values.pop();
					were_values.push(true);
				}
				were_values.push(false);
			} else if (token.value == ",") {
				let mismatched = true;
				while (stack.length > 0) {
					if (stack[stack.length - 1].value !== "(")
						output.push(stack.pop());
					else {
						mismatched = false;
						break;
					}
				}
				if (mismatched) throw "Mismatched parens";
				if (were_values.pop()) {
					arg_count[arg_count.length - 1]++;
					were_values.push(false);
				}
			} else if (token.value == "(") stack.push(token);
			else if (token.value == ")") {
				let mismatched = true;
				while (stack.length > 0) {
					if (stack[stack.length - 1].value !== "(")
						output.push(stack.pop());
					else {
						mismatched = false;
						break;
					}
				}
				if (mismatched) throw "Mismatched parens";
				stack.pop();
				if (
					stack.length > 0 &&
					stack[stack.length - 1].type == Parser.TYPES.IDENTIFIER
				) {
					let f = stack.pop();
					let a = arg_count.pop();
					if (were_values.pop()) a++;
					f.args = a;
					output.push(f);
				}
			} else if (token.type == Parser.TYPES.OPERATOR) {
				while (
					stack.length > 0 &&
					stack[stack.length - 1].type == Parser.TYPES.OPERATOR &&
					((Parser.ASSOC[token.value] == "left" &&
						Parser.PREC[token.value] <=
							Parser.PREC[stack[stack.length - 1].value]) ||
						(Parser.ASSOC[token.value] == "right" &&
							Parser.PREC[token.value] <
								Parser.PREC[stack[stack.length - 1].value]))
				)
					output.push(stack.pop());
				stack.push(token);
			}
		}
		while (stack.length > 0) {
			let op = stack.pop();
			if (/[()]/.test(op.type)) throw "Mismatched parens";
			output.push(op);
		}
		return output;
	}

	static fixUnary(str) {
		while (
			/(e|z|n|G)((\w+\([^,]+\))|[^\+\*\^\(\,][^\+\*\^\,]*[^\+\*\^\)\,]?)/g.test(
				str
			)
		)
			str = str.replace(
				/(e|z|n|G)((\w+\([^,]+\))|[^\+\*\^\(\,][^\+\*\^\,]*[^\+\*\^\)\,]?)/g,
				function (_match, c1, c2) {
					return `${c1}(${c2})`;
				}
			);
		return str;
	}

	static fromString(str: string): VNClass {
		str = Parser.fixUnary(str);
		let tokens = Parser.tokenize(str);
		let rpn = Parser.parse(tokens);
		let args = [];
		while (rpn.length > 0) {
			let token = rpn.shift();
			if (token.type == Parser.TYPES.LITERAL) {
				if (token.value == "w") args.push(new Phi(1));
				else {
					let f = parseFloat(token.value);
					if (!isNaN(f)) args.push(new Atom(f));
					else throw "Unknown token:" + token.value;
				}
			} else if (token.type == Parser.TYPES.OPERATOR) {
				let a1 = args.pop();
				let a2 = args.pop();
				if (token.value == "+") args.push(a2.add(a1));
				else if (token.value == "*") args.push(a2.mul(a1));
				else if (token.value == "^") args.push(a2.pow(a1));
			} else if (token.type == Parser.TYPES.IDENTIFIER) {
				let a = [];
				for (let i = 0; i < token.args; i++) a.push(args.pop());
				if (token.value == "e") args.push(new Phi(1, a[0]));
				else if (token.value == "z") args.push(new Phi(2, a[0]));
				else if (token.value == "n") args.push(new Phi(3, a[0]));
				else if (token.value == "G") args.push(new Phi(1, 0, a[0]));
				else if (token.value == "phi" || token.value == "p")
					args.push(new Phi(...a.reverse()));
			}
		}
		return args[0];
	}

	static handleParens(str, sub = false, replace = false) {
		if (Parser.needsParens(str, sub))
			return `(${replace !== false ? replace : str})`;
		return replace !== false ? replace : str;
	}

	static needsParens(str, sub = false) {
		let t = Parser.parse(Parser.tokenize(Parser.fixUnary(str)))
			.map(e => e.value)
			.join("");
		if (t.endsWith("+") || t.endsWith("*") || (sub && t.endsWith("^")))
			return true;
		return false;
	}
}

class VebleNum extends VNClass {
	constructor(input) {
		super();
		if (typeof input == "number") return new Atom(input);
		if (input instanceof VNClass) return input.clone();
		let v = Parser.fromString(input.replace(/\s/g, ""));
		for (let i in v) this[i] = v[i];
		this.setType(v.__proto__.constructor);
	}

	static zero = new Atom(0);
	static one = new Atom(1);
	static w = new Phi(1);
	static omega = new Phi(1);
	static Least_Transfinite_Ordinal = new Phi(1);
	static e0 = new Phi(1, 0);
	static epsilon0 = new Phi(1, 0);
	static Small_Cantor_Ordinal = new Phi(1, 0);
	static z0 = new Phi(2, 0);
	static zeta0 = new Phi(2, 0);
	static Cantor_Ordinal = new Phi(2, 0);
	static n0 = new Phi(3, 0);
	static eta0 = new Phi(3, 0);
	static G0 = new Phi(1, 0, 0);
	static Gamma0 = new Phi(1, 0, 0);
	static Feferman_Schutte_Ordinal = new Phi(1, 0, 0);
	static Ackermann = new Phi(1, 0, 0, 0);
}

const Ordinal = VebleNum;
const O = function () {
	return new Ordinal(...arguments);
};
