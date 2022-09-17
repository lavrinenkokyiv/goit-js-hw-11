import './css/styles.css';
import { fetchPixabay } from './js/fetchPixabay.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';



const searchForm = document.querySelector('.search-form');
const toGallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');


searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);


let searchQueryInput = '';
let page = 1;
let totalPages = null;


function onSearch(e) {
  e.preventDefault();
  reserPage();
  cleanerGallery();
  searchQueryInput = e.currentTarget.elements.searchQuery.value.trim();
  if (searchQueryInput === '') {
    loadMoreBtn.classList.add('is-hidden');
    return Notify.info('Please enter a more specific name.');
  }
  fetchPixabay(searchQueryInput, page)
    .then(r => {
      console.log(r.data);
      totalPages = Math.ceil(r.data.totalHits / 40);
      if (r.data.totalHits === 0) {
        loadMoreBtn.classList.add('is-hidden');
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      if (page === 1) {
        Notify.success(`Hooray! We found ${r.data.totalHits} images.`);
      }
      loadMoreBtn.classList.remove('is-hidden');
      if (totalPages <= 1) {
        loadMoreBtn.classList.add('is-hidden');
      }
      incrementPage();

      return r.data.hits;
    })
    .then(getResponse)
    .catch(onFetchError)
    .finally(() => console.log('Make a second request'));
}


function createGallery(hits) {
  const markup = hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <a href="${largeImageURL}">
            <div class="photo-card">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                <div class="info">
                    <p class="info-item">
                    <b>Likes</b><br>${likes}
                    </p>
                    <p class="info-item">
                    <b>Views</b><br>${views}
                    </p>
                    <p class="info-item">
                    <b>Comments</b><br>${comments}
                    </p>
                    <p class="info-item">
                    <b>Downloads</b><br>${downloads}
                    </p>
                </div>
            </div>
        </a>`;
      }
    )
    .join('');
  toGallery.insertAdjacentHTML('beforeend', markup);
}


function onLoadMore() {
  if (page > totalPages) {
    loadMoreBtn.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
  }

  fetchPixabay(searchQueryInput, page)
    .then(r => {
      incrementPage();
      return r.data.hits;
    })
    .then(getResponse);
}


function cleanerGallery() {
  toGallery.innerHTML = '';
}

function incrementPage() {
  page += 1;
}

function reserPage() {
  page = 1;
  totalPages = null;
}

function onFetchError(error) {
  Notify.failure('Oops, error!!!');
}


const gallery = new SimpleLightbox('.gallery a', {});

function getResponse(hits) {
  createGallery(hits);
  gallery.refresh();
}
