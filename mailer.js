const fs = require('fs');
const mustache = require('mustache');
const util = require('util');

const utils = require('./utils');

module.exports = async driver => {
    const config = {
        rootDomain: utils.assertEnvVar('MAIL_ROOT_DOMAIN')
    };
    
    if (config.rootDomain.indexOf('@') !== -1) {
        throw new Error(`MAIL_ROOT_DOMAIN must be a domain name without ` +
                `the "@".  Was: ${config.rootDomain}.`)
    }
    
    const baseUrl = utils.assertEnvVar('BASE_URL');
    
    let instantiatedDriver = await driver(config);
    
    async function send(from, to, subject, body) {
        if (from.indexOf('@') !== -1) {
            throw new Error('"from" must be a user name without the "@".  ' +
                    'Was: ' + from);
        }
        
        await instantiatedDriver.send(from, to, subject, body);
    }
    
    return {
        sendLoginToken: async (dest, token, hasPassword) => {
            const portals = 'api/v1/portals';
            
            const loginLink = `${baseUrl}/${portals}/login?t=${token}`;
            const passwordLink =
                    `${baseUrl}/${portals}/login?t=${token}&createPassword=yes`;
            const silenceLink =
                    `${baseUrl}/${portals}/silenceLoginEmails?t=${token}`;
            
            await send('noreply', dest, 'Login Link',
                    await doTemplate('login-link', {
                        loginLink: loginLink,
                        passwordLink: hasPassword ? null : passwordLink,
                        silenceLink: silenceLink
                    }));
        }
    };
};

async function doTemplate(templateName, data) {
    const template = (await (util.promisify(fs.readFile)(
                global.projroot + `/email-templates/${templateName}.mustache`)))
                .toString();
    mustache.parse(template);
    return mustache.render(template, data);
}