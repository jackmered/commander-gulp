module.exports = {
  plugins: [
    require('autoprefixer')(['> 5%', 'Last 8 versions', 'IE 9']),
    require('perfectionist')({
      cascade: false,
      indentSize: 2,
      trimLeadingZero: false,
      maxSelectorLength: 1,
    }),
  ],
}
