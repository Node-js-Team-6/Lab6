const sql = require('mssql');

class RatingRepository {
    constructor(config, mapperFunc, logger=console) {
        this.config = config;
        this.logger = logger;
        this.tableName = 'Ratings';
        this.map = mapperFunc;
    }

    async findAll() {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        const res = await pool.request()
                              .query(`select * from ${this.tableName};`)
                              .catch(err => {
                                this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                              });
            
        pool.close();
        return res.recordset.map(v => this.map(v));
    }

    async findById(id) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        const res = await pool.request()
                              .input('id', sql.Int, id)
                              .query(`select * from ${this.tableName} where Id = @id;`)
                              .catch(err => {
                                this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                              });
            
        pool.close();
        return res.recordset[0] ? this.map(res.recordset[0]) : null;
    }

    async getRatingForFile(fileId) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        const res = await pool.request()
                              .input('id', sql.Int, fileId)
                              .query(`select * from ${this.tableName} where FileId = @id;`)
                              .catch(err => {
                                this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                              });
            
        pool.close();
        return res.recordset.map(v => this.map(v).score).reduce((a, b) => a + b, 0) / res.recordset.length;
    }

    async insert(item) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        await pool.request()
                  .input('score', sql.VarChar, item.score)
                  .input('fId', sql.VarChar, item.fileId)
                  .input('uId', sql.VarChar, item.userId)
                  .query(`insert into ${this.tableName} 
                                   (Score, UserId, FileId) 
                            values (@score, @uId, @fId);`)
                  .then(res => {
                    this.logger.log(`Inserted value into ${this.tableName}. Result: `, res);
                  })
                  .catch(err => {
                    this.logger.log(`Error, while inserting into ${this.tableName} `, err);
                  });
        
        pool.close();
    }

    async update(item) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        await pool.request()
                  .input('id', sql.Int, item.id)
                  .input('score', sql.VarChar, item.score)
                  .input('fId', sql.VarChar, item.fileId)
                  .input('uId', sql.VarChar, item.userId)
                  .query(`update ${this.tableName} 
                         set Score = @score, 
                             UserId = @uId, 
                             FileId = @fId
                         where Id = @id;`)
                  .then(res => {
                    this.logger.log(`Updated value in ${this.tableName} with id = ${item.id}. Result: `, res);
                  })
                  .catch(err => {
                    this.logger.log(`Error, while updating ${this.tableName} `, err);
                  });
        
        pool.close();
    }

    async delete(id) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        await pool.request()
                  .input('id', sql.Int, id)
                  .query(`delete from ${this.tableName} where Id = @id;`)
                  .then(res => {
                    this.logger.log(`Deleted row from ${this.tableName} with id = ${id}. Result: `, res);
                  })
                  .catch(err => {
                    this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                  });
        
        pool.close();
    }
} 

exports.RatingRepository = RatingRepository;