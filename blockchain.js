const CryptoJS = require('crypto-js');

function Blockchain() {
  this.chain = [];
  this.currentTransactions = [];
  // Create genesis block
  this.newBlock(100, 1);
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
  // length + 1, cause transaction is added to next block
  return this.chain.length + 1;
};
Blockchain.prototype.hash = function hash(block) {
  const blockString = JSON.stringify(block);
  const hashString = CryptoJS.SHA256(blockString).toString();
  return hashString;
};
Blockchain.prototype.getLastBlock = function getLastBlock() {
  const lastIndex = this.chain.length - 1;
  return this.chain[lastIndex];
};

Blockchain.prototype.prooOfWork = function prooOfWork(lastProof, previousHash) {
  let nonce;
  let guessHash;
  do {
    nonce = Math.random();
    guessHash = CryptoJS.SHA256(previousHash + lastProof + nonce).toString();
  }
  while (!guessHash.startsWith('00'));
  return nonce;
};

Blockchain.prototype.resolveConflicts = function resovleConflicts(neighbourChains) {
  let newChain = false;
  console.log(neighbourChains);
  let maxLength = this.chain.length;
  for (let i = 0; i < neighbourChains.length; i += 1) {
    const currentChain = neighbourChains[i];
    if (currentChain.length > maxLength && this.validChain(currentChain)) {
      maxLength = currentChain.length;
      newChain = currentChain;
    }
  }
  if (newChain) {
    console.log('New Chain');
    this.chain = newChain;
    return true;
  }
  return false;
};

Blockchain.prototype.validChain = function validChain(inputChain) {
  let chain = inputChain;
  if (inputChain === undefined || inputChain === null || !Array.isArray(inputChain)) {
    chain = this.chain; // eslint-disable-line prefer-destructuring
  }
  let previousBlock = chain[chain.length - 2];
  for (let currentIndex = 1; currentIndex < chain.length; currentIndex += 1) {
    const block = chain[currentIndex];
    const previousHash = this.hash(previousBlock);
    // check Hash
    if (block.previousHash !== previousHash) {
      return false;
    }
    const hash = CryptoJS.SHA256(previousHash + previousBlock.proof + block.proof).toString();
    if (!hash.startsWith('00')) {
      return false;
    }
    previousBlock = block;
  }
  return true;
};

Blockchain.prototype.mine = function mine() {
  const lastBlock = this.getLastBlock();
  const lastProof = lastBlock.proof;
  const previousHash = this.hash(lastBlock);
  const proof = this.prooOfWork(lastProof, previousHash);
  const block = this.newBlock(proof, previousHash);
  return block;
};

module.exports = Blockchain;
