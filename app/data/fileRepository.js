const sql = require('mssql');

class FileRepository {
    constructor(connPool, logger=console) {
        this.connection = connPool;
        this.logger = logger;
        this.tableName = 'Files';
    }

    findAll() {

        this.connection.connect()
                       .then(pool => {
                           return pool.request()
                                      .query(`select * from ${this.tableName};`);
                        })
                        .catch(err => {
                            this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                        });
    }

    findById(id) {
        this.connection.connect()
                       .then(pool => {
                           return pool.request()
                                      .input('id', sql.Int, id)
                                      .query(`select * from ${this.tableName} where Id = @id;`);
                        })
                        .catch(err => {
                            this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                        });
    }

    findByName(name) {
        this.connection.connect()
                       .then(pool => {
                           return pool.request()
                                      .input('name', sql.VarChar, name)
                                      .query(`select * from ${this.tableName} where Name like '%@name%';`);
                        })
                        .catch(err => {
                            this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                        });
    }

    findByName(extension) {
        this.connection.connect()
                       .then(pool => {
                           return pool.request()
                                      .input('ext', sql.VarChar, extension)
                                      .query(`select * from ${this.tableName} where Extension = @ext;`);
                        })
                        .catch(err => {
                            this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                        });
    }

    insert(item) {
        this.connection.connect()
                       .then(pool => {
                           return pool.request()
                                      .input('name', sql.VarChar, item.name)
                                      .input('ext', sql.VarChar, item.extension)
                                      .input('size', sql.VarChar, item.size)
                                      .input('path', sql.VarChar, item.path)
                                      .input('dc', sql.Int, item.downloadCount)
                                      .input('aId', sql.Int, item.userId)
                                      .input('pId', sql.Int, item.parentId)
                                      .query(`insert into ${this.tableName} 
                                             (Name, Extension, Size, Path, DownloadCount, AuthorId, ParentId) 
                                             values(@name, @ext, @size, @path, @dc, @aId, @pId);`);
                        })
                        .then(res => {
                            this.logger.log(`Inserted value into ${this.tableName}. Result: `, res);
                        })
                        .catch(err => {
                            this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                        });
    }

    update(item) {
        this.connection.connect()
                       .then(pool => {
                           return pool.request()
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
                                                 ParentId = @pId) 
                                             where Id = @id;`);
                        })
                        .then(res => {
                            this.logger.log(`Updated value in ${this.tableName} with id = ${item.id}. Result: `, res);
                        })
                        .catch(err => {
                            this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                        });
    }

    delete(id) {
        this.connection.connect()
                       .then(pool => {
                           return pool.request()
                                      .input('id', sql.Int, id)
                                      .query(`delete from ${this.tableName} where Id = @id;`);
                        })
                        .then(res => {
                            this.logger.log(`Deleted row from ${this.tableName} with id = ${id}. Result: `, res);
                        })
                        .catch(err => {
                            this.logger.log(`Error, while selecting from ${this.tableName} `, err);
                        });
    }
} 

export default FileRepository;