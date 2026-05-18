import './styles/style.css';
import './styles/ingredients.css'

window.addEventListener('scroll', () => {
    let scrolled = false ;
    if (window.scrollY > 50){
        scrolled = true;
    }
    document.getElementById("navbar")!.classList.toggle('scrolled',scrolled);
    document.getElementById("title")!.classList.toggle('scrolled',scrolled);
     
});
