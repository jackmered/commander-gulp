import {
  src, dest, parallel, series, watch,
} from 'gulp';
import webpackStream from 'webpack-stream';
import handlebarsLayouts from 'handlebars-layouts';
import del from 'del';
import gulpLoadPlugins from 'gulp-load-plugins';
import dartSass from 'sass';
import webpack from 'webpack';
import webpackConfig from './webpack.config.babel';

const isProduction = process.env.NODE_ENV === 'production';
const plugins = gulpLoadPlugins();

/**
 * Assets
 * Moves all child folders to root of dist
 */
const assets = () => src('./src/assets/**/*.*', { base: './src/assets' })
  .pipe(plugins.if(isProduction, plugins.imagemin()))
  .pipe(plugins.connect.reload())
  .pipe(dest('./dist'));

/**
 * Templates
 * Handlebars & htmlmin
 */
const templates = () => {
  const srcDir = './src/templates';
  const hbStream = plugins.hb()
    .partials(`${srcDir}/partials/components/**/*.{hbs,js}`)
    .partials(`${srcDir}/partials/layouts/**/*.{hbs,js}`)
    .helpers(handlebarsLayouts)
    .helpers(`${srcDir}/helpers/**/*.js`)
    .decorators(`${srcDir}/decorators/**/*.js`)
    .data(`${srcDir}/data/**/*.{js,json}`);

  return src(`${srcDir}/views/**/*.hbs`)
    .pipe(hbStream)
    .pipe(plugins.rename({ extname: '.html' }))
    .pipe(plugins.if(isProduction, plugins.htmlmin()))
    .pipe(plugins.connect.reload())
    .pipe(dest('./dist'));
};

/**
 * Styles
 * PostCSS, CSSO & Sourcemaps
 */
plugins.sass.compiler = dartSass;

const styles = () => src('./src/styles/app.scss')
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.sass().on('error', plugins.sass.logError))
  .pipe(plugins.if(isProduction, plugins.csso()))
  .pipe(plugins.postcss())
  .pipe(plugins.sourcemaps.write('./'))
  .pipe(plugins.connect.reload())
  .pipe(dest('./dist/styles'));

/**
 * Stylelint
 * Checks all stylesheets to ensure they are formatted correctly
 */
const stylelint = () => src('./src/styles/**/*.scss')
  .pipe(plugins.stylelint({
    reporters: [
      { formatter: 'string', console: true },
    ],
  }));

/**
 * Scripts
 * Transpiles es6 javascript and bundles into into dist/scripts folder, also minifies for production
 */
const scripts = () => src('./src/scripts/app.js')
  .pipe(webpackStream(webpackConfig, webpack))
  .pipe(plugins.connect.reload())
  .pipe(dest('./dist/scripts'));

/**
 * ESLint
 * Checks all javascript is formatted correctly
 */
const eslint = () => src(['src/scripts/**/*.js'])
  .pipe(plugins.eslint())
  .pipe(plugins.eslint.format())
  .pipe(plugins.eslint.failAfterError());

/**
 * Serve
 */
const serve = () => plugins.connect.server({
  root: 'dist',
  livereload: true,
  host: '0.0.0.0',
});

/**
 * Watch
 * Runs tasks if detects changes
 */
const watcher = () => {
  watch(['./src/assets/**/*.*'], series(assets));
  watch(['./src/templates/**/*.hbs'], series(templates));
  watch(['./src/styles/**/*.scss'], series(stylelint, styles));
  watch(['./src/scripts/**/*.js'], series(eslint, scripts));
};

/**
 * Build all
 */
export const build = parallel(
  assets, templates, series(stylelint, styles), series(eslint, scripts),
);

/**
 * Clean
 * Removes all files in dist folder
 */
export const clean = () => del('./dist/**/*');

/**
 * Develop
 * Builds, serves and watches for changes
 */
export const develop = parallel(build, serve, watcher);

/**
 * Publish
 * Cleans dist folder before build
 */
export const publish = series(clean, build);

/**
 * Default
 */
export default develop;
