// Конфиг валидации (можно вынести в отдельный файл)
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

const validateUrl = (url) => {
  return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url);
};

// Утилиты
const getErrorElement = (formElement, inputElement) => 
  formElement.querySelector(`.${inputElement.id}-error`);

// Валидация поля
const checkInputValidity = (formElement, inputElement, config) => {
  const errorElement = getErrorElement(formElement, inputElement);
  
  // Специальная проверка для URL
  if (inputElement.type === 'url' && !validateUrl(inputElement.value)) {
    inputElement.setCustomValidity('Введите корректный URL');
  } 
  // Проверка pattern
  else if (inputElement.validity.patternMismatch) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  } else {
    inputElement.setCustomValidity("");
  }

  // Остальная логика без изменений
  if (!inputElement.validity.valid) {
    errorElement.textContent = inputElement.validationMessage;
    errorElement.classList.add(config.errorClass);
    inputElement.classList.add(config.inputErrorClass);
  } else {
    errorElement.textContent = '';
    errorElement.classList.remove(config.errorClass);
    inputElement.classList.remove(config.inputErrorClass);
  }
};

// Состояние кнопки
const toggleSubmitButton = (inputList, buttonElement, config) => {
  const hasInvalid = inputList.some(input => !input.validity.valid);
  
  buttonElement.disabled = hasInvalid;
  buttonElement.classList.toggle(config.inactiveButtonClass, hasInvalid);
};

// Инициализация валидации формы
const setupFormValidation = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  inputList.forEach(input => {
    input.addEventListener('input', () => {
      checkInputValidity(formElement, input, config);
      toggleSubmitButton(inputList, buttonElement, config);
    });
  });

  // Первоначальная проверка
  toggleSubmitButton(inputList, buttonElement, config);
};

// Основной экспорт
export const enableFormValidation = (config = validationConfig) => {
  const forms = document.querySelectorAll(config.formSelector);
  forms.forEach(form => setupFormValidation(form, config));
};

// Сброс валидации
export const resetFormValidation = (formElement, config = validationConfig) => {
  const inputs = formElement.querySelectorAll(config.inputSelector);
  const button = formElement.querySelector(config.submitButtonSelector);

  inputs.forEach(input => {
    input.setCustomValidity('');
    getErrorElement(formElement, input).textContent = '';
    input.classList.remove(config.inputErrorClass);
  });

  button.disabled = true;
  button.classList.add(config.inactiveButtonClass);
};