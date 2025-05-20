import { closeModal } from "./modal.js";

// @todo: Темплейт карточки
const cardTemplate = document.querySelector("#card-template").content;

// @todo: Функция создания карточки
export function createCard(
  cardData,
  deleteCallback,
  likeCallback,
  openImageCallback,
  userId,
  openModal,
  closeModal
) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__count");
  const deleteButton = cardElement.querySelector(".card__delete-button");

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
      .then((updatedCard) => {
        likeCount.textContent = updatedCard.likes.length;
        if (updatedCard.likes.some((like) => like._id === userId)) {
          likeButton.classList.add("card__like-button_is-active");
          likeCount.classList.add("card__count_active");
        } else {
          likeButton.classList.remove("card__like-button_is-active");
          likeCount.classList.remove("card__count_active");
        }
      })
      .catch((error) => {
        console.error("Ошибка при обработке лайка:", error);
        // Возвращаем состояние кнопки в исходное положение
        if (currentLike) {
          likeButton.classList.add("card__like-button_is-active");
          likeCount.classList.add("card__count_active");
        } else {
          likeButton.classList.remove("card__like-button_is-active");
          likeCount.classList.remove("card__count_active");
        }
      });
  });

  // Обработчик удаления
  const ownerId =
    typeof cardData.owner === "object" ? cardData.owner._id : cardData.owner;
  if (userId !== ownerId) {
    deleteButton.style.visibility = "hidden";
  } else {
    deleteButton.addEventListener("click", () => {
      const popupDelete = document.querySelector(".popup_type_trash");
      openModal(popupDelete);

      const confirmButton = popupDelete.querySelector(".popup__button");
      const handleConfirm = () => {
        deleteCallback(cardData._id)
          .then(() => {
            cardElement.remove();
            closeModal(popupDelete);
          })
          .catch((error) => {
            console.error("Ошибка при удалении карточки:", error);
            closeModal(popupDelete);
          });
      };

      confirmButton.addEventListener("click", handleConfirm, { once: true });
    });
  }

  // Открытие изображения
  cardImage.addEventListener("click", () => {
    openImageCallback(cardData.link, cardData.name);
  });

  return cardElement;
}
