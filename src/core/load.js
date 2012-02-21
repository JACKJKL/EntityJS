(function(re){
    
    var b = function(assets){
        return new re.load.init(assets);    
    }
    
    b.path = "";
    
    b.imageExt = 'img';
    b.soundExt = 'sfx';
    b.images = ['gif', 'jpg', 'jpeg', 'png'];
    b.sounds = ['wav', 'mp3', 'aac', 'ogg'];
    
    /*
    Loads images, sounds and other files into components.
    
    All loaded assets will be put into a component with a ref to the asset.
    
    //example of loading assets
    re.load('tiles.png add.js attack.mp3')
    .complete(function(arrayOfAssets){
        //create new bitmap of tiles.png
        re.e('bitmap tiles.png');
        
        //new sound
        re.e('sound attack.mp3');
        
        //access image staticaly or localy
        re.comp('tiles.png').image;
        re.entity('tiles.png').image;
        
    })
    .error(function(assetThatCausedError){
        //error
    })
    .progress(function(current, total, assetLoaded){
        //called on loads
    });
    
    @warning only supports loading images and sounds
    
    //load sound
    
    //re.support will return the supported codec
    re.load('run.'+re.support('ogg', 'aac'));
    
    FUTURE remove directories from calls
    
    */
    var l = function(assets){
        
        if(re.is(assets,'string')){
          this.assets = assets.split(' ');
          
        } else if(re.is(assets,'object')){
          this.assets = [];
          for(var i in assets){
            
            if(re.is(assets[i], 'array')){
              this.assets = this.assets.concat(assets[i]);
            }
            
          }
        } else {
          
          this.assets = assets;
        }
        
        var a;
        for(var i=0; i<this.assets.length; i++){
            
            this.total++;
            
            a = this.assets[i];
            
            //copy full source path
            var s = a;
            
            //remove directories
            var d = a.lastIndexOf('/');
            if(d != -1){
                a = a.substr(d+1, a.length);
            }
            
            //find file extension
            var j = a.lastIndexOf('.')+1;
            var ext = a.substr(j).toLowerCase();
            
            //find name
            var n = a.substr(0, j);
            
            if(re.indexOf(re.load.images, ext) != -1){

                this._loadImg(s, a, n);
                
            } else if(re.indexOf(re.load.sounds, ext) != -1){
                
                //check if support component exists first
                if(!re.support || re.support(ext)){
                  //don't load the same sound twice
                  if(re._c[n+re.load.soundExt]){ 
                    //remove from array
                    this.total--;
                    this.assets.splice(i, 1); 
                    continue; 
                  }
                  
                    this._loadSound(s, a, n);
                }
                
            }
            
            
        }
        
        return this;
    }
    
    var p = l.prototype;
    
    p.current = 0;
    p.total = 0;
    
    p._loadImg = function(src, a, n){
        var that = this;
        var img = new Image();
        
        //create new image component
        re.c(a)
        .alias(n+re.load.imageExt)
        .statics({
            image:img
        })
        .defines({
            //save image for other components to copy or use
            _image:img
        });
        
        img.onload = function(){
          re.c(a).defaults({
            sizeX:img.width,
            sizeY:img.height
            })
            .defines('bisect', img.width);
            
          that._loaded();
        };
        
        img.onerror = function(){
            
            if(that._e){
                that._e.call(that, a);
            }
            
        };
        
        img.src = re.load.path+src;
        
        return this;
    };
    
    p._loaded = function(){
      this.current++;
      
      if(this.current <= this.total){
        if(this._p){
            this._p(this.current, this.total, this.assets[this.current-1]);
        }
      }
      if(this.current == this.total){
          if(this._s){
            this._s(this.assets);
          }
        }
    };
    
    p._loadSound = function(src, a, n){
        var that = this;
        
        var s = new Audio(re.load.path+src);
        s.src = re.load.path+src;
        s.preload = "auto";
        s.load();
        
        re.c(a)
        //create statics codec for easy use
        .alias(n+re.load.soundExt)
        .statics({
            sound:s
        })
        .defines({
            _sound:s
        });
        
        //s.addEventListener('load',function(){that._loaded()}, false);
        //called multiple times in firefox
        var f = function(){
          that._loaded();
          //remove after first call
          s.removeEventListener('canplaythrough', f);
          };
          
        s.addEventListener('canplaythrough',f,false);
        
        s.addEventListener('error',function(){
            
            if(that._e){
                that._e.call(that, a);
            }
        },false);
        
    }
    
    p.progress = function(m){
        
        this._p = m;
        
        return this;
    }
    
    p.complete = function(m){
        
        this._s = m;
        
    if(this.assets.length == 0){
      m([]);
    }
    
        return this;
    }
    
    p.error = function(m){
        
        this._e = m;
        
        return this;
    }
    
    re.load = b;
    re.load.init = l;
    
}(re));