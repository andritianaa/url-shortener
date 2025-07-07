module.exports = {
    apps: [
        {
            name: "Url shortener client",
            script: "npm",
            args: "start",
            env: {
                PORT: 3052,
                NODE_ENV: "production"
            }
        }
    ]
}