// Scroll reveal para proyectos
const cards = document.querySelectorAll('.project-card');

const reveal = () => {
  const windowHeight = window.innerHeight;
  cards.forEach(card => {
    const top = card.getBoundingClientRect().top;
    if(top < windowHeight - 100){
      card.style.opacity = 1;
      card.style.transform = 'translateY(0)';
    }
  });
}



window.addEventListener('scroll', reveal);
window.addEventListener('load', reveal);
