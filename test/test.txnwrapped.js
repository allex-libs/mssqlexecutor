function successfulJobProducer (txnexecutor) {
  return new Lib.jobs.SyncSingleQuery(txnexecutor, 'SELECT * FROM users');
}
function unsuccessfulJobProducer (txnexecutor) {
  return new Lib.jobs.SyncSingleQuery(txnexecutor, 'SELECT * FROM table_that_does_not_exist');
}

describe('Test Txn Wrapped Query', function () {
  it('Load lib', function () {
    return setGlobal('Lib', require('..')(execlib));
  });
  it ('Create Executor', function () {
    return setGlobal('Executor', new Lib.Executor({
      maxConnectionAttempts: 10,
      connection: {
        server: 'mysqlserver',
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
  it ('Run unsuccessful Txn-Wrappeed SELECT', function () {
    this.timeout(1e7);
    return qlib.newSteppedJobOnSteppedInstance(
      new Lib.jobcores.TxnWrapped(
        Executor, 
        unsuccessfulJobProducer
      )
    ).go().then(null, function (reason){
      console.error('got expected error', reason);
      return null;
    });
  });
  it ('Run successful Txn-Wrappeed SELECT', function () {
    this.timeout(1e7);
    return qlib.newSteppedJobOnSteppedInstance(
      new Lib.jobcores.TxnWrapped(
        Executor, 
        successfulJobProducer
      )
    ).go().then(
      console.log.bind(console, 'got expected users'),
      function (reason){
        console.error('got unexpected error', reason);
        throw reason;
      }
    );
  });
});