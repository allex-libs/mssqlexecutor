function createMSSQLHelperJobs (execlib, outerlib) {
  'use strict';
  var lib = execlib.lib, 
    mylib = {};

  require('./insertandreturnautoinccreator')(lib, outerlib, mylib);

  outerlib.helperjobs = mylib;
}
module.exports = createMSSQLHelperJobs;