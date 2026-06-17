import VebleNum from './built/index.js';
window.VebleNum = VebleNum;
window.solve = function solve() {
    let x = document.getElementById("exp").value;
    document.getElementById("out").innerHTML = VebleNum(x).toHTML();
}