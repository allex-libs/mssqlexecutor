function createConnectionHandling(execlib, mssql, MSSQLExecutor) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    ConnectionPool = mssql.ConnectionPool;

  MSSQLExecutor.prototype.connect = function () {
    if (this.poolPromise) {
      return this.poolPromise;
    }
    var d = q.defer();
    this.poolPromise = d.promise;
    this.connectionAttempts = 0;
    this.doConnect(d);
    return this.poolPromise;
  }
  MSSQLExecutor.prototype.doConnect = function (defer) {
    if (!lib.isNumber(this.connectionAttempts)) {
      defer.reject(new lib.Error('ALREADY_DESTROYED', 'This instance of '+this.constructor.name+' is already destroyed'));
      defer = null;
      return;
    }
    (new ConnectionPool(this.options.connection)).connect().then(
      this.onConnected.bind(this, defer),
      this.onConnectionFailed.bind(this, defer)
    );
    defer = null;
  };
  MSSQLExecutor.prototype.onConnected = function (defer, pool) {
    if (pool) {
      pool.on('error', this.onPoolError.bind(this));
    }
    defer.resolve(pool);
    defer = null;
  };

  MSSQLExecutor.prototype.onConnectionFailed = function (defer, reason) {
    console.log('Could not connect to MSSQL', this.options.connection);
    console.log(reason);
    this.connectionAttempts++;
    if (lib.isNumber(this.options.maxConnectionAttempts) && this.options.maxConnectionAttempts <= this.connectionAttempts) {
      defer.reject(new lib.Error('COULD_NOT_CONNECT', 'Could not connect to MSSQL Server'));
      defer = null;
      return;
    }
    console.log('Will try again');
    lib.runNext(this.doConnect.bind(this, defer), 1000);
    defer = null;
  };

  MSSQLExecutor.prototype.onPoolError = function (reason) {
    var pp = this.poolPromise;
    this.poolPromise = null;
    this.connect();
    if (pp) {
      pp.then(
        this.detachPool.bind(this),
        function () {}
      );
    }
  };
  MSSQLExecutor.prototype.detachPool = function (pool) {
    if (pool) {
      pool.off('error', this.onPoolError.bind(this));
    }
  };
}

module.exports = createConnectionHandling;
