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
  const $topRatedContainer = createElement("div", {
    className: "top-rated-container"
  });
  $topRatedContainer.append($rate, $title);
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
const $MovieItem = ({ title, poster_path, vote_average }) => {
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
const removeMoreButton = ({ condition }) => {
  if (!condition) {
    return;
  }
  const $moreButton = document.querySelector(".more-button");
  $moreButton == null ? void 0 : $moreButton.remove();
};
const renderMoreMovieList = async ({
  currentPage,
  fetchFn
}) => {
  addSkeletonItems();
  const { page, total_pages, results } = await fetchFn(currentPage);
  removeMoreButton({ condition: page === total_pages });
  removeSkeletonItems();
  addMovieItem(results);
};
const $MovieListBoxRender = () => {
  const movieState = {
    type: "popular",
    keyword: "",
    page: 1
  };
  const initCurrentPage2 = () => {
    movieState.page = 1;
  };
  const setMovieListType2 = (type) => {
    movieState.type = type;
  };
  const setKeyword2 = (keyword) => {
    movieState.keyword = keyword;
  };
  const handleMoreButtonClick = async () => {
    movieState.page += 1;
    if (movieState.type === "popular") {
      asyncErrorBoundary({
        asyncFn: () => renderMoreMovieList({
          currentPage: movieState.page,
          fetchFn: getPopularMovieList
        }),
        fallbackComponent: (errorMessage) => addErrorBox(errorMessage)
      });
      return;
    }
    asyncErrorBoundary({
      asyncFn: () => renderMoreMovieList({
        currentPage: movieState.page,
        fetchFn: (page) => getSearchedMovieList(movieState.keyword, page)
      }),
      fallbackComponent: (errorMessage) => addErrorBox(errorMessage)
    });
  };
  const $MovieListBox2 = ({ title, movieResult }) => {
    const $fragment = document.createDocumentFragment();
    const $title = createElement("h2", {
      textContent: title,
      className: "thumbnail-list-title"
    });
    const $movieList = $MovieList(movieResult.results);
    $fragment.append($title, $movieList);
    if (movieResult.page !== movieResult.total_pages) {
      const $moreButton = createElement("button", {
        type: "button",
        className: "more-button",
        textContent: "더 보기"
      });
      $moreButton.addEventListener("click", handleMoreButtonClick);
      $fragment.appendChild($moreButton);
    }
    const $movieListBox = createElement("div", {
      className: "movie-list-box"
    });
    $movieListBox.appendChild($fragment);
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
asyncErrorBoundary({
  asyncFn: () => initPopularMovieListRender(),
  fallbackComponent: (errorMessage) => addErrorBox(errorMessage)
});
