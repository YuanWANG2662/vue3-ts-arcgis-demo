// vue.config.js
module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = '通州'
                return args
            })
    }
}