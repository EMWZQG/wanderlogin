const validate = require(global.projroot + '/lib/validate');
const capdi = require(global.projroot + '/capdi');

const store = capdi('store');

module.exports = router => {
    router.post('/',
            validate.body({
                email: validate.required
            }),
            async (ctx, next) => {
                ctx.status = 401;
            });
};