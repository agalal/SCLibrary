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
    "gulp-jsbeautifier": "prettify",
    "gulp-cached": "cache",
    "gulp-concat": "concat",
    "gulp-htmlmin": "htmlmin",
    "gulp-iconfont": "iconfont",
    "gulp-iconfont-css": "iconfontCss",
    "gulp-imagemin": "imagemin",
    "gulp-livereload": "livereload",
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

gulp.task('build', ['sass', 'js', 'imgs', 'html', 'css'], function (cb) {
  pump(
    [
      p.livereload()
    ],
    cb);
});

gulp.task('watch', function () {
  p.livereload.listen();
  // watch everything
  gulp.watch('build/**/*', ['build']);
});

gulp.task('prettify-js', function (cb) {
  pump([
    gulp.src('build/js/**/*.js'),
    p.cache('prettify', {
      optimizeMemory: true
    }),
    p.prettify.reporter(),
    p.jshint(),
    p.jshint.reporter('default'),       // log syntax errors/warnings
    gulp.dest('build/js/')
  ], cb);


});


gulp.task('js', ['prettify-js'], function (cb) {
    var folders = getFolders(scriptsPath);

    var tasks = folders.map(function(folder, cb) {
      var glob = path.join(scriptsPath, folder, '/*.js');
      console.log(glob + ' -> ' + scriptsBuildPath);
      pump([
        // match all js files in child dirs to merge
        gulp.src(glob),
        p.cache('js', {
          optimizeMemory: true
        }),
        p.sourcemap.init(),


        p.babel({                           // babel for min & compatibility
           //presets: ['latest']
        }),

        // uglify(uglify_options, p.jsharmony),             // minify using es6 minifier

        p.concat(folder + '.js'),
        p.rename(function (path) {
          path.extname = '.min.js';
        }),

        p.sourcemap.write({sourceRoot: '/build/js'}),
        gulp.dest(scriptsBuildPath)             // build it out in public
       ],
       cb);
    });

});

gulp.task('icon', function(){
  var iconFontName = 'sc_icons';
  var runTimestamp = Math.round(Date.now()/1000);

  return gulp.src(['build/images/sc_icons/*.svg'])
    .pipe(p.cache('icons'), {
      optimizeMemory: true
    })
    .pipe(p.iconfontCss({
      fontName: iconFontName,
      path: 'scss',
      targetPath: '../../build/sass/components/_icons.scss',
      fontPath: '../fonts/'
    }))
    .pipe(p.iconfont({
      fontName: iconFontName,
      prependUnicode: true,
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      timestamp: runTimestamp
    }))
    .on('glyphs', function(glyphs, options) {
      // CSS templating, e.g.
      console.log(glyphs, options);
    })
    .pipe(gulp.dest('public/fonts/'));
});

gulp.task('sass', ['icon'], function (cb) {
  pump([
    // match full sass files, not partials
    gulp.src('build/sass/*.scss'),

    p.cache('sass', {
      optimizeMemory: true
    }),
    p.prettify(),
    p.sourcemap.init(),                 // start mapping
    p.sass(),                           // compile sass
    p.autoprefixer(autoprefixerOptions),// autoprefix for browsers
    p.uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }),

    p.concat('sclibrary.min.css'),      // make it one file
    p.sourcemap.write({sourceRoot: '/build/sass'}),             // write sourcemaps
    // livereload(),                    // refresh browser
    gulp.dest('public/stylesheets/')    // write
  ], cb);
});

gulp.task('css', function (cb) {
  pump([
    // match full sass files, not partials
    gulp.src('build/css/*.css'),

    // no need to cache, sass is cached, thus won't be sent downstream
    p.prettify(),
    p.sourcemap.init(),                 // start mapping
    p.autoprefixer(autoprefixerOptions),// autoprefix for browsers
    p.uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }),
    p.sourcemap.write({sourceRoot: '/build/css'}),             // write sourcemaps
    // livereload(),                    // refresh browser
    gulp.dest('public/stylesheets/')    // write
  ], cb);
});

gulp.task('imgs', function (cb) {
  pump([
    // p.cache('img', {
    //   optimizeMemory: true
    // }),
    gulp.src(imgGlob),
    p.imagemin(),
    gulp.dest('public/images')
  ], cb);
});


gulp.task('html', function (cb) {
  pump([
    gulp.src('build/views/*.html'),
    p.cache('html', {
      optimizeMemory: true
    }),
    p.prettify(),
    p.sourcemap.init(),
    p.htmlmin({collapseWhitespace: true}),
    p.sourcemap.write({sourceRoot: '/build/views'}),
    gulp.dest('public/views/')
  ],
  cb);
});
