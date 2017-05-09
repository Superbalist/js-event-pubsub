'use strict';

let chai = require('chai');
let expect = chai.expect;
let should = chai.should;
let chaiAsPromised = require('chai-as-promised');
let sinon = require('sinon');
let Ajv = require('ajv');
let JSONSchemaEventValidator = require('../src/validators/JSONSchemaEventValidator');
let SchemaEvent = require('../src/events/SchemaEvent');

chai.use(chaiAsPromised);
chai.should();

describe('Validators', () => {
  describe('JSONSchemaEventValidator', () => {
    describe('construct instance', () => {
      it('should set the ajv property', () => {
        let ajv = new Ajv();
        let validator = new JSONSchemaEventValidator(ajv);
        expect(validator.ajv).to.equal(ajv);
      });

      it('should set the ajv property to a default instance of ajv if not given', () => {
        let validator = new JSONSchemaEventValidator();
        expect(validator.ajv).to.be.an.instanceof(Ajv);
      });
    });

    describe('validates', () => {
      it('should return a promise', () => {
        let ajv = sinon.createStubInstance(Ajv);
        ajv.compileAsync = sinon.stub()
          .returns(new Promise((resolve, reject) => {}));

        let validator = new JSONSchemaEventValidator(ajv);

        let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');

        let promise = validator.validates(event);

        expect(promise).to.be.a('promise');
      });

      it('should resolve a promise if validation passes', () => {
        let validate = sinon.stub()
          .returns(true);

        let promise = new Promise((resolve, reject) => resolve(validate));

        let ajv = sinon.createStubInstance(Ajv);
        ajv.compileAsync = sinon.stub()
          .returns(promise);

        let validator = new JSONSchemaEventValidator(ajv);

        let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');

        return validator.validates(event)
          .then((success) => {
            sinon.assert.calledOnce(validate);
            sinon.assert.calledWith(validate, {'schema': 'http://schemas.my-website.org/events/user/created/1.0.json'});

            return success;
          })
          .should.eventually.be.true;
      });

      it('should reject a promise with errors if validation fails', () => {
        let errors = {
          'beep': 'bop',
        };
        let validate = sinon.stub()
          .returns(false);
        validate.errors = errors;

        let promise = new Promise((resolve, reject) => resolve(validate));

        let ajv = sinon.createStubInstance(Ajv);
        ajv.compileAsync = sinon.stub()
          .returns(promise);

        let validator = new JSONSchemaEventValidator(ajv);

        let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');

        return validator.validates(event)
          .catch((errors) => {
            sinon.assert.calledOnce(validate);
            sinon.assert.calledWith(validate, {'schema': 'http://schemas.my-website.org/events/user/created/1.0.json'});

            throw errors;
          })
          .should.be.rejectedWith(errors);
      });
    });

    describe('makeDefaultAjv', () => {
      it('should return an instance of ajv', () => {
        let ajv = JSONSchemaEventValidator.makeDefaultAjv();
        expect(ajv).to.be.an.instanceof(Ajv);
      });
    });
  });
});
