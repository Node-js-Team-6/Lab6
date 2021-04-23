const net = require('net');

const { Services } = require('./buisness_logic.js');
const { File } = require('./classes.js');

const logger = {
    log: msg => console.log(msg)
};
const service = new Services(logger);

const server = net.createServer(function (connection) {
    logger.log(`client connected. local address: '${connection.localAddress}' local port: '${connection.localPort}' remote address: '${connection.remoteAddress}' remote port: '${connection.remotePort}'`);

    connection.on('data', async function (d) {
        const data = JSON.parse(d);

        if (data.cmd === 'getRootIn'){
            let root = await service.getRoot();
            await service.getChildren(root);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: root};
            connection.write(JSON.stringify(response));
        }

        if (data.cmd === 'getRatingIn'){
            let file = data.param;
            file.rating = await service.getRating(file);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: file};

            connection.write(JSON.stringify(response));
        }

        if (data.cmd === 'getChildrenIn'){
            let folder = data.param;
            await service.getChildren(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder};

            connection.write(JSON.stringify(response));
        }

        if (data.cmd === 'downloadFileIn'){
            let file = data.param;
            file.downloadCount++;
            await service.addOrUpdateFile(file);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: file};
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'addOrUpdateFileIn'){
            let file = data.param;
            await service.addOrUpdateFile(new File(file));
            let folder = await service.getFolder(file.parentId);
            await service.getChildren(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder};
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'addOrUpdateRatingIn'){
            let rating = data.param;
            await service.addOrUpdateRating(rating);
            let response = {success: true, cmd: data.cmd.slice(0, -2)};
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'addOrUpdateFolderIn'){
            let folder = data.param;
            await service.addOrUpdateFolder(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2)};
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'addOrUpdateUserIn'){
            let user = data.param;
            await service.addOrUpdateUser(user);
            let response = {success: true, cmd: data.cmd.slice(0, -2)};
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'deleteFileIn'){
            await service.deleteFile(data.param);
            let response = {success: true, cmd: data.cmd.slice(0, -2)};
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'deleteFolderIn'){
            await service.deleteFolder(data.param);
            let response = {success: true, cmd: data.cmd.slice(0, -2)};
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'sortByDownloadCountIn'){
            let folder = data.param;
            service.sortByDownloadCount(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder}
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'sortByRatingIn'){
            let folder = data.param;
            service.sortByRating(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder}
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'sortByAuthorIn'){
            let folder = data.param;
            service.sortByAuthor(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder}
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'sortByNameIn'){
            let folder = data.param;
            service.sortByName(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder};
        
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'findFileByNameIn'){
            let folder = data.param;
            folder = service.findFileByName(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder}
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'findFileByExtensionIn'){
            let folder = data.param;
            folder = service.findFileByExtension(folder);
            let response = {success: true, cmd: data.cmd.slice(0, -2), result: folder}
            connection.write(JSON.stringify(response));
        }

        else if (data.cmd === 'saveCurrentStateIn') {
            await service.saveCurrentState();
        }

        else if (data.cmd === 'returnToPreviousVersionIn') {
            service.returnToPreviousVersion();
            let response = {success: true, cmd: data.cmd.slice(0, -2)}
            connection.write(JSON.stringify(response));
        }

    })

    connection.on('end', function() {
        logger.log('client disconnected');
    });

    connection.pipe(connection);

    connection.on('uncaughtException', function (err) {
        logger.log(err);
    }); 
});

server.listen(20202, function() {
    logger.log('server is listening');
});