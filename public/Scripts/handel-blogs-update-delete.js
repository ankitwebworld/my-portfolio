//delete blogs

document.getElementById('deleteBlog').addEventListener('click', (event) => {
    toggleForm('.delete-blog');
    deleteBlogs();
});

document.getElementById('delete').addEventListener('click', (event) => {
    event.preventDefault();
    const blogElement = document.getElementById('delete').value;
    const responce = document.getElementById('deleteMessage');
    const HideSelect = document.getElementById('delete');
    formData = {
        _id: blogElement
    };

    if (blogElement != "" && sure()) {
        fetch(`/admin/deleteMyBlog/${blogElement}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                HideSelect.style.display = 'none';
                TimeOut(data.message, 'deleteMessage');
            } else {
                throw new Error("Invalid response from server");
            }
        })
        .catch(error => {
            console.error(error);
            responce.textContent = error;
        });
    }
});

function sure() {
    try {
        const sure = confirm("are you sure You are deleting blog");
        if (sure) {
            return true;
        }
        return false;
    } catch (error) {
        console.error(error);
    }
}

function TimeOut(message, id) {
    const idData = document.getElementById('deleteMessage');
    const HideSelect = document.getElementById('delete');
    const loader = document.querySelector('.loader');
    idData.textContent = message;
    idData.style.display = 'block';
    setTimeout(() => {
        idData.textContent = '';
        idData.style.display = 'none';
        HideSelect.style.display = 'flex';
        loader.style.display = "block";
        deleteBlogs();
    }, 3000);
}

function deleteBlogs() {
    const message = document.getElementById('deleteMessage');
    const deleteOptions = document.getElementById('delete');
    const loader = document.querySelector('.loader');

    fetch("/admin/deleteBlogs", {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP generating error");
        }
        return response.json();  // Return the parsed JSON
    })
    .then(data => {
        // Hide the loader after fetching the data
        loader.style.display = "none";

        if (!data || !data.data || data.data.length === 0) {
            message.textContent = "Blogs not available";
        } else {
            // Create the first default option
            let optionsHTML = '<option disabled selected class="option" value="">Select Blogs For Delete</option>';

            const dateFormatter = new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            });
            // Add options based on the data
            data.data.forEach(element => {
                const formattedDate = dateFormatter.format(new Date(element.date));
                optionsHTML += `<option class="option" value='${element._id}'>title: ${element.title} | date: ${formattedDate}</option>`;
            });

            deleteOptions.innerHTML = optionsHTML;
        }
    })
    .catch(error => {
        console.error(error);
        message.textContent = error.message || "An error occurred";
    });
}

// Update blogs
document.getElementById('UpdateBlog').addEventListener('click', (event) => {
    toggleForm('.update-blog');
    updateBlogs();
});

function updateBlogs() {
    const message = document.getElementById('updateMessage');
    const updateOptions = document.getElementById('update');
    const loader = document.querySelector('.loader2');

    loader.style.display = 'block';

    fetch("/admin/updateBlogs", {
        method: "GET"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP generating error");
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.data || data.data.length === 0) {
            message.textContent = "Blogs not available";
        } else {
            let optionsHTML = '<option disabled selected class="option" value="">Select Blogs For Update</option>';

            const dateFormatter = new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            });

            data.data.forEach(element => {
                const formattedDate = dateFormatter.format(new Date(element.date));
                optionsHTML += `<option class="option" value='${element._id}'>title: ${element.title} | date: ${formattedDate}</option>`;
            });

            updateOptions.innerHTML = optionsHTML;
            
        }
    })
    .finally(() => {
        loader.style.display = 'none';
    })
    .catch(error => {
        console.error(error);
        message.textContent = error.message || "An error occurred";
    });
}

document.getElementById('update').addEventListener('click', (event) => {
    event.preventDefault();
    const blogElement = document.getElementById('update').value;
    const responce = document.getElementById('updateMessage');
    const HideSelect = document.getElementById('update');
    formData = {
        _id: blogElement
    };

    if (blogElement != "" && sure()) {
        fetch(`/admin/updateMyBlog/${blogElement}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                HideSelect.style.display = 'none';
                Timeout(data.message, 'updateMessage');
                toggleForm('.formContainer');
            }
            if (data.data) {
                InputFormDataForUpDate(data.data);
                callupdate();
                
            } else {
                throw new Error("Invalid response from server");
            }
        })
        .catch(error => {
            console.error(error);
            responce.textContent = error;
        });
    }
});

function InputFormDataForUpDate(data) {
    const form = document.querySelector('.formContainer');
    form.innerHTML = `
    <form id="updateInformation" >
         <input type="hidden" id="keyId" name="keyId" value="${data._id}">
        <label for="title">Title:</label>
        <input type="text" id="title" name="title" value="${data.title}" class="invalid-input">

        <label for="content">Content:</label>
        <textarea id="content" name="content" class="invalid-input">${data.content}</textarea>

        <label for="category">Category:</label>
        <input type="text" id="category" name="category" value="${data.category}">

        <label for="date">Date:</label>
        <input type="date" id="date" name="date" value="${formatDate(data.date)}">

        <label for="location">Location:</label>
        <input type="text" id="location" name="location" value="${data.location}">

        <label for="photos">Photos (URLs, separated by commas):</label>
        <input type="text" id="photos" name="photos" value="${data.photos}">

        <label for="hashtags">Hashtags (separated by commas):</label>
        <input type="text" id="hashtags" name="hashtags" value="${data.hashtags}">
       
        <label for="codes">Codes (formatted text):</label>
        <textarea id="codes" name="codes">${data.codes}</textarea>

        <label for="image">Upload Image:</label>
        <input type="file" id="image" name="image">

        <button type="button" id="submitUpdateForm">Update Information</button>
        <p id="updateFeedback"></p>
    </form>`;
}

function Timeout(message, id) {
    const idData = document.getElementById('updateMessage');
    const HideSelect = document.getElementById('update');
    const loader = document.querySelector('.loader2');
    idData.textContent = message;
    idData.style.display = 'block';
    setTimeout(() => {
        idData.textContent = '';
        idData.style.display = 'none';
        HideSelect.style.display = 'flex';
        loader.style.display = 'block';
        updateBlogs();
    }, 3000);
}

function formatDate(dateString) {
    const dateObject = new Date(dateString);
    const year = dateObject.getUTCFullYear();
    const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


function callupdate() {
    document.getElementById('submitUpdateForm').addEventListener('click', function (event) {
        event.preventDefault();

        const keyId = document.getElementById('keyId').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const location = document.getElementById('location').value;
        const photos = document.getElementById('photos').value;
        const hashtags = document.getElementById('hashtags').value;
        const codes = document.getElementById('codes').value;
        const imageInput = document.getElementById('image');
        const image = imageInput.files[0];

       console.log(image);
        

        const formData = new FormData();
        formData.append('keyId', keyId);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('date', date);
        formData.append('location', location);
        formData.append('photos', photos);
        formData.append('hashtags', hashtags);
        formData.append('codes', codes);
        formData.append('image', image);

        const url = '/admin/updateInformationRequest';
        const options = {
            method: 'POST',
           
            body: formData,
            headers: {
                // 'Content-Type': 'multipart/form-data; boundary=' + formData._boundary,
            },
        };
        
        

        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(feedback => {
                console.log('Server Response:', feedback);
                if (feedback.message) {
                    updateFeedback.textContent = feedback.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                updateFeedback.textContent = error;
            });
    });
}

document.getElementById('refresh').addEventListener('click',(e)=>{
    window.location.reload();
});



