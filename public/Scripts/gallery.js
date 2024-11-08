document.addEventListener("DOMContentLoaded", (e) => {
    const url = "/education/get-gallery-img";
    const slidingWindow = document.querySelector('.sliding-image-window');

    fetch(url, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data && !data.error) {
            const galleryContainer = document.querySelector('.gallery-container');
            galleryContainer.innerHTML = showGallery(data);
            slide(slidingWindow);
            bottomAllImages(data)
        } else if (data.error) {
            const text = document.createElement('p');
            text.classList.add('message');
            text.textContent = data.error;
            slidingWindow.appendChild(text);
        } else {
            console.error('Invalid data received:', data);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
});




function showGallery(data) {
    let html = '';
    data.forEach(item => {
        html += `
        <div class="gallery-item">
            <div class="post">
            <div class="head">
                <h2>${item.galleryName}</h2> 

                <p class="date-time">${formatDateTime(item.date)}</p>
            </div>
                <img src="/get-drive-image/${item.fileId}" alt="${item.galleryName}">
                <p class='description'>${item.description}</p>
            </div>
        </div>`;
    });
    return html;
}
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
}
function slide(slidingWindow) {
    const galleryContainer = document.querySelector('.gallery-container');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryWidth = galleryItems[0].offsetWidth;
    let currentIndex = 0;
    let timer; 

    function slideGallery(direction) {
        if (direction === 'prev') {
            currentIndex = Math.max(currentIndex - 1, 0);
        } else if (direction === 'next') {
            currentIndex = (currentIndex + 1) % galleryItems.length; 
        }

       clearInterval(timer);
        timer = setInterval(() => slideGallery('next'), 3000);
        galleryContainer.style.transform = `translateX(-${currentIndex * galleryWidth}px)`;
    }

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    prevButton.addEventListener('click', () => slideGallery('prev'));
    nextButton.addEventListener('click', () => slideGallery('next'));

    // Start auto-sliding
    timer = setInterval(() => slideGallery('next'), 3000); // Auto-slide every 3 seconds
}

function bottomAllImages(data) {
    const container = document.querySelector('.bottom-all-images');
    container.innerHTML = ''; // Clear previous content

    data.forEach(item => {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        const image = document.createElement('img');
        image.src = `/get-drive-image/${item.fileId}`;
        image.alt = item.galleryName;

        const caption = document.createElement('p');
        caption.textContent = item.galleryName;

        imageContainer.appendChild(image);
        imageContainer.appendChild(caption);
        container.appendChild(imageContainer);
    });
}

// document.addEventListener('contextmenu', event => event.preventDefault());