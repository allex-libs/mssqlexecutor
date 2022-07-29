function createConnectionHandling(execlib, mssql, MSSQLExecutor) {
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
    if (!connection) {
      return false;
    }
    return !connection._connecting && connection._connected && connection._healthy;
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
