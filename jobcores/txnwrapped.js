function createTxnWrappedJobCore (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib;

  function SafeJobRunnerJobCore (job) {
    this.job = job;
    this.notify = new lib.HookCollection();
  }
  SafeJobRunnerJobCore.prototype.destroy = function () {
    this.job = null;
    if (this.notify) {
      this.notify.destroy();
    }
    this.notify = null;
  };
  SafeJobRunnerJobCore.prototype.shouldContinue = function () {
    if (!this.job) {
      return new lib.Error('NO_JOB_TO_SAFE_RUN');
    }
    if (!this.notify) {
      return new lib.Error('ALREADY_DESTROYED');
    }
  };
  SafeJobRunnerJobCore.prototype.run = function () {
    return this.job.go().then(
      this.onRunSuccess.bind(this),
      this.onRunFail.bind(this),
      this.notify.fire.bind(this.notify)
    );
  };
  SafeJobRunnerJobCore.prototype.onRunSuccess = function (result) {
    return {
      success: result
    };
  };
  SafeJobRunnerJobCore.prototype.onRunFail = function (reason) {
    return {
      fail: reason
    };
  };

  SafeJobRunnerJobCore.prototype.steps = [
    'run'
  ];

  function TxnedExecutor (txn) {
    this.txn = txn;
    this.resourceHandlingOptions = {};
    this.connected = this.txn.connected;
  }
  TxnedExecutor.prototype.destroy = function () {
    this.connected = null;
    this.resourceHandlingOptions = null;
    this.txn = null;
  };
  TxnedExecutor.prototype.connect = function () {
    this.connected = this.txn.connected;
    return this.connected ? q(this.txn) : q.reject(new lib.Error('TRANSACTION_DISCONNECTED'));
  };

  function TxnWrappedJobCore (executor, jobproducerfunc) {
    this.executor = executor;
    this.jobProducerFunc = jobproducerfunc;
    this.jobToWrap = null;
    this.pool = null;
    this.txn = null;
    this.txnUnderWay = false;
    this.txnExecutor = null;
    this.result = null;
  }
  TxnWrappedJobCore.prototype.destroy = function () {
    if (this.txn && this.txnUnderWay) {
      this.txn.rollback();
    }
    this.result = null;
    if (this.txnExecutor) {
      this.txnExecutor.destroy();
    }
    this.txnExecutor = null;
    this.txnUnderWay = null;
    this.txn = null;
    this.pool = null;
    this.jobToWrap = null;
    this.executor = null;
  };
  TxnWrappedJobCore.prototype.shouldContinue = function () {
    if (!this.executor) {
      return new lib.Error('NO_EXECUTOR');
    }
    if (!lib.isFunction(this.jobProducerFunc)) {
      return new lib.Error('JOB_PRODUCER_FUNC_NOT_A_FUNCTION');
    }
    if (this.jobToWrap) {
      if (!lib.isFunction(this.jobToWrap.go)) {
        return new lib.Error('PRODUCED_JOB_TO_WRAP_NOT_GOABLE');
      }
    }
    if (this.pool) {
      if (!this.pool.healthy) {
        return new lib.Error('ACQUIRED_POOL_IS_NOT_HEALTHY');
      }
      if (!this.pool.connected) {
        return new lib.Error('ACQUIRED_POOL_IS_NOT_CONNECTED');
      }
    }
    if (this.txn) {
      if (!this.txn.connected) {
        return new lib.Error('INTERNAL_TRANSACTION_IS_NOT_CONNECTED');
      }
    }
    if (this.txnExecutor) {
      if (!this.txnExecutor.txn) {
        return new lib.Error('INTERNAL_TRANSACTIONED_EXECUTOR_DESTROYED');
      }
    }
  };

  TxnWrappedJobCore.prototype.connect = function () {
    return this.executor.connect();
  };
  TxnWrappedJobCore.prototype.onConnected = function (pool) {
    this.pool = pool;
    this.txn = this.pool.transaction();
  };
  TxnWrappedJobCore.prototype.beginTransaction = function () {
    return this.txn.begin();
  };
  TxnWrappedJobCore.prototype.onTransactionBegun = function () {
    this.txnUnderWay = true;
  };
  TxnWrappedJobCore.prototype.createWrapped = function () {
    this.txnExecutor = new TxnedExecutor(this.txn);
    return this.jobProducerFunc(this.txnExecutor);
  };
  TxnWrappedJobCore.prototype.onWrapped = function (wrapped) {
    this.jobToWrap = wrapped;
  };

  TxnWrappedJobCore.prototype.runWrapped = function (wrapped) {
    return qlib.newSteppedJobOnSteppedInstance(
      new SafeJobRunnerJobCore(this.jobToWrap)
    ).go();
  };
  TxnWrappedJobCore.prototype.onWrappedResult = function (runresult) {
    this.result = runresult;
  };
  TxnWrappedJobCore.prototype.finalizeTxn = function () {
    return this.txn[this.result.fail ? 'rollback' : 'commit']();
  };
  TxnWrappedJobCore.prototype.finalize = function () {
    this.txnUnderWay = false;
    this.txn = null;
    if (this.result.fail) {
      throw this.result.fail;
    }
    return this.result.success;
  };

  TxnWrappedJobCore.prototype.steps = [
    'connect',
    'onConnected',
    'beginTransaction',
    'onTransactionBegun',
    'createWrapped',
    'onWrapped',
    'runWrapped',
    'onWrappedResult',
    'finalizeTxn',
    'finalize'
  ]

  mylib.TxnWrapped = TxnWrappedJobCore;
}
module.exports = createTxnWrappedJobCore;