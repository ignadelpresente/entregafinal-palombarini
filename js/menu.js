document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById('mobile-menu');
    const navList = document.querySelector('.nav-list');
    const header = document.querySelector('header');

    menuToggle.addEventListener('click', function () {
        navList.classList.toggle('active');
        header.classList.toggle('active');
    });

});
