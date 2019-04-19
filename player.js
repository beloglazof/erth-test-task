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
  var video = document.getElementById('video');
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
  var currentTimePopUp = document.getElementById('current-time-popup');
  currentTimePopUp.style.visibility = 'hidden';

  player.initialize(video, getVideoUrl('init'), false);

  function syncPlayButtonState(element) {
    if (element.paused) {
      playButton.innerHTML = 'Play';
    } else {
      playButton.innerHTML = 'Pause';
    }
  }

  video.addEventListener('canplay', function() {
    durationElement.innerHTML = video.duration.toHHMMSS();
  });

  video.addEventListener('timeupdate', function() {
    var currentTime = video.currentTime;
    var duration = video.duration;

    currentTimestampElement.innerHTML = currentTime.toHHMMSS();
    currentTimePopUp.innerHTML = currentTime.toHHMMSS();

    var timeValue = (100 / duration) * currentTime;
    seekBar.value = timeValue;
  });

  seekBar.addEventListener('change', function() {
    var time = video.duration * (seekBar.value / 100);
    video.currentTime = time;
  });

  seekBar.addEventListener('focus', function() {
    currentTimePopUp.style.visibility = 'visible';
  });

  playButton.addEventListener('click', function() {
    if (video.paused) {
      video.play();
      syncPlayButtonState(video);
    } else {
      video.pause();

      syncPlayButtonState(video);
    }
  });

  prevButton.addEventListener('click', function() {
    player.attachSource(getVideoUrl('prev'));
    syncPlayButtonState(video);
  });

  nextButton.addEventListener('click', function() {
    player.attachSource(getVideoUrl('next'));
    syncPlayButtonState(video);
  });
};
