const Router = require('koa-router');
const winston = require('winston');

module.exports = {
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
    }
};