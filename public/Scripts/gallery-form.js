

document.getElementById("formdata").addEventListener("submit", (event) => {
    event.preventDefault();
    const galleryName = document.getElementById("galleryName").value;
    const description = document.getElementById("description").value;
    const author = document.getElementById("author").value;
    const date = document.getElementById("date").value;
    const galleryImageInput = document.getElementById("galleryImage").files[0];
    const responceMessage = document.getElementById("message");
console.log(galleryImageInput);
    const formData = new FormData(document.getElementById("formdata"));
 
    const url = '/education/gallery-form-data';
    const options = {
        method: 'POST',
        body: formData,
    };

    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            timeout(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            timeout("An error occurred while submitting the message.");
        });

    function timeout(comeingMessage) {
        responceMessage.style.display = "block";
        responceMessage.textContent = comeingMessage;
        setTimeout(() => {
            responceMessage.style.display = "none";
        }, 3000);
    }
});


document.addEventListener("DOMContentLoaded", (e) => {
    const url = "/education/fetch-data-from-gallery";
    const errormessage = document.getElementById("errormessage");
    const ifError = document.getElementById("ifError");

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
       
        const container = document.getElementById("available-data-container");
        container.innerHTML = fetchedData(data); // You need to define this function
    })
    .catch(error => {
        console.error(error);
        timeout(error);
    });

    function timeout(comeingMessage) {
        ifError.style.display = "block";
        errormessage.textContent = comeingMessage;
        setTimeout(() => {
            ifError.style.display = "none";
            errormessage.textContent = "";
        }, 3000);
    }
});


// Event delegation for delete and update buttons
document.addEventListener('click', (event) => {
    const target = event.target;

    if (target.matches('.delete-button')) {
        callDelete(event);
    } else if (target.matches('.update-button')) {
        callUpdate(event);
    }
});

function fetchedData(data) {
    let html = '';

    if (data.length > 0) {
        data.forEach(item => {
            html += `
            <div class='box'>
                <figure class="snip1193">
                    <img src="/get-drive-image/${item.fileId}" alt="${item.galleryName}"/>
                    <figcaption>
                        <h4>${item.galleryName}</h4>
                        <a href="#" class="bottom-left"><i>${item.author}</i></a>
                        <a href="#" class="bottom-right"><i>${item.description}</i></a>
                    </figcaption>
                </figure>
                <form class='delete-update'>
                    <input type="hidden" placeholder="Gallery Name" name="galleryName" value='${item.galleryName}'>
                    <input type="hidden" placeholder="author" name="author" value='${item.author}'>
                    <input type="hidden" placeholder="description" name="description" value='${item.description}'>
                    <input type="hidden"  name="fileId" value='${item.fileId}' style='display:none'>
                    <input type="submit" class="update-button" value="Update">
                    <input type="button" class="delete-button" value="Delete">
                    
                </form>
            </div>  
            `;
        });
    } else {
        html = `<p>No data available.</p>`;
    }

    return html;
}

function callDelete(event) {
    event.preventDefault();

    // Traverse up the DOM from the target element to find the nearest form
    let form = event.target;
    while (form && form.tagName !== 'FORM') {
        form = form.parentNode;
    }

    // Access form data if found
    if (form) {
        const fileId = form.querySelector('[name="fileId"]').value;
        const button = form.querySelector('[value="Delete"]');
button.value = 'deleting...'
button.disabled = true;
        // Send a request to delete the file from both Google Drive and the database
        fetch('/education/delete-gallery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileId: fileId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            button.value = data.message;
        })
        .catch(error => {
            console.error('Error:', error);
            button.disabled = true;
        });
    } else {
        console.error('Form element not found');
        button.disabled = true;
    }
}


function callUpdate(event) {
    event.preventDefault();

    // Traverse up the DOM from the target element to find the nearest form
    let form = event.target;
    while (form && form.tagName !== 'FORM') {
        form = form.parentNode;
    }

    // Access form data if found
    if (form) {
        const formData = new FormData(form);

        // Iterate over form data entries and update hidden inputs to text inputs
        formData.forEach((value, key) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.setAttribute('type', 'text');
                input.value = value;
            }
        });

        const submitButton = form.querySelector('[type="submit"]');
submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    // Access the form element associated with the submit button
    const form = event.target.closest('form');
    if (form) {
        // Find the galleryName input field within the form
        const button = form.querySelector('[value="Update"]');
        const galleryName = form.querySelector('[name="galleryName"]').value;
        const author = form.querySelector('[name="author"]').value;
        const description = form.querySelector('[name="description"]').value;
        const fileId = form.querySelector('[name="fileId"]').value;
    
        button.value = 'Updating...';
        button.disabled = true;
        const formData = {
            galleryName,
            author,
            description,
            fileId,
        };
    
        const url = '/education/update-gallery-info';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        };
    
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data); 
                button.value = 'Updated'; 
                button.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                button.value = 'Update'; 
            });
    } else {
        console.error('Form element not found');
    }
    
});

    } else {
        console.log('Form not found');
    }
}




const hoverElements = document.querySelectorAll(".hover");
hoverElements.forEach(element => {
    element.addEventListener('mouseleave', (event) => {
       element.classList.remove("hover");
    });
});


document.addEventListener('contextmenu', event => event.preventDefault());