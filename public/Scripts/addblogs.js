document.addEventListener('DOMContentLoaded', function () {
    const addInformationForm = document.getElementById('addInformation');
   
    addInformationForm.addEventListener('submit', (event) => {
        event.preventDefault();
       
        if (validateForm()) {
            submitForm();
           
        }
    });

    function validateForm() {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const firstInvalidInput = document.querySelector('.invalid-input');

        if (title.trim() === '' || content.trim() === '') {
            firstInvalidInput.focus();
            return false;
        }

        return true;
    }

    function submitForm() {
        const formData = new FormData(addInformationForm);
        const displayMessage = document.getElementById('displayMessage');

        fetch('/education/addInformation', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                Timeout(data.message);
            })
            .catch(error => {
                console.error('Error submitting form', error);
                Timeout(error);
            });

        function Timeout(message) {
            displayMessage.style.display = "block";
            displayMessage.textContent = message;
            setTimeout(() => {
                displayMessage.style.display = "none";
                displayMessage.textContent = "";
            }, 3000);
        }
    }
});

document.getElementById('showHideForm').addEventListener('click', (event) => {
    toggleForm('.formContainer');
});



function toggleForm(formSelector) {
    const allForms = document.querySelectorAll('.formContainer, .delete-blog, .update-blog');
    allForms.forEach(form => {
        if (form.classList.contains(formSelector.slice(1)) && form.classList.contains('hidden')) {
            form.classList.remove('hidden');
        } else {
            form.classList.add('hidden');
        }
    }); 
}

// document.addEventListener('contextmenu', event => event.preventDefault());




  