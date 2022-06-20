function MyComplexProc (exec, tablename, like) {
  this.exec = exec;
  this.tablename = tablename;
  this.like = like;
}
MyComplexProc.prototype.destroy = function () {
  this.like = null;
  this.tablename = null;
  this.exec = null;
};
MyComplexProc.prototype.shouldContinue = function () {
  if (!this.exec) {
    return new lib.Error('NO_EXECUTOR', 'No MSSQL executor');
  }
};
MyComplexProc.prototype.fetchFirst = function () {
  return (
    new Lib.jobs.SyncSingleQuery(
      Executor, 
      'SELECT * FROM '+this.tablename+' WHERE user_name LIKE \'%'+this.like+'%\''
    )
  ).go();
};
MyComplexProc.prototype.onFetch = function (fetched) {
  return lib.isArray(fetched)? fetched.length : 0;
};

describe ('Test Stepped Job', function () {
  it('Load lib', function () {
    return setGlobal('Lib', require('..')(execlib));
  });
  it ('Create Executor', function () {
    return setGlobal('Executor', new Lib.Executor({
      maxConnectionAttempts: 10,
      connection: {
        server: '192.168.1.129',
        user: 'sa',
        password: 'SQL1.Server2',
        database: 'IndataDB_Main',
        options: {
          trustServerCertificate: true
        }
      }
    }));
  });
  it ('Connect Executor', function () {
    return Executor.connect();
  });
  it ('Run a SteppedJob', function () {
    this.timeout(1e5);
    return setGlobal('SteppedResult', (new qlib.Stepped({
      mydata: {
        like: 'AUX'
      },
      steps: [
        function () {
          return (
            new Lib.jobs.SyncSingleQuery(
              Executor, 
              'SELECT * FROM users WHERE user_name LIKE \'%'+this.config.mydata.like+'%\''
            )
          ).go();
        },
        function (users) {
          return lib.isArray(users)? users.length : 0;
        }
      ]
    })).go());
  });
  it ('View Result', function () {
    console.log('SteppedResult', SteppedResult);
  });
  it ('Run a SteppedOnInstance job', function () {
    return setGlobal('SteppedOnInstanceResult', qlib.newSteppedJobOnInstance(
      new MyComplexProc(Executor, 'users', 'AUX'),
      ['fetchFirst', 'onFetch']
    ).go());
  })
  it ('View OnInstance Result', function () {
    console.log('SteppedOnInstanceResult', SteppedOnInstanceResult);
  });
  it ('Destroy Executor', function () {
    Executor.destroy();
  });
});