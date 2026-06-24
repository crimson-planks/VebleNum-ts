import VebleNum, {Sum, Product, Phi, Parser} from './built/index.js';
window.VebleNum = VebleNum;
window.Sum = Sum;
window.Product = Product;
window.Phi = Phi;
window.Parser = Parser;
window.solve = function solve() {
    let x = document.getElementById("exp").value;
    const outElement = document.getElementById("out");
    if(outElement===null) return;
    /** @type {import("./built/index.js").ConcreteVN|undefined}  */
    let parsedX = undefined;
    try{
        parsedX=VebleNum(x);
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