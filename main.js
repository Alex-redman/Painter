let currentIndex = 0;
let modal = document.getElementById("modal");
let modalImg = document.getElementById("modal-img");
let nextBtn = document.getElementById("next");
let prevBtn = document.getElementById("prev");

let touchStartX = 0;
let touchEndX = 0;

let images = [];

function openModal(index) {
  currentIndex = index;
  changeImageWithAnimation(images[index].src);
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function showNext() {
  currentIndex = (currentIndex + 1) % images.length;
  changeImageWithAnimation(images[currentIndex].src);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
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

    modal.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    });

    modal.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    });
  })
  .catch((err) => console.error("Error loading JSON:", err));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  if (!modal.classList.contains("hidden")) {
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active');
    }
  });
}, {
  threshold: 0.3
});

document.querySelectorAll('.aboutMe-content, .aboutMe-container-img')
  .forEach(el => observer.observe(el));
