module.exports = {
    apps: [{
        name: 'fagc-master-backend',
        script: './src/bin/www',
        env: {
            "NODE_ENV": "production"
        },
        cwd: "./src"
    }]
}