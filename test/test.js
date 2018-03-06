const Blockchain = require('../blockchain.js');
const assert = require('assert');
const { expect } = require('chai');

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('Blockchain module', () => {
  describe('#newBlock()', () => {
    it('add current transaction to the block', () => {
      const b = new Blockchain();
      b.newTransaction('Person A', 'Person B', 10);
      const block = b.newBlock(1, 'abc');
      assert.equal(block.transactions.length, 1);
    });
  });
  describe('#newTransaction()', () => {
    it('should add a transaction', () => {
      const b = new Blockchain();
      b.newTransaction('Person A', 'Person B', 10);
      assert.equal(b.currentTransactions.length, 1);
    });
  });
  describe('newBlock', () => {
    it('should export a function', () => {
      expect(Blockchain).to.be.a('function');
    });
  });
  describe('validChain', () => {
    it('should return false if the chain isnt valid', () => {
      const b = new Blockchain();
      b.newTransaction('Person A', 'Person B', 10);
      b.mine();
      b.newTransaction('Person B', 'Person C', 20);
      b.newTransaction('Person A', 'Person C', 50);
      b.mine();
      const block = b.chain[1];
      block.transactions.push({
        sender: 'null',
        recipient: 'Max',
        amount: 1000,
      });
      b.chain[1] = block;
      assert.equal(b.validChain(), false);
    });
  });
  describe('validChain', () => {
    it('should return true if the chain is valid', () => {
      const b = new Blockchain();
      b.newTransaction('Person A', 'Person B', 10);
      b.mine();
      assert.equal(b.validChain(), true);
    });
  });
});

