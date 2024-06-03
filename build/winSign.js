const { execSync } = require('child_process');

exports.default = configuration => {
    const keypairAlias = process.env.NORDIC_SM_KEYPAIR_ALIAS;
    if (configuration.path) {
        execSync(
            `smctl sign --keypair-alias=${keypairAlias} --input "${String(
                configuration.path
            )}"`
        );
    }
};
