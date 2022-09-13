function createJobCoreSpecializations (execlib, helpers) {
  var ret = {
    txnwrapped: require('./txnwrappedcreator').bind(null, helpers)
  };
  helpers = null;
  return ret;
}
module.exports = createJobCoreSpecializations;