const { Services } = require('./app/buisness_logic');
const { UnitOfWork } = require('./app/data/unitOfWork');

const { Folder } = require('./app/data/classes');
const { File } = require('./app/data/classes');
const { Rating } = require("./app/data/classes");
const { User } = require("./app/data/classes");

async function main() {
    const srvc = new Services(console);

    const file = new File({id: 7, name: 'test.js', extension: 'js', downloadCount: 0, parentId: 4, userId: 1, path: '\\test.js', size: '12b'});
    await srvc.addOrUpdateFile(file);
} 

main()