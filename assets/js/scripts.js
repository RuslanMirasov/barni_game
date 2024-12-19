const refs = {
  step: localStorage.getItem('step') || 1,
  preloader: document.querySelector('.preloader'),
  gameform: document.querySelector('[data-gameform]'),
  answerInput: document.querySelector('[data-anwer]'),
  stepInput: document.querySelector('[data-step]'),
  submitButton: document.querySelector('[data-submit]'),
  skipButton: document.querySelector('[data-skip]'),
  tipButton: document.querySelector('[data-tip]'),
  howToPlayButton: document.querySelector('.how-to-play'),
  modal: document.querySelector('.modal'),
  popup: document.querySelector('.popup'),
  contentParts: document.querySelectorAll('.modal-content'),
  imagesSlider: document.querySelector('[data-imgslider]'),
};

const popupConfirmTitles = ['Отличная работа!', 'Прекрасно продвигаетесь!', 'Вы на правильном пути!', 'Поздравляем', 'Поздравляем'];
const popupConfirmSubtitles = [
  'Один ребус решен, переходим к следующему!',
  'Еще несколько шагов, и подарок у вас!',
  'Осталось совсем немного!',
  'Четвертый ребус решен! Всего одна загадка до победы!',
  'Пятый ребус решен!, переходим к следующему!',
];

const popupErrorTitles = [
  'Кажется, это неправильный ответ. Попробуйте снова',
  'Это не совсем правильно, но вы на верном пути. Попробуйте еще раз',
  'Это неверный ответ. <br/>Не сдавайтесь, попробуйте другой вариант!',
  'Кажется, это неправильный ответ. Попробуйте снова',
  'Это не совсем правильно, но вы на верном пути. Попробуйте еще раз',
];

const popupTipsTitles = [
  'День, когда украшают дом <br/>и зовут гостей',
  'Радостное настроение, когда хочется смеяться',
  'Близкие люди, которые всегда рядом',
  'Этот предмет часто прячут под елкой',
  'Его украшают свечами',
];

const defaultProgress = [
  { step: 1, answer: 'праздник', isDone: false },
  { step: 2, answer: 'веселье', isDone: false },
  { step: 3, answer: 'друзья', isDone: false },
  { step: 4, answer: 'подарок', isDone: false },
  { step: 5, answer: 'торт', isDone: false },
];

let swiperText = null;
let swiperImages = null;

const updateNavigation = () => {
  const progress = loadProgress();
  const navigation = document.querySelectorAll('.step-navigation span');
  for (let i = 0; i < progress.length; i += 1) {
    if (progress[i].isDone) {
      navigation[i].classList.add('green');
    }
  }
};

const updateUI = step => {
  const progress = loadProgress();
  const isStepDone = progress[step].isDone;
  const rightAnswer = progress[step].answer;

  localStorage.setItem('step', progress[step].step);
  refs.stepInput.value = progress[step].step;

  if (isStepDone) {
    refs.submitButton.classList.add('disabled');
    refs.answerInput.value = rightAnswer;
    refs.answerInput.classList.add('freez');
    refs.tipButton.classList.add('freez');
    refs.imagesSlider.classList.add('freez');
    return;
  }
  refs.submitButton.classList.remove('disabled');
  refs.answerInput.value = '';
  refs.answerInput.classList.remove('freez');
  refs.tipButton.classList.remove('freez');
  refs.imagesSlider.classList.remove('freez');
};

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
    pagination: {
      el: '.step-navigation',
      clickable: true,
      renderBullet: function (index, className) {
        return `<span class="${className}">${index + 1}</span>`; // Цифры вместо точек
      },
    },
  });

  swiperImages = new Swiper('.swiper--images', {
    initialSlide: refs.step - 1,
    allowTouchMove: false,
    slidesPerView: 1,
    loop: true,
    effect: 'slide',
    speed: 600,
    pagination: {
      el: '.step-navigation',
      clickable: true,
      renderBullet: function (index, className) {
        return `<span class="${className}">${index + 1}</span>`; // Цифры вместо точек
      },
    },
    on: {
      slideNextTransitionStart: function () {
        updateUI(this.realIndex);
        updateNavigation();
      },
      slidePrevTransitionStart: function () {
        updateUI(this.realIndex);
        updateNavigation();
      },
    },
  });
}

const skipStep = () => {
  const progress = loadProgress();
  const unresolvedTasks = progress.filter(task => !task.isDone);

  if (unresolvedTasks.length < 1) {
    redirectToCongratulationsPage();
    return;
  }

  swiperText.slideNext();
  swiperImages.slideNext();
};

function loadProgress() {
  const savedProgress = localStorage.getItem('progress');
  const newProgress = savedProgress ? JSON.parse(savedProgress) : defaultProgress;
  if (!savedProgress) {
    localStorage.setItem('progress', JSON.stringify(newProgress));
  }
  return newProgress;
}

function saveProgress(progress) {
  localStorage.setItem('progress', JSON.stringify(progress));
}

function redirectToCongratulationsPage() {
  window.location.href = './../greeting';
}

const init = () => {
  const shuldOpenPopup = localStorage.getItem('instructions');
  if (refs.gameform) {
    refs.stepInput.value = refs.step;
    if (refs.step === '0') {
      redirectToCongratulationsPage();
      return;
    }
    if (!shuldOpenPopup) {
      localStorage.setItem('instructions', 'false');
      openModal('rules');
    }
    localStorage.setItem('step', refs.step);
    updateNavigation();
  }
};

export const ruleStepChange = number => {
  const ruleSteps = document.querySelectorAll('.rules-step');
  if (ruleSteps.length > 0) {
    ruleSteps.forEach(step => {
      if (step.classList.contains(`rules-step--${number}`)) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }
};

const formValidate = (step, answer) => {
  const currentAnswer = answer.toLowerCase();
  const progress = loadProgress();
  if (progress[step - 1].answer === currentAnswer) {
    progress[step - 1].isDone = true;
    openModal('confirm');
    saveProgress(progress);
    skipStep();
    return;
  }

  openModal('error');
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

  refs.contentParts.forEach(content => {
    if (content.classList.contains(type)) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  const currentStep = localStorage.getItem('step') || 1;
  const popupTitle = refs.modal.querySelector('[data-title]');
  const popupSubtitle = refs.modal.querySelector('[data-subtitle]');
  const popupButton = refs.modal.querySelector('[data-button]');

  if (type === 'error') {
    popupTitle.innerHTML = popupErrorTitles[currentStep - 1];
    popupButton.innerHTML = 'Попробовать снова';
  } else if (type === 'confirm') {
    popupTitle.innerHTML = popupConfirmTitles[currentStep - 1];
    popupSubtitle.innerHTML = popupConfirmSubtitles[currentStep - 1];
    popupButton.innerHTML = 'Следующее слово';
  } else if (type === 'tips') {
    const tipImage = `<div><img src="./../assets/img/step${currentStep}.jpg" alt="Барни"/></div>`;
    popupTitle.innerHTML = tipImage + popupTipsTitles[currentStep - 1];
    popupButton.innerHTML = 'Понятно';
  }

  refs.modal.classList.add('open', type);
};

const closeModal = e => {
  const popupCloseButton = document.querySelector('.popup__close');
  const popupBackdrop = document.querySelector('.modal-backdrop');

  const targetClasses = e.target.classList.value.split(' ');
  if (targetClasses.includes('js-popupClose')) {
    refs.modal.classList.remove('open');
    setTimeout(() => {
      if (!popupCloseButton.classList.contains('js-popupClose')) {
        popupCloseButton.classList.add('js-popupClose');
        popupBackdrop.classList.add('js-popupClose');
      }
      refs.modal.classList.remove('error', 'confirm', 'rules', 'tips');
      refs.contentParts.forEach(content => {
        content.classList.remove('active');
      });
      ruleStepChange(1);
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

if (refs.skipButton) {
  refs.skipButton.addEventListener('click', skipStep);
}

if (refs.howToPlayButton) {
  refs.howToPlayButton.addEventListener('click', () => {
    openModal('rules');
  });
}

if (refs.tipButton) {
  refs.tipButton.addEventListener('click', () => {
    openModal('tips');
  });
}

window.ruleStepChange = ruleStepChange;

init();
