'use strict';

let assert = require('assert');
let parallel = require('mocha.parallel');
let QuickChatClient = require('../lib');

describe('QuickChat Client', () => {
  let aliceClient;
  let aliceName = 'alice-' + Math.random().toString(36).slice(2);
  let bobClient;
  let bobName = 'bob-' + Math.random().toString(36).slice(2);
  let conversationId = Math.random().toString(36).slice(2);

  describe('constructor', () => {
    context('when not passed a <String> displayName', () => {
      it('should throw an exception', () => {
        assert.throws(() => new QuickChatClient());
        assert.throws(() => new QuickChatClient(123));
        assert.throws(() => new QuickChatClient([]));
        assert.throws(() => new QuickChatClient({}));
      });
    });
    context('when not passed a <String> conversationId', () => {
      it('should throw an exception', () => {
        assert.throws(() => new QuickChatClient(aliceName));
        assert.throws(() => new QuickChatClient(aliceName, 123));
        assert.throws(() => new QuickChatClient(aliceName, []));
        assert.throws(() => new QuickChatClient(aliceName, {}));
      });
    });
  });

  describe('Alice starting her Client', () => {
    it('should emit QuickChatClient#connected', (done) => {
      aliceClient = new QuickChatClient(aliceName, conversationId);
      aliceClient.once('connected', () => done());
    });

    it('should return an instance of QuickChatClient', () => {
      assert(aliceClient instanceof QuickChatClient);
    });

    it('should set the Client\'s displayName property', () => {
      assert.equal(aliceClient.displayName, aliceName);
    });
  });

  describe('Bob starting his Client', () => {
    it('should emit QuickChatClient#connected', (done) => {
      bobClient = new QuickChatClient(bobName, conversationId);
      bobClient.once('connected', () => done());
    });
  });

  describe('Alice sending a Message', () => {
    parallel('', () => {
      it('should emit QuickChatClient#messageAdded for Alice', (done) => {
        await(aliceClient, 'messageAdded', done, (message) => {
          return message === aliceName + ': Hello Bob';
        });
      });

      it('should emit QuickChatClient#messageAdded for Bob', (done) => {
        await(bobClient, 'messageAdded', done, (message) => {
          return message === aliceName + ': Hello Bob';
        });
      });

      it('should return undefined', (done) => {
        setTimeout(() => {
          let returnValue = aliceClient.sendMessage('Hello Bob');
          done(typeof returnValue !== 'undefined' && new Error('Unexpected return value'));
        });
      });
    });
  });

  describe('Bob sending a Message', () => {
    parallel('', () => {
      it('should emit QuickChatClient#messageAdded for Alice', (done) => {
        await(bobClient, 'messageAdded', done, (message) => {
          return message === bobName + ': Hello Alice';
        });
      });

      it('should emit QuickChatClient#messageAdded for Bob', (done) => {
        await(bobClient, 'messageAdded', done, (message) => {
          return message === bobName + ': Hello Alice';
        });
      });

      it('should return undefined', (done) => {
        setTimeout(() => {
          let returnValue = bobClient.sendMessage('Hello Alice');
          done(typeof returnValue !== 'undefined' && new Error('Unexpected return value'));
        });
      });
    });
  });

  describe('Alice getting a list of Messages from the server', () => {
    let messages;

    it('should return a fulfilled promise', (done) => {
      aliceClient.getMessages().then((_messages) => {
        messages = _messages;
        done();
      });
    });

    it('should resolve to an array containing both messages, in order', () => {
      assert.equal(messages[0], aliceName + ': Hello Bob');
      assert.equal(messages[1], bobName + ': Hello Alice');
      assert.equal(messages[2], undefined);
    });
  });

  after(() => {
    // Disconnect the websockets so the process can end
    aliceClient && aliceClient.disconnect();
    bobClient && bobClient.disconnect();
  });
});

// Wait for an event to be emitted from an emitter, optionally
// matching it against a condition, and remove the listener
// and call the test's done() callback on success.
function await(emitter, eventName, done, condition) {
  var handler = function() {
    if (condition && !condition.apply(null, arguments)) { return; }
    emitter.removeListener(eventName, handler);
    done();
  }

  emitter.on(eventName, handler);
}

