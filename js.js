
(function() {

if(!(!!window.addEventListener || !!document.querySelector)) {
  alert('Please use a more modern browser.');
  return; 
}

var $ = document.querySelector.bind(document);
Element.prototype.on = Element.prototype.addEventListener;

function show(el) {
  el.style.display = 'block';
};
function hide(el) {
  el.style.display = 'none';
};

function accuTimer(length, resolution, oninstance, oncomplete) {
  var steps = (length / 100) * (resolution / 10),
    speed = length / steps,
    count = 0,
    start = new Date().getTime();

  function instance() {
    if(count++ == steps) {
      oncomplete(steps, count);
    } else {
      oninstance(steps, count);

      var diff = (new Date().getTime() - start) - (count * speed);
      window.setTimeout(instance, (speed - diff));
    }
  }

  window.setTimeout(instance, speed);
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var app = {

  accuracy: 100,
  activeSquare: null,
  hits: 0,
  isLevelStarted: false,
  misses: 0,
  now: 0.0,
  squareSize: 0,

  settings: {
    activeColor: 'orange',
    barHeight: 40,
    margin: 10,
    columns: 3,
    rows: 3,
    margins: 5,
    levelLength: 10.0,
    squareColor: 'grey',
  },

  squares: $('.squares'),
  border: $('.border'),
  timer: $('.timer'),

  fillSettingsInputs: function() {
    $('.columns-input').value = this.settings.columns;
    $('.rows-input').value = this.settings.rows;
    $('.margins-input').value = this.settings.margins;
  },

  highlightRandomSquare: function() {
    var col = getRandomInt(0, this.settings.columns - 1),
      row = getRandomInt(0, this.settings.rows - 1),
      square = $('.squares .x' + col + 'y' + row);
    if(square === this.activeSquare) { 
      this.highlightRandomSquare(); 
      return; 
    }
    square.classList.remove('transition');
    square.classList.add('active');
    // square.style.backgroundColor = this.settings.activeColor;
    this.activeSquare = square;
  },

  updateAccuracy: function() {
    this.accuracy = this.hits / (this.hits + this.misses) * 100;
    $('.accuracy').innerText = parseInt(this.accuracy) + '%';
  },

  squareClicked: function(event) {
    var 
      self = this,
      activeSquare = this.activeSquare,
      el = event.target,
      isHit = el === activeSquare;
    el.classList.remove('transition');
    if(isHit) {
      this.hits++ 
      el.classList.remove('active');
      el.classList.add('hit');
    } else { 
      this.misses++;
      el.classList.add('miss');
      activeSquare.classList.remove('active');
    }
    this.updateAccuracy();

    var forceRedraw = el.offsetWidth;  // hax
    el.classList.add('transition');
    if(isHit) {
      el.classList.remove('hit');
    } else {
      el.classList.remove('miss');
    }
    this.highlightRandomSquare();
  },

  resize: function() {
    var squares = this.squares,
    border = this.border;

    while(squares.firstChild) {
      squares.removeChild(squares.firstChild);
    }

    /*
    +---------+---------+  ------------+
    |         |         |  barHeight   |
    |---------|---------|  ---+        |
    |         |         |  margin      |
    |     +---|---+     |  ----+       |
    |     |   |   |     |  halfHeight  winHeight
    +---------+---------+  ----+       |
    |     |   |   |     |              |
    |     +---|---+     |              |
    |         |         |              |
    |         |         |              |
    |         |         |              |
    +---------+---------+  ------------+
              |---+ halfWidth    
                  +-----+ margin
    +-----winWidth------+
    */

    var 
    winWidth = window.innerWidth,
    winHeight = window.innerHeight, 
    isPortrait = winWidth < winHeight,
    halfHeight = winHeight / 2 - this.settings.barHeight - this.settings.margin,
    halfWidth = winWidth / 2 - this.settings.margin,
    squaresSide = halfHeight < halfWidth ? halfHeight : halfWidth;
    squaresSide *= 2;
    squaresSide += 'px';
    this.border.style.height = squaresSide;
    this.border.style.width = squaresSide;
    $('.bar').style.width = squaresSide;

    squaresWidth = squares.offsetWidth,
    squaresHeight = squares.offsetHeight,
    squareWidth = squaresWidth / this.settings.columns,
    squareHeight = squaresHeight / this.settings.rows;

    for (x = 0; x < this.settings.columns; x++) { 
      for (y = 0; y < this.settings.rows; y++) { 
        div = document.createElement('div'); 
        div.className = 'x' + x + 'y' + y + ' square';
        div.style.left = x * squareWidth + 'px';
        div.style.bottom = y * squareHeight + 'px';
        var 
          squareInnerWidth = squareWidth - (this.settings.margins * 2);
          squareInnerHeight = squareHeight - (this.settings.margins * 2);
        this.squareSize = squareInnerWidth * squareInnerHeight;
        div.style.width = squareInnerWidth + 'px';
        div.style.height = squareInnerHeight + 'px';
        div.style.margin = this.settings.margins + 'px';
        squares.appendChild(div);

        var self = this;
        div.on('click', function(e) {
          console.log('click');
          if(self.isLevelStarted) {
            self.squareClicked(e);
          }
          e.stopPropagation();
        });
      }
    }

  },

  menuBinds: function() {
    var self = this;
    // $('.settings-btn').on('click', function() {
    //   show($('.settings'));
    //   self.fillSettingsInputs();
    // });
    $('.settings-hide').on('click', function() {
      hide($('.settings'));
    });
    $('.play-btn').on('click', function() {
      hide($('.menu'));
      hide($('.settings'));
      show($('.bar'));
      show($('.border'));
      self.play();
    });

    window.onresize = function() {
      self.resize();
    };
  },

  keyBinds: function() {
    document.onkeypress = function(e) {
      e = e || window.event;
      console.log('keypress ', e);
      if(e.keyCode == 32) { // space
        // this.pause();
      }
    };  
  },

  ready: function() {
    this.menuBinds();
    // this.keyBinds();
  },

  endLevel: function() {
    this.isLevelStarted = false;
    hide($('.bar'));
    hide($('.border'));
    show($('.results'));
    $('.end-square-size').innerText = 
      'Square size: ' + parseInt(this.squareSize) + ' pixels';
    $('.end-hit-miss').innerText = 
      'Hits: ' + this.hits + ' / Misses: ' + this.misses;
    $('.end-accuracy').innerText = 
      'Accuracy: ' + this.accuracy.toFixed(2) + '%';
  },

  startLevel: function() {
    var self = this,
    timer = this.timer;
    this.now = this.settings.levelLength,
    this.isLevelStarted = true;

    accuTimer(10000, 100, function(steps) {
      self.now = self.now - (10 / steps);
      timer.innerText = self.now.toFixed(2);
    }, function() {
      timer.innerText = '0.0';
      self.endLevel();
    });    

    this.highlightRandomSquare();
  },

  countDown: function() {
    var self = this,
    timer = this.timer;
    timer.innerText = 3;
    setTimeout(function(){ timer.innerText = 2; }, 1000);
    setTimeout(function(){ timer.innerText = 1; }, 2000);
    setTimeout(function(){ self.startLevel(); }, 3000);
  },

  play: function() {
    this.resize();
    this.countDown();

    var self = this;
    $('.squares').on('click', function() {
      if(self.isLevelStarted) {
        self.misses++;
        self.updateAccuracy();
      }
    });
  },

  init: function() {
    var self = this;
    document.addEventListener('DOMContentLoaded', function() {
      self.ready();
    }, false);
  }

};
app.init();
})();
