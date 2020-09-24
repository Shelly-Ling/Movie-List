const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

let movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector("#change-mode")
let mode = 'card'
let nowPage = 1


function renderMovieByCard(data) {
  let rawHTML = '' //要先在這宣告空字串，再用迴圈放入資料，若這句放在forEach中宣告rawHTML，會每跑一次就變成空字串，最後就只有最後一筆電影資料輸出。
  data.forEach((item) => {
    // title,image
    // console.log(item)

    rawHTML += ` 
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}" >+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}


function renderMovieByList(data) {

  rawHTML = ''
  let listHtmlStart = `<ul class="list-group" style="width:100%;">`
  let listHtmlEnd = `</ul>`


  data.forEach((item) => {

    console.log(item)
    rawHTML += `
                <div class="list-group-item "
          style="display: flex; width:100%; flex-direction: row; max-height: 70px; margin: 0px; padding: 0px; justify-content: space-between;">
          <img src="${POSTER_URL + item.image}" class="card-img" alt="..." style="width: 50px; margin: 0px; padding: 0px;">
          <div class="movies-list-title"
            style="display: flex; flex-direction: row; align-items:center; justify-content: space-between; width: 100%;">
            <h5 id="list-movie-title" class="m-3">${item.title}</h5>

          </div>
          <div style="display: flex; flex-direction: row; align-items:center; width:100%; justify-content: flex-end;">
            <div class="card-text"><em class="text-muted mr-3" id="list-movie-release-date">release date:${item.release_date}</em>
            </div>
            <div id="list-btns" class="mr-3">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
    `
  })

  dataPanel.innerHTML = listHtmlStart + rawHTML + listHtmlEnd
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //如果filteredMovies有東西，就給我filteredMovies，如果沒有，就給movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


changeMode.addEventListener('click', function renderMovieByMode(event) {

  if (event.target.matches('.show-card-btn')) {
    mode = 'card'
  } else if (event.target.matches('.show-list-btn')) {
    mode = 'list'
  }
  renderMovies(getMoviesByPage(nowPage))
})

function renderMovies(movieList) {
  // movieList = getMoviesByPage(nowPage)
  mode === 'card' ? renderMovieByCard(movieList) : renderMovieByList(movieList)

}



paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  //'A' 是指分頁器的a標籤 <a></a>
  nowPage = Number(event.target.dataset.page)
  console.log(event.target.dataset.page)
  console.log(nowPage)

  renderMovies(getMoviesByPage(nowPage))

})

function renderPaginator(amount) {

  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {

    rawHTML +=
      `<li class= "page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML

}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src = "${POSTER_URL + data.image}" alt = "movie-poster" class= "img-fluid">`
  })
}


function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在蒐藏清單中！')
  }

  list.push(movie)
  console.log(list)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}



searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword:' + keyword)
  }

  renderPaginator(filteredMovies.length)
  nowPage = 1
  renderMovies(getMoviesByPage(nowPage))
})



axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieByCard(getMoviesByPage(nowPage))
  })
  .catch((err) => console.log(err))



