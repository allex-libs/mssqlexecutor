var mssql = require('mssql');

function createExecutor (execlib, resourcehandlinglib, mylib) {
  'use strict';

  var ResMixin = resourcehandlinglib.mixins.ResourceHandler;

  function MSSQLExecutor (options) {
    ResMixin.call(this, options);
  }
  ResMixin.addMethods(MSSQLExecutor);
  MSSQLExecutor.prototype.destroy = function () {
    ResMixin.prototype.destroy.call(this);
  };

  require('./connectionhandling')(execlib, mssql, MSSQLExecutor);

  mylib.Executor = MSSQLExecutor;
}
module.exports = createExecutor;
