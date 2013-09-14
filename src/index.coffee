_ = require 'underscore'
fs = require 'fs'
path = require 'path'
gm = require 'gm'

class SpriteGenerator

	constructor: (options) ->
		@options = _.extend
			images: './images/icons',
			sprites: './images/sprites',
			debug: true
		, options

		@_supportExt = [
			'.png'
		]

		@_sprites = {}
		@_spriteGenerate @options.images
	
	setStylus: (stylus) ->
		@stylus = stylus
		@stylus.on 'end', @_onStylusRender
		@_defineMixins()

	getInstance: ->
		(stylus) =>
			@setStylus stylus
			@

	onReady: (callback) ->
		@onReadyCallback = callback

	_log: (message) ->
		if @options.debug
			console.log message

	_spriteGenerate: (dir) ->
		fs.readdir dir, (err, files) =>
			if err
				@_log err
			else
				files.forEach (file) =>
					fullPath = "#{dir}/#{file}"
					fs.stat fullPath, (err, stats) =>
						if (err)
							@_log err
						else
							if stats.isFile()
								if @_supportExt.indexOf(path.extname file) != -1
									spriteName = file.split('_')[0]
									@_attachImage spriteName, fullPath
							else if stats.isDirectory()
								@_spriteGenerate fullPath

	_attachImage: (spriteName, fileName) ->
		if @_nowAttach
			setTimeout () =>
				@_attachImage spriteName, fileName
		else
			@_nowAttach = true

			pathToSprite = "#{@options.sprites}/#{spriteName}.png"
			pathToImage = "#{process.cwd()}/#{fileName}"
			imageName = path.basename(fileName);
			@_supportExt.forEach (ext) ->
				imageName = imageName.replace ext, ''
			imageName = imageName.replace "#{spriteName}_", ''
			
			if !@_sprites[spriteName]
				@_sprites[spriteName] = {}
				@_sprites[spriteName][imageName] = 
					position: 0
				gm(pathToImage)
					.size pathToSprite, (err, size) =>
						if err
							@_log err
						else
							@_sprites[spriteName][imageName] = 
								position: size.height
						@_checkCallReady()
					.write pathToSprite, (err) =>
						if err
							@_log err
						@_nowAttach = false
						@_checkCallReady()
			else
				gm(pathToSprite)
					.size pathToSprite, (err, size) =>
						if err
							@_log err
						else
							@_sprites[spriteName][imageName] = 
								position: size.height
						@_checkCallReady()
					.append(pathToImage)
					.write pathToSprite, (err) =>
						if err
							@_log err
						@_nowAttach = false

	_checkCallReady: ->
		clearTimeout @_timerReady
		@_timerReady = setTimeout () =>
			@onReadyCallback()
		, 200

	_onStylusRender: (css, callback) =>
		console.log css
		callback null, css.replace(/'{{SPRITE:([./a-zA-Z]*)POSITION:(\d+)}}'/g, 'background-image: url("$1");\nbackground-position:0 $2px')

	_defineMixins: ->
		@stylus.define 'sprite', (sprite, image) =>
			if @_sprites[sprite] && @_sprites[sprite][image]
				"{{SPRITE:#{@options.sprites}/#{sprite}.pngPOSITION:#{@_sprites[sprite][image].position}}}"
			else 
				'{{NOT_FOUND}}'
			

			# @_sprites[sprite][image].position

module.exports = SpriteGenerator
# module.exports = (options) ->
# 	spriteGenerator = new SpriteGenerator options
# 	(stylus) ->
# 		spriteGenerator.setStylus stylus
# 		spriteGenerator