const moment = require('moment');

const utils = require(global.projroot + '/utils');

module.exports = async driver => {
    const temporaryRootApplicationWhitelist = [];
    
    return {
        /* Tokens exist independent from accounts, because they may be used for
         * non-account sorts of things like "suppress messages to this email" or
         * "confirm merging these two accounts."
         */
        generateLoginToken: async (application, email) => {
            const token = utils.generateUrlSafeToken(10);
            await driver.saveToken(token, moment.duration(15, 'minutes'), {
                application: application,
                email: email,
                type: 'login'
            });
            
            return token;
        },
        generateSessionToken: async (application, accountId) => {
            const token = utils.generateUrlSafeToken(20);
            
            const appConfig = await driver.getApplicationConfig(application);
            const ttl = moment.duration(
                    ...(appConfig.sessionTimeToLive || [24, 'hours']));
            
            await driver.saveToken(token, ttl, {
                application: application,
                accountId: accountId
            });
            
            return token;
        },
        consumeToken: async token => await driver.consumeToken(token),
        checkEmailMayRegister: async (application, email) => {
            if (application !== '' || !matchesAtLeastOne(
                    email, temporaryRootApplicationWhitelist)) {
            
                const appConfig =
                        await driver.getApplicationConfig(application);
                const mayRegister =
                        mayEmailRegister(application, appConfig, email);
                
                if (!mayRegister) {
                    const e = new Error(
                            (appConfig.registrationPolicy || {}).errorMessage ||
                            `This email may not register for application ` +
                                    `'${application}'.`);
                    e.code = 'MAY_NOT_REGISTER';
                    throw e;
                }
            }
        },
        getAccountContext: (application, email) =>
                driver.getAccountContextByEmail(application, email),
        createAccount: async application => {
            const accountId = utils.generateUrlSafeToken(10);
            const account = await driver.createAccount(application, accountId);
            
            return account;
        },
        addRootApplicationTemporaryWhitelistPattern: pattern => {
            // Just building this so that invalid regular expressions will error
            // early.
            new RegExp(`^${pattern}$`);
            
            temporaryRootApplicationWhitelist.push(pattern);
        }
    };
};

function matchesAtLeastOne(text, list) {
    return (list || []).find(
            pattern => (new RegExp(`^${pattern}$`)).test(text)) !== undefined;
}

function mayEmailRegister(application, appConfig, email) {
    const policy = appConfig.registrationPolicy;
    if (!policy) {
        return false;
    }
    
    let emailMatches = matchesAtLeastOne(email, policy.patterns);
    
    let result;
    switch (policy.type) {
        case 'whitelist': {
            result = emailMatches;
            break;
        }
        case 'blacklist': {
            result = !emailMatches;
            break;
        }
        default: {
            throw new Error(`No such application registration policy type ` +
                    `'${policy.type}' for application '${application}'.`);
        }
    }
    
    return result;
}