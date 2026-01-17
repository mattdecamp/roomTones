const CleanCSS = require('clean-css')

module.exports = (config) => {
  /**
   * Server Options
   */
  config.setServerOptions({
    livereload: true,
    port: 3456,
  })
  /**
   * Filters
   */
  config.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles
  })
  /**
   * Set directories to pass through to the dist folder
   */
  config.addPassthroughCopy('./src/js/app.min.js')
  config.addPassthroughCopy('./src/images/')

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
    },
  }
}
