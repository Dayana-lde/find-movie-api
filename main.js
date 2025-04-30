// Ключ API для доступа к данным о фильмах
const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";

// URL для получения списка самых популярных фильмов
const API_URL_POPULAR =
  "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1";

// URL для поиска фильмов по ключевому слову
const API_URL_SEARCH =
  "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";

// URL для получения подробностей о конкретном фильме (сюда нужно добавлять ID фильма)
const API_URL_MOVIE_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/";

// Сразу при загрузке сайта вызываем функцию получения популярных фильмов
getMovies(API_URL_POPULAR);

// Асинхронная функция для получения фильмов с сервера по заданному URL
async function getMovies(url) {
  const resp = await fetch(url, { // Делаем запрос на сервер
    headers: {
      "Content-Type": "application/json", // Тип передаваемых данных
      "X-API-KEY": API_KEY, // Передаём API-ключ для авторизации
    },
  });
  const respData = await resp.json(); // Получаем ответ в формате JSON
  showMovies(respData); // Передаем данные в функцию отрисовки фильмов
}

// Функция для выбора класса цвета рейтинга фильма
function getClassByRate(vote) {
  if (vote >= 7) {
    return "green"; // Высокий рейтинг - зелёный цвет
  } else if (vote > 5) {
    return "orange"; // Средний рейтинг - оранжевый цвет
  } else {
    return "red"; // Низкий рейтинг - красный цвет
  }
}

// Функция для отображения фильмов на странице
function showMovies(data) {
  const moviesEl = document.querySelector(".movies"); // Находим контейнер для фильмов

  // Очищаем контейнер перед добавлением новых фильмов
  document.querySelector(".movies").innerHTML = "";

  // Перебираем все фильмы из полученных данных
  data.films.forEach((movie) => {
    const movieEl = document.createElement("div"); // Создаем новый div для фильма
    movieEl.classList.add("movie"); // Добавляем класс оформления

    // Вставляем HTML разметку фильма
    movieEl.innerHTML = `
        <div class="movie__cover-inner">
          <img
            src="${movie.posterUrlPreview}" // Постер фильма
            class="movie__cover"
            alt="${movie.nameRu}" // Название фильма в качестве alt-текста
          />
          <div class="movie__cover--darkened"></div> <!-- Затемнённая подложка -->
        </div>
        <div class="movie__info">
          <div class="movie__title">${movie.nameRu}</div> <!-- Название фильма -->
          <div class="movie__category">${movie.genres.map(
            (genre) => ` ${genre.genre}` // Перечисляем все жанры фильма
          )}</div>
          ${
            movie.rating &&
            `
            <div class="movie__average movie__average--${getClassByRate(
              movie.rating
            )}">${movie.rating}</div> <!-- Рейтинг фильма с цветом -->
            `
          }
        </div>
    `;

    // Добавляем обработчик события на клик по фильму — откроется модальное окно
    movieEl.addEventListener("click", () => openModal(movie.filmId))

    moviesEl.appendChild(movieEl); // Добавляем карточку фильма на страницу
  });
}

// Находим элементы формы поиска и поля ввода
const form = document.querySelector("form");
const search = document.querySelector(".header__search");

// Добавляем обработчик отправки формы
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Отменяем стандартное поведение формы (перезагрузку страницы)

  const apiSearchUrl = `${API_URL_SEARCH}${search.value}`; // Формируем URL для поиска по введённому тексту
  if (search.value) {

    getMovies(apiSearchUrl); // Выполняем поиск фильмов

    search.value = ""; // Очищаем строку поиска после запроса
  } 
});

// --- Работа с модальным окном ---

// Находим элемент модального окна
const modalEl = document.querySelector(".modal");

// Функция открытия модального окна с информацией о конкретном фильме
async function openModal(id) {
  // Делаем запрос на сервер за подробной информацией о фильме по его ID
  const resp = await fetch(API_URL_MOVIE_DETAILS + id, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const respData = await resp.json(); // Получаем данные о фильме в формате JSON

  modalEl.classList.add("modal--show"); // Добавляем класс для отображения модального окна
  document.body.classList.add("stop-scrolling"); // Запрещаем прокрутку фона страницы

  // Вставляем HTML-разметку карточки фильма в модальное окно
  modalEl.innerHTML = `
    <div class="modal__card">
      <img class="modal__movie-backdrop" src="${respData.posterUrl}" alt=""> <!-- Большой постер фильма -->
      <h2>
        <span class="modal__movie-title">${respData.nameRu}</span> <!-- Название фильма -->
        <span class="modal__movie-release-year"> : ${respData.year} год </span> <!-- Год выхода -->
      </h2>
      <ul class="modal__movie-info">
        <div class="loader"></div> <!-- Иконка загрузки  -->
        <li class="modal__movie-genre">Жанр: ${respData.genres.map((el) => `<span>${el.genre}</span>`)}</li> <!-- Жанры -->
        
        <li>Сайт: <a class="modal__movie-site" href="${respData.webUrl}">${respData.webUrl}</a></li> <!-- Ссылка на сайт -->
        <li class="modal__movie-overview">Описание: ${respData.description}</li> <!-- Описание фильма -->
      </ul>
      <button type="button" class="modal__button-close">Закрыть</button> <!-- Кнопка закрытия модального окна -->
    </div>
  `;

  // Находим кнопку закрытия и добавляем обработчик закрытия модального окна
  const btnClose = document.querySelector(".modal__button-close");
  btnClose.addEventListener("click", () => closeModal());
}

// Функция для закрытия модального окна
function closeModal() {
  modalEl.classList.remove("modal--show"); // Убираем класс показа модального окна
  document.body.classList.remove("stop-scrolling"); // Возвращаем прокрутку страницы
}

// Закрытие модального окна по клику на фон
window.addEventListener("click", (e) => {
  if (e.target === modalEl) { // Если клик был именно на затемнённый фон
    closeModal(); // Закрываем модальное окно
  }
});

// Закрытие модального окна по нажатию клавиши Escape
window.addEventListener("keydown", (e) => {
  if (e.keyCode === 27) { // 27 — это код клавиши Escape
    closeModal();
  }
});