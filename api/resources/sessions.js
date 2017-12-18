const validate = require(global.projroot + '/lib/validate');

module.exports = router => {
    router.post('/',
            validate.body({
                email: validate.required
            }),
            async (ctx, next) => {
                ctx.status = 401;
            });
};