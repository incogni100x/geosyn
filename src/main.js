function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!hamburgerBtn || !mobileMenu) return;

  hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

function initServicesCarousel() {
  const carousel = document.getElementById('services-carousel');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('div');
  let currentIndex = 2; // Start at first real card
  let autoSlideInterval;
  const realCardsCount = 4; // 4 real service cards
  const startIndex = 2; // First real card index

  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  function getCardsPerView() {
    return window.innerWidth >= 768 ? 3 : 1;
  }

  function setCardWidths() {
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop && cards.length > 0) {
      const container = carousel.parentElement;
      const containerWidth = container.offsetWidth;
      const gap = 32;
      const totalGaps = gap * 2;
      const cardWidth = (containerWidth - totalGaps) / 3;

      cards.forEach((card) => {
        card.style.width = `${cardWidth}px`;
      });
    } else {
      cards.forEach((card) => {
        card.style.width = '';
      });
    }
  }

  function getRealPosition() {
    if (currentIndex < startIndex) return 0;
    return currentIndex - startIndex;
  }

  function updateDots() {
    if (!dotsContainer) return;
    const isDesktop = window.innerWidth >= 768;
    const cardsPerView = isDesktop ? 3 : 1;
    const totalPositions = Math.max(1, realCardsCount - cardsPerView + 1);

    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalPositions; i += 1) {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all ${
        getRealPosition() === i ? 'bg-[#0061A9] w-6' : 'bg-gray-300'
      }`;
      dot.setAttribute('data-position', i.toString());
      dot.addEventListener('click', () => goToPosition(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goToPosition(position) {
    if (window.innerWidth >= 768) {
      currentIndex = startIndex + position;
      updateCarousel();
      updateDots();
    }
  }

  function updateCarousel(instant = false) {
    if (cards.length === 0) return;

    const cardsPerView = getCardsPerView();
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      const container = carousel.parentElement;
      const containerWidth = container.offsetWidth;
      const gap = 32;
      const totalGaps = gap * 2;
      const cardWidth = (containerWidth - totalGaps) / 3;
      const offset = -currentIndex * (cardWidth + gap);

      if (instant) {
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(${offset}px)`;
        setTimeout(() => {
          carousel.style.transition = '';
        }, 50);
      } else {
        carousel.style.transform = `translateX(${offset}px)`;
      }
    } else {
      const firstCard = cards[0];
      if (!firstCard || firstCard.offsetWidth === 0) return;
      const gap = 32;
      const cardWidth = firstCard.offsetWidth;
      const offset = -currentIndex * (cardWidth + gap);
      carousel.style.transform = `translateX(${offset}px)`;
    }

    updateDots();
  }

  function nextSlide() {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      const cardsPerView = getCardsPerView();
      const maxRealIndex = startIndex + (realCardsCount - cardsPerView);
      currentIndex += 1;

      if (currentIndex > maxRealIndex) {
        updateCarousel();
        setTimeout(() => {
          currentIndex = startIndex;
          updateCarousel(true);
        }, 450);
      } else {
        updateCarousel();
      }
    } else {
      const maxIndex = Math.max(0, realCardsCount - 1);
      if (maxIndex <= 0) return;

      if (currentIndex < startIndex) currentIndex = startIndex;

      currentIndex += 1;
      if (currentIndex > startIndex + maxIndex) {
        currentIndex = startIndex;
      }
      updateCarousel();
    }
  }

  function prevSlide() {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      const cardsPerView = getCardsPerView();
      const maxRealIndex = startIndex + (realCardsCount - cardsPerView);
      currentIndex -= 1;

      if (currentIndex < startIndex) {
        currentIndex = maxRealIndex;
      }
      updateCarousel();
    } else {
      const maxIndex = Math.max(0, realCardsCount - 1);
      if (maxIndex <= 0) return;

      if (currentIndex <= startIndex) {
        currentIndex = startIndex + maxIndex;
      } else {
        currentIndex -= 1;
      }
      updateCarousel();
    }
  }

  function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 4000);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      clearInterval(autoSlideInterval);
      nextSlide();
      startAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      clearInterval(autoSlideInterval);
      prevSlide();
      startAutoSlide();
    });
  }

  let resizeTimeout;
  
function initAboutDropdown() {
  const desktopToggle = document.getElementById('about-desktop-toggle');
  const desktopMenu = document.getElementById('about-desktop-menu');
  const mobileToggle = document.getElementById('about-mobile-toggle');
  const mobileMenu = document.getElementById('about-mobile-menu');

  const closeMenu = (menu, toggle) => {
    if (!menu || !toggle) return;
    if (!menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  if (desktopMenu) {
    desktopMenu.addEventListener('click', (event) => event.stopPropagation());
  }

  if (mobileMenu) {
    mobileMenu.addEventListener('click', (event) => event.stopPropagation());
  }

  document.addEventListener('click', (event) => {
    if (desktopMenu && desktopToggle && !desktopMenu.classList.contains('hidden')) {
      if (!desktopMenu.contains(event.target) && !desktopToggle.contains(event.target)) {
        closeMenu(desktopMenu, desktopToggle);
      }
    }

    if (mobileMenu && mobileToggle && !mobileMenu.classList.contains('hidden')) {
      if (!mobileMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
        closeMenu(mobileMenu, mobileToggle);
      }
    }
  });

  if (desktopToggle && desktopMenu) {
    desktopToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isHidden = desktopMenu.classList.toggle('hidden');
      desktopToggle.setAttribute('aria-expanded', (!isHidden).toString());
    });
  }

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isHidden = mobileMenu.classList.toggle('hidden');
      mobileToggle.setAttribute('aria-expanded', (!isHidden).toString());
    });
  }
}

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setCardWidths();
      currentIndex = startIndex;
      updateCarousel();
      startAutoSlide();
    }, 250);
  });

  setTimeout(() => {
    currentIndex = startIndex;
    setCardWidths();
    updateDots();
    updateCarousel();
    startAutoSlide();
  }, 100);
}

function initCompaniesCarousel() {
  const companiesCarousel = document.getElementById('companies-carousel');
  if (!companiesCarousel) return;

  const allCompanies = companiesCarousel.querySelectorAll('div');
  const realCompanies = companiesCarousel.querySelectorAll('div:not(.company-clone)');
  let currentCompanyIndex = 0;
  let autoSlideInterval;

  function getCompaniesPerView() {
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 3;
    return 1;
  }

  function setCompanyWidths() {
    const companiesPerView = getCompaniesPerView();
    const isMobile = window.innerWidth < 768;

    if (!isMobile && allCompanies.length > 0) {
      const container = companiesCarousel.parentElement;
      const containerWidth = container.offsetWidth;
      const gap = 32;
      const totalGaps = gap * (companiesPerView - 1);
      const companyWidth = (containerWidth - totalGaps) / companiesPerView;

      allCompanies.forEach((company) => {
        company.style.width = `${companyWidth}px`;
      });
    } else {
      allCompanies.forEach((company) => {
        company.style.width = '';
      });
    }
  }

  function updateCompaniesCarousel(instant = false) {
    if (allCompanies.length === 0) return;

    const companiesPerView = getCompaniesPerView();
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      const firstCompany = allCompanies[0];
      if (!firstCompany || firstCompany.offsetWidth === 0) return;
      const gap = 32;
      const companyWidth = firstCompany.offsetWidth;
      const offset = -currentCompanyIndex * (companyWidth + gap);

      if (instant) {
        companiesCarousel.style.transition = 'none';
        companiesCarousel.style.transform = `translateX(${offset}px)`;
        setTimeout(() => {
          companiesCarousel.style.transition = '';
        }, 50);
      } else {
        companiesCarousel.style.transform = `translateX(${offset}px)`;
      }
    } else {
      const container = companiesCarousel.parentElement;
      const containerWidth = container.offsetWidth;
      const gap = 32;
      const totalGaps = gap * (companiesPerView - 1);
      const companyWidth = (containerWidth - totalGaps) / companiesPerView;
      const offset = -currentCompanyIndex * (companyWidth + gap);

      if (instant) {
        companiesCarousel.style.transition = 'none';
        companiesCarousel.style.transform = `translateX(${offset}px)`;
        setTimeout(() => {
          companiesCarousel.style.transition = '';
        }, 50);
      } else {
        companiesCarousel.style.transform = `translateX(${offset}px)`;
      }
    }
  }

  function nextCompanySlide() {
    const realCompaniesCount = realCompanies.length;
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      currentCompanyIndex += 1;
      if (currentCompanyIndex >= realCompaniesCount) {
        currentCompanyIndex = realCompaniesCount;
        updateCompaniesCarousel();
        setTimeout(() => {
          currentCompanyIndex = 0;
          updateCompaniesCarousel(true);
        }, 450);
      } else {
        updateCompaniesCarousel();
      }
    } else {
      const companiesPerView = getCompaniesPerView();
      const maxIndex = realCompaniesCount - companiesPerView;
      currentCompanyIndex += 1;

      if (currentCompanyIndex > maxIndex) {
        updateCompaniesCarousel();
        setTimeout(() => {
          currentCompanyIndex = 0;
          updateCompaniesCarousel(true);
        }, 450);
      } else {
        updateCompaniesCarousel();
      }
    }
  }

  function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextCompanySlide, 3000);
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setCompanyWidths();
      currentCompanyIndex = 0;
      updateCompaniesCarousel();
      startAutoSlide();
    }, 250);
  });

  setTimeout(() => {
    currentCompanyIndex = 0;
    setCompanyWidths();
    updateCompaniesCarousel();
    startAutoSlide();
  }, 100);
}

function initMembersCarousel() {
  const membersCarousel = document.getElementById('members-carousel');
  if (!membersCarousel) return;

  const allMembers = membersCarousel.querySelectorAll('div');
  const realMembers = membersCarousel.querySelectorAll('div:not(.member-clone)');
  let currentMemberIndex = 0;
  let autoSlideInterval;

  if (window.innerWidth >= 768) return; // mobile only

  function updateMembersCarousel(instant = false) {
    if (allMembers.length === 0) return;

    const firstMember = allMembers[0];
    if (!firstMember || firstMember.offsetWidth === 0) return;
    const gap = 24;
    const memberWidth = firstMember.offsetWidth;
    const offset = -currentMemberIndex * (memberWidth + gap);

    if (instant) {
      membersCarousel.style.transition = 'none';
      membersCarousel.style.transform = `translateX(${offset}px)`;
      setTimeout(() => {
        membersCarousel.style.transition = '';
      }, 50);
    } else {
      membersCarousel.style.transform = `translateX(${offset}px)`;
    }
  }

  function nextMemberSlide() {
    const realMembersCount = realMembers.length;
    currentMemberIndex += 1;

    if (currentMemberIndex >= realMembersCount) {
      currentMemberIndex = realMembersCount;
      updateMembersCarousel();
      setTimeout(() => {
        currentMemberIndex = 0;
        updateMembersCarousel(true);
      }, 450);
    } else {
      updateMembersCarousel();
    }
  }

  function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextMemberSlide, 3000);
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth >= 768) {
        clearInterval(autoSlideInterval);
        return;
      }
      currentMemberIndex = 0;
      updateMembersCarousel();
      startAutoSlide();
    }, 250);
  });

  setTimeout(() => {
    currentMemberIndex = 0;
    updateMembersCarousel();
    startAutoSlide();
  }, 100);
}

window.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initAboutDropdown();
  initServicesCarousel();
  initCompaniesCarousel();
  initMembersCarousel();
});
