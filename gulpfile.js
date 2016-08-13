var gulp = require('gulp');
var sass = require('gulp-sass');
var cmq = require('gulp-combine-mq');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var exec = require('child_process').exec;

gulp.task('lite-server', function(cb){
  exec('npm start', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('scripts', function(){
  return gulp.src(['assets/scripts/*.js', '!assets/scripts/*.min.js'])
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
    .pipe(gulp.dest('assets/scripts'));
});

gulp.task('fonts', function(){
  return gulp.src('assets/fonts/fonts.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('assets/fonts'));
});

gulp.task('sass', function(){
  return gulp.src('assets/scss/*.scss')
    .pipe(sass({
      outputStyle: 'compact'
    }).on('error', sass.logError))
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

gulp.task('autoprefix', function(){
  return gulp.src('assets/styles/*.min.css')
    .pipe(postcss([ autoprefixer({ browsers: ['last 3 versions'] })]))
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('watch', function(){
  gulp.watch(['assets/scss/*.scss', 'assets/scss/**/*.scss'], ['styles']);
  gulp.watch(['assets/scripts/*.js', '!assets/scripts/*.min.js'], ['scripts']);
});

gulp.task('default', ['watch', 'lite-server']);
