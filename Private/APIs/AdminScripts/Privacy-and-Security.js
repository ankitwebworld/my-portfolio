
// Add Related Link button functionality
document.getElementById('addRelatedLink').addEventListener('click', function() {
    const relatedLinksDiv = document.getElementById('relatedLinks');
    const newLinkDiv = document.createElement('div');
    newLinkDiv.classList.add('link');
    newLinkDiv.innerHTML = `
        <input type="text" name="relatedLinkTitle[]" placeholder="Title" required>
        <input type="url" name="relatedLinkURL[]" placeholder="URL" required>
    `;
    relatedLinksDiv.appendChild(newLinkDiv);
});

// Add FAQ button functionality
document.getElementById('addFAQ').addEventListener('click', function() {
    const FAQsDiv = document.getElementById('FAQs');
    const newFAQDiv = document.createElement('div');
    newFAQDiv.classList.add('question');
    newFAQDiv.innerHTML = `
        <input type="text" name="question[]" placeholder="Question" required>
        <input type="text" name="answer[]" placeholder="Answer" required>
    `;
    FAQsDiv.appendChild(newFAQDiv);
});

document.getElementById('Privacy-and-Security-Form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    const feedback = document.getElementById('feedback');
    const title = document.getElementById('title').value.trim();
    const mainText = document.getElementById('mainText').value.trim();
    const additionalInfo = document.getElementById('additionalInfo').value.trim();
    const videos = document.getElementById('videos').value.split(',').map(video => video.trim());
    const policies = document.getElementById('policies').value.trim();
    const importantNotes = document.getElementById('importantNotes').value.split(',').map(note => note.trim());

    const faqs = document.querySelectorAll('.question');
    const faqData = Array.from(faqs).map(faq => ({
        question: faq.querySelector('input[name="question[]"]').value.trim(),
        answer: faq.querySelector('input[name="answer[]"]').value.trim()
    }));

    const relatedLinks = document.querySelectorAll('.link');
    const relatedLinksData = Array.from(relatedLinks).map(link => ({
        title: link.querySelector('input[name="relatedLinkTitle[]"]').value.trim(),
        url: link.querySelector('input[name="relatedLinkURL[]"]').value.trim()
    }));

    const formData = {
            title,
            mainText,
            additionalInfo,
            videos,
            policies,
            importantNotes,
            frequentlyAskedQuestions: faqData,
            relatedLinks : relatedLinksData
        
    };

    fetch('/admin/submit-privacy-security-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        feedback.textContent = data.message;
    })
    .catch(error => {
        console.error('There was a problem with your form submission:', error);
        feedback.textContent = error.error;
    });
});



