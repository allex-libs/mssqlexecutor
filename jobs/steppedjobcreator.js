function createSteppedJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobBase = qlib.JobBase;

  function SteppedJob (config, defer) {
    JobBase.call(this, defer);
    this.config = config;
    this.notifyListener = null;
    this.step = -1; //will be bumped to zero in first runStep
    if (config.notify && lib.isFunction(config.notify.attach)){
      this.notifyListener = config.notify.attach(this.notify.bind(this));
    }
  }
  lib.inherit(SteppedJob, JobBase);
  SteppedJob.prototype.destroy = function () {
    if (this.config && lib.isFunction(this.config.onDesctruction)) {
      this.config.onDesctruction.call(this);
    }
    this.step = null;
    if (this.notifyListener) {
      this.notifyListener.destroy();
    }
    this.notifyListener = null;
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
    var ret = JobBase.prototype.peekToProceed.call(this), check;
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
      check = this.config.shouldContinue.call(this);
      if (check) {
        return {
          ok: false,
          val: check
        };
      }
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

  function newSteppedJobOnInstance (instance, methodnamesteps, defer) {
    var ret = new SteppedJob({
      notify: instance.notify,
      shouldContinue: lib.isFunction(instance.shouldContinue) ? instance.shouldContinue.bind(instance) : null,
      onDesctruction: lib.isFunction(instance.destroy) ? instance.destroy.bind(instance) : null,
      steps: methodnamesteps.map(function(stepmethodname) {
        if (!lib.isFunction(instance[stepmethodname])) {
          throw new lib.Error('NOT_A_METHOD', stepmethodname+' is not a method of '+instance.constructor.name);
        }
        return instance[stepmethodname].bind(instance);
      })
    }, defer);
    instance = null;
    methodnamesteps = null;
    return ret;
  }
  function newSteppedJobOnSteppedInstance (instance, defer) {
    return newSteppedJobOnInstance(instance, instance.steps, defer);
  }

  mylib.newSteppedJobOnInstance = newSteppedJobOnInstance;
  mylib.newSteppedJobOnSteppedInstance = newSteppedJobOnSteppedInstance;
}
module.exports = createSteppedJob;