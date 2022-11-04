function createTxnWrappedSpecialization (helpers, execlib, Base) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q;

  function TxnedExecutor (txnjobcore) {
    this.txn = txnjobcore.txn;
    this.resourceHandlingOptions = {connection: txnjobcore.txn._acquiredConfig};
    this.dbname = txnjobcore.executor.dbname;
    this.connected = this.txn.connected;
    this.maybeLog = txnjobcore.executor.maybeLog.bind(txnjobcore.executor);
  }
  TxnedExecutor.prototype.destroy = function () {
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

  function TxnWrappedJobCore (executor, jobproducerfunc) {
    Base.call(this, executor, jobproducerfunc);
  }
  lib.inherit(TxnWrappedJobCore, Base);

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
  };
  TxnWrappedJobCore.prototype.beginTransaction = function () {
    this.executor.maybeLog('BEGIN TRANSACTION');
    return this.txn.begin();
  };
  TxnWrappedJobCore.prototype.createWrapped = function () {
    this.txnExecutor = new TxnedExecutor(this);
    return this.jobProducerFunc(this.txnExecutor);
  };
  TxnWrappedJobCore.prototype.finalizeTxn = function () {
    this.txnUnderWay = false;
    if (!this.result.fail) {
      this.executor.maybeLog('COMMIT TRANSACTION');
      return this.txn.commit();
    }
    if (!this.txn._aborted) {
      this.executor.maybeLog('ROLLBACK TRANSACTION');
      return this.txn.rollback();
    }
  };

  return TxnWrappedJobCore;
}
module.exports = createTxnWrappedSpecialization;