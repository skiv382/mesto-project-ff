import "../pages/index.css";
import { initialCards } from "./cards.js";
import { createCard, handleDeleteCard, handleLikeClick } from "./card.js";
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

// Находим форму редактирования профиля
const formEditProfile = document.querySelector(
  '.popup__form[name="edit-profile"]'
);

// Находим элементы формы
const jobInput = formEditProfile.querySelector(
  ".popup__input_type_description"
);

// Находим элементы профиля на странице
const profileName = document.querySelector(".profile__title");
const profileJob = document.querySelector(".profile__description");

// Обработчик отправки формы
function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  // Обновляем данные профиля
  profileName.textContent = nameInput.value;
  profileJob.textContent = jobInput.value;
  closeModal(popupEditProfile);
}

formEditProfile.addEventListener("submit", handleEditProfileSubmit);

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

document.querySelectorAll(".popup__close").forEach((button) => {
  button.addEventListener("click", () => {
    const popup = button.closest(".popup");
    closeModal(popup);
  });
});
