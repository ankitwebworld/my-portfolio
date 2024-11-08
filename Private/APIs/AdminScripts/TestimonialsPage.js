const form = document.getElementById('form-Container');


form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch('/admin/testimonialsInfo', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    TimeOut(data.message, true);

  } catch (error) {
    TimeOut('Error occurred', false);
    console.error('Error:', error);
  }
});


function TimeOut(message, response) {
  const submit = document.getElementById('submit');
  submit.value = message;

  if (response) {
    submit.style.background = 'green';
  } else {
    submit.style.background = 'red';
  }

  setTimeout(() => {
    submit.value = 'Submit';
    submit.style.background = '';
  }, 3000);
}

function fristLoad(){
document.addEventListener('DOMContentLoaded', () => {
  fetch('/admin/valid/Testimonials')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ERROR ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data) {
        const loader = document.querySelector('.loader');
        loader.style.display = 'block';
        showContent(data);
      }
    })
    .catch((error) => {
      console.error(error);
      showError(error.message);
    });
});
}

fristLoad();
function showError(errors) {
  const errorId = document.getElementById('Server-error');
  errorId.style.display = 'block';
  errorId.textContent = errors;
}

function showContent(data) {
  const box = document.querySelector('.box');
  box.innerHTML = '';
const loader = document.querySelector('.loader');
        loader.style.display = 'none';
  data.reverse().forEach(element => {
    const item = document.createElement('div');
    const testimonialId = element._id; // Assuming your testimonial ID is stored in a property named "_id"

    const clientName = element.clientName ? `<h1>clientName: ${element.clientName}</h1>` : '';
    const clientTitle = element.clientTitle ? `<p>clientTitle: ${element.clientTitle}</p>` : '';
    const testimonialContent = element.testimonialContent ? `<p>testimonialContent: ${element.testimonialContent}</p>` : '';
    const projectDetails = element.projectDetails ? `<p>projectDetails: ${element.projectDetails}</p>` : '';
    const date = element.date ? formatDateTime(new Date(element.date)) : '';

    const markedByAnkit = element.markedByAnkit ? `<p>markedByAnkit: ${element.markedByAnkit}</p>` : '';
    const replyByAnkit = element.replyByAnkit ? `<p>replyByAnkit: ${element.replyByAnkit}</p>` : '';

    item.innerHTML = `
      <div class="testimonial-item" data-id="${testimonialId}">
        <div class="clientName">${clientName}</div>
        <div class="clientTitle">${clientTitle}</div>
        <div class="testimonialContent">${testimonialContent}</div>
        <div class="projectDetails">${projectDetails}</div>
        <div class="date-verify-reply">
          ${date}
          ${markedByAnkit}
          ${replyByAnkit}
        </div>
        <div class="buttons">
          <button class="update-btn">Update</button>
          <button class="delete-btn">Delete</button>
        </div>
        <div class="update-form" style="display: none;">
        <!-- Add your form fields here -->
        <input type="text" class="update-clientName" placeholder="New Client Name">
        <input type="text" class="update-clientTitle" placeholder="New Client Title">
        <textarea class="update-testimonialContent" placeholder="New Testimonial Content"></textarea>
        <button class="confirm-update-btn">Confirm Update</button>
      </div>
      </div>`;

    box.appendChild(item);
  });

  OperationOnResult();
}

function formatDateTime(dateTime) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const datePart = dateTime.toLocaleDateString('en-GB', options);
  return `<p>date: ${datePart}</p>`;
}

function OperationOnResult() {
  const testimonialBox = document.querySelector('.box');
  testimonialBox.addEventListener('click', (event) => {
    const target = event.target;
    const testimonialItem = target.closest('.testimonial-item');
    const testimonialId = testimonialItem.dataset.id;

    if (testimonialId) {
      if (target.classList.contains('delete-btn')) {
        const confirmation = confirm('are you sure..? ')
       
        if(confirmation)
        deleteTestimonial(testimonialId);
      } else if (target.classList.contains('update-btn')) {
        const updateForm = testimonialItem.querySelector('.update-form');
        if (updateForm) {
          updateForm.style.display = updateForm.style.display === 'none' ? '' : 'none';
        }
      } else if (target.classList.contains('confirm-update-btn')) {
        const updateForm = testimonialItem.querySelector('.update-form');
        const updateClientName = updateForm.querySelector('.update-clientName').value;
        const updateClientTitle = updateForm.querySelector('.update-clientTitle').value;
        const updateTestimonialContent = updateForm.querySelector('.update-testimonialContent').value;

       confirmUpdateTestimonial(testimonialId, updateClientName, updateClientTitle, updateTestimonialContent);
      }
    }
  });
}


async function deleteTestimonial(testimonialId) {
  try {
    const response = await fetch('/admin/delete/Testimonials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testimonialId }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.message);
      const deletedButton = document.querySelector(`.testimonial-item[data-id="${testimonialId}"] .delete-btn`);
      if (deletedButton) {
        deletedButton.textContent = 'Deleted';
        deletedButton.style.background = 'red';
      }
    } else {
      deletedButton.textContent = 'Error';
      console.error('Error deleting testimonial:', data.message);
    }
  } catch (error) {
    console.error('Error deleting testimonial:', error.message);
  }
}


async function updateTestimonial(testimonialId) {
  try {
    const response = await fetch('/admin/update/Testimonials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testimonialId }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.message);
      const updateButton = document.querySelector(`.testimonial-item[data-id="${testimonialId}"] .update-btn`);
      if (updateButton) {
        updateButton.textContent = 'Deleted';
        updateButton.style.background = 'green';
      }
    } else {
      updateButton.textContent = 'Error';
      console.error('Error deleting testimonial:', data.message);
    }
  } catch (error) {
    console.error('Error deleting testimonial:', error.message);
  }
}

async function confirmUpdateTestimonial(testimonialId, clientName, clientTitle, testimonialContent) {
  try {
    const response = await fetch('/admin/update/Testimonials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testimonialId, clientName, clientTitle, testimonialContent }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.message);
      console.log(data.updatedData)
      showContent(data.updatedData);
     
      
    } else {
      console.error('Error updating testimonial:', data.message);
    }
  } catch (error) {
    console.error('Error updating testimonial:', error.message);
  }
}
