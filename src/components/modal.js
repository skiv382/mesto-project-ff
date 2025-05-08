export function openModal(currentModal) {
  currentModal.classList.add("popup_is-opened");
  currentModal.addEventListener("click", closeModalOverlay);
  document.addEventListener("keydown", closeModalEscape);

  currentModal.setAttribute("aria-hidden", "false");
}

export function closeModal(currentModal) {
  if (!currentModal) return;

  currentModal.classList.remove("popup_is-opened");
  currentModal.removeEventListener("click", closeModalOverlay);
  document.removeEventListener("keydown", closeModalEscape);

  currentModal.setAttribute("aria-hidden", "true");
}

export function closeModalOverlay(evt) {
  const currentModal = evt.currentTarget;
  if (evt.target === currentModal) {
    closeModal(currentModal);
  }
}

export function closeModalEscape(evt) {
  if (evt.key === "Escape") {
    const currentModal = document.querySelector(".popup_is-opened");
    if (currentModal) {
      closeModal(currentModal);
    }
  }
}

document.querySelectorAll('.popup__close').forEach(button => {
    button.addEventListener('click', () => {
      const popup = button.closest('.popup');
      closeModal(popup);
    });
  });