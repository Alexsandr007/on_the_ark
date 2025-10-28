console.log('menu');


document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector(".header__burger");
    const menu = document.querySelector(".header__links");

    burger.addEventListener("click", () => {
    menu.classList.toggle("active");
        burger.classList.toggle("open");
    });
});
