function DOMContentLoad() {
    document.addEventListener('DOMContentLoaded', async function() {
        try {
            const response = await fetch('/admin/get-drive-images');
            const imageIds = await response.json();

            const imageContainer = document.getElementById('imageContainer');

            // Function to add images with a delay between each image
            async function addImagesWithDelay() {
                for (const data of imageIds) {
                    const formDiv = document.createElement('div');
                    formDiv.classList = 'form-container';

                    const img = document.createElement('img');
                    img.src = `/admin/get-drive-image/${data.id}`;
                    img.alt = data.name;
                    img.width = '500';
                    img.height = '500';
                    img.style.border = 'none';
                    
                    // Append the image to the form container
                    formDiv.appendChild(img);

                    formDiv.innerHTML += `
                        <form class="formData">
                            <input type="hidden" name="id" value="${data.id}">
                            <input type="text" name="name" value="${data.name}">
                            <input type="submit" name="Delete" value="Delete">
                            <input type="button" name="Update" value="Update">
                        </form>
                    `;

                    // Attach event listener to form submission
                    formDiv.querySelector('.formData').addEventListener('submit', async function(event) {
                        event.preventDefault(); // Prevent default form submission
                        const button = event.target.querySelector('[type="submit"]');
                        const formData = new FormData(this);
                        const id = formData.get('id');
                        const name = formData.get('name');
                        button.value = 'Deleting..';
                        await deleteDriveImage(id, name, button);
                    });

                    formDiv.querySelector('.formData [name="Update"]').addEventListener('click', async function(event) {
                        event.preventDefault();
                        this.value = 'Updating..'
                        const formData = new FormData(this.form);
                        const id = formData.get('id');
                        const name = formData.get('name');
                        await updateDriveImage(id, name, this);
                    });
                    
                    // Append the form container to the image container
                    imageContainer.appendChild(formDiv);

                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            await addImagesWithDelay();
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    });
}


DOMContentLoad();

async function updateDriveImage(id, newName,button) {
    try {
        
      
        const response = await fetch(`/admin/update-drive-image?id=${id}&name=${newName}`, {
            method: 'PUT'
        });
        if (response.ok) {
            console.log(`Image with ID ${id} updated successfully with new name: ${newName}`);
            const data = await response.json(); // Await the JSON data
            if (data.message) {
                button.value = 'Updated';
                button.style.backgroundColor = 'green';
        
                DOMContentLoad();
            } else if (data.error) {
                button.value = 'Updating Error';
                button.style.backgroundColor = 'red';
            }
        } else {
            button.value = 'Updating Error';
            button.style.backgroundColor = 'red';
            console.error('Error updating image:', response.statusText);
        }
        
    } catch (error) {
        button.value = 'Updating Error';
        button.style.backgroundColor = 'red';
        console.error('Error updating image:', error);
    }
}

async function deleteDriveImage(id, name,button) {
    try {
        
       const response = await fetch(`/admin/delete-drive-image?id=${id}&name=${name}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log(`Image with ID ${id} updated successfully`);
            const data = await response.json(); 
            if (data.message) {
                button.value = 'Deleted';
                button.style.backgroundColor = 'green';
        
                DOMContentLoad();
            } else if (data.error) {
                button.value = 'Deleting Error';
                button.style.backgroundColor = 'red';
            }
        } else {
            button.value = 'Deleting Error';
            button.style.backgroundColor = 'red';
            console.error('Error Deleting image:', response.statusText);
        }
        
    } catch (error) {
        button.value = 'Deleting Error';
        button.style.backgroundColor = 'red';
        console.error('Error Deleting image:', error);
    }
}