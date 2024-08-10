'use strict';
window.onload = () => {
  function fitTextToWidth(element) {
    clearTimeout(timeoutId);

    let iter = 0;
    const minSize = 16;
    const maxSize = 640;
    let textWidth = element.scrollWidth;
    const containerWidth = element.parentNode.clientWidth;
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    while (textWidth !== containerWidth && iter < 100 && fontSize > minSize && fontSize < maxSize) {
      element.style.fontSize = `${fontSize}px`;
      textWidth = element.scrollWidth;
      fontSize += 0.1 * (containerWidth - textWidth);
      iter++;
    }
  }

  function hideModal(event) {
    // close modal when user clicked only on it and not on its children
    if ((event.type === 'pointerdown' && event.target === this) || event.type === 'keyup' || this.id === 'close') {
      document.getElementById('modal').classList.add('hidden');
      document.removeEventListener('keypress', handleKeyPress);
      document.children[0].children[1].style.overflowY = 'visible';
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Escape') hideModal(event);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') nextImage(event);
  }

  function initModal() {
    const modal = document.createElement('div');
    const image = document.createElement('img');  
    const imageDescription = document.createElement('p');
    const rightButton = document.createElement('button');
    const leftButton = document.createElement('button');
    const closeButton = document.createElement('button');
    const imageDescriptionContainer = document.createElement('div');
    modal.id = 'modal';
    rightButton.id = 'right';
    leftButton.id = 'left';
    closeButton.id = 'close';
    modal.classList.add('modal-container');
    imageDescriptionContainer.classList.add('image-description-container');
    imageDescriptionContainer.appendChild(image);
    imageDescriptionContainer.appendChild(imageDescription);
    modal.classList.add('hidden');
    rightButton.innerHTML = '<svg viewBox="0 0 32 32"><polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6"/></svg>'; 
    leftButton.innerHTML = '<svg viewBox="0 0 32 32"><polygon points="14 26 15.41 24.59 7.83 17 28 17 28 15 7.83 15 15.41 7.41 14 6 4 16 14 26"/></svg>'; 
    closeButton.innerHTML = '<svg viewBox="0 0 32 32"><polygon points="17.4141 16 26 7.4141 24.5859 6 16 14.5859 7.4143 6 6 7.4141 14.5859 16 6 24.5859 7.4143 26 16 17.4141 24.5859 26 26 24.5859 17.4141 16"/></svg>'; 
    rightButton.classList.add('icon-button');
    leftButton.classList.add('icon-button');
    closeButton.classList.add('icon-button');
    modal.appendChild(imageDescriptionContainer);
    modal.appendChild(leftButton);
    modal.appendChild(rightButton);
    modal.appendChild(closeButton);
    document.children[0].children[1].appendChild(modal);
    document.children[0].children[1].style.overflowY = 'hidden';
    modal.addEventListener('pointerdown', hideModal);
    closeButton.addEventListener('pointerdown', hideModal);
    rightButton.addEventListener('pointerdown', nextImage);
    leftButton.addEventListener('pointerdown', nextImage);
    document.addEventListener('keyup', handleKeyPress);
  }

  function showModal(event) {
    const modal = document.getElementById('modal');
    const imageDescriptionContainer = modal.children[0].children;
    const image = event.target;
    imageDescriptionContainer[0].src = `images/${image.id}.jpg`;
    imageDescriptionContainer[0].setAttribute('data-src', image.id);
    imageDescriptionContainer[1].textContent = `‘${image.dataset['title']}’ by ${image.dataset['author']}. ${image.dataset['location']}, ${image.dataset['country']}`;
    modal.classList.remove('hidden');
  }

  function nextImage(event) {
    let i = -1;
    let found = false;
    const modal = document.getElementById('modal');
    const imageDescriptionContainer = modal.children[0].children;
    while (i < imageFileNames.length && !found) {
      i++;
      if (imageFileNames[i] === imageDescriptionContainer[0].dataset.src) {
        if (event.type === 'pointerdown' || event.key === 'ArrowRight') {
          i = (i + 1) % imageFileNames.length; 
          found = true;         
        }
        else if (event.type === 'pointerdown' || event.key === 'ArrowLeft') {
          i = i - 1;
          if (i < 0) i = imageFileNames.length - 1;
          found = true;
        }
      }
    };
    const newImage = document.getElementById(imageFileNames[i]);
    imageDescriptionContainer[0].src = `images/${newImage.id}.jpg`;
    imageDescriptionContainer[0].setAttribute('data-src', newImage.id);
    imageDescriptionContainer[1].textContent = `‘${newImage.dataset['title']}’ by ${newImage.dataset['author']}. ${newImage.dataset['location']}, ${newImage.dataset['country']}`;
  }

  function buildGallery() {
    let imageCount = 0;
    const w = window.innerWidth;
    breakPoints.forEach((bp, i) => {
      if (w >= bp[0] && w <= bp[1]) columns = i + 1;
    });
    const children = muralsContainer.children;
    fetch(`data/murals.json`).then(response => response.json()).then(data => {
      while (children.length) children[0].remove();

      for (let i = 0; i < columns; i++) {
        const col = document.createElement('div');
        col.classList.add('col');
        col.id = `col-${i}`
        muralsContainer.appendChild(col);
      }

      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          data[key].images.forEach((image, i) => {
            const col = document.getElementById(`col-${i % columns}`);
            const img = document.createElement('img');
            img.alt = image.alt;
            img.id = image.filename;
            imageFileNames.push(image.filename);
            img.setAttribute('data-country', data[key].title);
            img.setAttribute('data-year', image.year);
            img.setAttribute('data-title', image.title);
            img.setAttribute('data-author', image.author);
            img.setAttribute('data-location', image.location);
            img.setAttribute('data-category', image.category);
            col.appendChild(img);
            img.addEventListener('click', showModal);
            imageCount++;
          });
        }
      }
      counter.textContent = `${imageCount}`;
      document.title = title.textContent;
    }).catch(error => console.error('Error fetching JSON:', error));
  }

  function resizePage() {
    const vw = window.innerWidth;
    const sizeChanged = (vw !== prevVW);
    let breakPointCrossed = false;
    breakPoints.forEach((bp, i) => {
      if (vw >= bp[0] && vw <= bp[1] && i + 1 !== columns) breakPointCrossed = true;
    });
    if (sizeChanged && breakPointCrossed) {
      buildGallery();
      prevVW = vw;
    }
    timeoutId = setTimeout(() => { fitTextToWidth(title); }, 100);
  }

  let timeoutId = null;
  let prevVW = 0;
  let columns = 1;
  const imageFileNames = [];
  const breakPoints = [[0,319], [320,767], [768,1023], [1024,10000]];
  const muralsContainer = document.getElementById('murals-container');
  const title = document.getElementById('title');
  const counter = document.getElementById('counter');
  initModal();
  buildGallery();

  // sets up intersection observer to load images as they appear in the view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = `images/${lazyImage.id}.jpg`;
        io.unobserve(lazyImage);
      }
    });
  }, 
  {
    root: null,
    threshold: 0.2, // 20% of the image has to be visible to load it
  });

  // sets up mutation observer to handle dynamically added images
  const config = { attributes: true, childList: true, subtree: true };
  const mo = new MutationObserver((mutationList, _) => {
    const images = muralsContainer.getElementsByTagName('img');
    for (const image of images) {
      if (!image.classList.contains('loaded')) {
        io.observe(image);
        image.classList.add('loaded');  
      }
    }
  });
  mo.observe(muralsContainer, config);
  
  window.addEventListener('resize', resizePage);
  timeoutId = setTimeout(() => { fitTextToWidth(title); }, 100);
};