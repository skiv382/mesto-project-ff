import "../pages/index.css";
import { createCard } from "./card.js";
import { openModal, closeModal } from "./modal.js";
import {
  config,
  getUserData,
  getInitialCards,
  updateProfile,
  addNewCard,
  deleteCardApi,
  toggleLike,
  updateAvatar,
  validateImageUrl,
} from "./api.js";
import { enableFormValidation, resetFormValidation } from './validation.js';

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
  elements.cardsContainer.innerHTML = "";
  cards.forEach((card) => {
    const cardElement = createCard(
      card,
      (cardId) => handleDeleteCard(cardId),
      (cardId, isLiked) => handleLikeCard(cardId, isLiked),
      (link, name) => openPopupImage(link, name),
      currentUserId,
      openModal
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
  resetFormValidation(elements.formEditProfile); // Сброс валидации
  openModal(elements.popupEditProfile);
});

elements.buttonAddCard.addEventListener("click", () => {
  resetFormValidation(elements.formAddCard); // Сброс валидации
  openModal(elements.popupAddCard);
});

enableFormValidation();

  // Обновление аватара
  elements.profileAvatar.addEventListener("click", () => {
    elements.formAvatar.reset(); // Сбрасываем форму
    resetFormValidation(elements.formAvatar); // Сбрасываем валидацию
    openModal(elements.popupAvatar);
  });

  // Форма редактирования профиля
  elements.formEditProfile.addEventListener("submit", handleProfileSubmit);

  // Форма добавления карточки
  elements.formAddCard.addEventListener("submit", handleAddCardSubmit);

  // Форма обновления аватара
  elements.formAvatar.addEventListener("submit", handleAvatarSubmit);
}

// Обработчики форм
function handleProfileSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = "Сохранение...";

  updateProfile(elements.nameInput.value, elements.aboutInput.value)
    .then((userData) => {
      renderProfile(userData);
      closeModal(elements.popupEditProfile);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении профиля:", err);
    })
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const urlInput = elements.formAddCard.elements.link;
  const cardNameInput = elements.formAddCard.elements["place-name"];

  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  // Предзагрузка изображения
  const preloadImage = new Image();
  preloadImage.src = urlInput.value;

  preloadImage.onload = () => {
    // Проверка URL перед отправкой
    validateImageUrl(urlInput.value)
      .then((isValid) => {
        if (!isValid) {
          throw new Error("Ссылка не ведет на изображение");
        }
        return addNewCard(cardNameInput.value, urlInput.value);
      })
      .then((newCard) => {
        const cardElement = createCard(
          newCard,
          (cardId) => handleDeleteCard(cardId),
          (cardId, isLiked) => handleLikeCard(cardId, isLiked),
          (link, name) => openPopupImage(link, name),
          currentUserId,
          openModal
        );
        elements.cardsContainer.prepend(cardElement);
        closeModal(elements.popupAddCard);
        elements.formAddCard.reset();
      })
      .catch((err) => {
        console.error("Ошибка:", err);
        const errorElement = elements.formAddCard.querySelector(`.${urlInput.id}-error`);
        errorElement.textContent = err.message;
        errorElement.classList.add('popup__error_visible');
      })
      .finally(() => {
        submitButton.textContent = "Сохранить";
        submitButton.disabled = false;
      });
  };

  preloadImage.onerror = () => {
    const errorElement = elements.formAddCard.querySelector(`.${urlInput.id}-error`);
    errorElement.textContent = "Не удалось загрузить изображение";
    errorElement.classList.add('popup__error_visible');
    submitButton.textContent = "Сохранить";
    submitButton.disabled = false;
  };
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const avatarInput = elements.formAvatar.elements.avatar;
  const avatarUrl = avatarInput.value;
  const errorElement = elements.formAvatar.querySelector('.avatar-input-error');
  
  // Очищаем предыдущие ошибки
  errorElement.textContent = '';
  errorElement.classList.remove('popup__error_visible');
  
  // Проверяем валидность URL перед отправкой
  if (!avatarInput.validity.valid) {
    errorElement.textContent = avatarInput.validationMessage;
    errorElement.classList.add('popup__error_visible');
    return;
  }
  
  // Блокируем кнопку и меняем текст
  submitButton.disabled = true;
  submitButton.textContent = "Сохранение...";

  // Проверка URL перед отправкой
  validateImageUrl(avatarUrl)
    .then((isValid) => {
      if (!isValid) {
        throw new Error("Не удалось загрузить изображение. Проверьте URL и попробуйте снова.");
      }
      return updateAvatar(avatarUrl);
    })
    .then((userData) => {
      renderProfile(userData);
      closeModal(elements.popupAvatar);
      elements.formAvatar.reset();
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара:", err);
      errorElement.textContent = err.message || "Произошла ошибка при обновлении аватара";
      errorElement.classList.add('popup__error_visible');
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = "Сохранить";
    });
}

// Работа с карточками
function handleLikeCard(cardId, isLiked) {
  return toggleLike(cardId, isLiked)
    .then((updatedCard) => {
      return updatedCard.likes;
    })
    .catch((err) => {
      console.error("Ошибка при обработке лайка:", err);
      throw err;
    });
}

function handleDeleteCard(cardId) {
  return deleteCardApi(cardId)
    .then(() => true)
    .catch((err) => {
      console.error("Ошибка при удалении карточки:", err);
      return false;
    });
}

// Вспомогательные функции
function openPopupImage(imageSrc, imageAlt) {
  elements.popupImage.src = imageSrc;
  elements.popupImage.alt = imageAlt;
  elements.popupImageDescription.textContent = imageAlt;
  openModal(elements.popupImageOpen);
}

// Поиск кнопки закрытия по всей странице для закрытия модального окна.
document.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("popup__close")) {
    const currentModal = evt.target.closest(".popup");
    closeModal(currentModal);
  }
});

// Инициализация приложения
initApp();
