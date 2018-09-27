'use strict';

const httpStatus = require('http-status-codes');
const { Presenter } = require('../lib/presenter');
const {
  ConflictingStartError,
  ConflictingEndError,
  ConflictingMappingError,
  MissingSpanError,
  OutOfOrderError
} = require('../lib/controller');

describe('Presenter', () => {
  let controller;
  let presenter;
  let resp;

  beforeEach(() => {
    controller = {
      handleStart: sinon.stub(),
      handleStop: sinon.stub(),
      handleMappings: sinon.stub()
    };
    resp = {
      status: sinon.stub(),
      send: sinon.stub()
    };
    resp.status.returns(resp);
    presenter = new Presenter(controller);
  });

  const verifyResponse = (statusCode) => {
    assert.calledOnce(resp.status);
    assert.calledWithExactly(resp.status, statusCode);

    assert.calledOnce(resp.send);
  };

  describe('#handleStart', () => {
    const req = {
      body: {
        some: 'event'
      }
    };

    it('delegates call to controller and responds with "created" status code', async () => {
      await presenter.handleStart(req, resp);

      assert.calledOnce(controller.handleStart);
      assert.calledWithExactly(controller.handleStart, req.body);

      verifyResponse(httpStatus.CREATED);
    });

    context('when controller throws conflicting start error', () => {
      beforeEach(() => {
        controller.handleStart.callsFake(async () => {
          throw new ConflictingStartError();
        });
      });

      it('responds with "conflict" status code', async () => {
        await presenter.handleStart(req, resp);

        verifyResponse(httpStatus.CONFLICT);
      });
    });

    context('when controller throws an unknown error', () => {
      beforeEach(() => {
        controller.handleStart.callsFake(async () => {
          throw new Error('stubbed to fail');
        });
      });

      it('responds with "internal server error" status code', async () => {
        await presenter.handleStart(req, resp);

        verifyResponse(httpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('#handleStop', () => {
    const req = {
      body: {
        some: 'event'
      }
    };

    it('delegates call to controller and responds with "created" status code', async () => {
      await presenter.handleStop(req, resp);

      assert.calledOnce(controller.handleStop);
      assert.calledWithExactly(controller.handleStop, req.body);

      verifyResponse(httpStatus.CREATED);
    });

    context('when controller throws conflicting end error', () => {
      beforeEach(() => {
        controller.handleStop.callsFake(async () => {
          throw new ConflictingEndError();
        });
      });

      it('responds with "conflict" status code', async () => {
        await presenter.handleStop(req, resp);

        verifyResponse(httpStatus.CONFLICT);
      });
    });

    context('when controller throws missing span error', () => {
      beforeEach(() => {
        controller.handleStop.callsFake(async () => {
          throw new MissingSpanError();
        });
      });

      it('responds with "unprocessable entity" status code', async () => {
        await presenter.handleStop(req, resp);

        verifyResponse(httpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    context('when controller throws out of order error', () => {
      beforeEach(() => {
        controller.handleStop.callsFake(async () => {
          throw new OutOfOrderError();
        });
      });

      it('responds with "unprocessable entity" status code', async () => {
        await presenter.handleStop(req, resp);

        verifyResponse(httpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    context('when controller throws an unknown error', () => {
      beforeEach(() => {
        controller.handleStop.callsFake(async () => {
          throw new Error('stubbed to fail');
        });
      });

      it('responds with "internal server error" status code', async () => {
        await presenter.handleStop(req, resp);

        verifyResponse(httpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('#handleMappings', () => {
    const req = {
      body: {
        resource_id: 'test-resource-id',
        plan_id: 'test-plan-id',
        metering_plan: 'test-metering-plan',
        rating_plan: 'test-rating-plan',
        pricing_plan: 'test-pricing-plan'
      }
    };

    it('delegates call to controller and responds with "created" status code', async () => {
      await presenter.handleMappings(req, resp);

      assert.calledOnce(controller.handleMappings);
      assert.calledWithExactly(controller.handleMappings,
        req.body.resource_id,
        req.body.plan_id,
        req.body.metering_plan,
        req.body.rating_plan,
        req.body.pricing_plan
      );

      verifyResponse(httpStatus.CREATED);
    });

    context('when controller throws conflict mapping error', () => {
      beforeEach(() => {
        controller.handleMappings.callsFake(async () => {
          throw new ConflictingMappingError();
        });
      });

      it('responds with "conflict" status code', async () => {
        await presenter.handleMappings(req, resp);

        verifyResponse(httpStatus.CONFLICT);
      });
    });

    context('when controller throws an unknown error', () => {
      beforeEach(() => {
        controller.handleMappings.callsFake(async () => {
          throw new Error('stubbed to fail');
        });
      });

      it('responds with "internal server error" status code', async () => {
        await presenter.handleMappings(req, resp);

        verifyResponse(httpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});