function createMSSQLStorageJobCores (execlib, outerlib) {
  'use strict';
  var lib = execlib.lib, 
    mylib = {};

  require ('./onebyoneprocessor')(lib, mylib);
  require ('./txnwrapped')(lib, mylib);

  outerlib.jobcores = mylib;
}
module.exports = createMSSQLStorageJobCores;