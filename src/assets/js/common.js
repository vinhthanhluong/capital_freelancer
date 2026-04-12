const initHeaderScroll = () => {
    const header = document.querySelector('header');
    const scrollThreshold = 20;

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
        header.classList.add('active');
        } else {
        header.classList.remove('active');
        }
    });
};

const initFixedBtn = () => {
    const fixedElement = document.querySelector('.c-fixed');
    const scrollButton = document.querySelector('.c-totop');

    if (!fixedElement) return;

    const toggleFixed = () => {
        const vh50 = window.innerHeight / 2;

        if (window.scrollY > vh50) {
            fixedElement.classList.add('show');
            scrollButton.classList.add('show');
        } else {
            fixedElement.classList.remove('show');
            scrollButton.classList.remove('show');
        }
    };

    window.addEventListener('scroll', toggleFixed);
    toggleFixed();
};

const initBackToTop = () => {
    const scrollButtons = document.querySelectorAll('.c-fixed .totop, .c-totop');

    const scrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({
        top: 0,
        behavior: 'smooth'
        });
    };

    scrollButtons.forEach(btn => {
        btn.addEventListener('touchstart', scrollToTop, { passive: false });
        btn.addEventListener('click', scrollToTop);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initFixedBtn();
    initBackToTop();
});