var videoList = [
  {
    url: 'http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
    title: 'Video №1',
  },
  {
    url:
      'http://dash.edgesuite.net/dash264/TestCases/1a/sony/SNE_DASH_SD_CASE1A_REVISED.mpd',
    title: 'Video №2',
  },
  {
    url:
      'http://rdmedia.bbc.co.uk/dash/ondemand/testcard/1/client_manifest-events.mpd',
    title: 'Video №3',
  },
];
var videoId = 0;
var video = document.getElementById('video');
var player = dashjs.MediaPlayer().create();
// Header
var currentVideoTitle = document.getElementById('currentVideo');
var nextVideoTitle = document.getElementById('nextVideo');
// Controls
var playButton = document.getElementById('play-pause');
var playIcon = document.getElementById('play-pause-icon');
var prevButton = document.getElementById('prev');
var nextButton = document.getElementById('next');
var backwardButton = document.getElementById('backward');
var fastForwardButton = document.getElementById('fast-forward');
// Slider
var progressBar = document.getElementById('progress-bar');
var currentTimestampElement = document.getElementById('current-timestamp');
var durationElement = document.getElementById('duration');
var thumbPopUp = document.getElementById('thumb-popup');

function dec(num) {
  // console.log(num);
  var result = num - 1;
  return result;
}

function inc(num) {
  var result = num + 1;
  return result;
}

function getVideoId(direction) {
  var fn = {
    prev: dec,
    next: inc,
  };
  var nextId = fn[direction](videoId);

  return nextId;
}

function setPrevButtonState(vidId) {
  if (vidId === 0) {
    prevButton.disabled = true;
    prevButton.blur();
  } else {
    prevButton.disabled = false;
  }
}

function setNextButtonState(vidId) {
  if (vidId === videoList.length - 1) {
    nextButton.disabled = true;
    nextButton.blur();
  } else {
    nextButton.disabled = false;
  }
}

function updateVideoTitles() {
  currentVideoTitle.innerHTML = videoList[videoId].title;
  var nextVideoId = getVideoId('next');
  if (nextVideoId > videoList.length - 1) {
    nextVideoTitle.innerHTML = '...';
  } else {
    nextVideoTitle.innerHTML = videoList[nextVideoId].title;
  }
}

function syncPlayButtonState(element) {
  if (element.paused) {
    playIcon.src = './svg/play.svg';
  } else {
    playIcon.src = './svg/pause.svg';
  }
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

function updateProgress(percent) {
  progressBar.style.backgroundImage =
    'linear-gradient(to right, #ffffff 0%,#ffffff ' +
    percent +
    '%, #343c45 ' +
    percent +
    '%, #343c45 100%)';
  progressBar.value = percent;
}
function init(videoId) {
  currentTimestampElement.innerHTML = Number(0).toHHMMSS();
  player.initialize(video, videoList[videoId].url, true);
  player.setAutoSwitchQualityFor('video', false);
  thumbPopUp.innerHTML = '';
  showControlPanel();
  setPrevButtonState(videoId);
  setNextButtonState(videoId);
  updateVideoTitles();
}

function sum(num1, num2) {
  return Number(num1) + Number(num2);
}

function dif(num1, num2) {
  return num1 - num2;
}

function scrollVideo(direction, percent, seconds = 1) {
  fn = {
    back: dif,
    forward: sum,
  };
  var currentTime = video.currentTime;
  var duration = video.duration;
  if (!percent) {
    percent = Number(((seconds * 100) / duration).toFixed(1));
  }

  var currentPercentOfTime = (currentTime / duration) * 100;
  var step = (percent * duration) / 100;

  var nextPercentOfTime = Number(fn[direction](currentPercentOfTime, percent));
  var nextTime = Number(fn[direction](currentTime, step));

  if (nextTime < 0) {
    currentTimestampElement.innerHTML = Number(0).toHHMMSS();
    // video.currentTime = 0;
    player.seek(0);
  } else if (nextTime > duration) {
    currentTimestampElement.innerHTML = duration.toHHMMSS();
    // video.currentTime = duration;
    player.seek(duration);
  } else {
    currentTimestampElement.innerHTML = nextTime.toHHMMSS();
    // video.currentTime = nextTime;
    player.seek(nextTime);
  }
  updateProgress(nextPercentOfTime);
}

function getNextQuality(current) {
  const qualityList = player.getBitrateInfoListFor('video');
  const maxQuality = qualityList[qualityList.length - 1].qualityIndex;
  if (current === maxQuality) {
    return 0;
  }

  return current + 1;
}

var timerForControlPanelHide;

function showControlPanel() {
  var controlPanelElements = document.getElementsByClassName(
    'player-control-panel'
  );
  for (var element of controlPanelElements) {
    element.classList.remove('hidden');
  }
  if (timerForControlPanelHide) {
    clearTimeout(timerForControlPanelHide);
  }
  timerForControlPanelHide = setTimeout(function() {
    hideControlPanel();
  }, 10000);
}

function hideControlPanel() {
  var controlPanelElements = document.getElementsByClassName(
    'player-control-panel'
  );
  for (var element of controlPanelElements) {
    element.classList.add('hidden');
  }
}

function changeQuality() {
  var currentQuality = player.getQualityFor('video');
  var nextQuality = getNextQuality(currentQuality);
  // console.log(nextQuality);
  player.setQualityFor('video', nextQuality);
}

function goBack() {
  location.pathname = '/';
}

function handleControlKeyDown(key) {
  showControlPanel();
  var elementOnFocus = document.querySelector('*:focus');
  if (!elementOnFocus) {
    playButton.focus();
  }

  switch (key) {
    case 'ArrowLeft':
      if (elementOnFocus) {
        elementOnFocus.previousElementSibling.focus();
      }
      break;
    case 'ArrowRight':
      if (elementOnFocus) {
        elementOnFocus.nextElementSibling.focus();
      }
      break;
    case 'ArrowUp':
      progressBar.focus();
      break;
    case 'ArrowDown':
      playButton.focus();
      break;
  }
}

function goToVideo(dir) {
  videoId = getVideoId(dir);
  player.attachSource(videoList[videoId].url);
  player.preload();
  init(videoId);
}

function updatePopUpPosition(value) {
  var popupBlockWidth = 55;
  var positionOffset =
    Math.round((popupBlockWidth * value) / 100) - popupBlockWidth / 2;
  thumbPopUp.style.left = 'calc(' + value + '% - ' + positionOffset + 'px)';
}

window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'y':
      changeQuality();
      break;
    case 'r':
      goBack();
      break;
    case 'Backspace':
      hideControlPanel();
      break;
    default:
      handleControlKeyDown(event.key);
      return;
  }
});

progressBar.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'ArrowRight':
      scrollVideo('forward');
      break;
    case 'ArrowLeft':
      scrollVideo('back');
      break;
    default:
      break;
  }
});
window.onload = function() {
  init(videoId);

  // video.addEventListener('mouseover', function() {
  //   showControlPanel();
  // });

  // video.addEventListener('mousemove', function() {
  //   showControlPanel();
  // })
  video.addEventListener('ended', function() {
    goToVideo('next');
  });
  video.addEventListener('loadstart', function() {
    updateProgress(0);
  });

  video.addEventListener('canplay', function() {
    durationElement.innerHTML = video.duration.toHHMMSS();
  });

  video.addEventListener('timeupdate', function() {
    var currentTime = video.currentTime;
    var duration = video.duration;

    currentTimestampElement.innerHTML = currentTime.toHHMMSS();
    // currentTimePopUp.innerHTML = currentTime.toHHMMSS();
    if (duration) {
      var percent = ((currentTime / duration) * 100).toFixed(1);
      updateProgress(percent);
    }
  });

  video.addEventListener('play', function() {
    syncPlayButtonState(video);
  });

  video.addEventListener('pause', function() {
    syncPlayButtonState(video);
  });

  progressBar.addEventListener('change', function() {
    var time = video.duration * (this.value / 100);
    video.currentTime = time;
    thumbPopUp.innerHTML = time.toHHMMSS();

    updatePopUpPosition(this.value);
  });

  progressBar.addEventListener('input', function() {
    var time = video.duration * (this.value / 100);

    updatePopUpPosition(this.value);
    thumbPopUp.innerHTML = time.toHHMMSS();
  });

  backwardButton.addEventListener('click', function() {
    scrollVideo('back', 15);
  });
  fastForwardButton.addEventListener('click', function() {
    scrollVideo('forward', 15);
  });

  playButton.addEventListener('click', function() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  prevButton.addEventListener('click', function() {
    goToVideo('prev');
  });

  nextButton.addEventListener('click', function() {
    goToVideo('next');
  });
};
