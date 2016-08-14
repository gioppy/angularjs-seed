var gulp = require('gulp');
var sass = require('gulp-sass');
var cmq = require('gulp-combine-mq');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var htmlreplace = require('gulp-html-replace');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var del = require('del');
var exec = require('child_process').exec;

var opt = require('./dist.json');

gulp.task('fonts', function(){
  return gulp.src('assets/fonts/fonts.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('assets/fonts'));
});

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
  var e = gulp.src('assets/styles/*.tmp.css')
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
  del(['assets/styles/*.tmp.css']);

  return e;
});

gulp.task('scripts', function(){
  return gulp.src(['assets/scripts/*.js', '!assets/scripts/*.min.js', 'app/**/*.js', '!app/**/*.min.js'])
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
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(function(file){
      return file.base;
    }));
});

/* DEV PROCESS */

gulp.task('dev:clean', function(){
  return gulp.src('dev', {read: false})
    .pipe(clean({forse: true}));
});

gulp.task('struct', function(){
  return gulp.src(['index.html', 'app/**/*.min.js', 'assets/**/*.min.js', 'assets/**/*.min.css'], {base: './'})
    .pipe(gulp.dest('dev'));
});

gulp.task('lite-server', function(cb){
  exec('npm start', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('watch', function(){
  gulp.watch(['assets/scss/*.scss', 'assets/scss/**/*.scss'], ['styles']);
  gulp.watch(['assets/scripts/*.js', '!assets/scripts/*.min.js', 'app/**/*.js', '!app/**/*.min.js'], ['scripts']);
  gulp.watch(['index.html', 'app/**/*.min.js', 'assets/**/*.min.js', 'assets/**/*.min.css'], ['struct']);
});

gulp.task('dev', ['dev:clean', 'struct', 'styles', 'scripts', 'watch', 'lite-server']);

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
    .pipe(gulp.dest('./dist/app/'))
});

gulp.task('html', function(){
  return gulp.src('index.html')
    .pipe(htmlreplace(opt.htmlreplace))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('dist', [
  'dist:clean',
  'styles',
  'scripts',
  'dist:styles:vendor',
  'dist:styles:bundle',
  'dist:scripts:vendor',
  'dist:scripts:bundle',
  'html'
]);