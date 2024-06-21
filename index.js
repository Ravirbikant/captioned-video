let player;
let captions = [];
let captionDiv;

function loadAndPlayVideo() {
  const url = document.getElementById("videoUrl").value;
  const captionText = document.getElementById("captionText").value;
  const timestamp = document.getElementById("timestamp").value;

  if (!url) {
    alert("Please enter a YouTube URL");
    return;
  }

  if (!captionText || !timestamp) {
    alert("Please enter both caption text and timestamp");
    return;
  }

  const videoId = extractVideoId(url);
  if (videoId) {
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
    addCaption(captionText, timestamp);
  } else {
    alert("Invalid YouTube URL");
  }
}

function onPlayerReady(event) {
  captionDiv = document.createElement("div");
  captionDiv.id = "captionDiv";
  captionDiv.style.position = "absolute";
  captionDiv.style.bottom = "50px";
  captionDiv.style.left = "50%";
  captionDiv.style.transform = "translateX(-50%)";
  captionDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  captionDiv.style.color = "white";
  captionDiv.style.padding = "10px";
  captionDiv.style.borderRadius = "5px";
  captionDiv.style.display = "none";
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

function addCaption(text, timestamp) {
  if (text && timestamp) {
    captions.push({ text, timestamp });
    displayCaptions();
  }
}

function displayCaptions() {
  const captionsContainer = document.getElementById("captions");
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
  captions.forEach((caption) => {
    if (
      currentTime >= parseTimestamp(caption.timestamp) &&
      currentTime < parseTimestamp(caption.timestamp) + 3
    ) {
      captionDiv.innerText = caption.text;
      captionDiv.style.display = "block";
    } else if (currentTime >= parseTimestamp(caption.timestamp) + 3) {
      captionDiv.style.display = "none";
    }
  });
}

function parseTimestamp(timestamp) {
  const parts = timestamp.split(":");
  let seconds = 0;
  for (let i = 0; i < parts.length; i++) {
    seconds = seconds * 60 + parseInt(parts[i], 10);
  }
  return seconds;
}
