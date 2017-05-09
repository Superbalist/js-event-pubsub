'use strict';

let chai = require('chai');
let expect = chai.expect;
let TopicEvent = require('../src/events/TopicEvent');
let SimpleEvent = require('../src/events/SimpleEvent');

describe('TopicEvent', () => {
  describe('construct instance', () => {
    it('should extend a SimpleEvent', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event).to.be.an.instanceof(SimpleEvent);
    });

    it('should set the name property', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.name).to.equal('created');
    });

    it('should set the attributes property', () => {
      let attributes = {
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      let event = new TopicEvent('user', 'created', '1.0', attributes);
      expect(event.attributes).to.equal(attributes);
    });

    it('should set the attributes property to a default value of an empty object if not given', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.attributes).to.be.empty;
    });

    it('should set the topic property', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.topic).to.equal('user');
    });

    it('should set the version property', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.version).to.equal('1.0');
    });
  });

  describe('getName', () => {
    it('should return the event name', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.getName()).to.equal('created');
    });
  });

  describe('getAttributes', () => {
    it('should return the event attributes', () => {
      let attributes = {
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      let event = new TopicEvent('user', 'created', '1.0', attributes);
      expect(event.getAttributes()).to.equal(attributes);
    });
  });

  describe('getAttribute', () => {
    it('should return the value of an event attribute', () => {
      let event = new TopicEvent('user', 'created', '1.0', {'hello': 'world'});
      expect(event.getAttribute('hello')).to.equal('world');
    });

    it('should return null if the event attribute is not set', () => {
      let event = new TopicEvent('user', 'created', '1.0', {'hello': 'world'});
      expect(event.getAttribute('first_name')).to.be.null;
    });
  });

  describe('setAttribute', () => {
    it('should set the value of an event attribute', () => {
      let event = new TopicEvent('user', 'created', '1.0', {'first_name': 'Matthew'});
      expect(event.getAttribute('first_name')).to.equal('Matthew');
      event.setAttribute('first_name', 'Rob');
      expect(event.getAttribute('first_name')).to.equal('Rob');
    });
  });

  describe('hasAttribute', () => {
    it('should return a boolean indicating whether or not the attribute is set', () => {
      let event = new TopicEvent('user', 'created', '1.0', {'first_name': 'Matthew'});
      expect(event.hasAttribute('first_name')).to.be.true;
      expect(event.hasAttribute('last_name')).to.be.false;
    });
  });

  describe('toMessage', () => {
    it('should convert the event to a payload ready for publishing', () => {
      let attributes = {
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      let event = new TopicEvent('user', 'created', '1.0', attributes);
      let expected = {
        'topic': 'user',
        'event': 'created',
        'version': '1.0',
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      expect(event.toMessage()).to.deep.equal(expected);
    });

    it('should override the "topic", "event" & "version" attributes but not manipulate the original attributes object', () => {
      let attributes = {
        'topic': 'bleh',
        'event': 'some string',
        'version': 'a version',
        'first_name': 'Bob',
      };
      let event = new TopicEvent('user', 'created', '1.0', attributes);
      let expected = {
        'topic': 'user',
        'event': 'created',
        'version': '1.0',
        'first_name': 'Bob',
      };
      expect(event.toMessage()).to.deep.equal(expected);
      expect(event.getAttributes()).to.equal(attributes);
    });
  });

  describe('matches', () => {
    it('should match a wildcard (*) event expression', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.matches('*')).to.be.true;
    });

    it('should strictly match an event expression listening for the topic', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.matches('user')).to.be.true;
      expect(event.matches('user/*')).to.be.true;
      expect(event.matches('order')).to.be.false;
      expect(event.matches('order/*')).to.be.false;
      expect(event.matches('User')).to.be.false;
      expect(event.matches('User/*')).to.be.false;
    });

    it('should strictly match an event expression listening for the topic/event', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.matches('user/created')).to.be.true;
      expect(event.matches('user/created/*')).to.be.true;
      expect(event.matches('user/updated')).to.be.false;
      expect(event.matches('order/created')).to.be.false;
      expect(event.matches('order/created/*')).to.be.false;
      expect(event.matches('User/created')).to.be.false;
      expect(event.matches('user/Created')).to.be.false;
    });

    it('should strictly match an event expression listening for the topic/event/version', () => {
      let event = new TopicEvent('user', 'created', '1.0');
      expect(event.matches('user/created/*')).to.be.true;
      expect(event.matches('user/created/1.0')).to.be.true;
      expect(event.matches('user/created/1')).to.be.true;
      expect(event.matches('user/created/1.0.0')).to.be.true;
      expect(event.matches('order/created/1.0')).to.be.false;
      expect(event.matches('User/created/1.0')).to.be.false;
      expect(event.matches('user/Created/1.0')).to.be.false;
    });
  });

  describe('parseEventExpr', () => {
    it('should return an object with a topic, event & version', () => {
      expect(TopicEvent.parseEventExpr('*'))
        .to.deep.equal({'topic': '*', 'event': '*', 'version': '*'});
      expect(TopicEvent.parseEventExpr('user'))
        .to.deep.equal({'topic': 'user', 'event': '*', 'version': '*'});
      expect(TopicEvent.parseEventExpr('user/created'))
        .to.deep.equal({'topic': 'user', 'event': 'created', 'version': '*'});
      expect(TopicEvent.parseEventExpr('user/created/1.0'))
        .to.deep.equal({'topic': 'user', 'event': 'created', 'version': '1.0'});
      expect(TopicEvent.parseEventExpr('user/*'))
        .to.deep.equal({'topic': 'user', 'event': '*', 'version': '*'});
      expect(TopicEvent.parseEventExpr('user/created/*'))
        .to.deep.equal({'topic': 'user', 'event': 'created', 'version': '*'});
      expect(TopicEvent.parseEventExpr('*/created'))
        .to.deep.equal({'topic': '*', 'event': '*', 'version': '*'});
      expect(TopicEvent.parseEventExpr('*/created/*'))
        .to.deep.equal({'topic': '*', 'event': '*', 'version': '*'});
      expect(TopicEvent.parseEventExpr('user/*/1.0'))
        .to.deep.equal({'topic': 'user', 'event': '*', 'version': '*'});
    });

    it('should throw an exception when the event expression is invalid', () => {
      expect(() => TopicEvent.parseEventExpr('*/')).to.throw(Error, 'The expression must be in the format "topic/event?/version?"');
    });
  });

  describe('normaliseSemVerStr', () => {
    it('should return a semver string if the string can be parsed', () => {
      expect(TopicEvent.normaliseSemVerStr('1')).to.equal('1.0.0');
      expect(TopicEvent.normaliseSemVerStr('1.3')).to.equal('1.3.0');
    });

    it('should return the original string if the string cannot be parsed', () => {
      expect(TopicEvent.normaliseSemVerStr('alpha')).to.equal('alpha');
      expect(TopicEvent.normaliseSemVerStr('1-beta')).to.equal('1-beta');
      expect(TopicEvent.normaliseSemVerStr('1.')).to.equal('1.');
    });
  });
});
