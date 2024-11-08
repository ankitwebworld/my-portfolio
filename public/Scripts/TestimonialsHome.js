let slideIndex = 0;
let slideIndex2 = 0;
let slideshowInterval;

function startSlideshow(slideshowFunction, interval) {
  slideshowInterval = setInterval(slideshowFunction, interval);
}

function pauseSlideshow() {
  clearInterval(slideshowInterval);
}

function showSlides() {
  // ... (unchanged)
}

function showSlides2() {
  // ... (unchanged)
}

// Event listeners for dot clicks
const dotElements = document.getElementsByClassName("dot");
for (let i = 0; i < dotElements.length; i++) {
  dotElements[i].addEventListener("click", function () {
    slideIndex = i;
    showSlides();
  });
}

const dotElements2 = document.getElementsByClassName("dot2");
for (let i = 0; i < dotElements2.length; i++) {
  dotElements2[i].addEventListener("click", function () {
    slideIndex2 = i;
    showSlides2();
  });
}

// Touch event listeners for project info
const projectInfos = document.getElementsByClassName("project-info");
for (let i = 0; i < projectInfos.length; i++) {
  projectInfos[i].addEventListener("touchstart", pauseSlideshow);
  projectInfos[i].addEventListener("touchend", function () {
    if (i === 1) {
      startSlideshow(showSlides2, 3000);
    }
  });
}

// Initial start of the slideshow
startSlideshow(showSlides, 5000);
// startSlideshow(showSlides2, 3000);


