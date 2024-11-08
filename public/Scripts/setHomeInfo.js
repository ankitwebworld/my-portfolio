function fetchInfoData() {
    const contactTelPhoneNo = document.getElementById('contactTelPhoneNo');
    const contactEmail = document.getElementById('contactEmail');
    const GoToWhatsappChat = document.getElementById('GoToWhatsappChat');
    const myInformation = document.getElementById('my-information');
    const footerData = document.getElementById('footer-data');
    const mapeUrl = document.getElementById('mapeUrl');
    
    fetch('/get-homepage-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch data');
        }
    })
    .then(data => {
      
        // Populate HTML elements with fetched data
        contactTelPhoneNo.innerHTML = `<a href="tel:+91${data.contactTelPhoneNo}">+91 ${data.contactTelPhoneNo}</a>`;
        contactEmail.innerHTML = `<a href="mailto:${data.contactEmail}">${data.contactEmail}</a>`;
        GoToWhatsappChat.innerHTML = `<a href="${data.GoToWhatsappChat}" target="_blank">WhatsApp</a>`;
        myInformation.textContent = data.myInformation;
        footerData.textContent = data.footerData;
        mapeUrl.src = data.mapeUrl;
    })
    .catch(error => {
        console.error('Error:', error);
    });
};
