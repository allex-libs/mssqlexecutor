function createTxnWrappedSpecialization (execlib, Base) {
  'use strict';

  var lib = execlib.lib;

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
  }

  return TxnWrappedJobCore;
}
module.exports = createTxnWrappedSpecialization;