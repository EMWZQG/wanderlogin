process.on('unhandledRejection', error => {
    console.log('Unhandled promise rejection:');
    console.log(error);
    process.exit(1);
});

const Koa = require('koa');
const Router = require('koa-router');
const winston = require('winston');

const utils = require('./utils');

winston.level = process.env.SCATTERLOGIN_LOG_LEVEL || 'info';

async function main() {
    const api = new Router();
    
    winston.debug('Building api router...');
    api.use('/api/v1', (await utils.buildApiRouter()).routes());
    
    const app = new Koa();
    app.use(api.routes());
    
    const port = process.env.SCATTERLOGIN_PORT || 5700;
    
    winston.info(`Listening on port ${port}.`);
    app.listen(port);
}

main();