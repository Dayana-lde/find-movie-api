const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";
const API_URL_POPULAR = "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1";
const API_URL_SEARCH = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
const API_URL_MOVIE_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/";
const API_URL_GENRES = "https://kinopoiskapiunofficial.tech/api/v2.2/films/filters";
const API_URL_BY_GENRE = "https://kinopoiskapiunofficial.tech/api/v2.2/films";

// Глобальные переменные
let allMovies = [];
let currentPage = 1;
const moviesPerPage = 8;

// Элементы
const form = document.querySelector("form");
const search = document.querySelector(".header__search");
const logo = document.querySelector(".header__logo");
const modalEl = document.querySelector(".modal");
const genreSelect = document.querySelector(".genre__select");

// Загрузка при старте
getMovies(API_URL_POPULAR);
loadGenres();

// Получение фильмов
async function getMovies(url, type = "auto") {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });

  const respData = await resp.json();
  allMovies = respData.films || respData.items || [];
  currentPage = 1;
  showMovies();
  setupPagination();
}

// Поиск по ключевому слову
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const keyword = search.value.trim();
  if (keyword) {
    getMovies(`${API_URL_SEARCH}${keyword}`, "search");
    search.value = "";
    genreSelect.value = ""; // Сброс жанра
  }
});

// Рандомные фильмы по клику на логотип
logo.addEventListener("click", async (e) => {
  e.preventDefault();
  const resp = await fetch(API_URL_POPULAR, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const data = await resp.json();
  const shuffled = data.films.sort(() => 0.5 - Math.random());
  allMovies = shuffled.slice(0, 20); // немного больше для пагинации
  currentPage = 1;
  showMovies();
  setupPagination();
  genreSelect.value = "";
  search.value = "";
});

// Загрузка жанров
async function loadGenres() {
  const resp = await fetch(API_URL_GENRES, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const data = await resp.json();

  data.genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.genre;
    genreSelect.appendChild(option);
  });
}

// Событие при выборе жанра
genreSelect.addEventListener("change", () => {
  const selectedGenre = genreSelect.value;
  search.value = "";
  if (selectedGenre) {
    const url = `${API_URL_BY_GENRE}?genres=${selectedGenre}&page=1`;
    getMovies(url, "genre");
  } else {
    getMovies(API_URL_POPULAR);
  }
});
// Отображение фильмов
function showMovies() {
  const moviesEl = document.querySelector(".movies");
  moviesEl.innerHTML = "";

  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const moviesToShow = allMovies.slice(start, end);

  moviesToShow.forEach((movie) => {
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.innerHTML = `
      <div class="movie__cover-inner">
        <img src="${movie.posterUrlPreview}" class="movie__cover" alt="${movie.nameRu}" />
        <div class="movie__cover--darkened"></div>
      </div>
      <div class="movie__info">
        <div class="movie__title">${movie.nameRu}</div>
        <div class="movie__category">${movie.genres.map((genre) => ` ${genre.genre}`).join("")}</div>
        ${
          movie.rating
            ? `<div class="movie__average movie__average--${getClassByRate(movie.rating)}">${movie.rating}</div>`
            : ""
        }
      </div>
    `;
    movieEl.addEventListener("click", () => openModal(movie.filmId));
    moviesEl.appendChild(movieEl);
  });
}

// Классы цвета рейтинга
function getClassByRate(vote) {
  if (vote >= 7) return "green";
  else if (vote > 5) return "orange";
  else return "red";
}
// Модальное окно
async function openModal(id) {
  const resp = await fetch(API_URL_MOVIE_DETAILS + id, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const respData = await resp.json();

  modalEl.classList.add("modal--show");
  document.body.classList.add("stop-scrolling");

  modalEl.innerHTML = `
    <div class="modal__card">
      <img class="modal__movie-backdrop" src="${respData.posterUrl}" alt="">
      <h2>
        <span class="modal__movie-title">${respData.nameRu}</span>
        <span class="modal__movie-release-year"> : ${respData.year} год </span>
      </h2>
      <ul class="modal__movie-info">
        <div class="loader"></div>
        <li class="modal__movie-genre">Жанр: ${respData.genres.map((el) => `<span>${el.genre}</span>`).join("")}</li>
        <li>Сайт: <a class="modal__movie-site" href="${respData.webUrl}">${respData.webUrl}</a></li>
        <li class="modal__movie-overview">Описание: ${respData.description}</li>
      </ul>
      <button type="button" class="modal__button-close">Закрыть</button>
    </div>
  `;

  const btnClose = document.querySelector(".modal__button-close");
  btnClose.addEventListener("click", closeModal);
}

function closeModal() {
  modalEl.classList.remove("modal--show");
  document.body.classList.remove("stop-scrolling");
}

window.addEventListener("click", (e) => {
  if (e.target === modalEl) closeModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.keyCode === 27) closeModal();
});

// Пагинация
function setupPagination() {
  const paginationEl = document.querySelector(".pagination");
  paginationEl.innerHTML = "";
  const pageCount = Math.ceil(allMovies.length / moviesPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("pagination__button");
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      showMovies();
      setupPagination();
    });

    paginationEl.appendChild(btn);
  }
}
