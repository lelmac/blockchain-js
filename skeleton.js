const CryptoJS = require('crypto-js');

function Blockchain() {
  this.chain = [];
  this.currentTransactions = [];
}

Blockchain.prototype.newBlock = function newBlock(proof, previousHash) {
  const block = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.currentTransactions,
    proof,
    previousHash,
  };
  this.currentTransactions = [];
  this.chain.push(block);
  return block;
};
Blockchain.prototype.newTransaction = function newTransaction(sender, recipient, amount) {
  const transaction = {
    sender,
    recipient,
    amount,
  };
  this.currentTransactions.push(transaction);
  return this.chain.length + 1;
};
Blockchain.prototype.hash = function hash(block) {
  const blockString = JSON.stringify(block);
  const hashString = CryptoJS.SHA256(blockString).toString();
  return hashString;
};
Blockchain.prototype.getLastBlock = function getLastBlock() {
  const lastIndex = this.chain.length - 1;
  return lastIndex;
};
