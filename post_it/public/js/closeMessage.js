const closeBtn = document.getElementsByClassName('messagebtn');

closeBtn(btn => {
    btn.addEventListener('click', () => {
        const options = btn.nextElementSibling;
        if (options.style.display === 'block') {
        options.style.display = 'none';
        } else {
        options.style.display = 'block';
        }
    });
});
