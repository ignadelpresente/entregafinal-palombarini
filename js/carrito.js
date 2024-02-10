document.addEventListener('DOMContentLoaded', function() {
    var cartIcon = document.querySelector('.cart-icon');
    var cartElement = document.querySelector('.carrito');

    cartIcon.addEventListener('click', function() {
        cartElement.classList.toggle('hidden');
    });

    document.addEventListener('click', function(event) {
        if (!cartElement.contains(event.target) && !cartIcon.contains(event.target) && !cartElement.classList.contains('hidden')) {
            cartElement.classList.add('hidden');
        }
    });
});
