var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NDJmYWE0ZWIxOWZmOTMyOWZmNDZkMGQwMDkyYTUxYyIsIm5iZiI6MTc0MjMxNzMxMS43OTUsInN1YiI6IjY3ZDlhNmZmNTJhZTM3ZjhlZGFlYjdjYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PBKtRwionVyOb0lxGIveGTkLrDTbp6zVByBizi2ViMY";
class HTTPClient {
  constructor(baseUrl) {
    __publicField(this, "baseUrl", "");
    __publicField(this, "apiKey", "");
    this.baseUrl = baseUrl;
  }
  async get(url) {
    const headers = {
      "Content-Type": "application/json",
      ...this.apiKey && { Authorization: `Bearer ${this.apiKey}` }
    };
    const response = await fetch(this.baseUrl + url, {
      headers
    });
    return response.json();
  }
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
}
const tmdbClient = new HTTPClient(BASE_URL);
tmdbClient.setApiKey(TMDB_API_KEY);
const getPopularMovieList = async (page) => {
  const response = await tmdbClient.get(
    `/movie/popular?language=ko-KR&page=${page}`
  );
  if ("status_message" in response) {
    throw new Error(response.status_message);
  }
  return response;
};
const POSTER_PATH = Object.freeze({
  DEFAULT: "./default-poster.svg",
  LOADING: "./loading-poster.svg",
  ERROR: "./error-poster.svg"
});
const ICON_PATH = Object.freeze({
  STAR_EMPTY: "./star_empty.svg",
  STAR_FILLED: "./star_filled.svg",
  SEARCH: "./search.svg",
  MODAL_CLOSE: "./modal_button_close.svg"
});
const LOGO_PATH = Object.freeze({
  LOGO: "./logo.svg",
  WOOWACOURSE_LOGO: "./woowacourse_logo.png"
});
const IMAGE_PATH = Object.freeze({
  EMPTY_PLANET: "./empty-planet.svg"
});
const createElement = (tag, props = {}) => {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") {
      Array.isArray(value) ? element.classList.add(...value) : element.classList.add(value);
      continue;
    }
    element[key] = value;
  }
  return element;
};
const wrapFragment = (children) => {
  const fragment = document.createDocumentFragment();
  fragment.append(...children);
  return fragment;
};
const removeBanner = () => {
  const $header2 = document.querySelector("header");
  $header2.classList.remove("banner-open");
  const $banner = document.querySelector(".background-container");
  $banner == null ? void 0 : $banner.remove();
};
const $Banner = () => {
  const $backgroundContainer = createElement("div", {
    className: "background-container"
  });
  const $overlay = createElement("div", {
    className: "overlay",
    ariaHidden: "true"
  });
  const $star = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star"
  });
  const $rateValue = createElement("span", {
    className: "rate-value",
    textContent: "9.5"
  });
  const $rate = createElement("div", {
    className: ["banner-rate", "rate"]
  });
  $rate.append($star, $rateValue);
  const $title = createElement("div", {
    className: "title",
    textContent: "인사이드 아웃2"
  });
  const $detailButton = createElement("button", {
    className: "detail-button",
    textContent: "자세히 보기"
  });
  const $topRatedContainer = createElement("div", {
    className: "top-rated-container"
  });
  $topRatedContainer.append($rate, $title, $detailButton);
  $backgroundContainer.append($overlay, $topRatedContainer);
  return $backgroundContainer;
};
const asyncErrorBoundary = async ({
  asyncFn,
  fallbackComponent
}) => {
  try {
    await asyncFn();
  } catch (error) {
    if (error instanceof Error) {
      fallbackComponent(error.message);
    }
  }
};
const addErrorBox = (text) => {
  const $movieListSection = document.querySelector(
    ".movie-list-section"
  );
  $movieListSection.replaceChildren($ErrorBox({ text }));
};
const $ErrorBox = ({ text }) => {
  const $errorPlanet = createElement("img", {
    src: IMAGE_PATH.EMPTY_PLANET,
    className: "empty-planet",
    alt: text
  });
  const $emptyText = createElement("h2", {
    textContent: text
  });
  const $box = createElement("div", {
    className: "error-box"
  });
  $box.append($errorPlanet, $emptyText);
  return $box;
};
const getSearchedMovieList = async (query, page) => {
  const response = await tmdbClient.get(
    `/search/movie?query=${query}&language=ko-KR&page=${page}`
  );
  if ("status_message" in response) {
    throw new Error(response.status_message);
  }
  return response;
};
const $EmptyList = () => {
  const $emptyPlanet = createElement("img", {
    src: IMAGE_PATH.EMPTY_PLANET,
    className: "empty-planet",
    alt: "검색 결과가 없습니다."
  });
  const $emptyText = createElement("h2", {
    textContent: "검색 결과가 없습니다."
  });
  const $box = createElement("div", {
    className: "empty-box"
  });
  $box.append($emptyPlanet, $emptyText);
  return $box;
};
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZES = {
  MOVIE_DETAIL: "w440_and_h660_face"
};
const getPosterUrl = (posterPath, size = POSTER_SIZES.MOVIE_DETAIL) => {
  if (!posterPath) return POSTER_PATH.DEFAULT;
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
};
const MOVIE_ITEM_CLICK = "movie-item:click";
const $MovieItem = ({ id, title, poster_path, vote_average }) => {
  const $rate = createElement("p", {
    className: "rate"
  });
  const $star = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star"
  });
  const $rateValue = createElement("span", {
    textContent: `${vote_average.toFixed(1)}`
  });
  $rate.append($star, $rateValue);
  const $movieTitle = createElement("strong", {
    className: "movie-title",
    textContent: title
  });
  const $description = createElement("div", {
    className: "item-desc"
  });
  $description.append($rate, $movieTitle);
  const $item = createElement("li", {
    className: "item"
  });
  const $poster = createElement("img", {
    className: "thumbnail",
    src: POSTER_PATH.LOADING,
    alt: title,
    loading: "lazy"
  });
  if (poster_path) {
    const posterUrl = getPosterUrl(poster_path);
    const actualImage = new Image();
    actualImage.src = posterUrl;
    actualImage.onload = () => {
      $poster.src = posterUrl;
    };
    actualImage.onerror = () => {
      $poster.src = POSTER_PATH.ERROR;
    };
  } else {
    $poster.src = POSTER_PATH.DEFAULT;
  }
  $item.append($poster, $description);
  $item.addEventListener("click", () => {
    const event = new CustomEvent(MOVIE_ITEM_CLICK, {
      detail: { movieId: id },
      bubbles: true
    });
    $item.dispatchEvent(event);
  });
  return $item;
};
const addMovieItem = (movieList) => {
  const $movieList = document.querySelector(
    ".thumbnail-list"
  );
  const movieListFragment = wrapFragment(
    movieList.map((movieItemData) => $MovieItem(movieItemData))
  );
  $movieList.appendChild(movieListFragment);
};
const $MovieList = (movieList) => {
  if (!movieList.length) {
    return $EmptyList();
  }
  const $movieList = createElement("ul", {
    className: "thumbnail-list"
  });
  $movieList.append(
    ...movieList.map((movieItemData) => $MovieItem(movieItemData))
  );
  return $movieList;
};
const $SkeletonItem = () => {
  const $skeletonItem = createElement("li", {
    className: "skeleton-item"
  });
  const $skeletonPoster = createElement("div", {
    className: "skeleton-poster"
  });
  const $skeletonDescription = createElement("div", {
    className: "skeleton-description"
  });
  $skeletonItem.append($skeletonPoster, $skeletonDescription);
  return $skeletonItem;
};
const replaceSkeletonList = () => {
  const $movieListSection = document.querySelector(
    ".movie-list-section"
  );
  $movieListSection.replaceChildren($SkeletonList());
};
const addSkeletonItems = () => {
  const $thumbnailList = document.querySelector(".thumbnail-list");
  if (!$thumbnailList) return;
  const $skeletonList = Array.from({ length: 20 }, () => $SkeletonItem());
  $thumbnailList.append(...$skeletonList);
};
const removeSkeletonItems = () => {
  const $skeletonItems = document.querySelectorAll(".skeleton-item");
  $skeletonItems.forEach((item) => {
    item.remove();
  });
};
const $SkeletonList = () => {
  const $skeletonList = createElement("ul", { className: "skeleton-list" });
  $skeletonList.append(...Array.from({ length: 20 }, () => $SkeletonItem()));
  return $skeletonList;
};
const removeLoadingObserver = () => {
  const $loadingObserver = document.querySelector(".loading-observer");
  $loadingObserver == null ? void 0 : $loadingObserver.remove();
};
const renderMoreMovieList = async ({
  currentPage,
  fetchFn
}) => {
  addSkeletonItems();
  const { page, total_pages, results } = await fetchFn(currentPage);
  if (page === total_pages) {
    removeLoadingObserver();
  }
  removeSkeletonItems();
  addMovieItem(results);
};
const $MovieListBoxRender = () => {
  const movieState = {
    type: "popular",
    keyword: "",
    page: 1,
    isLoading: false
  };
  let observer = null;
  const initCurrentPage2 = () => {
    movieState.page = 1;
    movieState.isLoading = false;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };
  const setMovieListType2 = (type) => {
    movieState.type = type;
  };
  const setKeyword2 = (keyword) => {
    movieState.keyword = keyword;
  };
  const loadMoreMovies = async () => {
    if (movieState.isLoading) return;
    movieState.isLoading = true;
    movieState.page += 1;
    if (movieState.type === "popular") {
      await asyncErrorBoundary({
        asyncFn: () => renderMoreMovieList({
          currentPage: movieState.page,
          fetchFn: getPopularMovieList
        }),
        fallbackComponent: (errorMessage) => addErrorBox(errorMessage)
      });
    } else {
      await asyncErrorBoundary({
        asyncFn: () => renderMoreMovieList({
          currentPage: movieState.page,
          fetchFn: (page) => getSearchedMovieList(movieState.keyword, page)
        }),
        fallbackComponent: (errorMessage) => addErrorBox(errorMessage)
      });
    }
    movieState.isLoading = false;
  };
  const setupInfiniteScroll = (totalPages) => {
    var _a;
    if (movieState.page >= totalPages) return;
    const $loadingObserver = document.querySelector(".loading-observer") || createElement("div", {
      className: "loading-observer"
    });
    (_a = document.querySelector(".movie-list-box")) == null ? void 0 : _a.appendChild($loadingObserver);
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !movieState.isLoading) {
          loadMoreMovies();
        }
      },
      {
        rootMargin: "100px"
      }
    );
    observer.observe($loadingObserver);
  };
  const $MovieListBox2 = ({ title, movieResult }) => {
    const $fragment = document.createDocumentFragment();
    const $title = createElement("h2", {
      textContent: title,
      className: "thumbnail-list-title"
    });
    const $movieList = $MovieList(movieResult.results);
    $fragment.append($title, $movieList);
    const $movieListBox = createElement("div", {
      className: "movie-list-box"
    });
    $movieListBox.appendChild($fragment);
    setTimeout(() => {
      setupInfiniteScroll(movieResult.total_pages);
    }, 0);
    return $movieListBox;
  };
  return { initCurrentPage: initCurrentPage2, setKeyword: setKeyword2, setMovieListType: setMovieListType2, $MovieListBox: $MovieListBox2 };
};
const { initCurrentPage, setKeyword, setMovieListType, $MovieListBox } = $MovieListBoxRender();
const handleSearchFormSubmit = async (event) => {
  event.preventDefault();
  const target = event.target;
  const searchValue = target["search-input"].value;
  if (searchValue === "") {
    alert("검색어를 입력해주세요.");
    return;
  }
  try {
    removeBanner();
    replaceSkeletonList();
    const searchResult = await getSearchedMovieList(searchValue, 1);
    replaceMovieListBox({
      title: `"${searchValue}" 검색 결과`,
      movieResult: searchResult
    });
    setMovieListType("search");
    setKeyword(searchValue);
  } catch (error) {
    if (error instanceof Error) {
      addErrorBox(error.message);
    }
  }
};
const $SearchForm = () => {
  const $searchForm = createElement("form", {
    className: "search-form"
  });
  const $searchInput = createElement("input", {
    className: "search-input",
    name: "search-input",
    type: "text",
    placeholder: "검색어를 입력하세요"
  });
  const $searchButton = createElement("button", {
    type: "submit"
  });
  const $searchIcon = createElement("img", {
    src: ICON_PATH.SEARCH,
    alt: "search"
  });
  $searchButton.appendChild($searchIcon);
  $searchForm.append($searchInput, $searchButton);
  $searchForm.addEventListener("submit", handleSearchFormSubmit);
  return $searchForm;
};
const $HeaderBox = () => {
  const $headerBox = createElement("div", {
    className: "header-box"
  });
  const $logoLink = createElement("a", { href: "/javascript-movie-review" });
  const $logoImage = createElement("img", {
    src: LOGO_PATH.LOGO,
    alt: "MovieList"
  });
  $logoLink.appendChild($logoImage);
  $headerBox.append($logoLink, $SearchForm());
  return $headerBox;
};
const RATING_TEXTS = Object.freeze({
  "0": "내 평점을 남겨주세요",
  "1": "최악이예요",
  "2": "별로예요",
  "3": "보통이에요",
  "4": "재미있어요",
  "5": "명작이예요"
});
const movieRatingUtil = {
  getRatings() {
    const ratings = localStorage.getItem("movie_rate");
    return ratings ? JSON.parse(ratings) : {};
  },
  getRating(movieId) {
    const ratings = this.getRatings();
    return ratings[movieId] || 0;
  },
  saveRating(movieId, rating) {
    const ratings = this.getRatings();
    ratings[movieId] = rating;
    localStorage.setItem("movie_rate", JSON.stringify(ratings));
  }
};
const handleModal = {
  open() {
    const $modal2 = document.getElementById("modalBackground");
    if (!$modal2) return;
    $modal2.classList.add("active");
    document.body.classList.add("modal-open");
  },
  close() {
    const $modal2 = document.getElementById("modalBackground");
    if (!$modal2) return;
    $modal2.classList.remove("active");
    document.body.classList.remove("modal-open");
  },
  updateModalContent(movieData) {
    var _a;
    const $modal2 = document.getElementById("modalBackground");
    if (!$modal2) return;
    const posterUrl = getPosterUrl(movieData.poster_path);
    window.currentMovieId = movieData.id;
    const $image = $modal2.querySelector(".modal-image img");
    if ($image) $image.src = posterUrl;
    const $title = $modal2.querySelector(".modal-description h2");
    if ($title) $title.textContent = movieData.title;
    const $category = $modal2.querySelector(".category");
    if ($category)
      $category.textContent = movieData.release_year + " · " + movieData.genres.join(", ") || "";
    const $rateValue = $modal2.querySelector(".rate span");
    if ($rateValue)
      $rateValue.textContent = ((_a = movieData.vote_average) == null ? void 0 : _a.toFixed(1)) || "0.0";
    const $detail = $modal2.querySelector(".detail");
    if ($detail)
      $detail.textContent = movieData.overview || "(줄거리 내용이 없습니다.)";
    this.loadUserRating(movieData.id);
    this.open();
  },
  loadUserRating(movieId) {
    const ratingValue = movieRatingUtil.getRating(movieId);
    this.updateStars(ratingValue);
  },
  updateStars(ratingValue) {
    for (let i = 1; i <= 5; i++) {
      const star = document.getElementById(
        `userRateStar${i}`
      );
      if (star) {
        star.src = i <= ratingValue ? ICON_PATH.STAR_FILLED : ICON_PATH.STAR_EMPTY;
      }
    }
    this.updateRatingText(ratingValue);
  },
  updateRatingText(ratingValue) {
    const $rateText = document.getElementById("userRateText");
    const $rateValue = document.getElementById("userRateValue");
    if ($rateText) {
      $rateText.textContent = RATING_TEXTS[String(ratingValue)] || RATING_TEXTS["0"];
    }
    if ($rateValue) {
      $rateValue.textContent = `(${ratingValue * 2}/10)`;
    }
  },
  saveRating(movieId, rating) {
    movieRatingUtil.saveRating(movieId, rating);
    this.updateStars(rating);
  }
};
const $Modal = () => {
  const $modal2 = createElement("div", {
    className: "modal-background",
    id: "modalBackground"
  });
  const $modalElement = createElement("div", {
    className: "modal"
  });
  const $closeButton = createElement("button", {
    className: "close-modal",
    id: "closeModal"
  });
  const $closeImage = createElement("img", {
    src: ICON_PATH.MODAL_CLOSE
  });
  $closeButton.appendChild($closeImage);
  const $modalContainer = createElement("div", {
    className: "modal-container"
  });
  const $modalImage = createElement("div", {
    className: "modal-image"
  });
  const $image = createElement("img", {
    src: ""
  });
  $modalImage.appendChild($image);
  const $modalDescription = createElement("div", {
    className: "modal-description"
  });
  const $title = createElement("h2", {
    textContent: "",
    className: "title"
  });
  const $category = createElement("p", {
    className: "category",
    textContent: ""
  });
  const $rateContainer = createElement("div", {
    className: "rate-container"
  });
  const $rateTitle = createElement("span", {
    textContent: "평균"
  });
  const $rate = createElement("p", {
    className: "rate"
  });
  const $star = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star"
  });
  const $rateValue = createElement("span", {
    textContent: ""
  });
  $rate.append($star, $rateValue);
  $rateContainer.append($rateTitle, $rate);
  const $rateHr = createElement("hr", {});
  const $userRateHr = createElement("hr", {});
  const $userRateContainer = createElement("div", {
    className: "user-rate-container"
  });
  const $userRateTitle = createElement("h3", {
    textContent: "내 별점",
    className: "container-title"
  });
  const $userRate = createElement("div", {
    className: "user-rate"
  });
  const $userRateStars = createElement("div", {
    className: "user-rate-stars"
  });
  const $userRateStar1 = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star",
    id: "userRateStar1"
  });
  $userRateStar1.dataset.value = "1";
  const $userRateStar2 = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star",
    id: "userRateStar2"
  });
  $userRateStar2.dataset.value = "2";
  const $userRateStar3 = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star",
    id: "userRateStar3"
  });
  $userRateStar3.dataset.value = "3";
  const $userRateStar4 = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star",
    id: "userRateStar4"
  });
  $userRateStar4.dataset.value = "4";
  const $userRateStar5 = createElement("img", {
    src: ICON_PATH.STAR_EMPTY,
    className: "star",
    id: "userRateStar5"
  });
  $userRateStar5.dataset.value = "5";
  $userRateStars.append(
    $userRateStar1,
    $userRateStar2,
    $userRateStar3,
    $userRateStar4,
    $userRateStar5
  );
  const $userRateTextContainer = createElement("div", {
    className: "user-rate-text-container"
  });
  const $userRateText = createElement("p", {
    textContent: "내 평점을 남겨주세요",
    className: "user-rate-text",
    id: "userRateText"
  });
  const $userRateValue = createElement("p", {
    textContent: "(0/10)",
    className: "user-rate-value",
    id: "userRateValue"
  });
  $userRateTextContainer.append($userRateText, $userRateValue);
  $userRate.append($userRateStars, $userRateTextContainer);
  $userRateContainer.append($userRateTitle, $userRate);
  const $detailContainer = createElement("div", {
    className: "detail-container"
  });
  const $detailTitle = createElement("h3", {
    textContent: "줄거리",
    className: "container-title"
  });
  const $detail = createElement("p", {
    className: "detail",
    textContent: ""
  });
  $detailContainer.append($detailTitle, $detail);
  $modalDescription.append(
    $title,
    $category,
    $rateContainer,
    $rateHr,
    $userRateContainer,
    $userRateHr,
    $detailContainer
  );
  $modalContainer.append($modalImage, $modalDescription);
  $modalElement.append($closeButton, $modalContainer);
  $modal2.appendChild($modalElement);
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleModal.close();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  $closeButton.addEventListener("click", handleModal.close);
  $modal2.addEventListener("click", (e) => {
    if (e.target === $modal2) {
      handleModal.close();
    }
  });
  const handleStarClick = (e) => {
    const target = e.target;
    if (target.classList.contains("star") && target.dataset.value) {
      const value = parseInt(target.dataset.value);
      const currentMovieId = window.currentMovieId;
      if (currentMovieId) {
        handleModal.saveRating(currentMovieId, value);
      }
    }
  };
  $userRateStars.addEventListener("click", handleStarClick);
  return $modal2;
};
const transformMovieDetail = (tmdbDetail) => {
  const safeParseDate = (dateString) => {
    try {
      const date = new Date(dateString).getFullYear();
      return isNaN(date) ? 0 : date;
    } catch (error) {
      return 0;
    }
  };
  return {
    id: tmdbDetail.id,
    title: tmdbDetail.title,
    overview: tmdbDetail.overview,
    poster_path: tmdbDetail.poster_path,
    backdrop_path: tmdbDetail.backdrop_path,
    vote_average: tmdbDetail.vote_average,
    genres: tmdbDetail.genres.map((genre) => genre.name),
    release_year: safeParseDate(tmdbDetail.release_date)
  };
};
const getMovieDetail = async (movieId) => {
  const response = await tmdbClient.get(`/movie/${movieId}?language=ko-KR`);
  if ("status_message" in response) {
    throw new Error(response.status_message);
  }
  return transformMovieDetail(response);
};
const handleMovieDetailEvent = (event) => {
  const { movieId } = event.detail;
  getMovieDetail(movieId).then((movieDetail) => {
    handleModal.updateModalContent(movieDetail);
  }).catch((error) => {
    console.error("영화 상세 정보를 가져오는 중 오류 발생:", error);
  });
};
const registerMovieDetailEventListener = () => {
  document.addEventListener(
    MOVIE_ITEM_CLICK,
    handleMovieDetailEvent
  );
};
const replaceMovieListBox = ({
  title,
  movieResult
}) => {
  initCurrentPage();
  const $movieListSection = document.querySelector(
    ".movie-list-section"
  );
  $movieListSection.replaceChildren(
    $MovieListBox({
      title,
      movieResult
    })
  );
};
const initPopularMovieListRender = async () => {
  replaceSkeletonList();
  const popularMovieListResult = await getPopularMovieList(1);
  replaceMovieListBox({
    title: "지금 인기있는 영화",
    movieResult: popularMovieListResult
  });
};
const $header = document.querySelector("header");
$header == null ? void 0 : $header.append($Banner(), $HeaderBox());
const $modal = $Modal();
document.body.append($modal);
registerMovieDetailEventListener();
asyncErrorBoundary({
  asyncFn: () => initPopularMovieListRender(),
  fallbackComponent: (errorMessage) => addErrorBox(errorMessage)
});
