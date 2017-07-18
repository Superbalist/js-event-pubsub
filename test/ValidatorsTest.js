'use strict';

let chai = require('chai');
let expect = chai.expect;
let chaiAsPromised = require('chai-as-promised');
let sinon = require('sinon');
let Ajv = require('ajv');
let JSONSchemaEventValidator = require('../lib/validators/JSONSchemaEventValidator');
let SchemaEvent = require('../lib/events/SchemaEvent');
let ValidationResult = require('../lib/ValidationResult');

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

    describe('validate', () => {
      it('should return a promise', () => {
        let ajv = sinon.createStubInstance(Ajv);
        ajv.compileAsync = sinon.stub()
          .returns(new Promise((resolve, reject) => {}));

        let validator = new JSONSchemaEventValidator(ajv);

        let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');

        let promise = validator.validate(event);

        expect(promise).to.be.a('promise');
      });

      it('should resolve a promise to a ValidationResult if validation passes', () => {
        let validate = sinon.stub()
          .returns(true);

        let promise = new Promise((resolve, reject) => resolve(validate));

        let ajv = sinon.createStubInstance(Ajv);
        ajv.compileAsync = sinon.stub()
          .returns(promise);

        let validator = new JSONSchemaEventValidator(ajv);

        let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');

        return validator.validate(event).then((result) => {
          sinon.assert.calledOnce(validate);
          sinon.assert.calledWith(validate, {'schema': 'http://schemas.my-website.org/events/user/created/1.0.json'});

          expect(result).to.be.an.instanceof(ValidationResult);
          expect(result.validator).to.equal(validator);
          expect(result.event).to.equal(event);
          expect(result.passes).to.be.true;
          expect(result.errors).to.be.empty;
        });
      });

      it('should resolve a promise to false if validation fails', () => {
        let validate = sinon.stub()
          .returns(false);
        validate.errors = [
          {
            message: 'should have required property \'user\'',
          },
        ];

        let promise = new Promise((resolve, reject) => resolve(validate));

        let ajv = sinon.createStubInstance(Ajv);
        ajv.compileAsync = sinon.stub()
          .returns(promise);

        let validator = new JSONSchemaEventValidator(ajv);

        let event = new SchemaEvent('http://schemas.my-website.org/events/user/created/1.0.json');

        return validator.validate(event).then((result) => {
          sinon.assert.calledOnce(validate);
          sinon.assert.calledWith(validate, {'schema': 'http://schemas.my-website.org/events/user/created/1.0.json'});

          expect(result).to.be.an.instanceof(ValidationResult);
          expect(result.validator).to.equal(validator);
          expect(result.event).to.equal(event);
          expect(result.passes).to.be.false;
          expect(result.errors).to.deep.equal(['should have required property \'user\'']);
        });
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
