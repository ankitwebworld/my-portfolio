document.addEventListener('DOMContentLoaded', function () {
    const blogsList = document.getElementById('blogsList');

    fetch('/education/showBlogs')
        .then(response => response.json())
        .then(data => {
            let num = 0;
            let img = null

function getLogo() {
    if (num === 0) {
        num++;
        img =  `/get-logo-from-drive/AnkitLogo.png`;
        return img
    } else {
        return img;
    }
}

            if (data.blogsData && data.blogsData.length > 0) {
                data.blogsData.reverse().forEach(blog => {
                    const blogElement = document.createElement('div');
                    blogElement.classList.add('blog');

                    blogElement.innerHTML = `
                        <div class="Heading">
                            <div class="head">
                            <img src="${getLogo()}" alt="image" class="mypicture">
                            </div>  
                            <div class="bottomTitle">
                                <h2 class="title">${blog.title}</h2>
                                <div class="date-location">
                                    <p class="date">${new Date(blog.date).toLocaleDateString()}</p>
                                    <p class="location">${blog.location}</p>
                                </div>
                            </div>
                        </div>
                        ${blog.content ? `<p class="content">${blog.content}</p>` : ''}
                        ${blog.category ? `<p class="category">${blog.category}</p>` : ''}
                        ${blog.photos ? `<p class="photos">${blog.photos}</p>` : ''}
                        ${blog.hashtags ? `<p class="hashtags">${blog.hashtags}</p>` : ''}
                        ${blog.codes ? `<textarea class="codes" readonly>${blog.codes}</textarea>` : ''}
                        ${blog.fileId ? `<img class='img' src="/get-drive-image/${blog.fileId}" alt="Blog Image">` : ''}
                        <hr>  
                    `;
                   
                    blogsList.appendChild(blogElement);
                    if (!blog.photos) {
                        document.querySelector(".photos").style.display = "none";
                    }
                    if (!blog.content) {
                        document.querySelector(".content").style.display = "none";
                    }
                });
            } else {
                // Display a message if no blogs are available
                blogsList.innerHTML = '<p>No blogs available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching blogs', error);
        });

    const copyButtons = document.querySelectorAll('.copy-button');

    copyButtons.forEach(button => {
        button.addEventListener('click', function () {
            const contentToCopy = this.parentNode.querySelector('.codes').innerText;
            copyToClipboard(contentToCopy);
        });
    });

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard');
            })
            .catch((err) => {
                console.error('Unable to copy text to clipboard', err);
            });
    }
});


document.addEventListener('contextmenu', event => event.preventDefault());