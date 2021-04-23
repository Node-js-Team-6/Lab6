// ----------- data access layer -----------------
const fs = require('fs');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writefileAsync = util.promisify(fs.writeFile);

class Repository {

    constructor(filePath, mapToCustomTypeFunction, logger = console) {
        this.filePath = filePath;
        this.logger = logger;
        this.dataMapperToCustomType = mapToCustomTypeFunction;
        let f =  this.dataMapperToCustomType({id: -1})
        this.Data = [];
        this.readDataSync();
    }

    async readData() {
        this.Data = await this.readAllAsync();
    }

    readDataSync(){
        this.Data = this.readAllSync();
    }

    readAllCallback(callback = function() {}) {
        const start = Date.now();

        fs.readFile(this.filePath, 'utf-8', (err, data) => {
            if(err) {
                const msg = `${start}. an error occured while reading data from file "${this.filePath}"\n Error: "${err}"\n`;
                this.logger.log(msg);              
            }
            else {
                const end = Date.now();
                const msg = `${end}. Data was read from file "${this.filePath}". Reading took ${end - start}s\n`;
                this.logger.log(msg);

                callback(this.getCustomizedObjects(data));
            }
        });
    }

    readAllSync() {
        const start = Date.now();
        return this.getCustomizedObjects(fs.readFileSync(this.filePath, 'utf-8'));
    }

    readAllAsyncPromise() {
        const start = Date.now();

        return new Promise((resolve, reject) => {
            fs.readFile(this.filePath, 'utf-8', (err, data) => {
                if(err) {
                    const msg = `${start}. an error occured while reading data from file "${this.filePath}"\n Error: "${err}"\n`;
                    this.logger.log(msg);  
                    reject(err);            
                }
                else {
                    const end = Date.now();
                    const msg = `${end}. Data was read from file "${this.filePath}". Reading took ${end - start}s\n`;
                    this.logger.log(msg);

                    resolve(this.getCustomizedObjects(data));
                }
            })
        });
    }

    async readAllAsync() {
        const start = Date.now();
        
        try {
            let data = await readFileAsync(this.filePath, 'utf-8');
            const end = Date.now();
            const msg = `${end}. Data was read from file "${this.filePath}". Reading took ${end - start}s\n`;
            this.logger.log(msg);

            return this.getCustomizedObjects(data);
        }
        catch(err) {
            const msg = `${start}. an error occured while reading data from file "${this.filePath}"\n Error: "${err}"\n`;
            this.logger.log(msg);  
        }
    }

    async writeAllAsync() {
        const start = Date.now();
        
        try {
            let data = [];
            for(const item of this.Data) {
                data.push(item.jsonify());
            }
            const str = JSON.stringify(data);

            data = await writefileAsync(this.filePath, str, 'utf-8');

            const end = Date.now();
            const msg = `${end}. Data was written to file "${this.filePath}". Writing took ${end - start}s\n`;
            this.logger.log(msg);
        }
        catch(err) {
            const msg = `${start}. an error occured while reading data from file "${this.filePath}"\n Error: "${err}"\n`;
            this.logger.log(msg);  
        }
    }
    
    getCustomizedObjects = (string) => {
        
        const source = JSON.parse(string);
        let data = [];

        for(const elem of source) {
            data.push(this.dataMapperToCustomType(elem));
        };

        return data;
    };

    async insert(item) {
        this.Data.push(item);

        const msg = `${Date.now()}. Inserted one element with id = '${item.id}' to "${this.filePath}"\n`;
        this.logger.log(msg); 

        await this.writeAllAsync();
    }

    async delete(id) {
        const ind = this.Data.indexOf(o => o.id === id);
        if(ind > 0) {
            this.Data.splice(ind, 1);

            const msg = `${Date.now()}. Deleted one element with id = '${item.id}' from "${this.filePath}"\n`;
            this.logger.log(msg);
            
            await this.writeAllAsync();
        }
    }

    async addOrUpdate(item){
        if(!this.find(item.id)){
            await this.insert(item)
        } else {
            await this.modify(item)
        }

        await this.writeAllAsync();
    }

    find(id) {
        return this.Data.find(o => o.id === id);
    }

    findAll() {
        return this.Data;
    }

    async modify(item) {
        let ind = -1;
        for (let i = 0; i < this.Data.length; i++)
        {
            if (this.Data[i].id === item.id)
            {
                ind = i;
                break;
            }
        }
        if(ind > -1) {
            this.Data[ind] = item;

            const msg = `${Date.now()}. Modified one element with id = '${item.id}' in "${this.filePath}"\n`;
            this.logger.log(msg); 
        }

        await this.writeAllAsync();
    }
}

exports.Repositoty = Repository;