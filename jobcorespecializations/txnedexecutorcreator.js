function createTxnedExecutorSpecialization (helpers, execlib, Base) {
  'use strict';

  var lib = execlib.lib;

  function TxnedExecutor (txn) {
    Base.call(this, txn);
  }
  lib.inherit(TxnedExecutor, Base);
  TxnedExecutor.prototype.isResourceUsable = function (connection) {
    return helpers.isTransactionUsable(connection);
  };
  TxnedExecutor.prototype.activateConnection = function (connection) {
    return connection.request();
  };

  return TxnedExecutor;
}
module.exports = createTxnedExecutorSpecialization;