document.getElementById("userData").addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(document.getElementById('userData'));
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value.trim();
    });

    if (Object.keys(data).length > 0) {
        switch (true) {
            case data.ReferenceId !== "":
                getContactInfo(`/admin/getContactInfoByReferenceId`, getData("ReferenceId", data.ReferenceId));
                break;
            case data.emailAddress !== "":
                getContactInfo(`/admin/getContactInfoByEmailAddress`, getData("emailAddress", data.emailAddress));
                break;
            case data.phoneNo !== "":
                getContactInfo(`/admin/getContactInfoByPhoneNo`, getData("phoneNo", data.phoneNo));
                break;
            case data.date !== "":
                getContactInfo(`/admin/getContactInfoByDate`, getData("date", data.date));
                break;
            case data.name !== "":
                getContactInfo(`/admin/getContactInfoByName`, getData("name", data.name));
                break;
        }
    }
});

function getData(key, value) {
    return { [key]: value };
}

function getContactInfo(url, query) {
    const options = {
        method: 'POST',
        body: JSON.stringify(query),
        headers: {
            'Content-Type': 'application/json'
        }
    };
const box = document.getElementById("showUserData");
    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.message) {
                Timeout("Encountered an error");
            }

            if (data) {
                console.log(data);
               box.innerHTML=  renderContactBox(data);

             const dataContainer =  document.querySelectorAll('.box');
               showHide(dataContainer)
            }
           
        })
        .catch(error => {
            console.error('Error:', error);
            Timeout("Error fetching contact information");
        });
}

function showHide(boxes)
{
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

function Timeout(message) {
    const feedback = document.getElementById("feedback");
    feedback.style.display = "block";
    feedback.textContent = message;
    setTimeout(() => {
        feedback.style.display = "none";
        feedback.textContent = "";
        // window.location.reload();
    }, 3000);
}
