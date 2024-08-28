'use strict';
window.onload = () => {
  function fitTextToWidth(element) {
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
    const image = event.target;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vmin = (w > h) ? h / 100 : w / 100;
    const vmax = (w > h) ? w / 100 : h / 100;
    const modal = document.getElementById('modal');
    const imageDescriptionContainer = modal.children[0].children;
    const paddedWindowWidth = (w <= breakPoints[2][0]) ? w - 4*vmin : w - 24*vmax;
    imageDescriptionContainer[0].src = `images/${image.id}.jpg`;
    imageDescriptionContainer[0].setAttribute('data-src', image.id);
    imageDescriptionContainer[0].setAttribute('data-ratio', image.dataset.ratio);
    if (image.dataset.ratio < h / paddedWindowWidth) {
      imageDescriptionContainer[0].style.width = `${paddedWindowWidth}px`;
      imageDescriptionContainer[0].style.height = `${image.dataset.ratio*paddedWindowWidth}px`;
    }
    else {
      imageDescriptionContainer[0].style.height = `${h}px`;
      imageDescriptionContainer[0].style.width = `${h/image.dataset.ratio}px`;
    }
    if (lang === 'en') imageDescriptionContainer[1].textContent = `‘${image.dataset.title}’${(image.dataset.year !== '0') ? ', ' + image.dataset.year : ''} by ${image.dataset.author}. ${image.dataset.location}, ${image.dataset.country}`;
    else if (lang === 'ru') imageDescriptionContainer[1].textContent = `«${image.dataset.title}»${(image.dataset.year !== '0') ? ', ' + image.dataset.year : ''}. ${image.dataset.author}. ${image.dataset.location}, ${image.dataset.country}`;
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vmin = (w > h) ? h / 100 : w / 100;
    const vmax = (w > h) ? w / 100 : h / 100;
    const modal = document.getElementById('modal');
    const imageDescriptionContainer = modal.children[0].children;
    const paddedWindowWidth = (w <= breakPoints[2][0]) ? w - 4*vmin : w - 24*vmax;
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
    }
    const newImage = document.getElementById(imageFileNames[i]);
    imageDescriptionContainer[0].src = `images/${newImage.id}.jpg`;
    imageDescriptionContainer[0].setAttribute('data-src', newImage.id);
    imageDescriptionContainer[0].setAttribute('data-ratio', newImage.dataset.ratio);
    if (newImage.dataset.ratio < h / paddedWindowWidth) {
      imageDescriptionContainer[0].style.width = `${paddedWindowWidth}px`;
      imageDescriptionContainer[0].style.height = `${newImage.dataset.ratio*paddedWindowWidth}px`;
    }
    else {
      imageDescriptionContainer[0].style.height = `${h}px`;
      imageDescriptionContainer[0].style.width = `${h/newImage.dataset.ratio}px`;
    }
    if (lang === 'en') imageDescriptionContainer[1].textContent = `‘${newImage.dataset.title}’${(newImage.dataset.year !== '0') ? ', ' + newImage.dataset.year : ''} by ${newImage.dataset.author}. ${newImage.dataset.location}, ${newImage.dataset.country}`;
    else if (lang === 'ru') imageDescriptionContainer[1].textContent = `«${newImage.dataset.title}»${(newImage.dataset.year !== '0') ? ', ' + newImage.dataset.year : ''}. ${newImage.dataset.author}. ${newImage.dataset.location}, ${newImage.dataset.country}`;
    imageDescriptionContainer[1].style.width = `${imageDescriptionContainer[0].width + 8}px`;
  }

  function buildGallery() {
    let imageCount = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vmin = (w > h) ? h / 100 : w / 100;
    const vmax = (w > h) ? w / 100 : h / 100;
    breakPoints.forEach((bp, i) => {
      if (w >= bp[0] && w <= bp[1]) columns = i + 1;
    });
    const children = muralsContainer.children;
    const navBar = document.getElementById('nav-bar');
    const categoryInputs = document.getElementsByName('category-selector');
    for (let i = 0; i < categoryInputs.length; i++) {
      if (categoryInputs[i].checked) checkedCategories.push(categoryInputs[i].value);
      else checkedCategories = checkedCategories.filter(cat => cat !== categoryInputs[i].value);  
    }
    imageFileNames = [];
    fetch(datafile).then(response => response.json()).then(data => {
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
            const col = document.getElementById(`col-${imageCount % columns}`);
            const img = document.createElement('img');
            img.src = '#';
            img.alt = image.title;
            img.id = image.filename;
            img.setAttribute('data-country', data[key].title);
            img.setAttribute('data-year', image.year);
            img.setAttribute('data-title', image.title);
            img.setAttribute('data-ratio', image.ratio);
            img.setAttribute('data-author', image.author);
            img.setAttribute('data-location', image.location);
            img.setAttribute('data-category', image.category);
            for (let category of image.category) {
              if (categories.indexOf(category) === -1) {
                categories.push(category);
              }
            }
            if (!checkedCategories.length || image.category.some(cat => checkedCategories.includes(cat))) {
              imageFileNames.push(image.filename);
              const imageWidth = (w - 4*vmin - (columns - 1)*2*vmax) / columns;
              const imageHeight = parseFloat(image.ratio) * imageWidth; 
              img.addEventListener('click', showModal);
              col.appendChild(img);
              img.style.width = `${imageWidth}px`;
              img.style.height = `${imageHeight}px`;
              imageCount++;
            }
          });
        }
      }

      if (navBar.children.length !== 2*categories.length) {
        categories.sort();
        categories.forEach((category) => {
          let selectorLabel = document.createElement('label');
          let selector = document.createElement('input');
          selector.id = category;
          selector.value = category;
          selector.type = 'checkbox';
          selectorLabel.htmlFor = category;
          selector.name = 'category-selector';
          selectorLabel.textContent = category;
          selector.addEventListener('change', filterImages);
          navBar.appendChild(selector);
          navBar.appendChild(selectorLabel);
        })  
      }
      
      if (!counter.textContent) {
        counter.textContent = `${imageCount}`;
        document.title = title.textContent;  
      } 
    }).catch(error => console.error('Error fetching JSON:', error));
  }

  function filterImages(event) {
    const category = event.target.value;
    if (event.target.checked) checkedCategories.push(category);
    else checkedCategories = checkedCategories.filter(cat => cat !== category);
    buildGallery();
    timeoutId = setTimeout(() => { fitTextToWidth(title); }, debounce);    
  }

  function resizePage() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vmin = (w > h) ? h / 100 : w / 100;
    const vmax = (w > h) ? w / 100 : h / 100;
    const paddedWindowWidth = (w <= breakPoints[2][0]) ? w - 4*vmin : w - 24*vmax;
    const sizeChanged = (w !== prevVW);
    let breakPointCrossed = false;
    breakPoints.forEach((bp, i) => {
      if (w >= bp[0] && w <= bp[1] && i + 1 !== columns) breakPointCrossed = true;
    });
    if (sizeChanged && breakPointCrossed) {
      buildGallery();
      prevVW = w;
    }
    else {
      const images = document.getElementsByTagName('img');
      for (let image of images) {
        const imageWidth = (w - 4*vmin - (columns - 1)*2*vmax) / columns;
        const imageHeight = parseFloat(image.dataset.ratio) * imageWidth; 
        image.style.width = `${imageWidth}px`;
        image.style.height = `${imageHeight}px`;  
      }
    }
    timeoutId = setTimeout(() => { fitTextToWidth(title); }, debounce);
    const imageDescriptionContainer = document.getElementById('modal').children[0].children;
    if (imageDescriptionContainer[0].dataset.ratio < h / paddedWindowWidth) {
      imageDescriptionContainer[0].style.width = `${paddedWindowWidth}px`;
      imageDescriptionContainer[0].style.height = `${imageDescriptionContainer[0].dataset.ratio*paddedWindowWidth}px`;
    }
    else {
      imageDescriptionContainer[0].style.height = `${h}px`;
      imageDescriptionContainer[0].style.width = `${paddedWindowWidth/imageDescriptionContainer[0].dataset.ratio}px`;
    }
    imageDescriptionContainer[1].style.width = `${imageDescriptionContainer[0].width + 8}px`;
  }

  function changeLanguage() {
    const hints = {
      'title': {'en': ' ⁠murals', 'ru': ' ⁠мурала'},
      'contribution': {'en': 'About', 'ru': 'О проекте'},
      'murals': {'en': 'en.json', 'ru': 'ru.json'}
    }
    const navBar = document.getElementById('nav-bar');
    radios.forEach((radio) => {
      if (radio.checked && radio.value !== lang) {
        lang = radio.value;
        while (categories.length) categories.pop();
        while (checkedCategories.length) checkedCategories.pop();
        while (navBar.children.length) navBar.children[0].remove();
        datafile = `data/${hints['murals'][lang]}`;
        title.innerHTML = `<span id="counter">${counter.textContent}</span>${hints['title'][lang]}`;
        document.getElementById('contribution').textContent = hints['contribution'][lang];
        buildGallery();
        document.title = title.textContent;
        timeoutId = setTimeout(() => { fitTextToWidth(title); }, debounce);
      }
    });
  }

  let prevVW = 0;
  let columns = 1;
  let lang = 'en';
  let timeoutId = null;
  let curtainYOffset = 0;
  const debounce = 200;
  const categories = [];
  let imageFileNames = [];
  let checkedCategories = [];
  let datafile = 'data/en.json';
  const breakPoints = [[0,319], [320,767], [768,1023], [1024,10000]];
  const muralsContainer = document.getElementById('murals-container');
  const counter = document.getElementById('counter');
  const radios = document.getElementsByName('lang');
  const title = document.getElementById('title');
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
  
  radios.forEach((radio) => { 
    radio.addEventListener('change', changeLanguage);
  });
  window.addEventListener('resize', resizePage);
  timeoutId = setTimeout(() => { fitTextToWidth(title); }, debounce);
};