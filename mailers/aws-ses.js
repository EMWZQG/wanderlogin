const aws = require('aws-sdk');

const utils = require(global.projroot + '/utils.js');

let rootDomain;
let ses;

module.exports = {
    init: async () => {
        utils.assertEnvVar('AWS_ACCESS_KEY_ID');
        utils.assertEnvVar('AWS_SECRET_ACCESS_KEY');
        rootDomain = utils.assertEnvVar('MAIL_ROOT_DOMAIN');
        
        if (rootDomain.indexOf('@') !== -1) {
            throw new Error(`MAIL_ROOT_DOMAIN must be a domain name without ` +
                    `the "@".  Was: ${rootDomain}.`)
        }
        
        ses = new aws.SES({apiVersion: '2010-12-01'});
    },
    send: async (from, to, subject, text) => {
        if (from.indexOf('@') !== -1) {
            throw new Error(
                '"from" should just be the username portion of the address.');
        }
        
        ses.sendEmail(
                email(`${from}@${rootDomain}`, to, subject, text),
                (err, data) => {
                    if (err) {
                        throw new Error(err);
                    }
                });
    }
};

function email(from, to, subject, text) {
    return {
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
            Subject: { Data: subject },
            Body: {
                Test: { Data: text }
            }
        }
    }
}