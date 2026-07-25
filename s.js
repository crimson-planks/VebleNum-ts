import VebleNum, {isNtfn_symbol, ntfnSymbol, isNonTransfiniteNumber, convertNumberType, Sum, Product, Phi, Parser, VebleNumConstants} from './built/index.js';
window.VebleNum = VebleNum;
window.isNtfn_symbol = isNtfn_symbol;
window.ntfnSymbol = ntfnSymbol;
window.isNonTransfiniteNumber = isNonTransfiniteNumber;
window.convertNumberType = convertNumberType;
window.Sum = Sum;
window.Product = Product;
window.Phi = Phi;
window.Parser = Parser;
window.VebleNumConstants = VebleNumConstants;
window.solve = function solve() {
    let x = document.getElementById("exp").value;
    const outElement = document.getElementById("out");
    if(outElement===null) return;
    /** @type {import("./built/index.js").ConcreteVN|undefined}  */
    let parsedX = undefined;
    try{
        parsedX=VebleNum(x,Number.prototype[ntfnSymbol]);
    }
    catch(e){
        document.getElementById('error').style='display: block;';
        outElement.innerText = String(e);
    }
    if(parsedX!==undefined){
        document.getElementById('error').style='display: none;';
        outElement.innerHTML = parsedX.toHTML();
    }
}