import VebleNum, {nonTransfiniteNumberArithmeticSymbol} from './built/index.js';
window.VebleNum = VebleNum;
window.nonTransfiniteNumberArithmeticSymbol = nonTransfiniteNumberArithmeticSymbol;
window.solve = function solve() {
    let x = document.getElementById("exp").value;
    document.getElementById("out").innerHTML = VebleNum(x).toHTML();
}