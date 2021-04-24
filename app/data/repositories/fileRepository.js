const sql = require('mssql');

class FileRepository {
    constructor(config, mapperFunc, logger=console) {
        this.config = config;
        this.logger = logger;
        this.tableName = 'Files';
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

    async findByName(name) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        const res = await pool.request()
                              .input('name', sql.VarChar, name)
                              .query(`select * from ${this.tableName} where Name like '%' + @name + '%';`)
                              .catch(err => {
                                this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                              });
            
        pool.close();
        return res.recordset.map(v => this.map(v));
    }

    async findByExtension(extension) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        const res = await pool.request()
                              .input('ext', sql.VarChar, extension)
                              .query(`select * from ${this.tableName} where Extension = @ext;`)
                              .catch(err => {
                                this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                              });
            
        pool.close();
        return res.recordset.map(v => this.map(v));
    }

    async findByParentId(id) {
      const pool = await sql.connect(this.config)
                          .catch(err => {
                              this.logger.log('Cannot connect. Error: ', err);
                          });

      const res = await pool.request()
                            .input('pId', sql.VarChar, id)
                            .query(`select * from ${this.tableName} where ParentId = @pId;`)
                            .catch(err => {
                              this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                            });
          
      pool.close();
      return res.recordset.map(v => this.map(v));
  }

    async insert(item) {
        const pool = await sql.connect(this.config)
                            .catch(err => {
                                this.logger.log('Cannot connect. Error: ', err);
                            });

        await pool.request()
                  .input('name', sql.VarChar, item.name)
                  .input('ext', sql.VarChar, item.extension)
                  .input('size', sql.VarChar, item.size)
                  .input('path', sql.VarChar, item.path)
                  .input('dc', sql.Int, item.downloadCount)
                  .input('aId', sql.Int, item.userId)
                  .input('pId', sql.Int, item.parentId)
                  .query(`insert into ${this.tableName} 
                                   (Name, Extension, Size, Path, DownloadCount, AuthorId, ParentId) 
                            values (@name, @ext, @size, @path, @dc, @aId, @pId);`)
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
                  .input('name', sql.VarChar, item.name)
                  .input('ext', sql.VarChar, item.extension)
                  .input('size', sql.VarChar, item.size)
                  .input('path', sql.VarChar, item.path)
                  .input('dc', sql.Int, item.downloadCount)
                  .input('aId', sql.Int, item.userId)
                  .input('pId', sql.Int, item.parentId)
                  .query(`update ${this.tableName} 
                         set Name = @name, 
                             Extension = @ext, 
                             Size = @size, 
                             Path = @path, 
                             DownloadCount = @dc, 
                             AuthorId = @aId, 
                             ParentId = @pId
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

exports.FileRepository = FileRepository;