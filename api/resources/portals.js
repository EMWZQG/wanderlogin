const di = require('@emwzqg/di');
const validate = require('@emwzqg/validate');

module.exports = router => {
    const store = di.inject('store');
    
    router.get('/login',
            validate.query({
                t: validate.required,
                createPassword: validate.optional
            }),
            async (ctx, next) => {
                const details = await store.consumeToken(ctx.request.query.t);
                
                if (details.type !== 'login') {
                    throw new Error('Not a login token.  Token details: ' +
                            JSON.stringify(details));
                }
                
                let account;
                try {
                    // Does this account exist?
                    account = store.getAccountContext(
                            details.application, details.email);
                    await account.assertExists();
                }
                catch (e) {
                    // Account does not exist.  Create one.
                    account = await store.createAccount(details.application);
                }
                
                const sessionToken = await store.generateSessionToken(
                        details.application, await account.getId());
                
                ctx.status = 200;
                ctx.body = sessionToken;
            });
};