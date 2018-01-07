const dedent = require('dedent');

module.exports = async config => ({
    send: async (from, to, subject, text) => {
        if (from.indexOf('@') !== -1) {
            throw new Error(
                '"from" should just be the username portion of the address.');
        }
        
        console.log(dedent`
            TO: ${to}
            FROM: ${from}@${config.rootDomain}
            SUBJECT: ${subject}
            
            --------------------------------------------------------------------
            ${text}
            --------------------------------------------------------------------
        `);
    }
});