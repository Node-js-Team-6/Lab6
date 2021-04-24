const sql = require('mssql');

const config = require('../config/db.config');
const mappers = require('./mappers');

const { FileRepository } = require('./repositories/fileRepository');
const { UserRepository } = require('./repositories/userRepository');
const { FolderRepository } = require('./repositories/folderRepository');
const { RatingRepository } = require('./repositories/ratingRepository');

class UnitOfWork {

    constructor(logger=console) {
        this.logger = logger;

        sql.on('error', err => {
            this.logger.log('Error: ', err);    
        });

        this.fileRepository = new FileRepository(config, mappers.toFile, this.logger);
        this.userRepository = new UserRepository(config, mappers.toUser, this.logger);
        this.folderRepository = new FolderRepository(config, mappers.toFolder, this.logger);
        this.ratingRepository = new RatingRepository(config, mappers.toRating, this.logger);
    }
}

exports.UnitOfWork = UnitOfWork;