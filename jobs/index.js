function createMSSQLJobs (execlib, outerlib) {
  'use strict';

  require ('./syncexeccreator')(execlib, outerlib.jobs);

}
module.exports = createMSSQLJobs;
