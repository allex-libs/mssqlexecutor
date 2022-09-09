function createJobCoreSpecializations (execlib, helpers) {
  var ret = {
    txnwrapped: require('./txnwrappedcreator'),
    txnedexecutor: require('./txnedexecutorcreator').bind(null, helpers)
  };
  helpers = null;
  return ret;
}
module.exports = createJobCoreSpecializations;