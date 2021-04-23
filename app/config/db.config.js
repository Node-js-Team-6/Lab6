export const config = {
    database: 'FileManager',
    server: 'localhost',
    driver: 'msnodesqlv8', // for windows auth; it's a seperate module / db driver
    options: {
        trustedConnection: true
    }
};