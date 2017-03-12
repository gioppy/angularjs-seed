var gulp = require('gulp');
var sass = require('gulp-sass');
var cmq = require('gulp-combine-mq');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var imageMin = require('gulp-imagemin');
var htmlreplace = require('gulp-html-replace');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var autoprefixer = require('autoprefixer');
var watch = require('gulp-watch');
var del = require('del');
var runSequece = require('run-sequence');
var notify = require('gulp-notify');

var opt = require('./configs/dist.json');

/* COMMON PROCESS */

gulp.task('sass', function(){
  return gulp.src('assets/scss/*.scss')
    .pipe(sass({
      outputStyle: 'compact'
    }).on('error', sass.logError))
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('combine', ['sass'], function() {
  return gulp.src(['assets/styles/*.css', '!assets/styles/*.tmp.css', '!assets/styles/*.min.css'])
    .pipe(cmq({
      beautify: false
    }))
    .pipe(rename({suffix: '.tmp'}))
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('styles', ['combine'], function(){
  return gulp.src('assets/styles/*.tmp.css')
    .pipe(cssmin({
      showLog:false
    }))
    .pipe(rename(function(path){
      var name = path.basename;
      path.basename = name.replace('.tmp', '.min');
    }))
    .pipe(postcss([ autoprefixer({ browsers: ['last 3 versions'] })]))
    .pipe(gulp.dest((file) => {
      return file.base;
    }));
});

gulp.task('styles:remove:temp', ['styles'], function(){
  del(['assets/styles/*.tmp.css']);
});

gulp.task('fonts', function(){
  return gulp.src('assets/fonts/fonts.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('assets/fonts'));
});

gulp.task('scripts', function(){
  return gulp.src(['assets/scripts/*.js', '!assets/scripts/*.min.js', 'app/**/*.js', '!app/**/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify({
      mangle: true,
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true
      },
      preserveComments: function(){return false;}
    }).on('error', notify.onError((e) => {
      var msg = e.cause.message;
      var fileName = e.cause.filename;
      console.log(e.cause);
      return {
        title: `Error on ${fileName}`,
        message: e.message,
        wait: true
      };
    })))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(function(file){
      return file.base;
    }));
});

/* LOCAL PROCESS */

gulp.task('local', function(){
  return watch([
    'assets/scss/*.scss',
    'assets/scss/**/*.scss',
    'assets/fonts/*.scss',
    'assets/scripts/*.js',
    '!assets/scripts/*.min.js',
    'app/**/*.js',
    '!app/**/*.min.js',
    'index.html',
    'app/**/*.html'
  ], function(){
    runSequece(
      ['styles', 'fonts', 'scripts'],
      'styles:remove:temp'
    );
  });
});

/* DEV PROCESS */

gulp.task('dev:clean', function(){
  return gulp.src('dev', {read: false})
    .pipe(clean({forse: true}));
});

gulp.task('struct', function(){
  return gulp.src([
    'index.html',
    '!**/*.md',
    'app/**/*.min.js',
    'app/**/*.map',
    'app/**/*.html',
    'assets/**/*.min.js',
    'assets/**/*.min.css',
    'assets/images/*'
  ], {base: './'})
    .pipe(gulp.dest('dev'));
});

gulp.task('dev', function(){
  return watch([
    'assets/scss/*.scss',
    'assets/scss/**/*.scss',
    'assets/fonts/*.scss',
    'assets/scripts/*.js',
    '!assets/scripts/*.min.js',
    'app/**/*.js',
    '!app/**/*.min.js',
    'index.html',
    'app/**/*.html'
  ], function(){
    runSequece(
      ['styles', 'fonts', 'scripts'],
      'styles:remove:temp',
      'struct'
    );
  });
});

/* DIST PROCESS */

gulp.task('dist:clean', function(){
  return gulp.src('dist', {read: false})
    .pipe(clean({forse: true}));
});

gulp.task('dist:styles:vendor', function(){
  return gulp.src(opt.vendor.css)
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest('./dist/assets/libraries/'))
});

gulp.task('dist:styles:bundle', function(){
  return gulp.src(opt.bundle.css)
    .pipe(concat('bundle.min.css'))
    .pipe(gulp.dest('./dist/assets/styles/'))
});

gulp.task('dist:scripts:vendor', function(){
  return gulp.src(opt.vendor.js)
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('./dist/assets/libraries/'))
});

gulp.task('dist:scripts:bundle', function(){
  return gulp.src(opt.bundle.js)
    .pipe(concat('bundle.min.js'))
    .pipe(gulp.dest('./dist/app/'));
});

gulp.task('html', function(){
  return gulp.src(['app/**/*', '!app/**/*.js'])
    .pipe(gulp.dest('./dist/app'));
});

gulp.task('index', function(){
  return gulp.src('index.html')
    .pipe(htmlreplace(opt.htmlreplace))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('images', function(){
  return gulp.src(['assets/images/*', '!assets/images/*.md'])
    .pipe(imageMin())
    .pipe(gulp.dest('./dist/assets/images/'));
});

gulp.task('dist', (cb) => {
  runSequece(
    'dist:clean',
    ['styles', 'fonts', 'scripts'],
    'styles:remove:temp',
    ['dist:styles:vendor', 'dist:styles:bundle', 'dist:scripts:vendor', 'dist:scripts:bundle'],
    'images',
    ['html', 'index'],
    cb
  );
});