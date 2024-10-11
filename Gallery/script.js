// Unified Script

// Elements for the image list and slider functionality
const imageList = document.querySelector('.image-list');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const captionText = document.getElementById('caption');
const closeBtn = document.querySelector('.close');
const images = document.querySelectorAll('.slider-image');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const radioButtons = document.querySelectorAll('input[name="galleryOption"]');
const showMoreBtn = document.getElementById('showMoreBtn');
const prevBtn = document.getElementById('prevBtn');

// Variables for slider and Unsplash API
let page = 1;
let keyword = 'nature';
const key = 'HbRqajqKK1WJQvN4WkB6dYSAaEkESjRl-V83ncALdlU'; // Unsplash API key
let currentIndex = 0;
let autoSlide;

// Fetch images from the Unsplash API
async function ImageApi(clear = true) {
    if (page > 4) {
        alert('You have reached the maximum page limit!');
        return;
    }

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${key}&per_page=9`;
    const response = await fetch(url);
    const data = await response.json();

    if (clear) {
        imageList.innerHTML = '';
    }

    data.results.forEach((result) => {
        const image = document.createElement('img');
        image.src = result.urls.small;

        image.addEventListener('click', () => {
            openModal(result.urls.full, result.alt_description);
        });

        imageList.appendChild(image);
    });
}

// Modal functionality
function openModal(src, alt) {
    modal.style.display = 'block';
    modalImg.src = src;
    captionText.innerHTML = alt;
}

// Close modal functionality
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Show more images
showMoreBtn.addEventListener('click', async () => {
    if (page < 4) {
        page++;
        currentIndex++;
        updateSelection(currentIndex);
        await ImageApi(false);
    } else {
        alert('You have reached the maximum page limit!');
    }
});

// Navigate previous images
prevBtn.addEventListener('click', async () => {
    if (page > 1) {
        page--;
        currentIndex = (currentIndex - 1 + radioButtons.length) % radioButtons.length;
        updateSelection(currentIndex);
    }
});

// Update radio button selection
function updateSelection(index) {
    radioButtons.forEach((radio, idx) => {
        radio.checked = idx === index;
    });
}

// Slider functionality for auto-navigation
function showImage(index) {
    images.forEach((image, i) => {
        image.classList.toggle('hidden', i !== index);
    });
}

// Show the first image initially
showImage(currentIndex);

// Navigate to the next and previous images
function nextImage() {
    currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
    showImage(currentIndex);
}

function prevImage() {
    currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
    showImage(currentIndex);
}

// Start automatic sliding
autoSlide = setInterval(nextImage, 3000);

// Event listeners for slider navigation buttons
prevButton.addEventListener('click', () => {
    prevImage();
    resetAutoSlide();
});

nextButton.addEventListener('click', () => {
    nextImage();
    resetAutoSlide();
});

// Reset the auto-slide interval after manual navigation
function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(nextImage, 3000);
}

// Initial fetch of images from Unsplash
ImageApi();

// Toggle Navbar for Small Screens
const dropdownIcon = document.querySelector('.dropdown-icon');
const dropdownMenu = document.querySelector('.dropdown-menu');

dropdownIcon.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
    dropdownMenu.classList.toggle('flex');
});
