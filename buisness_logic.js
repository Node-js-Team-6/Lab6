const data = require('./data.js')

const { Folder } = require('./classes.js');
const { File } = require('./classes.js');
const { Rating } = require("./classes.js");
const { User } = require("./classes.js");
const { VersionManager } = require('./versioning.js');

class Services {
    constructor(logger=console) {
        this.vm = new VersionManager('./database', logger);
        this.fileRepository = new data.Repositoty('./database/file.json', File.objectify, logger);
        this.folderRepository = new data.Repositoty('./database/folder.json', Folder.objectify, logger);
        this.userRepository = new data.Repositoty('./database/user.json', User.objectify, logger);
        this.ratingRepository = new data.Repositoty('./database/rating.json', Rating.objectify, logger);

        this.vm.subscribe_for_rollback(this.folderRepository);
        this.vm.subscribe_for_rollback(this.userRepository);
        this.vm.subscribe_for_rollback(this.ratingRepository);
        this.vm.subscribe_for_rollback(this.fileRepository);
    }

    async addOrUpdateFile(file) {
        await this.fileRepository.addOrUpdate(file)
    }

    async addOrUpdateRating(rating) {
        await this.ratingRepository.addOrUpdate(rating);
    }

    async addOrUpdateFolder(folder) {
        await this.folderRepository.addOrUpdate(folder)
    }

    async addOrUpdateUser(user) {
        await this.userRepository.addOrUpdate(user)
    }

    async deleteFile(file) {
        await this.fileRepository.delete(file)
    }

    async deleteFolder(folder) {
        for (let c in folder.children) {
            if (c instanceof Folder) {
                await this.deleteFolder(c)
            } else {
                await this.deleteFile(c)
            }
        }

        await this.folderRepository.delete(folder)
    }

    async getChildren(folder){
        let folderChildren = await this.folderRepository.findAll().filter(f => f.parentId === folder.id);
        let fileChildren = await this.fileRepository.findAll().filter(f => f.parentId === folder.id);
        for (let c of folderChildren)
        {
            c.user = this.userRepository.find(c.userId);
        }
        for (let c of fileChildren)
        {
            c.user = await this.userRepository.find(c.userId);
            c.rating = await this.getRating(c);
        }
        folder.children = [...folderChildren, ...fileChildren]
        console.log(folder.children);
    }

    async getRoot()
    {
        let root = await this.folderRepository.find(922);
        root.user = await this.userRepository.find(root.userId);
        return root;
    }

    async getFolder(id)
    {
        let folder = await this.folderRepository.find(id);
        folder.user = await this.userRepository.find(folder.userId);
        return folder;
    }

    async getRating(file)
    {
        let ratings = await this.ratingRepository.findAll();
        let filtered = ratings.filter(r => r.fileId === file.id);
        let sum = filtered.map(r => r.score).reduce((a, b) => a+b, 0)
        return sum / filtered.length;
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
        return await this.getPath(await this.folderRepository.find(element.parentId), root) + '/' + element.name;
    }

    async saveCurrentState(){
        await this.vm.saveVersionPako();
    }

    async returnToPreviousVersion()
    {
        await this.vm.rollbackVersionPako();
    }
}

exports.Services = Services;