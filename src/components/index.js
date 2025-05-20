import "../pages/index.css";
import { createCard } from "./card.js";
import { openModal, closeModal } from "./modal.js";
import {
  config,
  getUserData,
  updateProfile,
  addNewCard,
  deleteCardApi,
  toggleLike,
  updateAvatar,
  validateImageUrl,
  getInitialCards,
} from "./api.js";
import { enableFormValidation, resetFormValidation } from "./validation.js";

// DOM элементы
const elements = {
  cardsContainer: document.querySelector(".places__list"),
  buttonEditProfile: document.querySelector(".profile__edit-button"),
  popupEditProfile: document.querySelector(".popup_type_edit"),
  buttonAddCard: document.querySelector(".profile__add-button"),
  popupAddCard: document.querySelector(".popup_type_new-card"),
  nameInput: document.querySelector(".popup__input_type_name"),
  aboutInput: document.querySelector(".popup__input_type_description"),
  nameTitle: document.querySelector(".profile__title"),
  jobTitle: document.querySelector(".profile__description"),
  popupImage: document.querySelector(".popup__image"),
  popupImageOpen: document.querySelector(".popup_type_image"),
  popupImageDescription: document.querySelector(".popup__caption"),
  formAddCard: document.querySelector('.popup__form[name="new-place"]'),
  formEditProfile: document.querySelector('.popup__form[name="edit-profile"]'),
  profileAvatar: document.querySelector(".profile__image"),
  popupAvatar: document.querySelector(".popup_type_new_avatar"),
  formAvatar: document.querySelector('.popup__form[name="new-avatar"]'),
};

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Установка конфигурации API
config.baseUrl = "https://nomoreparties.co/v1/wff-cohort-39";
config.headers.authorization = "347a52db-cb7d-4c20-934d-7f0877b61624";

let currentUserId = null;

// Инициализация приложения
function initApp() {
  // Добавляем класс анимации для всех попапов
  document.querySelectorAll(".popup").forEach((popup) => {
    popup.classList.add("popup_is-animated");
  });
  Promise.all([getUserData(), getInitialCards()])
    .then(([userData, cards]) => {
      currentUserId = userData._id;
      renderProfile(userData);
      renderCards(cards);
      setupEventListeners();
    })
    .catch((err) => console.error("Ошибка при загрузке данных:", err));
}

// Рендеринг профиля
function renderProfile(userData) {
  elements.nameTitle.textContent = userData.name;
  elements.jobTitle.textContent = userData.about;
  elements.profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;
}

// Рендеринг карточек
function renderCards(cards) {
  cards.forEach((card) => {
    const cardElement = createCard(
      card,
      (cardId) => handleDeleteCard(cardId),
      (cardId, isLiked) => handleLikeCard(cardId, isLiked),
      (link, name) => openPopupImage(link, name),
      currentUserId,
      openModal,
      closeModal
    );
    elements.cardsContainer.append(cardElement);
  });
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Редактирование профиля
  elements.buttonEditProfile.addEventListener("click", () => {
    elements.nameInput.value = elements.nameTitle.textContent;
    elements.aboutInput.value = elements.jobTitle.textContent;
    resetFormValidation(elements.formEditProfile, validationConfig); // Передаем конфигурацию
    openModal(elements.popupEditProfile);
  });

  elements.buttonAddCard.addEventListener("click", () => {
    elements.formAddCard.reset(); // Очищаем форму от старых значений
    resetFormValidation(elements.formAddCard, validationConfig); // Передаем конфигурацию
    openModal(elements.popupAddCard);
  });

  enableFormValidation(validationConfig); // Передаем конфигурацию

  // Обновление аватара
  elements.profileAvatar.addEventListener("click", () => {
    elements.formAvatar.reset(); // Сбрасываем форму
    resetFormValidation(elements.formAvatar, validationConfig); // Передаем конфигурацию
    openModal(elements.popupAvatar);
  });

  // Форма редактирования профиля
  elements.formEditProfile.addEventListener("submit", handleProfileSubmit);

  // Форма добавления карточки
  elements.formAddCard.addEventListener("submit", handleAddCardSubmit);

  // Форма обновления аватара
  elements.formAvatar.addEventListener("submit", handleAvatarSubmit);

  // Обработчики закрытия модальных окон
  document.querySelectorAll(".popup__close").forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
      const currentModal = closeButton.closest(".popup");
      closeModal(currentModal);
    });
  });
}

// Утилитарная функция для управления состоянием кнопок
function handleSubmitButton(button, isLoading, defaultText = "Сохранить") {
  button.textContent = isLoading ? "Сохранение..." : defaultText;
  button.disabled = isLoading;
}

// Обработчики форм
function handleProfileSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  handleSubmitButton(submitButton, true);

  updateProfile(elements.nameInput.value, elements.aboutInput.value)
    .then((userData) => {
      renderProfile(userData);
      closeModal(elements.popupEditProfile);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении профиля:", err);
    })
    .finally(() => {
      handleSubmitButton(submitButton, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const urlInput = elements.formAddCard.elements.link;
  const cardNameInput = elements.formAddCard.elements["place-name"];
  const errorElement = elements.formAddCard.querySelector(
    `.${urlInput.id}-error`
  );

  // Очищаем предыдущие ошибки
  errorElement.textContent = "";
  errorElement.classList.remove("popup__error_visible");

  // Проверяем URL перед загрузкой
  try {
    new URL(urlInput.value);
  } catch (e) {
    errorElement.textContent = "Введите корректный URL";
    errorElement.classList.add("popup__error_visible");
    return;
  }

  handleSubmitButton(submitButton, true);

  // Предзагрузка изображения
  const preloadImage = new Image();
  let timeoutId;

  // Устанавливаем таймаут для предзагрузки
  timeoutId = setTimeout(() => {
    preloadImage.src = ""; // Останавливаем загрузку
    errorElement.textContent = "Превышено время ожидания загрузки изображения";
    errorElement.classList.add("popup__error_visible");
    handleSubmitButton(submitButton, false);
  }, 10000); // 10 секунд таймаут

  preloadImage.onload = () => {
    clearTimeout(timeoutId);
    addNewCard(cardNameInput.value, urlInput.value)
      .then((newCard) => {
        const cardElement = createCard(
          newCard,
          (cardId) => handleDeleteCard(cardId),
          (cardId, isLiked) => handleLikeCard(cardId, isLiked),
          (link, name) => openPopupImage(link, name),
          currentUserId,
          openModal,
          closeModal
        );
        elements.cardsContainer.prepend(cardElement);
        closeModal(elements.popupAddCard);
        elements.formAddCard.reset();
      })
      .catch((err) => {
        console.error("Ошибка:", err);
        errorElement.textContent =
          err.message || "Произошла ошибка при создании карточки";
        errorElement.classList.add("popup__error_visible");
      })
      .finally(() => {
        handleSubmitButton(submitButton, false);
      });
  };

  preloadImage.onerror = () => {
    clearTimeout(timeoutId);
    errorElement.textContent = "Не удалось загрузить изображение";
    errorElement.classList.add("popup__error_visible");
    handleSubmitButton(submitButton, false);
  };

  preloadImage.src = urlInput.value;
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const avatarInput = elements.formAvatar.elements.avatar;
  const avatarUrl = avatarInput.value;
  const errorElement = elements.formAvatar.querySelector(".avatar-input-error");

  // Очищаем предыдущие ошибки
  errorElement.textContent = "";
  errorElement.classList.remove("popup__error_visible");

  // Проверяем URL перед загрузкой
  try {
    new URL(avatarUrl);
  } catch (e) {
    errorElement.textContent = "Введите корректный URL";
    errorElement.classList.add("popup__error_visible");
    return;
  }

  handleSubmitButton(submitButton, true);

  // Предзагрузка изображения
  const preloadImage = new Image();
  let timeoutId;

  // Устанавливаем таймаут для предзагрузки
  timeoutId = setTimeout(() => {
    preloadImage.src = ""; // Останавливаем загрузку
    errorElement.textContent = "Превышено время ожидания загрузки изображения";
    errorElement.classList.add("popup__error_visible");
    handleSubmitButton(submitButton, false);
  }, 10000); // 10 секунд таймаут

  preloadImage.onload = () => {
    clearTimeout(timeoutId);
    updateAvatar(avatarUrl)
      .then((userData) => {
        renderProfile(userData);
        closeModal(elements.popupAvatar);
        elements.formAvatar.reset();
      })
      .catch((err) => {
        console.error("Ошибка при обновлении аватара:", err);
        errorElement.textContent =
          err.message || "Произошла ошибка при обновлении аватара";
        errorElement.classList.add("popup__error_visible");
      })
      .finally(() => {
        handleSubmitButton(submitButton, false);
      });
  };

  preloadImage.onerror = () => {
    clearTimeout(timeoutId);
    errorElement.textContent = "Не удалось загрузить изображение";
    errorElement.classList.add("popup__error_visible");
    handleSubmitButton(submitButton, false);
  };

  preloadImage.src = avatarUrl;
}

// Работа с карточками
function handleLikeCard(cardId, isLiked) {
  return toggleLike(cardId, isLiked)
    .then((updatedCard) => {
      return updatedCard;
    })
    .catch((err) => {
      console.error("Ошибка при обработке лайка:", err);
      throw err; // Пробрасываем ошибку дальше для обработки в card.js
    });
}

function handleDeleteCard(cardId) {
  return deleteCardApi(cardId)
    .then(() => true)
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
      throw err; // Пробрасываем ошибку дальше для обработки в card.js
    });
}

// Вспомогательные функции
function openPopupImage(imageSrc, imageAlt) {
  elements.popupImage.src = imageSrc;
  elements.popupImage.alt = imageAlt;
  elements.popupImageDescription.textContent = imageAlt;
  openModal(elements.popupImageOpen);
}

// Инициализация приложения
initApp();
