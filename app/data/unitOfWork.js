const sql = require('mssql');
require('msnodesqlv8');

import config from './app/config/db.config';
import FileRepository from './fileRepository';

class UnitOfWork {

    constructor(logger=console) {
        this.logger = logger;

        sql.on('error', err => {
            this.logger.log('Error: ', err);    
        });

        const conn = new sql.ConnectionPool(config, err => {
            this.logger.log('Cannot create connection pool. Error: ', err);
        });
        this.connectionPool = conn;
        this.fileRepository = new FileRepository(conn, this.logger);
    }

    dispose() {
        this.connectionPool.close();
    }
}