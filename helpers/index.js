function createMSSQLHelpers (execlib, outerlib) {
  'use strict'

  var lib = execlib.lib;
  var mylib = {};

  function isConnectionUsable (connection) {
    return connection && !connection._connecting && connection._connected && connection._healthy;
  }
  function isTransactionUsable (connection) {
    return connection && connection.connected;
  }
  function checkSyncQueryResults (syncqueryres, explen) {
    if (!(
      syncqueryres &&
      lib.isArray(syncqueryres.recordsets) &&
      syncqueryres.recordsets.length == explen &&
      syncqueryres.recordsets.every(function (rs) {return rs.length>0})
    )) {
      throw new lib.Error('INTERNAL_DB_FETCH_ERROR', 'Expected '+explen+' recordsets on getting lookup data');
    }
  }

  mylib.isConnectionUsable = isConnectionUsable;
  mylib.isTransactionUsable = isTransactionUsable;
  mylib.checkSyncQueryResults = checkSyncQueryResults;

  outerlib.helpers = mylib;
}
module.exports = createMSSQLHelpers;