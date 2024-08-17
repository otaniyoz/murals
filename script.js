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
      document.children[0].style.overflowY = 'scroll';
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Escape') hideModal(event);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') nextImage(event);
  }

  function scrollCurtain(event) {
    const curtain = document.getElementById('curtain');
    const height = curtainYOffset - event.clientY;
    curtain.style.height = `${Math.max(parseFloat(window.getComputedStyle(curtain).height), 0.2*window.innerHeight) + height}px`;
  }

  function initModal() {
    const modal = document.getElementById('modal');
    const image = document.createElement('img');  
    const imageDescription = document.createElement('p');
    const rightButton = document.getElementById('right');
    const leftButton = document.getElementById('left');
    const closeButton = document.getElementById('close');
    const imageDescriptionContainer = modal.children[0];
    imageDescription.id = 'curtain';
    imageDescription.classList.add('image-description');
    imageDescriptionContainer.appendChild(image);
    imageDescriptionContainer.appendChild(imageDescription);
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
    document.children[0].style.overflowY = 'hidden';
    imageDescriptionContainer[1].style.width = `${imageDescriptionContainer[0].width + 8}px`;
    imageDescriptionContainer[1].addEventListener('pointerdown', (event) => {
      curtainYOffset = event.clientY;
      document.addEventListener('pointermove', scrollCurtain);
      document.addEventListener('pointerup', () => {
        document.removeEventListener('pointermove', scrollCurtain);
        // resetting image description height on pointerup so that it does not persist across images and stuff
        imageDescriptionContainer[1].style.height = `${0.2*window.innerHeight}px`;
        
      });
    });
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
        if ((event.type === 'pointerdown' && event.target.getBoundingClientRect().x > window.innerWidth / 2) || event.key === 'ArrowRight') {
          i = (i + 1) % imageFileNames.length; 
          found = true;         
        }
        else if ((event.type === 'pointerdown' && event.target.getBoundingClientRect().x < window.innerWidth / 2) || event.key === 'ArrowLeft') {
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
    imageDescriptionContainer[1].style.width = `${imageDescriptionContainer[0].width + 8}px`;
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
            img.src = '#';
            img.alt = image.alt;
            img.id = image.filename;
            imageFileNames.push(image.filename);
            img.setAttribute('data-country', data[key].title);
            img.setAttribute('data-year', image.year);
            img.setAttribute('data-title', image.title);
            img.setAttribute('data-author', image.author);
            img.setAttribute('data-location', image.location);
            img.setAttribute('data-category', image.category);
            img.addEventListener('click', showModal);
            col.appendChild(img);
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

    const imageDescriptionContainer = document.getElementById('modal').children[0].children;
    imageDescriptionContainer[1].style.width = `${imageDescriptionContainer[0].width + 8}px`;;
  }

  let prevVW = 0;
  let columns = 1;
  let timeoutId = null;
  let curtainYOffset = 0;
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