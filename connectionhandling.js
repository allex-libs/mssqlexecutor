function createConnectionHandling(execlib, mssql, mylib, MSSQLExecutor) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    ConnectionPool = mssql.ConnectionPool;

  MSSQLExecutor.prototype.connect = function () {
    return this.getHoldOfResource();
  };
  MSSQLExecutor.prototype.acquireResource = function (desc) {
    var ret = (new ConnectionPool(desc.connection)).connect().then(
      null,
      this.onConnectionFailed.bind(this, desc)
    );
    desc = null;
    return ret;
  };
  MSSQLExecutor.prototype.isResourceUsable = function (connection) {
    return mylib.helpers.isConnectionUsable(connection);
  };

  MSSQLExecutor.prototype.destroyResource = function (res) {
    return res.close();
  };

  MSSQLExecutor.prototype.onConnectionFailed = function (/*defer, */desc, reason) {
    console.log('Could not connect to MSSQL', desc.connection);
    console.log(reason);
    console.log('Will try again');
  };
}

module.exports = createConnectionHandling;
