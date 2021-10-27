describe ('Test Stepped Job', function () {
  it('Load lib', function () {
    return setGlobal('Lib', require('..')(execlib));
  });
  it ('Create Executor', function () {
    return setGlobal('Executor', new Lib.Executor({
      maxConnectionAttempts: 10,
      connection: {
        server: 'localhost',
        user: 'sa',
        password: 'Kremplazma.123',
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
    return setGlobal('SteppedResult', (new Lib.jobs.Stepped({
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
  it ('Destroy Executor', function () {
    Executor.destroy();
  });
});