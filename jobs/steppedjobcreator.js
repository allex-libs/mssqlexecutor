function createSteppedJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobBase = qlib.JobBase;

  function SteppedJob (config, defer) {
    JobBase.call(this, defer);
    this.config = config;
    this.step = -1; //will be bumped to zero in first runStep
  }
  lib.inherit(SteppedJob, JobBase);
  SteppedJob.prototype.destroy = function () {
    this.step = null;
    this.config = null;
    JobBase.prototype.destroy.call(this);
  };
  SteppedJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.runStep(null);
    return ok.val;
  };
  SteppedJob.prototype.peekToProceed = function () {
    var ret = JobBase.prototype.peekToProceed.call(this);
    if (!(ret && ret.ok)) {
      return ret;
    }
    if (!this.config) {
      return {
        ok: false,
        val: new lib.Error('NO_CONFIG', 'No config was specified for '+this.constructor.name)
      };
    }
    if (!lib.isArray(this.config.steps)) {
      return {
        ok: false,
        val: new lib.Error('NO_CONFIG_STEPS', 'No config steps were specified for '+this.constructor.name)
      };
    }
    if (lib.isFunction(this.config.shouldContinue)) {
      return this.config.shouldContinue.call(this);
    }
    return ret;
  };
  SteppedJob.prototype.runStep = function (lastresult) {
    var func, funcres;
    if (!this.okToProceed()) {
      return;
    }
    this.step++;
    if (this.step >= this.config.steps.length) {
      this.resolve(lastresult);
      return;
    }
    func = this.config.steps[this.step];
    if (!lib.isFunction(func)) {
      this.reject(new lib.Error('NOT_A_FUNCTION', 'Step #'+this.step+' in config.steps was not a function'));
      return;
    }
    try {
      funcres = func.call(this, lastresult);
      if (q.isThenable(funcres)) {
        funcres.then(
          this.runStep.bind(this),
          this.reject.bind(this),
          this.notify.bind(this)
        );
        return;
      }
      this.runStep(funcres);
    } catch (e) {
      this.reject(e);
    }
  };

  mylib.Stepped = SteppedJob;
}
module.exports = createSteppedJob;