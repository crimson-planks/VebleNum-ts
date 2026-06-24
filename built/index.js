"use strict";
export class VN_TooManyTermsError extends Error {
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
    constructor() {
        super("Too many terms, reduce exponent");
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/captureStackTrace
        if ("captureStackTrace" in Error && Error.captureStackTrace instanceof Function) {
            Error.captureStackTrace(this, VN_TooManyTermsError);
        }
        this.name = 'VN_TooManyTermsError';
    }
}
;
export class ParserError extends Error {
    constructor(message) {
        super(message);
        if ("captureStackTrace" in Error && Error.captureStackTrace instanceof Function) {
            Error.captureStackTrace(this, ParserError);
        }
        this.name = 'ParserError';
    }
}
/**
 * Set the type of an object
 * @param obj
 * @param type - The type to set `obj` to
 */
function setType(obj, type) {
    Object.setPrototypeOf(obj, type.prototype);
}
class VNClass {
    clone() {
        // Making TS happy; obj.[[Prototype]] will eventually be a subtype of VNClass
        const obj = {};
        for (const i in this) {
            if (this[i] !== null && typeof this[i] === 'object')
                obj[i] = VebleNum.clone(this[i]);
            else
                obj[i] = this[i];
        }
        //VNClass.prototype.setType<T>.call(obj,this.constructor);
        setType(obj, this.constructor);
        return obj;
    }
    add(other) {
        if (!(other instanceof VNClass))
            other = VebleNum(other);
        if (!isConcreteVN(this))
            throw TypeError("");
        return sumVN(this, other);
    }
    static add(a, b) {
        if (!(a instanceof VNClass)) {
            if (typeof a === "number")
                a = new Atom(a);
            else
                a = VebleNum(a);
        }
        return a.add(b);
    }
    static mul(a, b) {
        if (!(a instanceof VNClass)) {
            if (typeof a === "number")
                a = new Atom(a);
            else
                a = VebleNum(a);
        }
        if (!(b instanceof VNClass)) {
            if (typeof b === "number")
                b = new Atom(b);
            else
                b = VebleNum(b);
        }
        return a.mul(b);
    }
    static pow(a, b) {
        if (!(a instanceof VNClass)) {
            if (typeof a === "number")
                a = new Atom(a);
            else
                a = VebleNum(a);
        }
        if (!(b instanceof VNClass)) {
            if (typeof b === "number")
                b = new Atom(b);
            else
                b = VebleNum(b);
        }
        return a.pow(b);
    }
    static cmp(a, b) {
        if (!(a instanceof VNClass)) {
            if (typeof a === "number")
                a = new Atom(a);
            else
                a = VebleNum(a);
        }
        return a.cmp(b);
    }
    gt(other) {
        return this.cmp(other) === 1;
    }
    lt(other) {
        return this.cmp(other) === -1;
    }
    gte(other) {
        return this.cmp(other) > -1;
    }
    lte(other) {
        return this.cmp(other) > 1;
    }
    eq(other) {
        return this.cmp(other) === 0;
    }
    neq(other) {
        return this.cmp(other) !== 0;
    }
}
VNClass.MAX_TERMS = 200;
//class CloneTemplate extends VNClass {}
function isConcreteVN(x) {
    return x instanceof Atom || x instanceof Sum || x instanceof Product || x instanceof Phi;
}
/* reason for making sum, product, phi standalone functions
   It's unintuitive and harder to type check when calling `new Sum()` and getting something that isn't Sum
*/
function sumVN(...addends) {
    const work1Arr = [];
    for (let addend of addends) {
        if (isConcreteVN(addend))
            addend = addend.toStandardized();
        // Flatten sums into the array
        if (addend instanceof Sum) {
            work1Arr.push(addend.addends);
        }
        // Turn Atoms into numbers
        else if (addend instanceof Atom)
            work1Arr.push(addend.value);
        else
            work1Arr.push(addend);
    }
    //console.log(`work1Arr: ${work1Arr}`);
    // Sum is flattened
    const work2Arr = work1Arr.flat();
    // Merge final numbers
    while (work2Arr.length >= 2 &&
        typeof work2Arr[work2Arr.length - 1] === "number" &&
        typeof work2Arr[work2Arr.length - 2] === "number") {
        //@ts-expect-error see while condition
        work2Arr[work2Arr.length - 2] += work2Arr.pop();
    }
    // Convert to an Atom when necessary
    if (work2Arr.length === 1 && typeof work2Arr[0] === "number") {
        return new Atom(work2Arr[0]);
    }
    //console.log(`work2Arr: ${work2Arr}`);
    const work3Arr = [...work2Arr];
    // Remove redundant terms
    for (let i = 0; i < work3Arr.length - 1; i++) {
        const curr = work3Arr[i];
        if (curr === null)
            continue;
        //finite ordinal + transfinite ordinal -> the same transfinite ordinal
        if (typeof curr === 'number') {
            work3Arr[i] = null;
            continue;
        }
        //null is only used as padding for removed elements during this current, so next wont be null.
        const next = work3Arr[i + 1];
        if (curr.cmp(next) === -1) {
            if (curr instanceof Product) {
                if (next instanceof Product) {
                    if (curr.ord.cmp(next.ord) ===
                        0)
                        continue;
                    work3Arr[i] = null;
                    continue;
                }
                if (curr.ord.cmp(next) === 0)
                    continue;
                work3Arr[i] = null;
                continue;
            }
            if (next instanceof Product) {
                if (curr.cmp(next.ord) === 0)
                    continue;
                work3Arr[i] = null;
                continue;
            }
            if (curr.cmp(next) === 0)
                continue;
            work3Arr[i] = null;
            continue;
        }
    }
    //console.log(`work3Arr: ${work3Arr}`);
    const work4Arr = work3Arr.filter((v) => v !== null);
    // Collect like terms
    for (let i = 0; i < work4Arr.length - 1; i++) {
        const curr = work4Arr[i];
        if (curr === null)
            continue;
        //same reason for non-null as above.
        const next = work4Arr[i + 1];
        // If they're equal just merge into a Product
        if (next instanceof VNClass && curr.cmp(next) === 0) {
            work4Arr[i + 1] = productVN(next, 2);
            work4Arr[i] = null;
            continue;
        }
        // If the current one is a Product...
        if (curr instanceof Product) {
            // ...and the next one is a Product...
            if (next instanceof Product) {
                // ...if they're Products of the same ordinal then merge
                if (curr.ord.cmp(next.ord) === 0) {
                    work4Arr[i + 1] = new Product(next.ord, curr.mult + next.mult);
                    work4Arr[i] = null;
                }
                continue;
            }
            // ...and the next one is not but they are like terms then merge
            if (next instanceof VNClass && curr.ord.cmp(next) === 0) {
                work4Arr[i + 1] = productVN(next, curr.mult + 1);
                work4Arr[i] = null;
            }
            continue;
        }
        // If the current one isn't a Product...
        if (next instanceof Product) {
            // ...if they're like terms then merge
            if (curr.cmp(next.ord) === 0) {
                work4Arr[i + 1] = new Product(next.ord, 1 + next.mult);
                work4Arr[i] = null;
            }
        }
    }
    //console.log(`work4Arr: ${work4Arr}`);
    const work5Arr = work4Arr.filter((v) => v !== null);
    // Remove outer Sum to simplify single term
    if (work5Arr.length === 1) {
        //the number case is handled above
        return work5Arr[0];
    }
    //console.log(`work5Arr: ${work5Arr}`);
    if (!(work5Arr[0] instanceof Product || work5Arr[0] instanceof Phi))
        throw Error();
    //@ts-expect-error work5Arr[0]
    return new Sum(...work5Arr);
}
export class Atom extends VNClass {
    /**
     * Class to handle storing independent numbers
     * @param value - The value of the atom
     */
    constructor(value) {
        super();
        this.value = typeof value === 'number' ? value : value.value;
    }
    toStandardized() {
        return this.clone();
    }
    static wrapIfNumber(v) {
        return typeof v === 'number' ? new Atom(v) : v;
    }
    static unwrap(a) {
        return typeof a === 'number' ? a : a instanceof Atom ? a.value : a;
    }
    add(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (typeof other === "number")
            return new Atom(this.value + other);
        if (other instanceof Atom)
            return new Atom(this.value + other.value);
        return other;
    }
    mul(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (typeof other === "number")
            return new Atom(this.value * other);
        if (other instanceof Atom)
            return new Atom(this.value * other.value);
        if (this.value === 1)
            return other.clone();
        if (this.value === 0)
            return new Atom(0);
        return other.clone();
    }
    pow(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (other instanceof Sum) {
            let p = new Atom(1);
            for (const i of other.addends)
                p = p.mul(this.pow(i));
            return p;
        }
        if (other instanceof Product)
            return this.pow(other.ord).pow(other.mult);
        //other is ω^α (α>1)
        if (other instanceof Phi &&
            other.args.length === 1 &&
            new Atom(1).cmp(other.args[0]) === -1) {
            //if ω<=α (other>=ω^ω)
            if (new Phi(1).cmp(other.args[0]) < 1)
                return new Phi(other.clone());
            //if 1<α<ω: then α is number or Atom
            const o = other.clone();
            o.args[0] = Atom.unwrap(o.args[0]) - 1;
            return new Phi(o);
        }
        if (typeof other === "number")
            return new Atom(this.value ** other);
        if (other instanceof Atom)
            return new Atom(this.value ** other.value);
        if (this.value === 1)
            return new Atom(1);
        if (this.value === 0)
            return new Atom(0);
        return other.clone();
    }
    cmp(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (typeof other === "number")
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
export class Sum extends VNClass {
    /**
     * Class to handle sums of terms, terms are either number or Product or Phi
     */
    constructor(...args) {
        super();
        this.addends = args;
    }
    toStandardized() {
        return sumVN(...this.addends);
    }
    cmp(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        // Standard Sums are always greater than Atoms
        if (typeof other === "number" || other instanceof Atom)
            return 1;
        // If other > first term then -1, if other === first term then 1, or other < first term then 1
        if (other instanceof Product || other instanceof Phi) {
            //the first term of Sum is never number; number becomes Atom.
            return (this.addends[0]).cmp(other) === -1 ? -1 : 1;
        }
        if (!(other instanceof Sum))
            throw TypeError(`Invalid Sum.prototype.cmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
        // Compare with other terms
        for (let i = 0; i < Math.min(this.terms, other.terms); i++) {
            if (typeof this.addends[i] === "number") {
                if (typeof other.addends[i] === "number")
                    return this.addends[i] > other.addends[i]
                        ? 1
                        : this.addends[i] < other.addends[i]
                            ? -1
                            : 0;
                return -1;
            }
            if (typeof other.addends[i] === "number")
                return 1;
            //ok typescript, there is a type guard for number right above.
            const c = this.addends[i].cmp(other.addends[i]);
            if (c !== 0)
                return c;
        }
        if (this.terms > other.terms)
            return 1;
        if (this.terms < other.terms)
            return -1;
        return 0;
    }
    mul(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (other === 1 || (other instanceof Atom && other.value === 1))
            return this.clone();
        if (other === 0 || (other instanceof Atom && other.value === 0))
            return new Atom(0);
        if (typeof other === "number")
            other = new Atom(other);
        if (other instanceof Sum)
            return sumVN(...other.addends.map(e => this.mul(e)));
        const t = this.addends[0];
        if (!(other instanceof Atom))
            return t.mul(other);
        return sumVN(Atom.wrapIfNumber(t).mul(other), ...this.addends.slice(1));
    }
    pow(other) {
        if (!(this instanceof Sum))
            throw TypeError(`this (${this}) is not Sum`);
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (other instanceof Sum) {
            let p = new Atom(1);
            for (const i of other.addends)
                p = p.mul(this.pow(i));
            return p;
        }
        if (other instanceof Product)
            return this.pow(other.ord).pow(other.mult);
        if (other === 1 || (other instanceof Atom && other.value === 1))
            return this.clone();
        if (other === 0 || (other instanceof Atom && other.value === 0))
            return new Atom(1);
        if (typeof other === "number")
            other = new Atom(other);
        if (other instanceof Atom) {
            if (other.value > VNClass.MAX_TERMS - 1)
                throw new VN_TooManyTermsError();
            let t = this.clone();
            for (let i = 0; i < other.value - 1; i++)
                t = t.mul(this);
            return t;
        }
        const t = this.addends[0];
        if (typeof t === "number")
            return new Atom(t).pow(other);
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
            if (typeof e === "number")
                return new Atom(e).toMixed();
            return e.toMixed();
        })
            .join("+");
    }
    toHTML() {
        return this.addends
            .map(e => {
            if (typeof e === "number")
                return new Atom(e).toHTML();
            return e.toHTML();
        })
            .join("+");
    }
    [Symbol.iterator]() {
        return this.addends[Symbol.iterator]();
    }
}
function productVN(ord, mult) {
    // Turn Atoms into numbers
    if (ord instanceof Atom)
        ord = ord.value;
    if (mult instanceof Atom)
        mult = mult.value;
    // Convert to a single Atom where possible
    if (typeof ord === "number") {
        return new Atom(ord * mult);
    }
    // Simply x0 and x1
    if (mult === 0) {
        return new Atom(0);
    }
    if (mult === 1) {
        return ord.clone();
    }
    // Simplify nested products
    if (ord instanceof Product) {
        mult = mult * ord.mult;
        ord = ord.ord;
    }
    //if(!(ord instanceof Phi)) throw new TypeError(`Invalid mulVN argument(ord): ${ord} ([[prototype]]: ${Object.getPrototypeOf(ord)})`);;
    return new Product(ord, mult);
}
export class Product extends VNClass {
    /**
     * Class to handle products of an ordinal and a finite value
     * @param ord - Ordinal being multiplied
     * @param mult - Finite multiplier
     */
    constructor(ord, mult) {
        super();
        this.ord = ord;
        this.mult = mult;
    }
    toStandardized() {
        return productVN(this.ord, this.mult);
    }
    cmp(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        // All standard products are greater than finite Atoms
        if (typeof other === "number" || other instanceof Atom)
            return 1;
        // Inverted comparison for Sum
        if (other instanceof Sum)
            return -other.cmp(this);
        // If other > ord then -1, if other === ord then 1, or other < ord then 1
        if (other instanceof Phi)
            return this.ord.cmp(other) === -1 ? -1 : 1;
        if (!(other instanceof Product))
            throw new TypeError(`Invalid Product.prototype.cmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
        // Handle comparison with other Products
        const oc = this.ord.cmp(other.ord);
        if (oc !== 0)
            return oc;
        return this.mult > other.mult ? 1 : this.mult < other.mult ? -1 : 0;
    }
    mul(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (other === 1 || (other instanceof Atom && other.value === 1))
            return this.clone();
        if (other === 0 || (other instanceof Atom && other.value === 0))
            return new Atom(0);
        if (other instanceof Atom)
            other = other.value;
        if (other instanceof Sum)
            return sumVN(...other.addends.map(e => this.mul(e)));
        if (typeof other === "number")
            return productVN(this.ord.mul(other), this.mult);
        return this.ord.mul(other);
    }
    pow(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (other instanceof Sum) {
            let p = new Atom(1);
            for (const i of other.addends)
                p = p.mul(this.pow(i));
            return p;
        }
        if (other instanceof Product)
            return this.pow(other.ord).pow(other.mult);
        if (other === 1 || (other instanceof Atom && other.value === 1))
            return this.clone();
        if (other === 0 || (other instanceof Atom && other.value === 0))
            return new Atom(1);
        if (typeof other === "number")
            other = new Atom(other);
        if (other instanceof Atom)
            return productVN(this.ord.pow(other), this.mult);
        return this.ord.pow(other);
    }
    toString() {
        return (Parser.handleParens(this.ord.toString()) +
            "*" +
            this.mult.toString());
    }
    toMixed() {
        return (Parser.handleParens(this.ord.toMixed()) + "*" + this.mult.toString());
    }
    toHTML() {
        return (Parser.handleParens(this.ord.toMixed(), false, this.ord.toHTML()) +
            "*" +
            this.mult.toString());
    }
}
function isPhiArg(x) {
    return typeof x === 'number' || x instanceof Atom || x instanceof Sum || x instanceof Product || x instanceof Phi;
}
function phiVN(...args) {
    // Convert Atoms to numbers
    for (const i in args)
        if (args[i] instanceof Atom)
            args[i] = args[i].value;
    // Remove redundant 0s
    while (args[0] === 0 && args.length > 1)
        args.shift();
    // Convert phi(0) to 1
    if (args[0] === 0) {
        return new Atom(1);
    }
    // Deal with fixed points
    for (const i in args) {
        if (!(args[i] instanceof Phi))
            continue;
        const a = [...args];
        a[i] = "_";
        if (args[i].isFixedPoint(a))
            args = args[i].args;
    }
    for (const i in args)
        if (args[i] instanceof VNClass &&
            !(args[i] instanceof Atom))
            args[i] = args[i].toStandardized();
    return new Phi(...args);
}
export class Phi extends VNClass {
    /**
     * Class to handle sums of terms, terms are either Sum, Product, Phi, or number
     */
    constructor(...args) {
        super();
        this.args = args;
    }
    static fromValue_noStandard(...args) {
        const t = new Phi();
        t.args = args;
        //t.standardize(true);
        // Convert Atoms to numbers
        for (const i in args)
            if (args[i] instanceof Atom)
                args[i] = args[i].value;
        return t;
    }
    toStandardized() {
        return phiVN(...this.args);
    }
    cmp(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        // Standard Phis are always greater than Atoms
        if (typeof other === "number" || other instanceof Atom)
            return 1;
        // Inverted comparisons for Sum and Product
        if (other instanceof Sum || other instanceof Product)
            return -other.cmp(this);
        /**
         * the basic comparison algorithm alone is just
         * φ(X) > φ(Y) iff the sum of args in X is greater than φ(Y)
         * or
         * (X is lexicographically greater than Y and φ(X) is greater than the sum of args in Y)
         */
        if (!(other instanceof Phi))
            throw new TypeError(`Invalid Phi.prototype.cmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
        const sumthis = sumVN(...this.args);
        const sumother = sumVN(...other.args);
        if (sumthis.cmp(other) === 1 ||
            ((sumother instanceof Atom || sumother.cmp(this) === -1) &&
                this.lexcmp(other) === 1))
            return 1;
        if (sumother.cmp(this) === 1 ||
            ((sumthis instanceof Atom || sumthis.cmp(other) === -1) &&
                other.lexcmp(this) === 1))
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
    isFixedPoint(a) {
        const index = a.indexOf("_");
        for (let i = index + 1; i < a.length; i++)
            if (a[i] !== 0)
                return false;
        if (a.length > this.args.length)
            return false;
        if (this.args.length > a.length)
            return true;
        for (const i in a) {
            if (a[i] === "_")
                break;
            let cmp;
            if (this.args[i] instanceof VNClass) {
                cmp = this.args[i].cmp(a[i] instanceof VNClass ? a[i] : new Atom(a[i]));
            }
            else {
                if (a[i] instanceof VNClass) {
                    cmp = -a[i].cmp(Atom.wrapIfNumber(this.args[i]));
                }
                else
                    cmp =
                        this.args[i] > a[i] ? 1 : this.args[i] < a[i] ? -1 : 0;
            }
            if (cmp === -1)
                return false;
            if (cmp === 1)
                return true;
        }
        return false;
    }
    lexcmp(other) {
        if (typeof other === "string") {
            const fsother = Parser.fromString(other);
            if (!(fsother instanceof Phi))
                throw TypeError(`Invalid Phi.prototype.lexcmp argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
            other = fsother;
        }
        // In lexicographical comparison, longer = bigger
        if (this.args.length > other.args.length)
            return 1;
        if (this.args.length < other.args.length)
            return -1;
        // Iterate to check term by term
        for (let i = 0; i < this.args.length; i++) {
            // Compare numbers
            if (typeof this.args[i] === "number") {
                if (typeof other.args[i] === "number") {
                    if (this.args[i] === other.args[i])
                        continue;
                    return this.args[i] > other.args[i]
                        ? 1
                        : this.args[i] < other.args[i]
                            ? -1
                            : 0;
                }
                return -1;
            }
            if (typeof other.args[i] === "number")
                return 1;
            // Compare infinite terms
            // the number check is above.
            const c = this.args[i].cmp(other.args[i]);
            if (c !== 0)
                return c;
        }
        // Return 0 if they're equal
        return 0;
    }
    mul(other) {
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (other === 1 || (other instanceof Atom && other.value === 1))
            return this.clone();
        if (other === 0 || (other instanceof Atom && other.value === 0))
            return new Atom(0);
        if (other instanceof Atom)
            other = (other.value);
        if (typeof other === "number")
            return productVN(new Phi(...this.args), other);
        if (other instanceof Sum)
            return sumVN(...other.addends.map(e => this.mul(e)));
        if (other instanceof Product)
            return productVN(this.mul(other.ord), other.mult);
        let t = this.clone();
        if (!(other instanceof Phi))
            throw new TypeError(`Invalid Phi.prototype.mul argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
        if (this.args.length > 1)
            t = Phi.fromValue_noStandard(this);
        if (other.args.length > 1)
            other = Phi.fromValue_noStandard(other);
        t.args[0] = Atom.wrapIfNumber(t.args[0]);
        if (!(other instanceof Phi))
            throw new TypeError(`Invalid Phi.prototype.mul argument: ${other} ([[prototype]]: ${Object.getPrototypeOf(other)})`);
        other.args[0] = Atom.wrapIfNumber(other.args[0]);
        return phiVN(t.args[0].add(other.args[0]));
    }
    pow(other) {
        //console.log("Phi.pow start")
        if (typeof other === "string")
            other = Parser.fromString(other);
        if (other instanceof Sum) {
            let p = new Atom(1);
            for (const i of other.addends)
                p = p.mul(this.pow(i));
            return p;
        }
        if (other instanceof Product)
            return this.pow(other.ord).pow(other.mult);
        if (other === 1 || (other instanceof Atom && other.value === 1))
            return this.clone();
        if (other === 0 || (other instanceof Atom && other.value === 0))
            return new Atom(1);
        if (other instanceof Atom)
            other = other.value;
        let t = this.clone();
        if (this.args.length > 1)
            t = Phi.fromValue_noStandard(this.clone());
        if (typeof t.args[0] === "number")
            t.args[0] = new Atom(t.args[0]);
        //TODO: figure out how to organize class hierachy (if it should even exist)
        t.args[0] = t.args[0].mul(other);
        t = t.toStandardized();
        //console.log("Phi.pow end")
        return t;
    }
    toString() {
        return "phi(" + this.args.join(",") + ")";
    }
    toMixed() {
        // the next line prevents number from being in t.args[number]
        const t_args = [...this.args];
        for (const i in t_args)
            if (typeof t_args[i] === "number")
                t_args[i] = new Atom(t_args[i]);
        if (t_args.length === 1) {
            if (t_args[0] instanceof Atom && t_args[0].value === 1)
                return "w";
            const s = Parser.handleParens(t_args[0].toMixed());
            return `w^${s}`;
        }
        if (t_args.length === 2 && t_args[0] instanceof Atom && t_args[0].value === 1) {
            const s = Parser.handleParens(t_args[1].toMixed(), true);
            return `e${s}`;
        }
        if (t_args.length === 2 && t_args[0] instanceof Atom && t_args[0].value === 2) {
            const s = Parser.handleParens(t_args[1].toMixed(), true);
            return `z${s}`;
        }
        if (t_args.length === 2 && t_args[0] instanceof Atom && t_args[0].value === 3) {
            const s = Parser.handleParens(t_args[1].toMixed(), true);
            return `n${s}`;
        }
        if (t_args.length === 3 && t_args[0] instanceof Atom && t_args[0].value === 1 && t_args[1] instanceof Atom && t_args[1].value === 0) {
            const s = Parser.handleParens(t_args[2].toMixed(), true);
            return `G${s}`;
        }
        return "phi(" + t_args.map(e => e?.toMixed()) + ")";
    }
    toHTML() {
        // same reason as Phi.prototype.toMixed
        const t_args = [...this.args];
        for (const i in t_args)
            if (typeof t_args[i] === "number")
                t_args[i] = new Atom(t_args[i]);
        if (t_args.length === 1) {
            if (t_args[0] instanceof Atom && t_args[0].value === 1)
                return "&omega;";
            const s = t_args[0].toHTML();
            return `&omega;<sup>${s}</sup>`;
        }
        if (t_args[0] instanceof Atom) {
            if (t_args.length === 2 && t_args[0].value === 1) {
                const s = t_args[1].toHTML();
                return `&epsilon;<sub>${s}</sub>`;
            }
            if (t_args.length === 2 && t_args[0].value === 2) {
                const s = t_args[1].toHTML();
                return `&zeta;<sub>${s}</sub>`;
            }
            if (t_args.length === 2 && t_args[0].value === 3) {
                const s = t_args[1].toHTML();
                return `&eta;<sub>${s}</sub>`;
            }
            if (t_args.length === 3 && t_args[0].value === 1 && t_args[1] instanceof Atom && t_args[1].value === 0) {
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
export const Parser = {
    TYPES: Object.freeze({
        LITERAL: 0,
        IDENTIFIER: 1,
        OPERATOR: 2,
    }),
    isNumber(char) {
        return /[0-9w]/.test(char);
    },
    isOperator(char) {
        return /[+*^(),]/.test(char);
    },
    tokenize(str) {
        str.replace(/([-/])/, function (_match, c1) {
            throw new ParserError(`Unknown char: "${c1}"`);
        });
        const tokens = [];
        let numbuff = [];
        let idbuff = [];
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const type = Parser.isNumber(char)
                ? 0
                : Parser.isOperator(char)
                    ? 2
                    : 1;
            if (numbuff.length > 0 && type !== 0) {
                tokens.push({ type: Parser.TYPES.LITERAL, value: numbuff.join(""), args: 0 });
                numbuff = [];
            }
            if (idbuff.length > 0 && type !== 1) {
                tokens.push({ type: Parser.TYPES.IDENTIFIER, value: idbuff.join(""), args: 0 });
                idbuff = [];
            }
            if (type === 0)
                numbuff.push(char);
            else if (type === 1)
                idbuff.push(char);
            //type === 2 (Operator)
            else
                tokens.push({ type: Parser.TYPES.OPERATOR, value: char, args: 0 });
        }
        if (numbuff.length > 0)
            tokens.push({ type: Parser.TYPES.LITERAL, value: numbuff.join(""), args: 0 });
        if (idbuff.length > 0)
            tokens.push({ type: Parser.TYPES.IDENTIFIER, value: idbuff.join(""), args: 0 });
        return tokens;
    },
    ASSOC: {
        "+": "left",
        "*": "left",
        "^": "right",
    },
    PREC: {
        "+": 2,
        "*": 3,
        "^": 4,
    },
    parse(tokens) {
        const output = [];
        const stack = [];
        const were_values = [];
        const arg_count = [];
        while (tokens.length > 0) {
            const token = tokens.shift();
            if (token === undefined)
                throw new ParserError(`Ran out of tokens`);
            if (token.type === Parser.TYPES.LITERAL) {
                output.push(token);
                if (were_values.length > 0) {
                    were_values.pop();
                    were_values.push(true);
                }
            }
            else if (token.type === Parser.TYPES.IDENTIFIER) {
                stack.push(token);
                arg_count.push(0);
                if (were_values.length > 0) {
                    were_values.pop();
                    were_values.push(true);
                }
                were_values.push(false);
            }
            else if (token.value === ",") {
                let mismatched = true;
                while (stack.length > 0) {
                    if (stack[stack.length - 1].value !== "(")
                        // since stack.length>0, stack.pop() !== undefined
                        output.push(stack.pop());
                    else {
                        mismatched = false;
                        break;
                    }
                }
                if (mismatched)
                    throw new ParserError("Mismatched parens");
                if (were_values.pop()) {
                    arg_count[arg_count.length - 1]++;
                    were_values.push(false);
                }
            }
            else if (token.value === "(")
                stack.push(token);
            else if (token.value === ")") {
                let mismatched = true;
                while (stack.length > 0) {
                    if (stack[stack.length - 1].value !== "(")
                        // since stack.length>0, stack.pop() !== undefined
                        output.push(stack.pop());
                    else {
                        mismatched = false;
                        break;
                    }
                }
                if (mismatched)
                    throw new ParserError("Mismatched parens");
                stack.pop();
                if (stack.length > 0 &&
                    stack[stack.length - 1].type === Parser.TYPES.IDENTIFIER) {
                    //see previous condition for nonnull assertion.
                    const f = stack.pop();
                    let a = arg_count.pop();
                    if (a === undefined)
                        throw new ParserError("arg_count is empty");
                    if (were_values.pop())
                        a++;
                    f.args = a;
                    output.push(f);
                }
            }
            else if (token.type === Parser.TYPES.OPERATOR) {
                while (stack.length > 0 &&
                    stack[stack.length - 1].type === Parser.TYPES.OPERATOR &&
                    ((Parser.ASSOC[token.value] === "left" &&
                        Parser.PREC[token.value] <=
                            Parser.PREC[stack[stack.length - 1].value]) ||
                        (Parser.ASSOC[token.value] === "right" &&
                            Parser.PREC[token.value] <
                                Parser.PREC[stack[stack.length - 1].value])))
                    output.push(stack.pop());
                stack.push(token);
            }
        }
        while (stack.length > 0) {
            const op = stack.pop();
            if (/[()]/.test(op.value))
                throw new ParserError("Mismatched parens");
            output.push(op);
        }
        return output;
    },
    fixUnaryRegExp: /(e|z|n|G)((\w+\([^,]+\))|[^\+\*\^\(\,][^\+\*\^\,]*[^\+\*\^\)\,]?)/g,
    fixUnary(str) {
        while (Parser.fixUnaryRegExp.test(str))
            str = str.replace(Parser.fixUnaryRegExp, function (_match, c1, c2) {
                return `${c1}(${c2})`;
            });
        return str;
    },
    fromString(str) {
        str = Parser.fixUnary(str);
        const tokens = Parser.tokenize(str);
        const rpn = Parser.parse(tokens);
        const args = [];
        while (rpn.length > 0) {
            const token = rpn.shift();
            if (token.type === Parser.TYPES.LITERAL) {
                if (token.value === "w")
                    args.push(new Phi(1));
                else {
                    const f = parseFloat(token.value);
                    if (!Number.isNaN(f))
                        args.push(new Atom(f));
                    else
                        throw new ParserError(`Unknown token: ${token.value}`);
                }
            }
            else if (token.type === Parser.TYPES.OPERATOR) {
                const a1 = args.pop();
                const a2 = args.pop();
                if (a1 === undefined || a2 === undefined)
                    throw new ParserError(`Invalid OPERATOR ${token.value}`);
                if (token.value === "+")
                    args.push(a2.add(a1));
                else if (token.value === "*")
                    args.push(a2.mul(a1));
                else if (token.value === "^")
                    args.push(a2.pow(a1));
            }
            else if (token.type === Parser.TYPES.IDENTIFIER) {
                const a = [];
                for (let i = 0; i < token.args; i++) {
                    const p = args.pop();
                    if (p === undefined)
                        throw new ParserError('args is empty');
                    a.push(p);
                }
                if (token.value === "e")
                    args.push(phiVN(1, a[0]));
                else if (token.value === "z")
                    args.push(phiVN(2, a[0]));
                else if (token.value === "n")
                    args.push(phiVN(3, a[0]));
                else if (token.value === "G")
                    args.push(phiVN(1, 0, a[0]));
                else if (token.value === "phi" || token.value === "p")
                    args.push(phiVN(...a.reverse()));
                else
                    throw new ParserError(`Invalid IDENTIFIER ${token.value}`);
            }
        }
        return args[0] ?? new Atom(0);
    },
    handleParens(str, sub = false, replace = false) {
        if (Parser.needsParens(str, sub))
            return `(${replace !== false ? replace : str})`;
        return replace !== false ? replace : str;
    },
    needsParens(str, sub = false) {
        const t = Parser.parse(Parser.tokenize(Parser.fixUnary(str)))
            .map(e => e.value)
            .join("");
        if (t.endsWith("+") || t.endsWith("*") || (sub && t.endsWith("^")))
            return true;
        return false;
    },
};
const VebleNum = Object.assign(function VebleNum(input) {
    if (typeof input === "number")
        return new Atom(input);
    if (isConcreteVN(input))
        return input.clone();
    if (typeof input === 'string') {
        return Parser.fromString(input.replace(/\s/g, ""));
    }
    return new Atom(0);
}, {
    fromString: Parser.fromString,
    clone(input) {
        if (input === null || typeof input !== 'object')
            return input;
        if (input instanceof VNClass)
            return input.clone();
        if (Array.isArray(input)) {
            const c = [];
            for (let i = 0; i < input.length; i++) {
                if (input[i] !== null && typeof input[i] === 'object')
                    c.push(VebleNum.clone(input[i]));
                else
                    c.push(input[i]);
            }
            return c;
        }
        const c = Object.create(Object.getPrototypeOf(input));
        for (const i in input) {
            //if (i === "clone") continue;
            c[i] = typeof input[i] === 'object' && input !== null ? VebleNum.clone(input[i]) : input[i];
        }
        return c;
    },
    isEpsilon() {
        return this instanceof Phi && this.args.length >= 2;
    },
    isZeta() {
        return (this instanceof Phi &&
            (this.args.length >= 3 ||
                (this.args.length === 2 && new Atom(2).cmp(this.args[0]) < 1)));
    },
    isEta() {
        return (this instanceof Phi &&
            (this.args.length >= 3 ||
                (this.args.length === 2 && new Atom(3).cmp(this.args[0]) < 1)));
    },
    isGamma() {
        return this instanceof Phi && this.args.length >= 3;
    },
    epsilon(n) {
        if (!(n instanceof VNClass)) {
            if (typeof n === "number")
                n = new Atom(n);
            else
                n = VebleNum(n);
        }
        if (!isPhiArg(n))
            throw new TypeError(`Invalid VebleNum.epsilon argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
        return phiVN(1, n);
    },
    zeta(n) {
        if (!(n instanceof VNClass)) {
            if (typeof n === "number")
                n = new Atom(n);
            else
                n = VebleNum(n);
        }
        if (!isPhiArg(n))
            throw new TypeError(`Invalid VebleNum.zeta argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
        return phiVN(2, n);
    },
    eta(n) {
        if (!(n instanceof VNClass)) {
            if (typeof n === "number")
                n = new Atom(n);
            else
                n = VebleNum(n);
        }
        if (!isPhiArg(n))
            throw new TypeError(`Invalid VebleNum.eta argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
        return phiVN(3, n);
    },
    Gamma(n) {
        if (!(n instanceof VNClass)) {
            if (typeof n === "number")
                n = new Atom(n);
            else
                n = VebleNum(n);
        }
        if (!isPhiArg(n))
            throw new TypeError(`Invalid VebleNum.Gamma argument: ${n} ([[prototype]]: ${Object.getPrototypeOf(n)})`);
        return phiVN(1, 0, n);
    },
    sum: sumVN,
    product: productVN,
    phi: phiVN,
    add(a, b) {
        if (typeof a === 'number')
            a = new Atom(a);
        else if (!(a instanceof VNClass))
            a = VebleNum(a);
        return a.add(b);
    },
    mul(a, b) {
        if (typeof a === 'number')
            a = new Atom(a);
        if (!(a instanceof VNClass))
            a = VebleNum(a);
        if (typeof b === 'number')
            b = new Atom(b);
        if (!(b instanceof VNClass))
            b = VebleNum(b);
        return a.mul(b);
    },
    pow(a, b) {
        if (typeof a === 'number')
            a = new Atom(a);
        else if (!(a instanceof VNClass))
            a = VebleNum(a);
        if (typeof b === 'number')
            b = new Atom(b);
        if (!(b instanceof VNClass))
            b = VebleNum(b);
        return a.pow(b);
    },
    cmp(a, b) {
        if (typeof a === 'number')
            a = new Atom(a);
        else if (!(a instanceof VNClass))
            a = VebleNum(a);
        return a.cmp(b);
    },
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
