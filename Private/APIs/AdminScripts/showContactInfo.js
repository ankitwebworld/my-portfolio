
window.onload = () => {
    const url = "/admin/getContactInfo";
    const options = {
        method: 'GET',
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            const showData = document.querySelector(".contact-info");
            const showMessage = document.getElementById("dataNotFound");
           

            if (!data.message) {
                showMessage.textContent = data.message;
                showMessage.style.display = "block";
            } 

            if (data && data.length > 0) {
                const reversedData = data.reverse();
               
                showData.innerHTML = reversedData.map(contact => renderContactBox(contact)).join('');
                
                const boxes = document.querySelectorAll('.box');

                boxes.forEach(box => {
                    const riplyButton = box.querySelector('.riply-button');
                    const viewMoreButton = box.querySelector('.view-more');
                    const riplyAreaSection = box.querySelector('.riply-area-section');
                    const contactAreaSection = box.querySelector('.contact-area-section');
                    const deleteRequest = box.querySelector('.delete-contact-info');
                        
                    riplyButton.addEventListener('click', function () {
                        riplyAreaSection.style.display = (window.getComputedStyle(riplyAreaSection).display === "none") ? "flex" : "none";
                        contactAreaSection.style.display = "none";
                    });

                    viewMoreButton.addEventListener('click', function () {
                        contactAreaSection.style.display = (window.getComputedStyle(contactAreaSection).display === "none") ? "flex" : "none";
                        riplyAreaSection.style.display = "none";
                    });

                    deleteRequest.addEventListener("click", deletionRequest);
                    
                });
            }

            
           
        })
        .catch(error => {
            console.error('Error:', error);
        });


    
};

// function setupShowOptionListeners(){
//     const deleteRequest = document.querySelectorAll(".delete-contact-info");
//     console.log(deleteRequest)
//     deleteRequest.forEach((Deleted) => {
       
//         Deleted.addEventListener("click", deletionRequest);
//     })
// }

function deletionRequest(event) {
    const box = event.target.closest(".box");
    if (box) {
        const referenceId = box.querySelector(".reference");
        deleteContact(referenceId.textContent)
    }
}

function deleteContact(referenceId) {
    const url = `/admin/deleteContactInfo`;
    const options = {
        method: 'POST',
        body: JSON.stringify({ referenceId }), // Corrected the syntax here
        headers: {
            'Content-Type': 'application/json'
        }
    };

   

    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                Timeout(data.message)
                
                console.log(data.message);
            }
            if (!data.message) {
                Timeout("encountered error")
                
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Timeout("Error deleting contact")
        });

}

 function Timeout(message) {
    const feedback = document.getElementById("feedback");
    feedback.style.display = "block";
    feedback.textContent = message;
                setTimeout(() => {
                    feedback.style.display = "none";
                    feedback.textContent = "";
                    window.location.reload();
                }, 3000);
}




function renderContactBox(contact) {
    
    return `
    <div class="box" data-contact='${JSON.stringify(contact)}'>
            <div class="contact-contant">
                <div class="top">
                    <p class="subject">${contact.subject}</p>
                    <p class="reference">${contact.ReferenceId}</p>
                </div>
                <div class="message">
                    <p>${contact.name} :</p>
                    <p>${contact.message}</p>
                </div>
                <div class="contact-method time-date">
                    <p>${new Date(contact.date).toLocaleDateString('en-GB')}</p>
                    <p>${new Date(contact.date).toLocaleTimeString('en-US', { hour12: false })}</p>
                </div>
                <div class="contact-method">
                    <span class="contact-label">Last Response: </span>
                    ${getLastResponse(contact.responses)}
                </div>
            </div>
            <div class="riply-area-section">
                <form class="form-riply" action="/admin/adminRipliedUser" method="POST">
                    <input type="text" name="message" placeholder="riply something" class="riplied">
                    <input type="hidden" value="${contact.ReferenceId}" name="ReferenceId">
                    <input type="hidden" value="admin" name="respondBy">
                    <input type="hidden" value="${contact.emailAddress}" name="emailAddress">
                    <input type="hidden" value="${contact.phoneNo}" name="phoneNo">
                    <button type="submit" class="send">Send</button>
                    <p class="feedback"></p>
                </form>
            </div>
            <div class="contact-section contact-area-section">
                <div class="show-more-section">
                    <p class="phoneNo">${contact.phoneNo}</p>
                    <p class="emailAddress">${contact.emailAddress}</p>
                </div>
                <hr>
                <div class="responses">
                    ${contact.responses.reverse().map(element =>  renderResponse(element)).join('')}
                </div>
            </div>
            <div class="reply-button">
                <button class="riply-button">Riply</button>
                <button class="view-more">View More</button>
                <button class="delete-contact-info">DELETE</button>
            </div>
        </div>
    `;
}

function getLastResponse(responses) {
    if (responses.length > 0) {
        const lastResponse = responses[responses.length - 1];
        return `
            <div class="last-responce response-data">
                
                
                <p>${lastResponse.respondBy} : </p>
                <p>${lastResponse.message}</p>
                <div class="contact-method time-date for-bottom">
                    <p>${new Date(lastResponse.timestamp).toLocaleDateString('en-GB')}</p>
                    <p>${new Date(lastResponse.timestamp).toLocaleTimeString('en-US', { hour12: false })}</p>
                </div>
            </div>
        `;
    } else {
        return ''; // No responses
    }
}

function renderResponse(element) {
    
    return `
        <div class="response-data">
        
            <p>${element.respondBy} : ${element.message}</p>
            <div class=" time-date">
        <p>${new Date(element.timestamp).toLocaleDateString('en-GB')}</p>
        <p>${new Date(element.timestamp).toLocaleTimeString('en-US', { hour12: false })}</p>
    </div>
        </div>
    `;
}


