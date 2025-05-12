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
