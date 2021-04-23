const net = require('net');
const readline = require('readline');
const prompt = require('prompt-sync')();

const { Folder } = require('./classes.js');
const { File } = require('./classes.js');
const { Rating } = require("./classes.js");
const { User } = require("./classes.js");
const getId = () => Math.floor(Math.random() * 1000);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentFolder;

const client = new net.Socket();

client.connect(20202, '127.0.0.1', function() {
	console.log(`Connected to server`);
    const msg = {cmd: "getRootIn"};
	client.write(JSON.stringify(msg));
});

client.on('data', async function(dataIn) {
	const data = JSON.parse(dataIn);

    if(data.cmd === "getRating" || data.cmd === 'downloadFile') {
        showFile(data.result, res => {
            if(res === 'd' || res === 'D') {
                let msg = {cmd: "downloadFileIn", param: data.result};
                client.write(JSON.stringify(msg));
    
                // msg = {cmd: "getRootIn"};
                // client.write(JSON.stringify(msg));
            } else if (res === 'a' || res === 'A') {
                const msg = {cmd: "getRootIn"};
                client.write(JSON.stringify(msg));
            }
        });
    }

    if(data.cmd === "getRoot" || data.cmd === 'getChildren' || data.cmd === 'sortByRating' || 
       data.cmd === 'sortByAuthor' || data.cmd === 'sortByName' || data.cmd === 'sortByDownloadCount'
        || data.cmd === 'addOrUpdateFile') {

        currentFolder = data.result;

        await showFolder(currentFolder, async (res) => await consoleInputParser(res, data));
    }
});

client.on('close', function() {
	console.log('Connection closed');
});

async function showFolder(folder, callback) {

    console.log('  show folder: ', folder);
    const data = folder instanceof Array ? folder : folder.children;

    console.log('  after if show folder data: ', data);
    
    for(let i = 0; i < data.length; i++) {
        console.log(`${i}. ${data[i].name} Rating: ${data[i].hasOwnProperty("rating") && data[i].rating ? data[i].rating : "-" } Downloads: ${data[i].downloadCount ?? '-'}`);
    }

    console.log("\nTo get information about file or to go to folder enter its number ");
    console.log("To display sorted by name press 'n'");
    console.log("To display sorted by rating press 'r'");
    console.log("To display sorted by downloads press 'd'");
    console.log("To display sorted by author press 'a'");
    console.log("To add new file type 'add'");

    rl.question('Enter: ', (answer) => {
        callback(answer);
    });
}

function showFile(file, callback) {
    console.log(`\nName: ${file.name}`);
    console.log(`Size: ${file.size}`);
    console.log(`Rating: ${file.rating}`);
    console.log(`Downloads: ${file.downloadCount}\n`);

    console.log("\nTo download file press 'd': ");
    console.log("To return to root press 'a': ");

    rl.question('Enter: ', (answer) => {
        callback(answer);
    });
}

async function consoleInputParser(res, data) {

    if(res === 'r' || res === 'R') {
        const msg = {cmd: 'sortByRatingIn', param: data.result};
        client.write(JSON.stringify(msg));
        return;
    }
    if(res === 'a' || res === 'A') {
        const msg = {cmd: 'sortByAuthorIn', param: data.result};
        client.write(JSON.stringify(msg));
        return;

    }
    if(res === 'd' || res === 'D') {
        const msg = {cmd: 'sortByDownloadCountIn', param: data.result};
        client.write(JSON.stringify(msg));
        return;
    }
    if(res === 'n' || res === 'N') {
        const msg = {cmd: 'sortByNameIn', param: data.result};
        client.write(JSON.stringify(msg));
        return;
    }

    if(res === 'add') {
        let name = prompt("Enter file name: ");
        let extension = prompt("Enter file extension: ");
        let size = Number(prompt("Enter file size: "));
        let newFile = new File({id: getId(), name: name, extension: extension, size: size,
            parentId: currentFolder.id});
        const msg = {cmd: "addOrUpdateFileIn", param: newFile}
        client.write(JSON.stringify(msg));
    }

    if(!isNaN(res)) {
        if (res < 0 || res >= data.result.children.length)
        {
            await showFolder(currentFolder, (res) => consoleInputParser(res, data));
            return;
        }
        const elem =  data.result instanceof Array ?  data.result[res] : data.result.children[res];

        if(!elem.hasOwnProperty('size')) {
            const msg = {cmd: "getChildrenIn", param: elem};
            client.write(JSON.stringify(msg));
        } else {
            const msg = {cmd: "getRatingIn", param: elem};
            client.write(JSON.stringify(msg));
        }
        return;
    }

    else {
        await showFolder(currentFolder, (res) => consoleInputParser(res, data));
        return;
    }
}

