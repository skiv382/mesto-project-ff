export function openModal(currentModal) {
  if (!currentModal) return;
  
  // Удаляем предыдущие обработчики, если они есть
  currentModal.removeEventListener("click", closeModalOverlay);
  document.removeEventListener("keydown", closeModalEscape);
  
  // Добавляем новые обработчики
  currentModal.addEventListener("click", closeModalOverlay);
  document.addEventListener("keydown", closeModalEscape);
  
  // Открываем модальное окно
  currentModal.classList.add("popup_is-opened");
  currentModal.setAttribute("aria-hidden", "false");
}

export function closeModal(currentModal) {
  if (!currentModal) return;

  // Удаляем обработчики
  currentModal.removeEventListener("click", closeModalOverlay);
  document.removeEventListener("keydown", closeModalEscape);

  // Закрываем модальное окно
  currentModal.classList.remove("popup_is-opened");
  currentModal.setAttribute("aria-hidden", "true");
}

export function closeModalOverlay(evt) {
  const currentModal = evt.currentTarget;
  // Проверяем, что клик был именно по оверлею
  if (evt.target === currentModal) {
    closeModal(currentModal);
  }
}

export function closeModalEscape(evt) {
  if (evt.key === "Escape") {
    const currentModal = document.querySelector(".popup_is-opened");
    closeModal(currentModal);
  }
}
