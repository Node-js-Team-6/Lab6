const { UnitOfWork } = require('../app/data/unitOfWork');

const { Folder } = require('./data/classes');
const { File } = require('./data/classes');
const { Rating } = require("./data/classes");
const { User } = require("./data/classes");

class Services {
    constructor(logger=console) {
        this.uow = new UnitOfWork(logger);
    }

    async addOrUpdateFile(file) {
        if(!file.id) {
            await this.uow.fileRepository.insert(file);
        }
        else {
            await this.uow.fileRepository.update(file);
        }
    }
 
    async addOrUpdateRating(rating) {
        if(!rating.id) {
            await this.uow.ratingRepository.insert(rating);
        }
        else {
            await this.uow.ratingRepository.update(rating);
        }
    }

    async addOrUpdateFolder(folder) {
        if(!folder.id) {
            await this.uow.folderRepository.insert(folder);
        }
        else {
            await this.uow.folderRepository.update(folder);
        }
    }

    async addOrUpdateUser(user) {
        if(!user.id) {
            await this.uow.userRepository.insert(user);
        }
        else {
            await this.uow.userRepository.update(user);
        }
    }

    async deleteFile(file) {
        await this.uow.fileRepository.delete(file.id);
    }

    async deleteFolder(folder) {
        for (let c in folder.children) {
            if (c instanceof Folder) {
                await this.deleteFolder(c)
            } else {
                await this.deleteFile(c)
            }
        }

        await this.uow.folderRepository.delete(folder.id)
    }

    async getChildren(folder){
        let folderChildren = await this.uow.folderRepository.findByParentId(folder.id);
        let fileChildren = await this.uow.fileRepository.findByParentId(folder.id);
        for (let c of folderChildren)
        {
            c.user = this.uow.userRepository.findById(c.userId);
        }
        for (let c of fileChildren)
        {
            c.user = await this.uow.userRepository.findById(c.userId);
            c.rating = await this.uow.ratingRepository.getRatingForFile(c.id);
        }

        folder.children = [...folderChildren, ...fileChildren];
    }

    async getRoot()
    {
        return await this.uow.folderRepository.findRoot();
    }

    async getFolder(id)
    {
        let folder = await this.uow.folderRepository.findById(id);
        folder.user = await this.uow.userRepository.findById(folder.userId);
        return folder;
    }

    async getRating(file)
    {
        return await this.uow.ratingRepository.getRatingForFile(file.id);
    }

    sortByDownloadCount(folder) {
        folder.children.sort((a, b) => (a instanceof Folder || b instanceof Folder) ? 1 :
            b.downloadCount - a.downloadCount);
    }

    sortByRating(folder) {
        folder.children.sort((a, b) => (a instanceof Folder || b instanceof Folder) ? 1 :
            b.rating - a.rating);
    }

    sortByAuthor(folder) {
        folder.children.sort(function (a, b) {
            if (!a.user || !b.user)
                return -1;
            if (a.user.name > b.user.name) return 1;
            if (a.user.name < b.user.name) return -1;
            return 0
        });
    }

    sortByName(folder) {
        folder.children.sort(function (a, b) {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0
        });
    }


    findFileByName(folder, searchText) {
        return folder.children.filter(file => file.name.startsWith(searchText));
    }

    findFileByExtension(folder, searchText) {
        return folder.children.filter(file => !(file instanceof Folder) && file.extension.startsWith(searchText));
    }

    async getPath(element, root) {
        if (element.id === root.id)
            return element.name;
        return await this.getPath(await this.uow.folderRepository.findById(element.parentId), root) + '/' + element.name;
    }
}

exports.Services = Services;