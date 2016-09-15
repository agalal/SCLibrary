// gulp import
var gulp = require('gulp');

// node default stuff for merging by folder
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');

// loads all gulp plugins from package.json
var gulpLoadPlugins = require('gulp-load-plugins');

// load plugins and name conveniently
var p = gulpLoadPlugins({
  rename: {
    "gulp-babel": "babel",
    "gulp-concat": "concat",
    "gulp-htmlmin": "htmlmin",
    "gulp-imagemin": "imagemin",
    "gulp-rename": "rename",
    "gulp-sass": "sass",
    "gulp-sourcemaps": "sourcemap",
    // "gulp-uglify": "uglify",
    "gulp-uglifycss": "uglifycss",
    "gulp-watch": "watch",
    "uglify-js-harmony": "jsharmony",
    "gulp-jshint": "jshint"
  }
});

var uglify = require('gulp-uglify/minifier');

// runs pipes and error reports
var pump = require('pump');

// variables
var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

var imgGlob = [
  'build/images/*.svg',
  'build/images/**/*.svg',
  'build/images/*.png'
];

var uglify_options = {
  compressor: {
    sequences     : true,  // join consecutive statemets with the “comma operator”
    properties    : true,  // optimize property access: a["foo"] → a.foo
    dead_code     : true,  // discard unreachable code
    drop_debugger : true,  // discard “debugger” statements
    unsafe        : false, // some unsafe optimizations (see below)
    conditionals  : true,  // optimize if-s and conditional expressions
    comparisons   : true,  // optimize comparisons
    evaluate      : true,  // evaluate constant expressions
    booleans      : true,  // optimize boolean expressions
    loops         : true,  // optimize loops
    unused        : true,  // drop unused variables/functions
    hoist_funs    : true,  // hoist function declarations
    hoist_vars    : false, // hoist variable declarations
    if_return     : true,  // optimize if-s followed by return/continue
    join_vars     : true,  // join var declarations
    cascade       : true,  // try to cascade `right` into `left` in sequences
    side_effects  : true,  // drop side-effect-free statements
    warnings      : true,  // warn about potentially dangerous optimizations/code
    global_defs   : {}     // global definitions
  }
};

var scriptsPath = 'build/js';
var scriptsBuildPath = 'public/js';

function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

gulp.task('build', ['sass', 'js', 'imgs', 'html']);

gulp.task('watch', function () {
  gulp.watch('build/**/*', ['build']);
});


gulp.task('js', function (cb) {
    var folders = getFolders(scriptsPath);

    var tasks = folders.map(function(folder, cb) {
      var glob = path.join(scriptsPath, folder, '/*.js');
      console.log(glob + ' -> ' + scriptsBuildPath);
      pump([
        // match all js files in child dirs to merge
        gulp.src(glob),
        p.sourcemap.init(),

        // p.jshint(),
        // p.jshint.reporter('default'),       // log syntax errors/warnings

        p.babel({                           // babel for min & compatibility
           //presets: ['latest']
        }),

        // uglify(uglify_options, p.jsharmony),             // minify using es6 minifier

        p.concat(folder + '.js'),
        p.rename(function (path) {
          path.extname = '.min.js';
        }),

        p.sourcemap.write('.'),
        gulp.dest(scriptsBuildPath)             // build it out in public
       ],
       cb);
    });

});

gulp.task('sass', function (cb) {
  pump([
    // match full sass files, not partials
    gulp.src('build/sass/*.scss'),

    p.sourcemap.init(),                 // start mapping
    p.sass(),                           // compile sass
    p.autoprefixer(autoprefixerOptions),// autoprefix for browsers
    p.uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }),

    p.concat('sclibrary.min.css'),      // make it one file
    p.sourcemap.write('.'),             // write sourcemaps
    // livereload(),                    // refresh browser
    gulp.dest('public/stylesheets/')    // write
  ], cb);
});

gulp.task('css', function (cb) {
  pump([
    // match full sass files, not partials
    gulp.src('build/css/*.css'),

    p.sourcemap.init(),                 // start mapping
    p.autoprefixer(autoprefixerOptions),// autoprefix for browsers
    p.uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }),
    p.sourcemap.write('.'),             // write sourcemaps
    // livereload(),                    // refresh browser
    gulp.dest('public/stylesheets/')    // write
  ], cb);
});

gulp.task('imgs', function (cb) {
  pump([
    gulp.src(imgGlob),
    p.imagemin(),
    gulp.dest('public/images')
  ], cb);
});

gulp.task('html', function (cb) {
  pump([
    gulp.src('build/views/*.html'),
    p.sourcemap.init(),
    p.htmlmin({collapseWhitespace: true}),
    p.sourcemap.write('.'),
    gulp.dest('public/views/')
  ],
  cb);
});
