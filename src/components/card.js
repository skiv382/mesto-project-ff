// @todo: Темплейт карточки
const cardTemplate = document.querySelector("#card-template").content;

// @todo: Функция создания карточки
export function createCard(
  cardData,
  deleteCallback,
  likeCallback,
  openImageCallback
) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  const deleteButton = cardElement.querySelector(".card__delete-button");
  deleteButton.addEventListener("click", () => deleteCallback(cardElement));

  likeButton.addEventListener("click", (evt) => {
    likeCallback(evt);
  });

  // Обработчик клика по изображению
  cardImage.addEventListener("click", () => {
    openImageCallback(cardData.link, cardData.name);
  });

  return cardElement;
}

// Функция обработки лайка
export function handleLikeClick(evt) {
  evt.target.classList.toggle("card__like-button_is-active");
}

// @todo: Функция удаления карточки
export function handleDeleteCard(cardElement) {
  cardElement.remove();
}
