const gulp = require('gulp')
const rollup = require('rollup')
const clean = require('gulp-clean')// 清除文件
const rename = require("gulp-rename");// 文件改名
const uglify = require('gulp-uglify-es').default;// js压缩
const rollupTypescript = require('rollup-plugin-typescript2')// ts 支持
// 编译目录
const buildDir = 'dist'

gulp.task('clean-all', function () {
    return gulp
        .src(buildDir, {read: false, allowEmpty: true})
        .pipe(clean(buildDir));
});

gulp.task("build", async function () {
    const subTask = await rollup.rollup({
        input: "src/index.ts",
        output: {
            file: buildDir + '/index.js',
            format: 'umd', //iife
            extend: true,
            name: 'index',
        },
        plugins: [
            rollupTypescript(),
        ]
    });
    return await subTask.write({
        file: buildDir + '/index.js',
        format: 'umd', //iife
        extend: true,
        name: 'index'
    });
});


gulp.task("uglify", function () {
    return gulp.src(buildDir + "/*.js")
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify(/* options */))
        .pipe(gulp.dest(buildDir + "/"));
});

gulp.task('default',
    gulp.series('clean-all', 'build',  'uglify', function (cb) {
        cb();
    })
)
