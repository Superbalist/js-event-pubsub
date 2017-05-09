'use strict';

let chai = require('chai');
let expect = chai.expect;
let SimpleEvent = require('../lib/events/SimpleEvent');

describe('SimpleEvent', () => {
  describe('construct instance', () => {
    it('should set the name property', () => {
      let event = new SimpleEvent('user.created');
      expect(event.name).to.equal('user.created');
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
      let event = new SimpleEvent('user.created', attributes);
      expect(event.attributes).to.equal(attributes);
    });

    it('should set the attributes property to a default value of an empty object if not given', () => {
      let event = new SimpleEvent('user.created');
      expect(event.attributes).to.be.empty;
    });
  });

  describe('getName', () => {
    it('should return the event name', () => {
      let event = new SimpleEvent('user.created');
      expect(event.getName()).to.equal('user.created');
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
      let event = new SimpleEvent('user.created', attributes);
      expect(event.getAttributes()).to.equal(attributes);
    });
  });

  describe('getAttribute', () => {
    it('should return the value of an event attribute', () => {
      let event = new SimpleEvent('user.created', {'hello': 'world'});
      expect(event.getAttribute('hello')).to.equal('world');
    });

    it('should return null if the event attribute is not set', () => {
      let event = new SimpleEvent('user.created', {'hello': 'world'});
      expect(event.getAttribute('first_name')).to.be.null;
    });
  });

  describe('setAttribute', () => {
    it('should set the value of an event attribute', () => {
      let event = new SimpleEvent('user.created', {'first_name': 'Matthew'});
      expect(event.getAttribute('first_name')).to.equal('Matthew');
      event.setAttribute('first_name', 'Rob');
      expect(event.getAttribute('first_name')).to.equal('Rob');
    });
  });

  describe('hasAttribute', () => {
    it('should return a boolean indicating whether or not the attribute is set', () => {
      let event = new SimpleEvent('user.created', {'first_name': 'Matthew'});
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
      let event = new SimpleEvent('user.created', attributes);
      let expected = {
        'event': 'user.created',
        'user': {
          'id': 1456,
          'first_name': 'Joe',
          'last_name': 'Soap',
          'email': 'joe.soap@example.org',
        },
      };
      expect(event.toMessage()).to.deep.equal(expected);
    });

    it('should override the "event" attribute but not manipulate the original attributes object', () => {
      let attributes = {
        'event': 'some string',
        'first_name': 'Bob',
      };
      let event = new SimpleEvent('user.created', attributes);
      let expected = {
        'event': 'user.created',
        'first_name': 'Bob',
      };
      expect(event.toMessage()).to.deep.equal(expected);
      expect(event.getAttributes()).to.equal(attributes);
    });
  });

  describe('matches', () => {
    it('should match a wildcard (*) event expression', () => {
      let event = new SimpleEvent('user.created');
      expect(event.matches('*')).to.be.true;
    });

    it('should strictly match the event expression', () => {
      let event = new SimpleEvent('user.created');
      expect(event.matches('user.created')).to.be.true;
      expect(event.matches('User.Created')).to.be.false;
      expect(event.matches('user.updated')).to.be.false;
    });
  });
});
