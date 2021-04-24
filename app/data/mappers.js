const { Folder } = require('./classes');
const { File } = require('./classes');
const { Rating } = require("./classes");
const { User } = require("./classes");

const toFile = data => {
    return new File({
        id: data.Id,
        name: data.Name,
        extension: data.Extension,
        size: data.Size,
        userId: data.AuthorId,
        downloadCount: data.DownloadCount,
        parentId: data.ParentId,
        path: data.Path
    });
};

const toFolder = data => {
    return new Folder({
        id: data.Id,
        name: data.Name,
        userId: data.AuthorId,
        parentId: data.ParentId,
        path: data.Path
    });
};

const toUser = data => {
    return new User({
        id: data.Id,
        name: data.Name,
        password: data.Password
    });
};

const toRating = data => {
    return new Rating({
        id: data.Id,
        score: data.Score,
        userId: data.UserId,
        fileId: data.FileId
    });
};

module.exports = {
    toFile: toFile,
    toFolder: toFolder,
    toUser: toUser,
    toRating: toRating
};