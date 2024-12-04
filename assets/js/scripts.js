const refs = {
  step: localStorage.getItem('step') || 1,
  preloader: document.querySelector('.preloader'),
  gameform: document.querySelector('[data-gameform]'),
  answerInput: document.querySelector('[data-anwer]'),
  stepInput: document.querySelector('[data-step]'),

  modal: document.querySelector('.modal'),
  popup: document.querySelector('.popup'),
};

const popupConfirmTitles = ['Отличная работа!', 'Прекрасно продвигаетесь!', 'Вы на правильном пути!', 'Поздравляем'];
const popupConfirmSubtitles = [
  'Один ребус решен, переходим к следующему!',
  'Второй ребус решен, переходим к следующему!',
  'Осталось совсем немного!',
  'Четвертый ребус решен! Всего одна загадка до победы!',
];
const popupErrorTitles = [
  'Кажется, это неправильный ответ. Попробуйте снова',
  'Это не совсем правильно, но вы на верном пути. Попробуйте еще раз',
  'Это неверный ответ. <br/>Не сдавайтесь, попробуйте другой вариант!',
  'Кажется, это неправильный ответ. Попробуйте снова',
  'Это не совсем правильно, но вы на верном пути. Попробуйте еще раз',
];

let swiperText = null;
let swiperImages = null;

const init = () => {
  if (refs.gameform) {
    const currentStepOnLocalstorage = localStorage.getItem('step');
    if (currentStepOnLocalstorage && currentStepOnLocalstorage > 5) {
      window.location.href = './../greeting';
      return;
    }
    refs.stepInput.value = refs.step;
    localStorage.setItem('step', refs.step);
  }
};

init();

if (refs.gameform) {
  swiperText = new Swiper('.swiper--text', {
    initialSlide: refs.step - 1,
    allowTouchMove: false,
    slidesPerView: 1,
    loop: true,
    effect: 'fade',
    autoHeight: true,
    fadeEffect: {
      crossFade: true,
    },
    speed: 600,
  });

  swiperImages = new Swiper('.swiper--images', {
    initialSlide: refs.step - 1,
    allowTouchMove: false,
    slidesPerView: 1,
    loop: true,
    effect: 'slide',
    speed: 600,
  });
}

const formValidate = (step, answer) => {
  const currentStep = Number(step);
  const currentAnswer = answer.toLowerCase();
  if (
    (currentStep === 1 && currentAnswer === 'праздник') ||
    (currentStep === 2 && currentAnswer === 'веселье') ||
    (currentStep === 3 && currentAnswer === 'друзья') ||
    (currentStep === 4 && currentAnswer === 'подарок') ||
    (currentStep === 5 && currentAnswer === 'торт')
  ) {
    goToStep(currentStep + 1);
    if (currentStep < 5) {
      openModal('confirm');
    }
    return;
  }
  openModal('error');
};

const goToStep = number => {
  refs.stepInput.value = number;
  localStorage.setItem('step', number);
  if (number > 5) {
    window.location.href = './../greeting';
    return;
  }
  swiperText.slideTo(number - 1);
  swiperImages.slideTo(number - 1);
};

const handleFormSubmit = e => {
  e.preventDefault();
  const form = e.target;
  const step = form.step.value;
  const answer = form.answer.value;
  if (!answer) {
    form.answer.classList.add('invalid');
    return;
  }
  formValidate(step, answer);
  form.reset();
};

function hidePreloader() {
  setTimeout(function () {
    refs.preloader.classList.add('hidden');
    document.body.classList.add('loaded');
  }, 300);
}

const onInputFocus = e => {
  e.target.classList.remove('invalid');
};

const openModal = type => {
  if (!refs.modal) return;
  const currentStep = localStorage.getItem('step') || 1;
  const popupTitle = refs.modal.querySelector('.title--h2');
  const popupSubtitle = refs.modal.querySelector('.title--h3');
  const popupButton = refs.modal.querySelector('.button');
  popupTitle.innerHTML = type === 'error' ? popupErrorTitles[currentStep - 1] : popupConfirmTitles[currentStep - 2];
  popupButton.innerHTML = type === 'error' ? 'Попробовать снова' : 'Следующее слово';
  if (type === 'confirm') {
    popupSubtitle.innerHTML = popupConfirmSubtitles[currentStep - 2];
  }
  refs.modal.classList.add('open', type);
};

const closeModal = e => {
  const targetClasses = e.target.classList.value.split(' ');
  if (targetClasses.includes('js-popupClose')) {
    refs.modal.classList.remove('open');
    setTimeout(() => {
      refs.modal.classList.remove('error', 'confirm');
    }, 500);
  }
};

window.addEventListener('load', hidePreloader);

if (refs.gameform) {
  refs.gameform.addEventListener('submit', handleFormSubmit);
  refs.answerInput.addEventListener('focus', onInputFocus);
}

if (refs.modal) {
  refs.modal.addEventListener('click', closeModal);
}
