const merge = require('merge');

const db = {
    tokens: {},
    applications: {
        '': {   // The root application always exists.
            accounts: [],
            config: {
                
            }
        }
    }
};

module.exports = ({
    getApplicationConfig: async (name) => {
        const app = db.applications[name];
        if (!app) {
            const e = new Error('No such application: ' + name);
            e.code = 'NO_SUCH_APPLICATION';
            throw e;
        }
        
        return app.config;
    },
    /* Tokens exist independent from accounts, because they may be used for
     * non-account sorts of things like "suppress messages to this email" or
     * "confirm merging these two accounts."
     */
    saveToken: (token, ttl, fields) => {
        db.tokens[token] = merge(fields, { _id: token });
    },
    getAccountContextByEmail: (application, email) => {
        let account;
        if (!db.applications[application]) {
            account = new Account({
                message: 'No such application: ' + application,
                code: 'NO_SUCH_APPLICATION'
            });
        }
        else {
            account = db.applications[application].accounts.find(
                    account => account.isAssociatedWithEmail(email));
            
            if (!account) {
                account = new Account({
                    message: 'No account associated with email: ' + email,
                    code: 'NO_SUCH_ACCOUNT'
                });
            }
        }
        
        return account;
    }
});

var Account = class {
    constructor(err) {
        this.err = err;
        this.emails = [];
    }
    
    isAssociatedWithEmail(email) {
        this.doError();
        
        return this.emails.findIndex(
                potentialEmail => email === potentialEmail) != -1;
    }
    
    hasPassword() {
        this.doError();
        
        return !!this.passwordHash;
    }
    
    doError() {
        if (this.err) {
            const e = new Error(this.err.message);
            e.code = this.err.code;
            throw e;
        }
    }
};