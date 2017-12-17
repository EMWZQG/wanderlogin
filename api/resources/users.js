module.exports = router => {
    router.get('/', async (ctx, next) => {
        ctx.status = 401;
    });
};