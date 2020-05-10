//--------- Include references
const {src, dest, series, parallel, watch} = require('gulp'),
	concat = require('gulp-concat'),
	browserSync = require('browser-sync'),
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'),
	del = require('del'),
	babel = require('gulp-babel'),
	plumber = require('gulp-plumber'),
	pug = require('gulp-pug'),
	lec = require('gulp-line-ending-corrector'),
	esLint = require('gulp-eslint'),
	uglify = require('gulp-uglify'),
	gulpif = require('gulp-if'),
	sass = require('gulp-sass'),
	cleanCSS = require('gulp-clean-css'),
	postCSS = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	cssVars = require('postcss-css-variables'),
	gap = require('postcss-gap-properties'),
	sassLint = require('gulp-sass-lint'),
	packageDist = 'pkg/dist/'

//--------- Define Paths
const paths = {

	scripts: {
		app: {
			src: 'src/js/app/*.js',
			srcProd: 'src/js/app/@plugin.js',
			watch: 'src/js/**/*'
		},
		dist: {
			app: 'dist/assets/js/app/',
			appProd: `${packageDist}js/`
		}
	},
	views: {
		app: {
			src: 'src/index.pug',
			watch: 'src/*.pug',
			dest: 'dist/'
		}
	},
	styles: {
		app: {
			src: 'src/scss/global.scss',
			watch: 'src/scss/**/*.scss'
		},

		dist: {
			dest: 'dist/assets/css/',
			destProd: `${packageDist}css/`,
		}
	},
	assets: {
		watch: 'src/**/**/*'
	}
}

//--------- Clean files
function clean(done) {
	del.sync([`${paths.views.app.dest}*`, `${packageDist}*`], {
		force: true
	})
	done()
}

//--------- Views : Pug
function viewsPug(done) {
	src(paths.views.app.src)
		.pipe(plumber())
		.pipe(pug({
			pretty: true,
			basedir: 'src'
		}))
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(dest(paths.views.app.dest))
	done()
}

//--------- Scripts
function coreScripts(source, dist) {

	const isDev = dist === paths.scripts.dist.app

	src(source)
		.pipe(plumber())
		.pipe(gulpif(isDev, esLint()))
		.pipe(esLint.format('table'))
		.pipe(esLint.failAfterError())
		.pipe(gulpif(isDev, sourcemaps.init()))
		.pipe(babel({
			'presets': ['@babel/preset-env'],
			'sourceType': 'script'
		}))
		.pipe(gulpif(isDev, concat('cookie.js')))
		.pipe(rename({
			basename: 'cookie',
			suffix: '.min'
		}))
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(gulpif(!isDev, uglify()))
		.pipe(gulpif(!isDev, dest(dist)))
		.pipe(gulpif(isDev, sourcemaps.write('.')))
		.pipe(gulpif(isDev, dest(dist)))
}

function scripts(done) {
	coreScripts(paths.scripts.app.src, paths.scripts.dist.app)
	coreScripts(paths.scripts.app.srcProd, paths.scripts.dist.appProd)
	done()
}

//--------- Compile Sass
function coreStyles(basename, source, dist, prod) {

	src(source)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded',
		}).on('error', sass.logError))
		.pipe(cleanCSS()) 
		.pipe(postCSS([
			gap(),
			cssVars({
				preserve: true
			}), 
			autoprefixer({
				grid: 'autoplace'
			})
		]))
		.pipe(concat(`${basename}.css`))
		.pipe(rename({
			basename: basename,
			suffix: '.min'
		}))
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(dest(prod))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(dist))
}

function styles(done) {

	coreStyles(
		'cookie',
		paths.styles.app.src,
		paths.styles.dist.dest,
		paths.styles.dist.destProd
	)
	done()
}

function sassLinter(done) {
	src(paths.styles.app.watch)
		.pipe(plumber())
		.pipe(sassLint())
		.pipe(sassLint.format())
		.pipe(sassLint.failOnError())
	done()
}

//--------- Browser sync - local Server
function localServer(done) {
	browserSync.create()
	browserSync.init({
		snippetOptions: {
			rule: {
				match: /<\/body>/i,
				fn: (snippet, match) => {
					return `${snippet}${match}`
				}
			}
		},
		reloadDelay: 5000,
		port: 9000,
		ui: false,
		notify: false,
		open: false, 
		server: 'dist'
	})
	done()
}

//--------- Reload browser Sync
function reload(done) {
	browserSync.reload()
	done()
}

//--------- Watch
function watchAssets(done) {
	watch(paths.styles.app.watch, series(styles, sassLinter, reload))
	watch(paths.scripts.app.watch, series(scripts, reload))
	watch(paths.views.app.watch, series(viewsPug, reload)) 
	done()
}

//--------- Create tasks
const dev = series(clean, parallel(styles, scripts, viewsPug), sassLinter)

exports.build = dev
exports.default = series(dev, localServer, watchAssets)