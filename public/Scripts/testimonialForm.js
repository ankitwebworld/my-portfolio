document.getElementById('insertData').addEventListener("click", (e) => {
    const clientName = document.getElementById('clientName').value;
    const clientTitle = document.getElementById('clientTitle').value;
    const testimonialContent = document.getElementById('testimonialContent').value;
    const projectDetails = document.getElementById('projectDetails').value;
    const getMessage = document.getElementById('message');

    const url = "/education/submitTestimonials";

    const formData = {
        clientName,
        clientTitle,
        testimonialContent,
        projectDetails
    }

    const server = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    };

    // Corrected the fetch method arguments
    fetch(url, server)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                timeout(data.message);
            } else {
                timeout("Invalid response from server");
            }
        })
        .catch(error => {
            console.error(error);
            timeout("Internal server error");
        });

    function timeout(message) {
        getMessage.style.display = "block";
        getMessage.textContent = message;
        setTimeout(() => {
            getMessage.style.display = "none";
            getMessage.textContent = "";
        }, 3000);
    }
});

document.getElementById("showButton").addEventListener("click", () => {
    const showData = document.getElementById("form");
    showData.style.display = (showData.style.display === "none" || showData.style.display === "") ? "block" : "none";
});


document.addEventListener("DOMContentLoaded", (e) => {
    const url = "/education/fetchTestimonialData";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const testimonialList = document.getElementById("testimonialList");

            testimonialList.innerHTML = "";

            data.testimonials.forEach(testimonial => {
                if (testimonial.markedByAnkit) {
                    const formattedDate = new Date(testimonial.date);
                    const dateString = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()} ${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;

                    const testimonialElement = document.createElement("div");
                    testimonialElement.classList.add("testimonial");
                    testimonialElement.innerHTML = `
                    <div class="top_head">
                    <div class="top_right">
                    <h3>${testimonial.clientName}</h3>
                    <p class="markedBy">
                        ${testimonial.markedByAnkit ? `<img src="../Images/verify.png" alt="Verified" class="img">` : 'Not Verified'}
                    </p>
                </div>
                        <p class="dateString">${dateString}</p>
                    </div>
                        <p>${testimonial.clientTitle}</p>
                        <p>${testimonial.testimonialContent}</p>
                        <p>${testimonial.projectDetails}</p>
                        <p>${testimonial.replybyAnkit ? testimonial.replybyAnkit : ""}</p>
                        
                    `;
                    testimonialList.appendChild(testimonialElement);
                }
            });

        })
        .catch(error => {
            console.error(error);
            
        });
});