const imageList = document.querySelector('.image-list');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const captionText = document.getElementById('caption');
const closeBtn = document.querySelector('.close');

let page = 1; 
let keyword = 'nature'; 
const key = 'HbRqajqKK1WJQvN4WkB6dYSAaEkESjRl-V83ncALdlU';

const radioButtons = document.querySelectorAll('input[name="galleryOption"]');
let currentIndex = 0; 

async function ImageApi(clear = true) {
    if (page > 4) {
        alert('You have reached the maximum page limit!');
        return; 
    }

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${key}&per_page=10`;
    
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

function openModal(src, alt) {
    modal.style.display = "block"; 
    modalImg.src = src; 
    captionText.innerHTML = alt; 
}


closeBtn.addEventListener('click', () => {
    modal.style.display = "none"; // Hide the modal
});
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none"; // Hide the modal
    }
});



document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchField').value.trim();
    if (query.length > 2) {
        page = 1;
        keyword = query;
        currentIndex = 0;
        updateSelection(currentIndex);
        await ImageApi(true); 
    } else {
        alert("Please enter at least 3 characters for the search.");
    }
});


document.getElementById('showMoreBtn').addEventListener('click', async () => {
    if (page < 4) {
        page++;
        currentIndex = (currentIndex + 1); 
        updateSelection(currentIndex); 
        await ImageApi(false); 
    } else {
        alert("You have reached the maximum page limit!");
    }
});


document.getElementById('prevBtn').addEventListener('click', async () => {
    if (page > 1) {
        page--; 
        currentIndex = (currentIndex - 1 + radioButtons.length); 
        updateSelection(currentIndex);
       
       
    }
});


function updateSelection(index) {
    radioButtons.forEach((radio, idx) => {
        radio.checked = (idx === index);
    });
}

ImageApi();
