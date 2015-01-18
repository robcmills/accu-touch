
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

  levelIsStarted: false,
  now: 0.0,
  hits: 0,
  misses: 0,
  accuracy: 100,
  squareSize: 0,

  settings: {
    columns: 3,
    rows: 3,
    margins: 5,
    levelLength: 10.0
  },

  fillSettingsInputs: function() {
    $('.columns-input').value = this.settings.columns;
    $('.rows-input').value = this.settings.rows;
    $('.margins-input').value = this.settings.margins;
  },

  highlightRandomSquare: function() {
    var col = getRandomInt(0, this.settings.columns - 1),
      row = getRandomInt(0, this.settings.rows - 1),
      square = $('.x' + col + 'y' + row);
    square.classList.remove('transition');
    square.style.backgroundColor = 'blue';
    square.classList.add('active');
  },

  updateAccuracy: function() {
    this.accuracy = this.hits / (this.hits + this.misses) * 100;
    $('.accuracy').innerText = parseInt(this.accuracy) + '%';
  },

  squareClicked: function(event) {
    var 
      el = event.target,
      isHit = el.classList.contains('active'),
      active;
    el.classList.remove('transition');
    if(isHit) {
      this.hits++;
      el.classList.remove('active');
    } else {
      this.misses++;
      active = $('.square.active');
      active.classList.remove('transition');
      active.classList.remove('active');
    }
    el.style.backgroundColor = isHit ? 'green' : 'red';
    this.updateAccuracy();
    setTimeout(function() {
      el.classList.add('transition');
      el.style.backgroundColor = 'lightgrey';
      if(!isHit) {
        active.classList.add('transition');
        active.style.backgroundColor = 'lightgrey';
      }
    }, 10);
    this.highlightRandomSquare();
  },

  resize: function() {
    var squares = $('.squares'),
    border = $('.border');

    while(squares.firstChild) {
      squares.removeChild(squares.firstChild);
    }

    border.style.padding = this.settings.margins + 'px';
    border.style.height = 
      $('body').offsetHeight - $('.bar').offsetHeight + 'px';

    var 
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
          if(self.levelIsStarted) {
            self.squareClicked(e);
          }
          e.stopPropagation();
        });
        div.on('touchstart', function(e) {
          if(self.levelIsStarted) {
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
      show($('.squares'));
      self.play();
    });

    window.onresize = function() {
      self.resize();
    };
  },

  ready: function() {
    this.menuBinds();
  },

  endLevel: function() {
    this.levelIsStarted = false;
    hide($('.bar'));
    hide($('.border'));
    show($('.results'));
    $('.end-square-size').innerText = 
      'Square size: ' + parseInt(this.squareSize) + ' pixels';
    $('.end-hit-miss').innerText = 
      'Hits: ' + this.hits + ' / Misses: ' + this.misses;
    $('.end-accuracy').innerText = 
      'Accuracy: ' + parseInt(this.accuracy) + '%';
  },

  startLevel: function() {
    var self = this,
    timer = $('.time');
    this.now = this.settings.levelLength,
    this.levelIsStarted = true;

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
    timer = $('.time');
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
      if(self.levelIsStarted) {
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
