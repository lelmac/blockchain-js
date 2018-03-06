const Blockchain = require('./blockchain.js');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const httpPort = process.env.HTTP_PORT || 8080;
const wsPort = process.env.WS_PORT || 8080;
const messageType = {
  CHAIN: 0,
  RESOLVE: 1,
};

// HTTP Endpoint
const app = express();
app.use(bodyParser.json());

const nodes = [];
const b = new Blockchain();

// Broadcast to all registered Nodes
const broadcast = (message) => {
  console.log('Broadcasting Message:');
  console.log(message);
  for (let i = 0; i < nodes.length; i += 1) {
    nodes[i].send(JSON.stringify(message));
  }
};

const initConnection = (ws) => {
  console.log('New Connection');
  if (nodes.indexOf(ws) === -1) {
    nodes.push(ws);
  }
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('message');
    console.log(message);
    if (message.type === messageType.CHAIN) {
      console.log('Resolving');
      b.resolveConflicts(message.payload);
    }
    if (message.type === messageType.RESOLVE) {
      const chainMessage = {
        type: messageType.CHAIN,
        payload: [b.chain],
      };
      broadcast(chainMessage);
    }
  });
  const closeConnection = (socket) => {
    console.log(`connection failed to peer:  ${socket.url}`);
    nodes.splice(nodes.indexOf(socket), 1);
  };
  ws.on('close', () => closeConnection(ws));
  ws.on('error', () => closeConnection(ws));
};

const initWSServer = (httpServer) => {
  const server = new WebSocket.Server({ server: httpServer, path: '/ws' });
  console.log(`Websocket running on port: ${wsPort}`);
  server.on('connection', ws => initConnection(ws));
};

const addNodes = (newNodes) => {
  newNodes.forEach((node) => {
    const ws = new WebSocket(node);
    ws.on('open', () => initConnection(ws));
    ws.on('error', () => {
      console.log(`Connection failed to Node: ${node}`);
    });
  });
};

// Get the current blockchain
app.get('/chain', (req, res) => { res.send(JSON.stringify(b.chain)); });

// create a new block
app.post('/mineBlock', (req, res) => {
  const newBlock = b.mine();
  console.log('block added: ');
  console.log(JSON.stringify(newBlock));
  res.send();
});

// add a new transaction
app.post('/transactions/new', (req, res) => {
  const required = ['sender', 'recipient', 'amount'];
  const params = req.body;
  for (let i = 0; i < required.length; i += 1) {
    const key = required[i];
    if (params[key] == null || params[key] === undefined) {
      res.status(400).send(`Missing Value: ${key}`);
      return;
    }
  }
  b.newTransaction(params.sender, params.recipient, params.amount);
  res.send('Transaction will be added to new Block');
});

// get all registered nodes
app.get('/nodes', (req, res) => {
  res.send(nodes.map(s => `${s.remoteAddress} : ${s.remotePort}`));
});

// register a new node
app.post('/addNode', (req, res) => {
  console.log(req.body);
  addNodes([req.body.url]);
  res.send();
});

// check if the chain is valid
app.get('/valid', (req, res) => { res.send(b.validChain(b)); });

// tigger the consensus algorithm
app.get('/resolveConflicts', (req, res) => {
  const message = {
    type: messageType.RESOLVE,
  };
  broadcast(message);
  res.send('Resolving Conflicts');
});

const server = app.listen(httpPort, () => console.log(`Listening http on port: ${httpPort}`));
initWSServer(server);
