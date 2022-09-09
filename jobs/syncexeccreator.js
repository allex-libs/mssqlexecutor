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

  function inputter (request, input) {
    request.input(input.name, mssql[input.type], input.value);
  }
  function outputter (request, output) {
    request.output(output.name, mssql[output.type], output.default);
  }

  mylib.SyncExec = SyncExecJob;
}
module.exports = createSyncExecJob;