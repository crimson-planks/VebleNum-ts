import VebleNum, {Sum, Product, Phi, Parser} from './built/index.js';
window.VebleNum = VebleNum;
window.Sum = Sum;
window.Product = Product;
window.Phi = Phi;
window.Parser = Parser;
window.solve = function solve() {
    let x = document.getElementById("exp").value;
    document.getElementById("out").innerHTML = VebleNum(x).toHTML();
}