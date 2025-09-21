// --- CONSTANTES GLOBAIS ---
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const mainContentEl = document.querySelector('.main-content');
const homeNavButtons = document.querySelectorAll('.home-nav-btn');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const scrollTopBtn = document.getElementById("scrollTopBtn");
const bodyEl = document.body;

// --- NAVEGAÇÃO DE PÁGINAS ---
function showPage(targetId) {
    // Desativa a página e o link de navegação antigos
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => {
        l.classList.remove('active');
        const subNav = l.parentElement.querySelector('.sub-nav-list');
        if (subNav) {
            subNav.classList.remove('is-visible');
        }
    });

    // Ativa a nova página e o link de navegação correspondente
    const targetPage = document.getElementById(targetId);
    const correspondingNavLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);

    if (targetPage) {
        targetPage.classList.add('active');
    }
    if (correspondingNavLink) {
        correspondingNavLink.classList.add('active');
        const subNav = correspondingNavLink.parentElement.querySelector('.sub-nav-list');
        if (subNav) {
            subNav.classList.add('is-visible');
        }
    }

    // Esconde a sidebar na página inicial, mostra nas outras
    if (targetId === 'page-home') {
        bodyEl.classList.add('home-active');
    } else {
        bodyEl.classList.remove('home-active');
    }

    mainContentEl.scrollTop = 0; // Rola para o topo da nova página

    // Fecha o menu mobile se estiver aberto
    if (window.innerWidth < 992) {
        closeMobileMenu();
    }
}

function handleNavClick(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('data-target');
    showPage(targetId);
}

// --- SCRIPT PARA O MENU MOBILE ---
function openMobileMenu() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
}

function closeMobileMenu() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
}

// --- SCRIPT PARA O BOTÃO "VOLTAR AO TOPO" ---
mainContentEl.onscroll = () => { scrollTopBtn.style.display = mainContentEl.scrollTop > 100 ? "block" : "none"; };
const scrollToTop = () => { mainContentEl.scrollTo({top: 0, behavior: 'smooth'}); };

// --- GERAÇÃO DINÂMICA DO SUB-MENU ---
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Substitui espaços por -
        .replace(/[^\w\-]+/g, '')       // Remove caracteres não-alfanuméricos
        .replace(/\-\-+/g, '-')         // Substitui múltiplos - por um único -
        .replace(/^-+/, '')             // Remove hífens do início
        .replace(/-+$/, '');            // Remove hífens do fim
}

function populateSubNavs() {
    navLinks.forEach(navLink => {
        const targetId = navLink.dataset.target;
        const page = document.getElementById(targetId);
        const subNavList = navLink.parentElement.querySelector('.sub-nav-list');

        if (!page || !subNavList) return;

        const headings = page.querySelectorAll('.page-content h2');
        if (headings.length === 0) return;

        headings.forEach(h2 => {
            const headingText = h2.textContent;
            const headingId = slugify(headingText);
            h2.id = headingId;

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${headingId}`;
            link.textContent = headingText;
            link.classList.add('sub-nav-link');
            
            listItem.appendChild(link);
            subNavList.appendChild(listItem);
        });
    });
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
navLinks.forEach(link => link.addEventListener('click', handleNavClick));
homeNavButtons.forEach(button => button.addEventListener('click', handleNavClick));
mobileMenuBtn.addEventListener('click', openMobileMenu);
overlay.addEventListener('click', closeMobileMenu);

sidebar.addEventListener('click', (event) => {
    if (event.target.matches('.sub-nav-link')) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            // Calcula a posição correta do elemento dentro do container de rolagem.
            // getBoundingClientRect() nos dá a posição relativa à janela de visualização (viewport).
            const containerRect = mainContentEl.getBoundingClientRect();
            const elementRect = targetElement.getBoundingClientRect();

            // A posição de rolagem de destino é a posição atual de rolagem
            // mais a distância do elemento até o topo do container.
            const offset = elementRect.top - containerRect.top;

            mainContentEl.scrollTo({
                top: mainContentEl.scrollTop + offset,
                behavior: 'smooth'
            });
        }
    }
});

// Define o estado inicial da UI no carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    populateSubNavs();
    showPage('page-home');
});