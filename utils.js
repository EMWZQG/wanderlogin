const Router = require('koa-router');
const winston = require('winston');
var crypto = require('crypto');
var base64url = require('base64url');

module.exports = {
    generateUrlSafeToken: byteCount => base64url(crypto.randomBytes(byteCount)),
    buildApiRouter: async () => {
        const apiRouter = new Router();
        
        const routers = {};
        function createRouter(resourceName) {
            winston.debug(`Creating router for resource "${resourceName}"...`);
            
            const resourceRouter = new Router();
            routers[resourceName] = resourceRouter;
            return resourceRouter;
        }
        
        await require('./api/attachResourceOps')(createRouter);
        
        Object.keys(routers).forEach(resourceName => {
            const resourceRouter = routers[resourceName];
            
            apiRouter.use(`/${resourceName}`, resourceRouter.routes(),
                    resourceRouter.allowedMethods());
        });
        
        return apiRouter;
    },
    assertEnvVar: name => {
        if (!process.env[name]) {
            throw new Error(`Environmental variable ${name} must be set.`);
        }
        
        return process.env[name];
    },
    errorHandler: exposedSet => async (ctx, next) => {
        try {
            await next();
        }
        catch (e) {
            if (exposedSet.has(e.code)) {
                ctx.status = 400;
                ctx.body = e.message;
            }
            else {
                ctx.status = 500;
                ctx.body = 'Internal server error.';
            }
            
            while (e) {
                console.log(e);
                e = e.cause;
            }
        }
    }
};