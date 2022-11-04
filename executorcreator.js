var mssql = require('mssql');

function createExecutor (execlib, SQLExecutor, mylib) {
  'use strict';

  var lib = execlib.lib;

  function MSSQLExecutor (options) {
    SQLExecutor.call(this, options);
  }
  lib.inherit(MSSQLExecutor, SQLExecutor);
  MSSQLExecutor.prototype.destroy = function () {
    SQLExecutor.prototype.destroy.call(this);
  };
  MSSQLExecutor.prototype.activateConnection = function (connection) {
    return connection.request();
  };
  
  MSSQLExecutor.prototype.prepareForLog = function (thingy) {
    return 'USE ['+this.dbname+']\n'+thingy+'\n';
  };

  require('./connectionhandling')(execlib, mssql, mylib, MSSQLExecutor);

  mylib.Executor = MSSQLExecutor;
}
module.exports = createExecutor;
