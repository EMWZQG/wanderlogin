const di = require('@emwzqg/di');
const validate = require('@emwzqg/validate');

module.exports = router => {
    const store = di.inject('store');
    const mailer = di.inject('mailer');
    
    router.post('/',
            validate.body({
                application: validate.required,
                email: validate.required
            }),
            async (ctx, next) => {
                const application = ctx.request.body.application;
                const email = ctx.request.body.email;
                const hasPassword = await (async () => {
                    try {
                        return await (store
                                .getAccountContext(application, email)
                                .hasPassword());
                    }
                    catch (e) {
                        if (e.code !== 'NO_SUCH_ACCOUNT') throw e;
                        
                        await store.checkEmailMayRegister(application, email);
                        
                        return false;
                    }
                })();
                
                await mailer.sendLoginToken(email,
                        await store.generateLoginToken(application, email),
                        hasPassword);
                
                ctx.status = 204;
            });
};