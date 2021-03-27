const { src, dest, parallel } = require('gulp'),
	gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	groupMedia = require('gulp-group-css-media-queries'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	webpack = require('webpack-stream'),
	imagemin = require('gulp-imagemin'),
	watch = require('gulp-watch'),
	webp = require('gulp-webp'),
	webp2html = require('gulp-webp-in-html');

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
			img: sourceFolder + '/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
			fonts: sourceFolder + '/fonts/*.ttf',
		},
		watch: {
			html: sourceFolder + '/**/*.html',
			css: sourceFolder + '/sass/**/*.+(scss|sass)',
			js: sourceFolder + '/js/**/*.js',
			img: sourceFolder + '/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}',
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
		.pipe(webp2html())
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

// images =====================================================================
function images() {
	return src(path.src.img)
		.pipe(webp({ quality: 70 }))
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(
			imagemin(
				[
					imagemin.gifsicle({ interlaced: true }),
					imagemin.mozjpeg({ quality: 75, progressive: true }),
					imagemin.optipng({ optimizationLevel: 3 }),
					imagemin.svgo({
						plugins: [{ removeViewBox: false }],
					}),
				],
				{ verbose: true }
			)
		)
		.pipe(dest(path.build.img))
		.pipe(browserSync.stream());
}

// ============================================================================
function watchFiles() {
	watch([path.watch.html], html);
	watch([path.watch.css], styles);
	watch([path.watch.js], scriptJS);
	watch(
		[path.watch.img],
		{
			usePolling: false,
			ignoreInitial: true,
		},
		images
	);
}

// clean dist catalog ========================================================
async function cleanDist() {
	return await del(path.clean);
}

// =============================================================================
const build = gulp.series(cleanDist, images, gulp.parallel(scriptJS, styles, html));
const watchTask = gulp.series(build, parallel(watchFiles, server));

// =============================================================================
exports.watchFiles = watchFiles;
exports.images = images;
exports.scriptJS = scriptJS;
exports.styles = styles;
exports.html = html;
exports.build = build;
exports.watchTask = watchTask;
exports.cleanDist = cleanDist;
exports.default = watchTask;
