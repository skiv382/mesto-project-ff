import "../pages/index.css";
import { initialCards } from "./cards.js";
import { createCard } from "./card.js";
import { handleDeleteCard } from "./card.js";
import { openModal, closeModal, closeModalOverlay } from "./modal.js";

// @todo: DOM узлы
const cardsContainer = document.querySelector(".places__list");
const buttonEditProfile = document.querySelector(".profile__edit-button");
const popupEditProfile = document.querySelector(".popup_type_edit");
const buttonAddCard = document.querySelector(".profile__add-button");
const popupAddCard = document.querySelector(".popup_type_new-card");
const nameInput = document.querySelector(".popup__input_type_name");
const aboutInput = document.querySelector(".popup__input_type_description");
const nameTitle = document.querySelector(".profile__title");
const jobTitle = document.querySelector(".profile__description");
const popupImage = document.querySelector(".popup__image");
const popupImageOpen = document.querySelector(".popup_type_image");
const popupImageDescription = document.querySelector(".popup__caption");
const formAddCard = document.querySelector('.popup__form[name="new-place"]');

// @todo: Вывести карточки на страницу
initialCards.forEach((cardData) => {
  const cardElement = createCard(
    cardData,
    handleDeleteCard,
    handleLikeClick,
    openPopupImage
  );
  cardsContainer.append(cardElement);
});

// Функция обработки лайка
function handleLikeClick(evt) {
  evt.target.classList.toggle("card__like-button_is-active");
}

// Редактирование профиля
buttonEditProfile.addEventListener("click", () => {
  nameInput.value = nameTitle.textContent;
  aboutInput.value = jobTitle.textContent;
  openModal(popupEditProfile);
});

// Добавление карточки
buttonAddCard.addEventListener("click", () => {
  openModal(popupAddCard);
});

// Функция открытия попапа изображения
function openPopupImage(imageSrc, imageAlt) {
  popupImage.src = imageSrc;
  popupImage.alt = imageAlt;
  popupImageDescription.textContent = imageAlt;
  openModal(popupImageOpen);
}

document.addEventListener("DOMContentLoaded", () => {
  // Находим форму редактирования профиля
  const formEditProfile = document.querySelector(
    '.popup__form[name="edit-profile"]'
  );

  // Находим элементы формы
  const nameInput = formEditProfile.querySelector(".popup__input_type_name");
  const jobInput = formEditProfile.querySelector(
    ".popup__input_type_description"
  );

  // Находим элементы профиля на странице
  const profileName = document.querySelector(".profile__title");
  const profileJob = document.querySelector(".profile__description");

  // Обработчик отправки формы
  function handleFormSubmit(evt) {
    evt.preventDefault();

    // Обновляем данные профиля
    profileName.textContent = nameInput.value;
    profileJob.textContent = jobInput.value;

    const popup = formEditProfile.closest(".popup");
    if (popup) {
      popup.classList.remove("popup_is-opened");
    }

    console.log("Профиль успешно обновлен!");
  }

  // Добавляем обработчик события
  formEditProfile.addEventListener("submit", handleFormSubmit);
});

// Находим поля формы в DOM
const cardNameInput = formAddCard.querySelector(".popup__input_type_card-name");
const cardUrlInput = formAddCard.querySelector(".popup__input_type_url");

// Обработчик отправки формы добавления карточки
function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const cardName = cardNameInput.value;
  const cardUrl = cardUrlInput.value;

  const newCardData = {
    name: cardName,
    link: cardUrl,
  };

  const cardElement = createCard(
    newCardData,
    handleDeleteCard,
    handleLikeClick,
    openPopupImage
  );

  cardsContainer.prepend(cardElement);
  closeModal(popupAddCard);
  formAddCard.reset();
}

// Прикрепляем обработчик к форме
formAddCard.addEventListener("submit", handleAddCardSubmit);

// Находим все попапы и добавляем класс анимации
document.querySelectorAll(".popup").forEach((popup) => {
  popup.classList.add("popup_is-animated");
});
