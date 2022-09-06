var procbody = [
  "CREATE PROCEDURE allextest (",
  "@first int,",
  "@count int OUTPUT",
  ") AS",
  "SET @count = (SELECT COUNT (*) FROM users)",
  "DECLARE c CURSOR FOR SELECT user_name FROM USERS",
  "DECLARE @mycnt int",
  "DECLARE @name varchar(100)",
  "OPEN c",
  "FETCH NEXT FROM c INTO @name",
  "WHILE (@@fetch_status <> -1)",
  "BEGIN",
  "SET @mycnt = @mycnt+1",
  "SELECT @name AS user_name",
  "FETCH NEXT FROM c INTO @name",
  "END",
  "CLOSE c",
  "DEALLOCATE c"
].join('\n');

describe ('Test Exec', function () {
  it('Load lib', function () {
    return setGlobal('Lib', require('..')(execlib));
  });
  it ('Create Executor', function () {
    return setGlobal('Executor', new Lib.Executor(require('./config/connect')));
  });
  it ('Create SP', function () {
    return (new Lib.jobs.SyncQuery(Executor, procbody)).go();
  });
  it ('Run SyncExec', function () {
    return (new Lib.jobs.SyncExec(
      Executor,
      'allextest',
      [{
        name: 'first',
        type: 'Int'
      }],
      [{
        name: 'count',
        type: 'Int'
      }]
    ))
    .go()
    .then(
      function (res) {
        console.log(res);
      }
    )
  })
  /**/
  it ('Drop SP', function () {
    return (new Lib.jobs.SyncQuery(Executor, "DROP PROCEDURE allextest")).go();
  });
  /**/
  it ('Destroy Executor', function () {
    Executor.destroy();
  });
});