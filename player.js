var videoList = [
  'http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
  'http://dash.edgesuite.net/dash264/TestCases/1a/sony/SNE_DASH_SD_CASE1A_REVISED.mpd',
  'http://rdmedia.bbc.co.uk/dash/ondemand/testcard/1/client_manifest-events.mpd',
];

function dec(num) {
  // console.log(num);
  var result = num - 1;
  return result;
}

function inc(num) {
  var result = num + 1;
  return result;
}

var videoId = 0;
function getVideoUrl(direction) {
  var fn = {
    prev: dec,
    next: inc,
  };

  if (direction !== 'init') {
    var nextId = fn[direction](videoId);
    videoId = nextId;
  }

  if (videoId > videoList.length - 1) {
    videoId = 0;
  }

  if (videoId < 0) {
    videoId = videoList.length - 1;
  }

  return videoList[videoId];
}

Number.prototype.toHHMMSS = function() {
  var sec_num = parseInt(this, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  return hours + ':' + minutes + ':' + seconds;
};

window.onload = function() {
  var videoElement = document.getElementById('video');
  var player = dashjs.MediaPlayer().create();
  // Controls
  var playButton = document.getElementById('play-pause');
  var prevButton = document.getElementById('prev');
  var nextButton = document.getElementById('next');
  var backwardButton = document.getElementById('backward');
  var fastForwardButton = document.getElementById('fast-forward');
  // Slider
  var seekBar = document.getElementById('seek-bar');
  var currentTimestampElement = document.getElementById('current-timestamp');
  currentTimestampElement.innerHTML = Number(0).toHHMMSS();
  var durationElement = document.getElementById('duration');

  player.initialize(videoElement, getVideoUrl('init'), false);

  function syncPlayButtonState(element) {
    if (element.paused) {
      playButton.innerHTML = 'Play';
    } else {
      playButton.innerHTML = 'Pause';
    }
  }

  // var playPromise = videoElement.play();

  // if (playPromise !== undefined) {
  //   playPromise
  //     .then(_ => {
  //       console.log('success autoplay');
  //     })
  //     .catch(err => {
  //       console.error(err);
  //     });
  // }

  videoElement.addEventListener('canplay', function() {
    durationElement.innerHTML = videoElement.duration.toHHMMSS();
  });

  videoElement.addEventListener('timeupdate', function() {
    currentTimestampElement.innerHTML = videoElement.currentTime.toHHMMSS();
  });

  playButton.addEventListener('click', function() {
    if (videoElement.paused) {
      videoElement.play();
      syncPlayButtonState(videoElement);
    } else {
      videoElement.pause();

      syncPlayButtonState(videoElement);
    }
  });

  prevButton.addEventListener('click', function() {
    player.attachSource(getVideoUrl('prev'));
    syncPlayButtonState(videoElement);
  });

  nextButton.addEventListener('click', function() {
    player.attachSource(getVideoUrl('next'));
    syncPlayButtonState(videoElement);
  });
};
