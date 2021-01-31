//--------- Include references
const { src, dest, series , watch } = require('gulp'),
	concat = require('gulp-concat'),
	browserSync = require('browser-sync'),
	sourcemaps = require('gulp-sourcemaps'),
	del = require('del'),
	babel = require('gulp-babel'),
	plumber = require('gulp-plumber'), //does not crash if error occurs
	pug = require('gulp-pug'),
	lec = require('gulp-line-ending-corrector'),
	esLint = require('gulp-eslint'),
	uglify = require('gulp-uglify'),
	gulpif = require('gulp-if'),
	header = require('gulp-header'),
	pkg = require('./pkg/package.json'),
	// Sass
	sass = require('gulp-sass'),
	cleanCSS = require('gulp-clean-css'),
	postCSS = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	cssVars = require('postcss-css-variables'),
	gap = require('postcss-gap-properties'),
	sassLint = require('gulp-sass-lint'),
	//Assets path
	assetsPath = 'pkg/dist/',
	banner = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @version v<%= pkg.version %>',
	' * @author <%= pkg.author %>',
	' * @link <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
	''].join('\n');


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
			appProd: `${assetsPath}js/`
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
			destProd: `${assetsPath}css/`,
		}
	},
	assets: {
		watch: 'src/**/**/*'
	}
}

//--------- Clean files
function clean(done) {
	del.sync([`${paths.views.app.dest}*`, `${assetsPath}*`], {
		force: true
	})
	done()
}

//--------- Views : Pug
function viewsPug() {
	// templates
	return src(paths.views.app.src)
		.pipe(plumber())
		.pipe(pug({
			pretty: true,
			basedir: 'src'
		}))
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(dest(paths.views.app.dest))
}

//--------- Script : javascript
function coreScripts(source, dist) {

	const isDev = dist === paths.scripts.dist.app

	return src(source)
		.pipe(plumber())
		.pipe(gulpif(isDev, esLint()))
		.pipe(esLint.format('table'))
		.pipe(esLint.failAfterError())
		.pipe(gulpif(isDev, sourcemaps.init()))
		.pipe(babel({
			'presets': ['@babel/preset-env'],
			'sourceType': 'script'
		}))
		.pipe(concat('cookie.min.js'))
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(gulpif(!isDev, uglify()))
		.pipe(header(banner, { pkg : pkg } ))
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

	return src(source) //paths.styles.vendor
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded', //nested, expanded, compact, compressed
		}).on('error', sass.logError))
		.pipe(cleanCSS()) //minify
		.pipe(postCSS([gap(),
			cssVars({
				preserve: true
			}), autoprefixer({
				grid: 'autoplace'
			})
		]))
		.pipe(concat(`${basename}.min.css`))
		.pipe(lec({
			eolc: 'CRLF'
		}))
		.pipe(header(banner, { pkg : pkg } ))		
		.pipe(dest(prod))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(dist))
}

function styles(done) {

	//styles DIST
	coreStyles(
		'cookie',
		paths.styles.app.src,
		paths.styles.dist.dest,
		paths.styles.dist.destProd
	)
	done()
}

function sassLinter() {
	return src(paths.styles.app.watch)
		.pipe(plumber())
		.pipe(sassLint())
		.pipe(sassLint.format())
		.pipe(sassLint.failOnError())
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
		port: 9000,
		ui: false,
		notify: false,
		open: false, //disable opening browser after running gulp
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
const dev = series(clean, styles, scripts, viewsPug, sassLinter)

exports.build = dev
exports.default = series(localServer, watchAssets)