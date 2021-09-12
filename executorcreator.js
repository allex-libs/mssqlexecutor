var mssql = require('mssql');

function createExecutor (execlib, mylib) {
  'use strict';

  function MSSQLExecutor (options) {
    this.options = options;
    this.connectionAttempts = 0;
    this.poolPromise = null;
  }
  MSSQLExecutor.prototype.destroy = function () {
    if (this.poolPromise) {
      this.poolPromise.close();
    }
    this.poolPromise = null;
    this.options = null;
    this.connectionAttempts = null;
  };

  require('./connectionhandling')(execlib, mssql, MSSQLExecutor);

  mylib.Executor = MSSQLExecutor;
}
module.exports = createExecutor;
