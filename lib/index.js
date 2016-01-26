'use strict';

const SERVER_URI = 'http://178.128.8.66:8081';

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;
const WebSocketClient = require('websocket').client;

function QuickChatClient(displayName, conversationId) {
  const wsClient = new WebSocketClient();

  EventEmitter.call(this);

  wsClient.on('connect', () => {
    console.info('Ready for action!');
  });

  wsClient.connect(SERVER_URI);
}

inherits(QuickChatClient, EventEmitter);

QuickChatClient.prototype.disconnect = function disconnect() { };
QuickChatClient.prototype.getMessages = function getMessages() { };
QuickChatClient.prototype.sendMessage = function sendMessage(message) { };

module.exports = QuickChatClient;

