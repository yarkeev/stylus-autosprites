// Generated by CoffeeScript 1.6.3
var SpriteGenerator, fs, gm, path, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

_ = require('underscore');

fs = require('fs');

path = require('path');

gm = require('gm');

SpriteGenerator = (function() {
  function SpriteGenerator(options) {
    this._onStylusRender = __bind(this._onStylusRender, this);
    this.options = _.extend({
      images: './images/icons',
      sprites: './images/sprites',
      url: '/images/sprites/',
      debug: true
    }, options);
    this._supportExt = ['.png'];
    this._sprites = {};
    this._spriteGenerate(this.options.images);
  }

  SpriteGenerator.prototype.setStylus = function(stylus) {
    this.stylus = stylus;
    this.stylus.on('end', this._onStylusRender);
    return this._defineMixins();
  };

  SpriteGenerator.prototype.getInstance = function() {
    var _this = this;
    return function(stylus) {
      _this.setStylus(stylus);
      return _this;
    };
  };

  SpriteGenerator.prototype.onReady = function(callback) {
    if (!this._readyState) {
      return this.onReadyCallback = callback;
    } else {
      return callback();
    }
  };

  SpriteGenerator.prototype._log = function(message) {
    if (this.options.debug) {
      return console.log(message);
    }
  };

  SpriteGenerator.prototype._spriteGenerate = function(dir) {
    var _this = this;
    return fs.readdir(dir, function(err, files) {
      if (err) {
        return _this._log(err);
      } else {
        return files.forEach(function(file) {
          var fullPath;
          fullPath = "" + dir + "/" + file;
          return fs.stat(fullPath, function(err, stats) {
            var spriteName;
            if (err) {
              return _this._log(err);
            } else {
              if (stats.isFile()) {
                if (_this._supportExt.indexOf(path.extname(file)) !== -1) {
                  spriteName = file.split('_')[0];
                  return _this._attachImage(spriteName, fullPath);
                }
              } else if (stats.isDirectory()) {
                return _this._spriteGenerate(fullPath);
              }
            }
          });
        });
      }
    });
  };

  SpriteGenerator.prototype._attachImage = function(spriteName, fileName) {
    var imageName, pathToImage, pathToSprite,
      _this = this;
    if (this._nowAttach) {
      return setTimeout(function() {
        return _this._attachImage(spriteName, fileName);
      });
    } else {
      this._nowAttach = true;
      pathToSprite = "" + this.options.sprites + "/" + spriteName + ".png";
      pathToImage = "" + (process.cwd()) + "/" + fileName;
      imageName = path.basename(fileName);
      this._supportExt.forEach(function(ext) {
        return imageName = imageName.replace(ext, '');
      });
      imageName = imageName.replace("" + spriteName + "_", '');
      if (!this._sprites[spriteName]) {
        this._sprites[spriteName] = {};
        this._sprites[spriteName][imageName] = {
          position: 0
        };
        return gm(pathToImage).size(pathToSprite, function(err, size) {
          if (err) {
            _this._log(err);
          } else {
            _this._sprites[spriteName][imageName] = {
              position: size.height
            };
          }
          return _this._checkCallReady();
        }).write(pathToSprite, function(err) {
          if (err) {
            _this._log(err);
          }
          _this._nowAttach = false;
          return _this._checkCallReady();
        });
      } else {
        return gm(pathToSprite).size(pathToSprite, function(err, size) {
          if (err) {
            _this._log(err);
          } else {
            _this._sprites[spriteName][imageName] = {
              position: size.height
            };
          }
          return _this._checkCallReady();
        }).append(pathToImage).write(pathToSprite, function(err) {
          if (err) {
            _this._log(err);
          }
          return _this._nowAttach = false;
        });
      }
    }
  };

  SpriteGenerator.prototype._checkCallReady = function() {
    var _this = this;
    clearTimeout(this._timerReady);
    return this._timerReady = setTimeout(function() {
      _this.onReadyCallback && _this.onReadyCallback();
      return _this._readyState = true;
    }, 200);
  };

  SpriteGenerator.prototype._onStylusRender = function(css, callback) {
    var cssString;
    cssString = css.replace(/'{{NOT_FOUND}}'/g, '');
    cssString = cssString.replace(/'{{SPRITE:([./a-zA-Z]*)POSITION:(\d+)}}'/g, 'background-image: url($1);\nbackground-position:0 $2px');
    return callback(null, cssString);
  };

  SpriteGenerator.prototype._defineMixins = function() {
    var _this = this;
    return this.stylus.define('sprite', function(sprite, image) {
      if (_this._sprites[sprite] && _this._sprites[sprite][image]) {
        return "{{SPRITE:" + _this.options.url + "/" + sprite + ".pngPOSITION:" + _this._sprites[sprite][image].position + "}}";
      } else {
        return '{{NOT_FOUND}}';
      }
    });
  };

  return SpriteGenerator;

})();

module.exports = SpriteGenerator;
