document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formData');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        onloadgetData(form);
    });

    onloadgetData(form);
});
function onloadgetData(form) {
    // Get form data by input IDs
    const contactTelPhoneNo = document.getElementById('contactTelPhoneNo').value.trim();
    const contactEmail = document.getElementById('contactEmail').value.trim();
    const goToWhatsappChat = document.getElementById('GoToWhatsappChat').value.trim();
    const myInformation = document.getElementById('myInformation').value.trim();
    const footerData = document.getElementById('footerData').value.trim();
    const mapUrl = document.getElementById('mapeUrl').value.trim();
    const button = form.querySelector('[type="submit"]');

   

    // Construct form data object
    const formData = {
        contactTelPhoneNo,
        contactEmail,
        GoToWhatsappChat: goToWhatsappChat,
        myInformation,
        footerData,
        mapUrl
    };

    fetch('/admin/submit-homepage-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to submit form');
        }
    })
    .then(data => {
        button.value = data.message;
        setData(data.data);
        console.log(data)
    })
    .catch(error => {
        button.value = error.message || error.error || error;
        console.error('Error:', error);
    });
}

function setData(data) {
    const contactTelPhoneNo = document.getElementById('contactTelPhoneNo');
    const contactEmail = document.getElementById('contactEmail');
    const goToWhatsappChat = document.getElementById('GoToWhatsappChat');
    const myInformation = document.getElementById('myInformation');
    const footerData = document.getElementById('footerData');
    const mapUrl = document.getElementById('mapeUrl');

    // Check if data is not empty before populating form fields
    if (data) {
        contactTelPhoneNo.value = data.contactTelPhoneNo || '';
        contactEmail.value = data.contactEmail || '';
        goToWhatsappChat.value = data.GoToWhatsappChat || '';
        myInformation.value = data.myInformation || '';
        footerData.value = data.footerData || '';
        mapUrl.value = data.mapeUrl || '';
    }
}

