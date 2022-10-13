var mssql = require('mssql');

function createSyncExecJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib;
  var SyncJob = mylib.Sync;

  function SyncExecJob (executor, name, inputs, outputs, defer) {
    SyncJob.call(this, executor, defer);
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;
  }
  lib.inherit(SyncExecJob, SyncJob);
  SyncExecJob.prototype.useTheRequest = function (request) {
    var ret;
    if (lib.isArray(this.inputs)) {
      this.inputs.forEach(inputter.bind(null, request));
    }
    if (lib.isArray(this.outputs)) {
      this.outputs.forEach(outputter.bind(null, request));
    }
    ret = request.execute(this.name);
    request = null;
    return ret;
  };

  function checkparamhash (paramhash) {
    if (!paramhash) {
      throw new lib.Error('NO_PARAM_TO_CHECK');
    }
    if (!paramhash.type) {
      throw new lib.JSONizingError('NO_PARAM_TYPE', paramhash, 'Type needed on');
    }
    if (!(paramhash.type in mssql)) {
      throw new lib.JSONizingError('NO_PARAM_TYPE', paramhash, 'Type declared is not defined in MSSql');
    }
  }
  function inputter (request, input) {
    checkparamhash(input);
    request.input(input.name, 'typeparam' in input ? mssql[input.type](input.typeparam) : mssql[input.type], input.value);
  }
  function outputter (request, output) {
    checkparamhash(output);
    request.output(output.name, 'typeparam' in output ? mssql[output.type](output.typeparam) : mssql[output.type], output.default);
  }

  mylib.SyncExec = SyncExecJob;
}
module.exports = createSyncExecJob;