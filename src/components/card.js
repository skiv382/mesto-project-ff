// @todo: Темплейт карточки
const cardTemplate = document.querySelector("#card-template").content;

// @todo: Функция создания карточки
export function createCard(
  cardData,
  deleteCallback,
  likeCallback,
  openImageCallback,
  userId,
  openModal
) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  cardElement.classList.add('card');

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__count");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const popupDelete = cardElement.querySelector(".popup_type_trash");

  // Установка базовых данных
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes ? cardData.likes.length : 0;

  // Обработка лайков
  const isLiked = cardData.likes.some((like) => like._id === userId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
    likeCount.classList.add("card__count_active");
  } else {
    likeCount.classList.remove("card__count_active");
  }

  // Обработчик лайка
  likeButton.addEventListener("click", () => {
    const currentLike = likeButton.classList.contains(
      "card__like-button_is-active"
    );
    likeCallback(cardData._id, currentLike)
      .then((data) => {
        likeButton.classList.toggle("card__like-button_is-active");
        likeCount.textContent = data.likes.length;
        if (likeButton.classList.contains("card__like-button_is-active")) {
          likeCount.classList.add("card__count_active");
        } else {
          likeCount.classList.remove("card__count_active");
        }
      })
      .catch((error) => {
        console.log("Ошибка", error);
      });
  });

  // Обработчик удаления
  const ownerId = typeof cardData.owner === 'object' ? cardData.owner._id : cardData.owner;
  if (userId !== ownerId) {
    deleteButton.style.visibility = "hidden";
  } else {
    deleteButton.addEventListener("click", () => {
      openModal(popupDelete);
    });

    cardElement
      .querySelector(".popup__button")
      .addEventListener("click", () => {
        deleteCallback(cardData._id)
          .then(() => {
            cardElement.remove();
          })
          .catch((error) => {
            console.log("Ошибка", error);
          });
      });
  }

  // Открытие изображения
  cardImage.addEventListener("click", () => {
    openImageCallback(cardData.link, cardData.name);
  });

  return cardElement;
}
