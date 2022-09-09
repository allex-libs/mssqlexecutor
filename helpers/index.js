function createMSSQLHelpers (execlib, outerlib) {
  'use strict'

  var mylib = {};

  function isConnectionUsable (connection) {
    return connection && !connection._connecting && connection._connected && connection._healthy;
  }
  function isTransactionUsable (connection) {
    return connection && connection.connected;
  }

  mylib.isConnectionUsable = isConnectionUsable;
  mylib.isTransactionUsable = isTransactionUsable;

  outerlib.helpers = mylib;
}
module.exports = createMSSQLHelpers;