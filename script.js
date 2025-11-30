document.addEventListener('DOMContentLoaded', () => {
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
    function showPage(pageId, subPageId = null) {
        // 1. Esconder todas as páginas e desativar todos os links principais
        pages.forEach(p => p.classList.remove('active'));
        navLinks.forEach(l => {
            l.classList.remove('active');
            const subNav = l.parentElement.querySelector('.sub-nav-list');
            if (subNav) subNav.classList.remove('is-visible'); 
        });

        // 2. Ativar a página principal correta
        const targetPage = document.getElementById(pageId);
        if (!targetPage) {
            console.error(`Página com ID "${pageId}" não encontrada.`);
            return;
        }
        targetPage.classList.add('active');

        // 3. Ativar o link principal correspondente na sidebar
        const activeLink = sidebar.querySelector(`.nav-link[data-target="${pageId}"]`);
        if (activeLink) {
            // Remove a classe de cor de todos os links antes de adicionar a nova
            sidebar.querySelectorAll('.nav-link').forEach(l => l.classList.remove('bg-secondary-blue', 'bg-secondary-green', 'bg-secondary-purple', 'bg-secondary-red'));

            activeLink.classList.add('active');
            const subNav = activeLink.parentElement.querySelector('.sub-nav-list');
            if (subNav) subNav.classList.add('is-visible');

            // Adiciona a classe de cor baseada no header da página
            const header = targetPage.querySelector('.page-header');
            const colorClass = header ? Array.from(header.classList).find(c => c.startsWith('bg-')) : null;
            if (colorClass) activeLink.classList.add(colorClass);
        }

        // 4. Lidar com subpáginas
        const subPages = targetPage.querySelectorAll('.sub-page');
        if (subPages.length > 0) {
            // Esconder todas as subpáginas primeiro
            subPages.forEach(sp => sp.classList.remove('active'));

            // Determinar qual subpágina mostrar
            let targetSubPage;
            if (subPageId) {
                targetSubPage = targetPage.querySelector(`.sub-page[data-subpage-id="${subPageId}"]`);
                // Fallback robusto: se não encontrar a subpágina solicitada, mostra a primeira
                if (!targetSubPage) {
                    targetSubPage = subPages[0];
                }
            } else {
                // Se nenhum ID de subpágina for fornecido, mostra a primeira
                targetSubPage = subPages[0];
            }

            if (targetSubPage) {
                targetSubPage.classList.add('active');
                // Ativar o link da subpágina na sidebar
                const subPageLinkId = targetSubPage.dataset.subpageId; 
                const activeSubLink = document.querySelector(`.sub-nav-link[data-subtarget="${subPageLinkId}"]`);
                if (activeSubLink) {
                    const allSubNavLinks = activeSubLink.closest('.sub-nav-list').querySelectorAll('.sub-nav-link');
                    allSubNavLinks.forEach(sl => {
                        sl.classList.remove('active', 'bg-secondary-blue', 'bg-secondary-green', 'bg-secondary-purple', 'bg-secondary-red');
                    });
                    activeSubLink.classList.add('active');
                    const header = targetPage.querySelector('.page-header');
                    const colorClass = header ? Array.from(header.classList).find(c => c.startsWith('bg-')) : null;
                    if (colorClass) activeSubLink.classList.add(colorClass);
                }
            }
        }

        // 5. Ajustes de UI
        if (window.innerWidth >= 992) {
            // Lógica para DESKTOP
            if (pageId === 'page-home') {
                sidebar.style.display = 'none';
            } else {
                sidebar.style.display = 'block';
                // Mover a sidebar para dentro do container da página ativa
                const pageBodyContainer = targetPage.querySelector('.page-body-container');
                if (pageBodyContainer) {
                    pageBodyContainer.prepend(sidebar);
                }
            }
        } else {
            // Lógica para MOBILE
            sidebar.style.display = 'block'; // Garante que a sidebar seja 'visível' para a animação do menu
            if (sidebar.parentElement !== bodyEl) {
                bodyEl.prepend(sidebar);
            }
        }

        mainContentEl.scrollTop = 0;
        if (window.innerWidth < 992) closeMobileMenu();
    }

    function handleNavClick(event, clickedElement) {
        event.preventDefault();
        const pageTarget = clickedElement.getAttribute('data-target');
        const subPageTarget = clickedElement.getAttribute('data-subtarget');
        showPage(pageTarget, subPageTarget);
    }

    // --- MENU MOBILE ---
    const openMobileMenu = () => {
        sidebar.classList.add('is-open');
        overlay.classList.add('is-visible');
    };
    const closeMobileMenu = () => {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
    };

    // --- BOTÃO "VOLTAR AO TOPO" ---
    window.scrollToTop = () => { mainContentEl.scrollTo({ top: 0, behavior: 'smooth' }); };

    // --- LÓGICA DE SCROLL (STICKY SIDEBAR) ---
    mainContentEl.addEventListener('scroll', () => {
        // Botão de voltar ao topo
        scrollTopBtn.style.display = mainContentEl.scrollTop > 100 ? "block" : "none";
    });

    // --- GERAÇÃO DINÂMICA DE CONTEÚDO ---
    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    function populateDynamicContent() {
        const pagesWithSubnav = document.querySelectorAll('.page:not(#page-home)');
        pagesWithSubnav.forEach(page => {
            const pageId = page.id;
            const subPages = Array.from(page.querySelectorAll('.sub-page'));
            const mainNavLink = document.querySelector(`.sidebar .nav-link[data-target="${pageId}"]`);
            const subNavList = mainNavLink ? mainNavLink.parentElement.querySelector('.sub-nav-list') : null;
            
            if (subNavList) {
                subNavList.innerHTML = ''; // Limpa sub-menus existentes
                if (subPages.length > 0) {
                    subPages.forEach((subPage, index) => {
                        const h2 = subPage.querySelector('h2');
                        if (!h2) return;

                        const title = h2.textContent;
                        const subPageId = subPage.dataset.subpageId || slugify(title);
                        subPage.dataset.subpageId = subPageId; // Garante que o ID existe

                        // 1. Popular Sub-menu na Sidebar
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = '#';
                        link.textContent = title;
                        link.classList.add('sub-nav-link');
                        link.dataset.target = pageId;
                        link.dataset.subtarget = subPageId;
                        listItem.appendChild(link);
                        subNavList.appendChild(listItem);

                        // 2. Criar botões de Paginação
                        const paginationNav = subPage.querySelector('.pagination-nav');
                        if (paginationNav) {
                            paginationNav.innerHTML = ''; // Limpa paginação existente

                            // Botão "Anterior"
                            if (index > 0) {
                                const prevSubPage = subPages[index - 1];
                                const prevTitle = prevSubPage.querySelector('h2').textContent;
                                const prevId = prevSubPage.dataset.subpageId;
                                const prevLink = document.createElement('a');
                                prevLink.href = '#';
                                prevLink.classList.add('pagination-link', 'prev');
                                prevLink.dataset.target = pageId;
                                prevLink.dataset.subtarget = prevId;
                                prevLink.innerHTML = `&larr; Anterior: ${prevTitle}`;
                                paginationNav.appendChild(prevLink);
                            }

                            // Botão "Próximo"
                            if (index < subPages.length - 1) {
                                const nextSubPage = subPages[index + 1];
                                const nextTitle = nextSubPage.querySelector('h2').textContent;
                                // Garante que a próxima subpágina tenha um ID definido antes de criar o link
                                const ensuredNextId = nextSubPage.dataset.subpageId || slugify(nextTitle);
                                nextSubPage.dataset.subpageId = ensuredNextId;
                                const nextLink = document.createElement('a');
                                nextLink.href = '#';
                                nextLink.classList.add('pagination-link', 'next');
                                nextLink.dataset.target = pageId;
                                nextLink.dataset.subtarget = ensuredNextId;
                                nextLink.innerHTML = `Próximo: ${nextTitle} &rarr;`;
                                paginationNav.appendChild(nextLink);
                            }
                        }
                    });
                }
            }
        });
    }

    // --- LIGHTBOX PARA IMAGENS DAS SEÇÕES ---
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    const lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    const closeLightbox = () => lightbox.classList.remove('is-visible');
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    function attachLightbox() {
        const contentImages = document.querySelectorAll('.page-content img');
        contentImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || '';
                lightbox.classList.add('is-visible');
            });
        });
    }

    // --- INICIALIZAÇÃO E EVENT LISTENERS ---
    populateDynamicContent();
    attachLightbox();

    document.body.addEventListener('click', (event) => {
        const target = event.target.closest('a');
        if (target && (target.matches('.nav-link') || target.matches('.home-nav-btn') || target.matches('.sub-nav-link') || target.matches('.pagination-link') || target.matches('.top-logo-link'))) {
            handleNavClick(event, target);
        }
    });

    mobileMenuBtn.addEventListener('click', openMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);

    // Define o estado inicial da UI
    showPage('page-home');
});
