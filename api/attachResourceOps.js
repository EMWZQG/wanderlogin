const fs = require('fs');

const RESOURCE_FOLDER = `${__dirname}/resources/`;

module.exports = createRouter => {
    fs.readdirSync(RESOURCE_FOLDER).forEach(file => {
        if (!file.endsWith('.js')) {
            throw new Error(`Files in ${RESOURCE_FOLDER} must end in ".js".`);
        }
        
        const router = createRouter(file.substring(0, file.length - 3));
        require(`${RESOURCE_FOLDER}/${file}`)(router);
    })
};