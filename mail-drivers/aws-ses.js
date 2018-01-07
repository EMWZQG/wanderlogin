const aws = require('aws-sdk');
const utils = require(global.projroot + '/utils.js');

module.exports = async config => {
    utils.assertEnvVar('AWS_ACCESS_KEY_ID');
    utils.assertEnvVar('AWS_SECRET_ACCESS_KEY');
    
    const ses = new aws.SES({apiVersion: '2010-12-01'});
        
    return {
        send: async (from, to, subject, text) => {
            ses.sendEmail(
                    email(`${from}@${config.rootDomain}`, to, subject, text),
                    (err, data) => {
                        if (err) {
                            throw new Error(err);
                        }
                    });
        }
    };
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
    };
}