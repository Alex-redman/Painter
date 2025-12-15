let currentIndex = 0;
let modal = document.getElementById("modal");
let modalImg = document.getElementById("modal-img");
let nextBtn = document.getElementById("next");
let prevBtn = document.getElementById("prev");
let galleryBtn = document.getElementById("gallery-button");
let closeBtn = document.getElementById("close-modal");
let lastFocused = null;

let touchStartX = 0;
let touchEndX = 0;

let images = [];

function updateModalContent(index) {
  let topContainer = modal.querySelector(".modal-top-content-container");

  if (!topContainer) {
    topContainer = document.createElement("div");
    topContainer.className = "modal-top-content-container";
    modalImg.parentElement.insertBefore(topContainer, modalImg);
  }

  topContainer.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "modal-top-content-title";
  title.textContent = images[index].title || "";
  topContainer.appendChild(title);

  function createDescriptionBlock(size, price, ready) {
    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "modal-top-content-description";

    const sizeEl = document.createElement("p");
    sizeEl.className = "modal-top-content-description-size";
    sizeEl.textContent = size || "";

    const priceEl = document.createElement("p");
    priceEl.className = "modal-top-content-description-price";
    priceEl.textContent = price || "";

    if (ready === false) {
      const readySpan = document.createElement("span");
      readySpan.className = "modal-top-content-description-price-ready";
      readySpan.textContent = " (на замовлення)";
      priceEl.appendChild(readySpan);
    }

    descriptionDiv.appendChild(sizeEl);
    descriptionDiv.appendChild(priceEl);
    return descriptionDiv;
  }

  topContainer.appendChild(
    createDescriptionBlock(
      images[index].size1,
      images[index].price1,
      images[index].ready1
    )
  );

  if (images[index].size2 && images[index].price2) {
    topContainer.appendChild(
      createDescriptionBlock(
        images[index].size2,
        images[index].price2,
        images[index].ready2
      )
    );
  }

  if (images[index].size3 && images[index].price3) {
    topContainer.appendChild(
      createDescriptionBlock(
        images[index].size3,
        images[index].price3,
        images[index].ready3
      )
    );
  }

  let descriptionEl = modal.querySelector(".modal-description");

  if (!descriptionEl) {
    descriptionEl = document.createElement("p");
    descriptionEl.className = "modal-description";
    modalImg.parentElement.appendChild(descriptionEl);
  }

  descriptionEl.textContent = images[index].description || "";
}

function openModal(index) {
  currentIndex = index;
  updateModalContent(index);
  changeImageWithAnimation(images[index].src);
  lastFocused = document.activeElement;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  try {
    modal.inert = false;
  } catch (e) {}
  if (closeBtn) closeBtn.focus();
  const mainEl = document.querySelector("main");
  const headerEl = document.querySelector("header");
  if (mainEl) {
    try {
      mainEl.inert = true;
    } catch (e) {}
  }
  if (headerEl) {
    try {
      headerEl.inert = true;
    } catch (e) {}
  }
}

function closeModal() {
  try {
    if (galleryBtn && typeof galleryBtn.focus === "function") {
      galleryBtn.focus();
    } else if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      const tmp = document.createElement("div");
      tmp.setAttribute("tabindex", "-1");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      document.body.appendChild(tmp);
      tmp.focus();
      document.body.removeChild(tmp);
    }
  } catch (e) {
    try {
      document.activeElement && document.activeElement.blur();
    } catch (e) {}
  }

  try {
    modal.inert = true;
  } catch (e) {}
  modal.classList.add("hidden");
  document.body.style.overflow = "";

  const mainEl = document.querySelector("main");
  const headerEl = document.querySelector("header");
  if (mainEl) {
    try {
      mainEl.inert = false;
    } catch (e) {}
  }
  if (headerEl) {
    try {
      headerEl.inert = false;
    } catch (e) {}
  }
}

function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  updateModalContent(currentIndex);
  changeImageWithAnimation(images[currentIndex].src);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateModalContent(currentIndex);
  changeImageWithAnimation(images[currentIndex].src);
}

fetch("images.json")
  .then((res) => res.json())
  .then((data) => {
    images = data;
    const gallery = document.getElementById("gallery-imgs");

    nextBtn.addEventListener("click", showNext);
    prevBtn.addEventListener("click", showPrev);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    images.forEach((image, i) => {
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt;
      img.loading = "lazy";
      img.classList.add("gallery-img", `img-${i + 1}`);
      img.addEventListener("click", () => openModal(i));
      gallery.appendChild(img);
    });

    filterGallery("усі");

    const categoryButtons = document.querySelectorAll(
      ".header-button-list button"
    );
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.id.toLowerCase();
        filterGallery(category);

        const galleryList = document.getElementById("gallery-list");
        if (galleryList) {
          if (galleryBtn && typeof galleryBtn.focus === "function") {
            galleryBtn.focus();
          } else if (
            document.activeElement &&
            typeof document.activeElement.blur === "function"
          ) {
            document.activeElement.blur();
          }
          galleryList.classList.remove("visible");
          galleryList.setAttribute("aria-hidden", "true");
        }
        if (galleryBtn) galleryBtn.setAttribute("aria-expanded", "false");
      });
    });

    modal.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    });

    modal.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
  })
  .catch((err) => console.error("Error loading JSON:", err));

document.addEventListener("keydown", (e) => {
  // Close modal only if it's open and focus is inside it
  if (e.key === "Escape") {
    if (
      !modal.classList.contains("hidden") &&
      modal.contains(document.activeElement)
    ) {
      closeModal();
      return;
    }
  }

  if (!modal.classList.contains("hidden")) {
    if (e.key === "ArrowRight") {
      showNext();
      return;
    }
    if (e.key === "ArrowLeft") {
      showPrev();
      return;
    }

    if (e.key === "Tab") {
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const focusableArr = Array.from(focusable).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
      if (focusableArr.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusableArr[0];
      const last = focusableArr[focusableArr.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }
});

function handleSwipe() {
  const diff = touchEndX - touchStartX;

  if (Math.abs(diff) < 50) return;
  if (diff < 0) {
    showNext();
  } else {
    showPrev();
  }
}

function changeImageWithAnimation(newSrc) {
  modalImg.classList.add("fade-out");

  setTimeout(() => {
    modalImg.src = newSrc;
    modalImg.classList.remove("fade-out");
    modalImg.classList.add("fade-in");

    setTimeout(() => {
      modalImg.classList.remove("fade-in");
    }, 250);
  }, 250);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        entry.target.classList.remove("active");
      }
    });
  },
  {
    threshold: 0.3,
  }
);

document
  .querySelectorAll(".aboutMe-content, .aboutMe-container-img")
  .forEach((el) => observer.observe(el));

galleryBtn.addEventListener("click", () => {
  const gallerySection =
    document.getElementById("gallery-list") ||
    document.querySelector(".header-button-lists");
  const isVisible = gallerySection.classList.toggle("visible");
  gallerySection.setAttribute("aria-hidden", isVisible ? "false" : "true");
  galleryBtn.setAttribute("aria-expanded", isVisible ? "true" : "false");
});

function filterGallery(category) {
  const gallery = document.getElementById("gallery-imgs");
  gallery.innerHTML = "";
  const filteredImages =
    category === "усі"
      ? images
      : images.filter((img) => {
          if (!img.categories) return false;
          if (Array.isArray(img.categories)) {
            return img.categories
              .map((c) => c.toLowerCase().trim())
              .includes(category.toLowerCase());
          }
          return img.categories
            .toLowerCase()
            .split(",")
            .map((s) => s.trim())
            .includes(category.toLowerCase());
        });

  if (filteredImages.length === 0) {
    const message = document.createElement("div");
    message.className = "gallery-empty-message";
    message.textContent = `На жаль, поки що немає картин у категорії "${
      category.charAt(0).toUpperCase() + category.slice(1)
    }"`;
    gallery.appendChild(message);
    return;
  }

  filteredImages.forEach((image, i) => {
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.loading = "lazy";
    img.classList.add("gallery-img", `img-${i + 1}`);

    const originalIndex = images.indexOf(image);
    img.addEventListener("click", () => openModal(originalIndex));

    gallery.appendChild(img);
  });
}
