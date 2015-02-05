
// (function() {

if(!(!!window.addEventListener || !!document.querySelector)) {
  alert('Please use a more modern browser.');
  // return; 
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
  activeLevel: 0,
  activeSquare: null,
  hits: 0,
  isLevelStarted: false,
  misses: 0,
  now: 0.0,
  squareSize: 0,
  totalHits: 0,
  totalMisses: 0,

  settings: {
    activeColor: 'orange',
    barHeight: 40,
    margin: 10,
    squareColor: 'grey',
  },

  levels: [
    {num: 1, columns: 2, rows: 2, margins: 10, timeLength: 10.0},
    {num: 2, columns: 4, rows: 4, margins: 10, timeLength: 20.0},
    {num: 3, columns: 8, rows: 8, margins: 10, timeLength: 40.0},
    {num: 4, columns: 10, rows: 10, margins: 5, timeLength: 60.0},
    {num: 5, columns: 15, rows: 15, margins: 5, timeLength: 60.0},
  ],

  squares: $('.squares'),
  border: $('.border'),
  timer: $('.timer'),

  // fillSettingsInputs: function() {
  //   $('.columns-input').value = this.settings.columns;
  //   $('.rows-input').value = this.settings.rows;
  //   $('.margins-input').value = this.settings.margins;
  // },

  activateRandomSquare: function() {
    var 
      columns = this.levels[this.activeLevel].columns,
      rows = this.levels[this.activeLevel].rows,
      col = getRandomInt(0, columns - 1),
      row = getRandomInt(0, rows - 1),
      square = $('.squares .x' + col + 'y' + row);
    if(square === this.activeSquare) { 
      this.activateRandomSquare(); 
      return; 
    }
    square.classList.remove('transition');
    square.classList.add('active');
    this.activeSquare = square;
  },

  updateAccuracy: function() {
    if(this.hits || this.misses) {
      this.accuracy = this.hits / (this.hits + this.misses) * 100;
      $('.accuracy').innerText = parseInt(this.accuracy) + '%';
      show($('.accuracy'));
    } else {
      hide($('.accuracy'));
    }
  },
  updateLevel: function() {
    $('.level').innerText = this.activeLevel + 1 + '/' + this.levels.length;
  },

  squareClicked: function(event) {
    var 
      self = this,
      activeSquare = this.activeSquare,
      el = event.target,
      isHit = el === activeSquare;
    el.classList.remove('transition');
    if(isHit) {
      this.hits++;
      this.totalHits++;
      el.classList.remove('active');
      el.classList.add('hit');
    } else { 
      this.misses++;
      this.totalMisses++;
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
    this.activateRandomSquare();
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
    activeLevel = this.levels[this.activeLevel],
    margins = activeLevel.margins,
    winWidth = window.innerWidth,
    winHeight = window.innerHeight, 
    isPortrait = winWidth < winHeight,
    halfHeight = winHeight / 2 - this.settings.barHeight - margins,
    halfWidth = winWidth / 2 - margins,
    squaresSide = halfHeight < halfWidth ? halfHeight : halfWidth;
    squaresSide *= 2;
    squaresSide += 'px';
    this.border.style.height = squaresSide;
    this.border.style.width = squaresSide;
    $('.bar').style.width = squaresSide;

    squaresWidth = squares.offsetWidth,
    squaresHeight = squares.offsetHeight,
    columns = activeLevel.columns,
    rows = activeLevel.rows,
    squareWidth = squaresWidth / columns,
    squareHeight = squaresHeight / rows;

    for (x = 0; x < columns; x++) { 
      for (y = 0; y < rows; y++) { 
        div = document.createElement('div'); 
        div.className = 'x' + x + 'y' + y + ' square';
        div.style.left = x * squareWidth + 'px';
        div.style.bottom = y * squareHeight + 'px';
        var 
          squareInnerWidth = squareWidth - (margins * 2);
          squareInnerHeight = squareHeight - (margins * 2);
        this.squareSize = squareInnerWidth * squareInnerHeight;
        div.style.width = squareInnerWidth + 'px';
        div.style.height = squareInnerHeight + 'px';
        div.style.margin = margins + 'px';
        squares.appendChild(div);

        var self = this;
        div.on('click', function(e) {
          if(self.isLevelStarted) {
            self.squareClicked(e);
          }
          e.stopPropagation();
        });
      }
    }

  },

  endGame: function() {
    hide($('.results .title'));
    hide($('.results .stats'));
    hide($('.results .next'));
    $('.gold-star .msg').innerHTML = 'Thanks for participating in this ' +
      'experiment.<br>For your efforts here is a gold star:'
    show($('.gold-star'));
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

  playBinds: function() {
    var self = this;
    $('.squares').on('click', function() {
      if(self.isLevelStarted) {
        var active = self.activeSquare;
        self.misses++;
        self.totalMisses++;
        active.classList.remove('transition');
        active.classList.remove('active');
        active.classList.add('miss');
        self.updateAccuracy();

        var forceRedraw = active.offsetWidth;  // hax
        active.classList.add('transition');
        active.classList.remove('miss');
        self.activateRandomSquare();
      }
    });
    $('.results .next').on('click', function() {
      self.activeLevel++;
      if(self.activeLevel >= self.levels.length){
        self.endGame();
      } else {
        self.play();
      }
    });
  },

  ready: function() {
    this.menuBinds();
    this.playBinds();
    // this.keyBinds();
  },

  endLevel: function() {
    this.isLevelStarted = false;
    hide($('.bar'));
    hide($('.border'));
    hide($('.results .next'));
    show($('.results'));
    $('.end-level').innerText = 'Level: ' + 
      (this.activeLevel + 1) + '/' + this.levels.length;
    $('.end-square-size').innerText = 
      'Square size: ' + parseInt(this.squareSize) + ' pixels';
    $('.end-hit-miss').innerText = 
      'Hits: ' + this.hits + ' / Misses: ' + this.misses;
    $('.end-accuracy').innerText = 
      'Accuracy: ' + this.accuracy.toFixed(2) + '%';
    setTimeout(function() {
      show($('.results .next'));
    }, 1000);
  },

  startLevel: function() {
    var 
      self = this,
      timer = this.timer;
      level = this.levels[this.activeLevel],
      length = level.timeLength * 1000;
    this.now = level.timeLength;
    this.isLevelStarted = true;

    accuTimer(length, 100, function(steps, count) {
      self.now = (length - (length / steps * count)) / 1000;
      timer.innerText = self.now.toFixed(2);
    }, function() {
      timer.innerText = '0.0';
      self.endLevel();
    });    

    this.activateRandomSquare();
  },

  countDown: function() {
    var self = this,
    timer = this.timer;
    timer.innerText = 3;
    setTimeout(function(){ timer.innerText = 2; }, 1000);
    setTimeout(function(){ timer.innerText = 1; }, 2000);
    setTimeout(function(){ self.startLevel(); }, 3000);
  },

  resetLevel: function() {
    this.accuracy = 100;
    this.hits = 0;
    this.misses = 0;
    this.resize();
    this.updateLevel();
    this.updateAccuracy();
  },

  play: function() {
    hide($('.menu'));
    hide($('.settings'));
    hide($('.results'));
    show($('.bar'));
    show($('.border'));

    this.resetLevel();
    this.countDown();
  },

  init: function() {
    var self = this;
    document.addEventListener('DOMContentLoaded', function() {
      self.ready();
    }, false);
  }

};
app.init();
// })();
