/* global module, require */
// todo: implement grunt-autoprefixer (already added to npm)
module.exports = function (grunt) {
	'use strict';

	require('load-grunt-tasks')(grunt);
	grunt.loadTasks('gruntTasks');

	var folderSrc = 'src/'
		,folderSrcDev = folderSrc
		,folderSrcJs = folderSrcDev+'script/'
		//
		,folderDist = 'dist/'
		,folderDistDev = folderDist
		,folderDistJs = folderDistDev+'script/'
		//
		,sourcesJs = [
			folderSrcJs+'main.js'
		]
		,sourceJsMain = sourcesJs[0]
	;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')

		// watch
		,watch: {
			options: { livereload: true }//, livereload: 35729
			,gruntfile: {
				files: ['Gruntfile.js', '.jshintrc', 'gruntTasks/**']
				,options: { spawn: false, reload: true }
			}
			,inject: {
				files: ['Gruntfile.js']
				,tasks: ['inject']
				,options: { spawn: false }
			}
			,js: {
				files: [folderSrcJs+'**/*.js','.jshintrc','.jscsrc']
				,tasks: ['js']
				,options: { spawn: false }
			}
			,cc: {
				files: [folderSrcJs+'**/*.cc']
				,tasks: ['copy:cc']
				,options: { spawn: false }
			}
			//,sass: {
			//	files: [folderSrc+'style/**/*.scss']
			//	,tasks: ['sass']
			//	,options: { spawn: false }
			//}
			//,templates: {
			//	files: [folderSrc+'tpl/**/*.html']
			//	,tasks: ['tpl']
			//	,options: { spawn: false }
			//}
			//,icon: {
			//	files: [folderSrc+'icons/ics.zip']
			//	,tasks: ['icomoon']
			//	,options: { spawn: false }
			//}
			,vendor: {
				files: [folderSrcDev+'vendor/**','.bowerrc']
				,tasks: ['inject']
				,options: { spawn: false }
			}
			,admin: {
				files: [folderSrcJs+'admin/**']
				,tasks: ['uglify:adminCard','uglify:adminCardSettings','copy:colorthief']
				,options: { spawn: false }
			}
			,iconexport: {
				files: [folderSrc+'icons/export/**']
				,tasks: ['copy:iconexport']
				,options: { spawn: false }
			}
			/*,prerender: {
				files: [folderSrcTheme+'*.php']
				,tasks: ['prerender']
				,options: { spawn: false }
			}*/
		}

		// JSHint the source files
		,jshint: {
			options: { jshintrc: '.jshintrc' }
			,files: sourcesJs
		}

		// Check source code style
		,jscs: {
			src: folderSrcJs+'**/*.js', options: { config: ".jscsrc" }
		}

		// Clean folders
		,clean: {
			dist: {
				src: ['dist/**']
			}
		}

		// Inject source files
		,inject: {
			main: {
				id: 'app'
				,files: sourcesJs
				,src: folderSrcDev
				,dest: folderSrc+'index.html'
			}
			//,mainwp: {
			//	id: 'app'
			//	,files: sourcesJs
			//	,src: folderSrcDev
			//	,dest: folderSrcTheme+'footer.php'
			//}
			,bower: {
				id: 'bower'
				,json: 'bower.json'
				,bowerrc: '.bowerrc'
				,src: folderSrcDev
				,dest: folderSrc+'index.html'
				,concat: 'temp/vendor.xx'
			}
			// dist
			,distmain: {
				id: 'app'
				,files: ['script/main.js']
				,dest: folderSrc+'index.html'
				,defer: true
			}
			,distbower: {
				id: 'bower'
				,files: ['script/vendor.js']
				,dest: folderSrc+'index.html'
				,defer: true
			}
			//,tpl: {
			//	id: 'tpl'
			//	,files: ['temp/templates.html']
			//	,dest: folderSrcJs+'run.js'
			//	,prefix: '\''
			//	,suffix: '\''
			//	,type: 'string'
			//}
		}

		//// Rewrite angular dependency injection notation
		//,ngAnnotate: {
		//	options: {
		//		singleQuotes: true
		//		,sourcemap: false // false||true||string
		//	}
		//	,main: {
		//		files: {
		//			'temp/main.js': sourcesJs
		//		}
		//	}
		//}

		// CLI
		,cli: {
			/*jsdoc: { cwd: './', command: 'jsdoc -c jsdoc.json', output: true }
			,*/browserify: { cwd: './', command: 'browserify src/script/main.js -d -t babelify --outfile temp/main.js', output: true }
			//,browserifytest: { cwd: './test/unit/', command: 'browserify src/test.js -d -t babelify --outfile test.js', output: true }
			//,babel: { cwd: './', command: 'babel src/_test.js --out-file temp/_test.js -t', output: true }
		}

		// Uglify all the things
		,uglify: {
			main: {
				options: {sourceMap:true,wrap:true}
				,src: 'temp/main.js'
				,dest: folderDistJs+'main.js'
			}
			,vendor: {
				src: 'temp/vendor.js'
				,dest: folderDistJs+'vendor.js'
			}
			//,adminCard: {
			//	options: {sourceMap:true,wrap:true}
			//	,src: folderSrcJs+'admin/adminCard.js'
			//	,dest: folderSrcTheme+'/js/adminCard.js'
			//}
			//,adminCardSettings: {
			//	options: {sourceMap:true,wrap:true}
			//	,src: folderSrcJs+'admin/adminCardSettings.js'
			//	,dest: folderSrcTheme+'/js/adminCardSettings.js'
			//}
		}

		// sass to css
		//,sass: {
		//	dist: {
		//		options: { style: 'compressed' }
		//		,files: {
		//			'src/style/main.css': 'src/style/main.scss'
		//			// folderSrcTheme
		//			,'src/wordpress/wp-content/themes/ICS/style/admin.css': 'src/style/admin.scss'
		//			,'src/wordpress/wp-content/themes/ICS/style/admin-tinymce.css': 'src/style/admin-tinymce.scss'
		//			,'src/wordpress/wp-content/themes/ICS/style/admin-cards.css': 'src/style/admin-cards.scss'
		//		}
		//	}
		//}

		//// autoprefix css
		//,autoprefixer: {
		//	options: {
		//		// Task-specific options go here.
		//	}
		//	,// prefix the specified file
		//	single_file: {
		//		options: {
		//			// Target-specific options go here.
		//		}
		//		,src: 'src/style/main.css',dest: 'temp/main-autoprefixed.css'
		//	}
		//}

		// icomoon
		//,icomoon: {
		//	src: {
		//		src: 'src/icons/ics.zip'
		//		,dest: 'src/style/_icons.scss'
		//		,fontDest: folderSrc+'fonts/'
		//		,iconName: 'icon'
		//	}
		//}

		// copy
		,copy: {
			build: {
				files: [
					{
						expand: true
						,cwd: folderSrc
						,src: [
							'.htaccess'
							,'index.html'
							,'index.php'
							//,'attractors.appcache'
							//,'fonts/**'
							,'script/*.cc'
							,'style/**'
							,'!style/*.scss'
						]
						,dest: folderDist
						,dot: true
						,filter: 'isFile'
					}
				]
			}
			,cc: {
				files: [
					{
						expand: true
						,cwd: folderSrc
						,src: ['script/*.cc']
						,dest: folderDist
						,dot: true
						,filter: 'isFile'
					}
				]
			}
			//
			//,iconexport: {
			//	files: [{
			//		expand: true
			//		,cwd: folderSrc+'icons/export/'
			//		,src: ['*.svg']
			//		,dest: folderSrc+'icons/export/'
			//		,rename: function (dest,src) {
			//			return dest + src.replace('ics_','');
			//		}
			//	}]
			//}
			//
			//,colorthief: {
			//	files: [
			//		{
			//			expand: true
			//			,cwd: folderSrc+'vendor/color-thief/dist/'
			//			,src: [ 'color-thief.min.js' ]
			//			,dest: folderSrcTheme+'js/'
			//			,filter: 'isFile'
			//		}
			//	]
			//}
		}

		// versioning
		,version_git: {
			main: {
				src: [
					sourceJsMain
					//,folderSrcJs+'settings.js'
					//,folderSrc+'ics.appcache'
					,'package.json'
					,'bower.json'
					//,folderSrcTheme+'style.css'
				]
			}
		}

		// minify the final html
		,htmlmin: {
			dist: {
				options: {
					removeComments: true
					,collapseWhitespace: true
					,minifyJS: true
					,minifyCSS: true
				}
				,files: (function(o,s){
					o[s] = s;
					return o;
				})({},folderDistDev+'index.html')
			}
		}

		// Render and save index.html
		/*,renderPage: {
			index: {
				baseUri: 'http://localhost.ics/'
				,dest: './src/'
				,pages: {'index.php':'__index.html'}
			}
		}*/

		// command line interface
		/*,cli: {
			migrate: { cwd: 'src/laravel', command: 'php artisan migrate --env=local', output: true }
			,seed: { cwd: 'src/laravel', command: 'php artisan db:seed --class=BaseSeeder --env=local', output: true }
		}*/

	});

	grunt.registerTask('default',['watch']);

	grunt.registerTask('js',[
		'jshint'
		//,'jscs'
		,'cli:browserify'
		,'uglify'
	]);

	grunt.registerTask('dist',[
		'copy:build'
		,'js'
		,'inject:distmain'
		,'inject:distbower'
		//,'uglify'
		//,'tpl'
		//,'ngAnnotate'
		//,'uglify'
		//,'sass'
		//,'inject:distmainwp'
		//,'inject:distbowerwp'
		//,'htmlmin:dist'
	]);

	grunt.registerTask('distclean',[
		'jshint'
		,'jscs'
		,'clean:dist'
		,'copy:build'
	]);

	grunt.registerTask('prerender',[
		'renderPage'
	]);

	grunt.registerTask('version',[
		'version_git'
	]);
};