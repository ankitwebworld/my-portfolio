// Declare fetchedSections with a global scope
let fetchedSections = new Set();

document.addEventListener('DOMContentLoaded', () => {
   
    let slideIndex = 0;

    const sectionsContainer = document.querySelector('.sections-Area');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                if (!fetchedSections.has(sectionId)) {
                    console.log(sectionId);
                    fetchDataFromApi(sectionId);
                    fetchedSections.add(sectionId);
                }
            }
        });
    }, { threshold: 0.5 }); // Adjust the threshold as needed

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // Initial fetch for sections that are already visible
    fetchVisibleSections();

    // Manually check for visibility and fetch data
    sectionsContainer.addEventListener('scroll', debouncedScroll);
    window.addEventListener('resize', fetchVisibleSections);

    fetchInfoData();
});

function fetchVisibleSections() {
    getCurrentSectionsInView().forEach(sectionId => {
        if (!fetchedSections.has(sectionId)) {
            fetchDataFromApi(sectionId);
            fetchedSections.add(sectionId);
        }
    });
}

function debouncedScroll() {
    let isScrolling = false;

    return debounce(() => {
        if (isScrolling) {
            fetchVisibleSections();
            isScrolling = false;
        }
    }, 200);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        const later = () => {
            timeout = null;
            func();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}





function updateSectionContent(data) {
    testimonialList(data);
}

function testimonialList(data) {
    const testimonialList = document.getElementById("testimonialList");
    testimonialList.innerHTML = "";

    data.forEach(testimonial => {
        if (testimonial.markedByAnkit) {
            const formattedDate = new Date(testimonial.date);
            const dateString = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()} ${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;

            const testimonialElement = document.createElement("div");
            testimonialElement.classList.add("testimonial", "fade");
            testimonialElement.innerHTML = `
                <div class="top_head">
                    <div class="top_right">
                        <h3>${testimonial.clientName}</h3>
                        <p class="markedBy">
                            ${testimonial.markedByAnkit ? `<img src="/get-logo-from-drive/verify.png" alt="Verified" class="img">` : 'Not Verified'}
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
    changingTestimonial();
}

function getCurrentSectionsInView() {
    const sections = document.querySelectorAll('.section');
    const visibleSections = [];

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible = (rect.top <= 0 && rect.bottom >= 0) || (rect.bottom >= 0 && rect.top <= window.innerHeight);

        if (isVisible) {
            visibleSections.push(section.id);
        }
    });

    return visibleSections;
}

function fetchDataFromApi(sectionId) {
    if (!sectionId) {
        return;
    }

    let apiUrl;

    switch (sectionId) {
        case 'Testimonials':{
            apiUrl = `/home/${sectionId}`;
            const loader = document.querySelector('.loader');
            loader.style.display = 'block';
            fetch(apiUrl).then(response => response.json()).then(data => {
                    loader.style.display = 'none';
                    updateSectionContent(data);
                }).catch(error => console.error('Error fetching data:', error));
            break;
            }
            case 'projects': {
                apiUrl = `/home/${sectionId}`;
                const loader = document.querySelector('.loader');
                loader.style.display = 'block';
             const projectsSection = document.getElementById('projects');
                
               const iframe = document.createElement('iframe');
                
               iframe.src = 'education/projects';
                
                iframe.style.width = '100%'; 
                iframe.style.height = '100vh';
                iframe.style.border = 'none';
                iframe.style.overflow = 'hidden'; 
                
                projectsSection.innerHTML = '';
                projectsSection.appendChild(iframe);
            
                loader.style.display = 'none';
                break;
            }
            case 'skills' : {
                const skills = document.getElementById('skills');
                skills.style.display ="block";
            }
            
            
        default:
            break;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        const later = () => {
            timeout = null;
            func();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function changingTestimonial() {
    let slideIndex = 0;

    function showSlides() {
        const slides = document.getElementsByClassName("fade");
        const dots = document.getElementsByClassName("dot");

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        slideIndex++;

        if (slideIndex > slides.length) {
            slideIndex = 1;
        }

        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
    }

    function createDots() {
        const dotsContainer = document.getElementById("dotsContainer");

        // Clear existing dots
        dotsContainer.innerHTML = '';

        const slides = document.getElementsByClassName("fade");

        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            dot.addEventListener("click", function () {
                slideIndex = i; // Set slideIndex to the clicked dot's index
                showSlides();
            });
            dotsContainer.appendChild(dot);
        }
    }

    createDots();
    startSlideshow(showSlides, 5000);
}

function currentSlide(index) {
    slideIndex = index - 1;
    showSlides();
}



// function getCurrentSectionsInView() {
//     const sections = document.querySelectorAll('.section');
//     const visibleSections = [];

//     sections.forEach((section) => {
//         const rect = section.getBoundingClientRect();
//         const isVisible = (rect.top <= 0 && rect.bottom >= 0) || (rect.bottom >= 0 && rect.top <= window.innerHeight);

//         if (isVisible) {
//             visibleSections.push(section.id);
//         }
//     });

//     return visibleSections;
// }


document.getElementById('skills').addEventListener('scroll', function() {
    const skillsList = document.querySelectorAll('.skill');

    skillsList.forEach(skill => {
        skill.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
});

