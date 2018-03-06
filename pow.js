const CryptoJS = require('crypto-js');


const x = 5;
let y = 0;
let solved = false;
while (!solved) {
  const mult = x / y;
  console.log(CryptoJS.SHA256(mult.toString()).toString())
  if (CryptoJS.SHA256(mult.toString()).toString().endsWith('d0d0')) {
    solved = true;
  }
  y += 1;
}

console.log(`Solved: ${y}`);
