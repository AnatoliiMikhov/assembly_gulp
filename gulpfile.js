const { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	groupMedia = require('gulp-group-css-media-queries'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	webpack = require('webpack-stream');

// ===========================================================================
const distFolder = 'dist',
	sourceFolder = 'src',
	path = {
		build: {
			html: distFolder + '/',
			css: distFolder + '/css/',
			js: distFolder + '/js/',
			img: distFolder + '/img/',
			fonts: distFolder + '/fonts/',
		},
		src: {
			html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
			css: sourceFolder + '/sass/style.scss',
			js: sourceFolder + '/js/script.js',
			img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
			fonts: sourceFolder + '/fonts/*.ttf',
		},
		watch: {
			html: sourceFolder + '/**/*.html',
			css: sourceFolder + '/sass/**/*.+(scss|sass)',
			js: sourceFolder + '/js/**/*.js',
			img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
		},
		clean: './' + distFolder + '/',
	};

// ===========================================================================
function server() {
	browserSync.init({
		server: {
			baseDir: './' + distFolder + '/',
		},
		port: 4000,
		notify: false,
	});
}

// html files work ===========================================================
function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream());
}

// sass scss func ============================================================
function styles() {
	return src(path.src.css)
		.pipe(
			sass({
				outputStyle: 'expanded',
			}).on('error', sass.logError)
		)
		.pipe(groupMedia())
		.pipe(autoprefixer())
		.pipe(dest(path.build.css))
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(dest(path.build.css))
		.pipe(browserSync.stream());
}

// scripts ===================================================================
function scriptJS() {
	return src(path.src.js)
		.pipe(
			webpack({
				mode: 'production',
				output: {
					filename: 'script.min.js',
				},
				watch: false,
				devtool: 'source-map',
				module: {
					rules: [
						{
							test: /\.m?js$/,
							exclude: /(node_modules|bower_components)/,
							use: {
								loader: 'babel-loader',
								options: {
									presets: [
										[
											'@babel/preset-env',
											{
												debug: true,
												corejs: 3,
												useBuiltIns: 'usage',
											},
										],
									],
								},
							},
						},
					],
				},
			})
		)
		.pipe(gulp.dest(path.build.js))
		.on('end', browserSync.reload);
}

// ============================================================================
function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], styles);
	gulp.watch([path.watch.js], scriptJS);
}

// clean dist catalog ========================================================
function cleanDist() {
	return del(path.clean);
}

// =============================================================================
const build = gulp.series(cleanDist, gulp.parallel(scriptJS, styles, html));
const watch = gulp.parallel(build, watchFiles, server);

// =============================================================================
exports.scriptJS = scriptJS;
exports.styles = styles;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
