window.onload = () => {
    const container = document.querySelector(".left-container");
    fetch('/admin/update-delete-Notifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            container.innerHTML = notificationContainer(data);
            update_delete_buttons();
        } else {
            container.innerHTML = `<p>No notifications available.</p>`;
        }
    })
    .catch(error => {
        console.error('There was a problem with your form submission:', error);
        container.innerHTML = `<p>${error.message}</p>`;
    });
};

function notificationContainer(data) {
    return `
        <section class="section-50">
            <div class="notification-container">
                <div class="notification-ui_dd-content">
                    <h3 class="m-b-50 heading-line">Notifications <i class="fa fa-bell text-muted"></i></h3>
                    ${data.map(notification => `
                        <div class="notification-list ${notification.read ? '' : 'notification-list--unread'}">
                            <div class="notification-list_content">
                                <div class="notification-list_img">
                                    <img src="/Images/roundImage.png" alt="user">
                                </div>
                                <div class="notification-list_detail">
                                    <p><b>${notification.sender.username}</b> ${notification.action} ${notification.target}</p>
                                    <p class="text-muted">${notification.message}</p>
                                    <p class="text-muted"><small>${formatDate(notification.createdAt)} ${formatTime(notification.createdAt)}</small></p>
                                </div>
                                ${notification.featureImage ? `<div class="notification-list_feature-img"><img src="${notification.featureImage}" alt="Feature image"></div>` : ''}

                            </div>
                       
                               
                                    <form class="update-delete-buttons">
                                        <input type="hidden" name="_id" value="${notification._id}">
                                        <input type="button" name="update" value="update">
                                        <input type="button" name="delete" value ="delete">
                                    </form>
                                
                        </div>
                    `).join('')}
                </div>

            </div>
        </section>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
}

function update_delete_buttons() {
    const buttons = document.querySelectorAll('.update-delete-buttons');

    buttons.forEach((form) => {
        const updateButton = form.querySelector('[name="update"]');
        const deleteButton = form.querySelector('[name="delete"]');
        const idInput = form.querySelector('[name="_id"]');

        updateButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            const _id = idInput.value; 
           
           handleUpdate(updateButton,_id);
        });

        deleteButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            const _id = idInput.value; 
             handleDelete(deleteButton,_id);
        });
    });
}


function handleUpdate(updateButton,_id) {
    updateButton.value = "updating...";
  
  const rightContainer = document.querySelector('.right-container')
    fetch('/admin/update-Notifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({_id})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data) {
            rightContainer.innerHTML = updateFormContainer(data);
            updateNotificationForm();
        } 
    })
    .catch(error => {
        console.error('There was a problem with your form submission:', error);

    });
   
}

function updateFormContainer(data) {
    return `
        <form id="updateNotificationForm">
            <input type="hidden" name="_id" value="${data._id}">
            <label for="sender">Sender:</label>
            <input type="text" id="sender" name="sender" value="${data.sender.username}" disabled><br>
            <label for="action">Action:</label>
            <input type="text" id="action" name="action" value="${data.action}"><br>
            <label for="target">Target:</label>
            <input type="text" id="target" name="target" value="${data.target}"><br>
            <label for="message">Message:</label>
            <textarea id="message" name="message">${data.message}</textarea><br>
            <label for="featureImage">Feature Image URL:</label>
            <input type="text" id="featureImage" name="featureImage" value="${data.featureImage}"><br>
            <button type="submit">Update Notification</button>
        </form>
    `;
}

function updateNotificationForm() {
    const updateForm = document.getElementById('updateNotificationForm');
    updateForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const _id = event.target.querySelector('[name ="_id"]').value;
        const button = event.target.querySelector('[type ="submit"]');
        const action = document.getElementById('action').value;
        const target = document.getElementById('target').value;
        const message = document.getElementById('message').value;
        const featureImage = document.getElementById('featureImage').value;

        button.textContent = "Updating...";

        fetch('/admin/update-Notification-req', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id,
                action,
                target,
                message,
                featureImage
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    button.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('There was a problem with your form submission:', error);
            });
    });
}

function handleDelete(deleteButton,_id) {
    deleteButton.value = "deleting..."
    fetch('/admin/delete-Notification-req', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                console.log(data)
                deleteButton.value = data.message;
            }
        })
        .catch(error => {
            deleteButton.textContent = error.message || error.error;
            console.error('There was a problem with your form submission:', error);
        });
}
