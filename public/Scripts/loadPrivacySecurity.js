fetch('/loadPrivacySecurity', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    // Check if data is not empty and has at least one item
    if (data && data.length > 0) {
        // Access the first item in the array
        const privacySecurityData = data[0];
        // Populate data into HTML elements
        document.getElementById('title').textContent = privacySecurityData.title;
        document.getElementById('mainText').textContent = privacySecurityData.content.mainText;
        document.getElementById('additionalInfo').textContent = privacySecurityData.content.additionalInfo;
        document.getElementById('videos').innerHTML = privacySecurityData.content.videos.map(video => `<li class="list-item">${video}</li>`).join('');
        document.getElementById('relatedLinks').innerHTML = privacySecurityData.content.relatedLinks.map(link => `<li class="list-item"><h4>${link.title ? link.title:''}:</h4> <a href="${link.url ? link.url:'#!'}" target="_blank">${link.url ? link.url:'No like there'}</a></li>`).join('');
        document.getElementById('faq').innerHTML = privacySecurityData.content.frequentlyAskedQuestions.map(faq => `<li class="list-item"><h4>${faq.question} : </h4> ${faq.answer}</li>`).join('');
        document.getElementById('importantNotes').innerHTML = privacySecurityData.content.importantNotes.map(note => `<li class="list-item">${note}</li>`).join('');

        const formattedPolicies = Object.entries(privacySecurityData.content.policies).map(([key, value]) => `<h4>${key} : </h4> ${value}`).join('<br><p class="formattedPolicies">');

         document.getElementById('policies').innerHTML = formattedPolicies;
    } else {
        const container = document.querySelector('.container');
        container.innerHTML = '<h4>Privacy and Security data is empty or not available</h4>';
        console.error('Privacy and Security data is empty or not available');
    }
})
.catch(error => {
    console.error('There was a problem with your fetch operation:', error);
});
