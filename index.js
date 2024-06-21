let player;
let captions = [];
let captionDiv;

function loadAndPlayVideo() {
  const url = document.getElementById("videoUrl").value;
  const videoId = extractVideoId(url);

  if (!videoId) {
    alert("Please enter a valid YouTube URL");
    return;
  }

  if (player) {
    player.loadVideoById(videoId);
  } else {
    player = new YT.Player("player", {
      height: "390",
      width: "640",
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  }

  displayCaptions();
}

function onPlayerReady(event) {
  captionDiv = document.createElement("div");
  captionDiv.id = "captionDiv";
  captionDiv.classList.add("caption-box");
  document.getElementById("videoContainer").appendChild(captionDiv);
  event.target.playVideo();
  setInterval(syncCaptions, 500);
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    syncCaptions();
  }
}

function extractVideoId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^&]+)/;
  const matches = url.match(regex);
  return matches ? matches[1] || matches[2] : null;
}

function addCaption() {
  const captionText = document.getElementById("captionText").value;
  const timestamp = document.getElementById("timestamp").value;

  if (!captionText || !timestamp) {
    alert("Please enter both caption text and timestamp");
    return;
  }

  if (!isValidTimestamp(timestamp)) {
    alert("Please enter a valid timestamp (hh:mm:ss)");
    return;
  }

  captions.push({ text: captionText, timestamp: timestamp });
  displayCaptions();

  // Clear input fields after adding caption
  document.getElementById("captionText").value = "";
  document.getElementById("timestamp").value = "";
}

function isValidTimestamp(timestamp) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return regex.test(timestamp);
}

function displayCaptions() {
  const captionsContainer = document.getElementById("captions-list");
  captionsContainer.innerHTML = "";
  captions.forEach((caption, index) => {
    captionsContainer.innerHTML += `
      <div class="caption">
        <p>${caption.timestamp} - ${caption.text}</p>
        <button onclick="removeCaption(${index})">Remove</button>
      </div>
    `;
  });
}

function removeCaption(index) {
  captions.splice(index, 1);
  displayCaptions();
}

function syncCaptions() {
  const currentTime = player.getCurrentTime();
  const currentCaption = captions.find(
    (caption) =>
      currentTime >= parseTimestamp(caption.timestamp) &&
      currentTime < parseTimestamp(caption.timestamp) + 3
  );

  if (currentCaption) {
    captionDiv.innerText = currentCaption.text;
    captionDiv.style.display = "block";
  } else {
    captionDiv.style.display = "none";
  }
}

function parseTimestamp(timestamp) {
  const parts = timestamp.split(":");
  let seconds = 0;
  for (let i = 0; i < parts.length; i++) {
    seconds = seconds * 60 + parseInt(parts[i], 10);
  }
  return seconds;
}
