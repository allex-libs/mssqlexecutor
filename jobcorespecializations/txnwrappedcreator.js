function createTxnWrappedSpecialization (helpers, execlib, Base) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q;

  function TxnedExecutor (txnjobcore) {
    if (txnjobcore && txnjobcore.executor) {
      TxnedExecutor.prototype.queue = txnjobcore.executor.constructor.prototype.queue;
      TxnedExecutor.prototype.validateQueueObj = txnjobcore.executor.constructor.prototype.validateQueueObj;
      TxnedExecutor.prototype.analyzeQueueResult = txnjobcore.executor.constructor.prototype.analyzeQueueResult;
      TxnedExecutor.prototype.queueTypes = txnjobcore.executor.constructor.prototype.queueTypes;
    }
    this.txn = txnjobcore.txn;
    this.resourceHandlingOptions = {connection: txnjobcore.txn._acquiredConfig};
    this.dbname = txnjobcore.executor.dbname;
    this.connected = this.txn.connected;
    this.maybeLog = txnjobcore.executor.maybeLog.bind(txnjobcore.executor);
    this.maybeLogComment = txnjobcore.executor.maybeLogComment.bind(txnjobcore.executor);
    this.prepareForLog = txnjobcore.executor.prepareForLog.bind(txnjobcore.executor);
  }
  TxnedExecutor.prototype.destroy = function () {
    this.prepareForLog = null;
    this.maybeLogComment = null;
    this.maybeLog = null;
    this.connected = null;
    this.dbname = null;
    this.resourceHandlingOptions = null;
    this.txn = null;
  };
  TxnedExecutor.prototype.connect = function () {
    this.connected = this.txn.connected;
    return this.connected ? q(this.txn) : q.reject(new lib.Error('TRANSACTION_DISCONNECTED'));
  };
  TxnedExecutor.prototype.isResourceUsable = function (connection) {
    return helpers.isTransactionUsable(connection);
  };
  TxnedExecutor.prototype.activateConnection = function (connection) {
    return connection.request();
  };
  TxnedExecutor.prototype.queue = null;
  TxnedExecutor.prototype.validateQueueObj = null;
  TxnedExecutor.prototype.analyzeQueueResult = null;
  TxnedExecutor.prototype.queueTypes = null;

  function TxnWrappedJobCore (executor, jobproducerfunc) {
    Base.call(this, executor, jobproducerfunc);
    this.rolledBack = false;
  }
  lib.inherit(TxnWrappedJobCore, Base);
  TxnWrappedJobCore.prototype.destroy = function () {
    this.rolledBack = null;
    Base.prototype.destroy.call(this);
  };

  TxnWrappedJobCore.prototype.shouldContinue = function () {
    var ret = Base.prototype.shouldContinue.call(this);
    if (ret) {
      return ret;
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
  TxnWrappedJobCore.prototype.onConnected = function (pool) {
    this.pool = pool;
    this.txn = this.pool.transaction();
    this.txn.on('rollback', this.onRolledBack.bind(this));
  };
  TxnWrappedJobCore.prototype.beginTransaction = function () {
    this.executor.maybeLog('BEGIN TRANSACTION');
    return this.txn.begin();
  };
  TxnWrappedJobCore.prototype.createWrapped = function () {
    this.txnExecutor = new TxnedExecutor(this);
    return this.jobProducerFunc(this.txnExecutor);
  };
  TxnWrappedJobCore.prototype.finalizeTxn = function (err) {
    this.txnUnderWay = false;
    if (!this.result.fail) {
      this.executor.maybeLog('COMMIT TRANSACTION');
      return this.txn.commit();
    }
    this.executor.maybeLogComment(this.result.fail.message, 'Error in transaction:');
    if (!(this.txn._aborted||this.rolledBack)) {
      this.executor.maybeLog('ROLLBACK TRANSACTION');
      try {
        return this.txn.rollback();
      } catch (e) {}
    }
    throw this.result.fail;
  };
  TxnWrappedJobCore.prototype.onRolledBack = function () {
    this.rolledBack = true;
  };

  return TxnWrappedJobCore;
}
module.exports = createTxnWrappedSpecialization;