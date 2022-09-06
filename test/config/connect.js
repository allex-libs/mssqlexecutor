module.exports = {
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
};