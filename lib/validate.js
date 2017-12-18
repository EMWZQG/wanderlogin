const bodyparser = require('koa-bodyparser');

const REQUEST_BODY_DESC = 'request body';

module.exports = {
    body: schema => async (ctx, next) => {
        await bodyparser()(ctx, next);
        
        const unprocessedKeys = new Set(Object.keys(ctx.request.body));
        
        const bodySchema = schema.body || {};
        await Promise.all(Object.keys(bodySchema).map(key => {
            bodySchema[key](REQUEST_BODY_DESC, key, ctx.request.body[key]);
            
            unprocessedKeys.delete(key);
        }));
        
        assertEmpty(REQUEST_BODY_DESC, unprocessedKeys);
    },
    required: async (sourceDesc, key, value) => {
        if (value === undefined) {
            throw new Error(`Expected "${key}" in ${sourceDesc}.`);
        }
    },
    optional: async (sourceDesc, key, value) => {}
};

function assertEmpty(sourceDesc, set) {
    if (set.size > 0) {
        throw new Error(`Unexpected fields in ${sourceDesc}: ${set}`);
    }
}