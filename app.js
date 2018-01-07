process.on('unhandledRejection', error => {
    console.log('Unhandled promise rejection:');
    console.log(error);
    process.exit(1);
});

const di = require('@emwzqg/di');
const commandLineArgs = require('command-line-args');
const Koa = require('koa');
const Router = require('koa-router');
const winston = require('winston');

const utils = require('./utils');

const EXPOSED_ERRORS = [require('@emwzqg/validate').validationCode,
        'NO_SUCH_APPLICATION', 'MAY_NOT_REGISTER'];

global.projroot = __dirname;

winston.level = process.env.SCATTERLOGIN_LOG_LEVEL || 'info';

const optionDefinitions = [
    { name: 'root-whitelist', alias: 'r', type: String, multiple: true }
];

const options = commandLineArgs(optionDefinitions);

async function main() {
    const mailer = await require('./mailer')(
            require(process.env.MAIL_DRIVER || './mail-drivers/console'));
    di.registerSingleton('mailer', () => mailer);
    
    const store = await require('./storage')(
            require(process.env.STORAGE_DRIVER ||
                    './storage-drivers/volatile-memory'));
    (options['root-whitelist'] || []).forEach(pattern => {
        store.addRootApplicationTemporaryWhitelistPattern(pattern);
    });
    
    di.registerSingleton('store', () => store);
    
    const api = new Router();
    
    winston.debug('Building api router...');
    api.use('/api/v1', 
            utils.errorHandler(exposedSet()),
            (await utils.buildApiRouter()).routes());
    
    const app = new Koa();
    app.use(api.routes());
    
    const port = process.env.PORT || 5700;
    
    winston.info(`Listening on port ${port}.`);
    app.listen(port);
}

main();

function exposedSet() {
    const result = new Set();
    EXPOSED_ERRORS.forEach(code => {
        result.add(code);
    });
    return result;
}