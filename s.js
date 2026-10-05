import VebleNum, {ntfnSymbol, numberNtfna, bigintNtfna, convertNumberType, Atom, Sum, Product, Phi, Parser, VebleNumConstants} from './built/VebleNum.js';
window.VebleNum = VebleNum;
window.ntfnSymbol = ntfnSymbol;
window.numberNtfna = numberNtfna;
window.bigintNtfna = bigintNtfna;
window.convertNumberType = convertNumberType;
window.Atom = Atom;
window.Sum = Sum;
window.Product = Product;
window.Phi = Phi;
window.Parser = Parser;
window.VebleNumConstants = VebleNumConstants;
const NumberVNConstants = new VebleNumConstants(numberNtfna);
window.NumberVNConstants = NumberVNConstants;
let x = new Atom(numberNtfna,0)
const outElement = document.getElementById("outval");
function display() {
    if(x!==undefined){
        document.getElementById('error-title').style='display: none;';
        document.getElementById('error').style='display: none;';
        outElement.innerHTML = x.toHTML();
    }
}
window.display=display;
function displayCatchError(func){
    return function(){
        let isError = false;
        try{
            func();
        }
        catch(e){
            isError=true;
            document.getElementById('error-title').style='display: block;';
            document.getElementById('error').style='display: block;';
            document.getElementById('error').innerText = String(e);
        }
        finally{
            if(!isError) display();
        }
    }
}
window.displayCatchError=displayCatchError;
const solve = displayCatchError(function(){
    let exp = document.getElementById("exp").value;
    x=VebleNum(numberNtfna,exp);
});
window.solve=solve;
const x_add_1 = displayCatchError(function(){
    x=x.add(NumberVNConstants.one);
});
window.x_add_1=x_add_1;
const x_add_w = displayCatchError(function(){
    x=x.add(NumberVNConstants.w);
});
window.x_add_w=x_add_w;
const x_mul_w = displayCatchError(function(){
    x=x.mul(NumberVNConstants.w);
});
window.x_mul_w=x_mul_w;
const w_mul_x = displayCatchError(function(){
    x=NumberVNConstants.w.mul(x);
});
window.w_mul_x=w_mul_x;
const x_pow_2 = displayCatchError(function(){
    x=x.pow(NumberVNConstants.two);
});
window.x_pow_2=x_pow_2;
const f2_pow_x = displayCatchError(function(){
    x=NumberVNConstants.two.pow(x);
});
window.f2_pow_x = f2_pow_x;
const w_pow_x = displayCatchError(function(){
    x=NumberVNConstants.w.pow(x);
});
window.w_pow_x=w_pow_x;
display();