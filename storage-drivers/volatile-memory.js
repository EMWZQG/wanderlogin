const merge = require('merge');

const db = {
    tokens: {},
    applications: {
        '': {   // The root application always exists.
            accounts: [],
            config: {}
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
    consumeToken: token => {
        const tokenFields = db.tokens[token];
        if (!tokenFields) {
            const e = new Error('No such token: ' + token);
            e.code = 'NO_SUCH_TOKEN';
            throw e;
        }
        
        delete db.tokens[token];
        
        return tokenFields;
    },
    createAccount: async (application, id) => {
        const account = new Account({
            id: id
        });
        db.applications[application].accounts.push(account);
        return account;
    },
    getAccountContextByEmail: (application, email) => {
        let account;
        if (!db.applications[application]) {
            account = new Account(null, {
                message: 'No such application: ' + application,
                code: 'NO_SUCH_APPLICATION'
            });
        }
        else {
            account = db.applications[application].accounts.find(
                    account => account.isAssociatedWithEmail(email));
            
            if (!account) {
                account = new Account(null, {
                    message: 'No account associated with email: ' + email,
                    code: 'NO_SUCH_ACCOUNT'
                });
            }
        }
        
        return account;
    },
    getAccountContextById: (application, id) => {
        let account;
        if (!db.applications[application]) {
            account = new Account(null, {
                message: 'No such application: ' + application,
                code: 'NO_SUCH_APPLICATION'
            });
        }
        else {
            account = db.applications[application].accounts.find(
                    account => account.getId() === id);
            
            if (!account) {
                account = new Account(null, {
                    message: 'No account with id: ' + id,
                    code: 'NO_SUCH_ACCOUNT'
                });
            }
        }
        
        return account;
    }
});

var Account = class {
    constructor(params, err) {
        if (params) {
            this.id = params.id;
            this.emails = params.emails || [];
        }
        else {
            this.err = err;
        }
    }
    
    async assertExists() {
        this.doError();
    }
    
    async getId() {
        return this.id;
    }
    
    async isAssociatedWithEmail(email) {
        this.doError();
        
        return this.emails.findIndex(
                potentialEmail => email === potentialEmail) != -1;
    }
    
    async hasPassword() {
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