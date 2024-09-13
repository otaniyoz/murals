'use strict';
window.onload = () => {
  function debounce(callback, waitDuration) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        callback(...args);
      }, waitDuration);
    };
  }

  function fitTextToWidth(element) {
    let iter = 0;
    const step = 0.1;
    const minSize = 16;
    const maxSize = 640;
    const maxIter = 100;
    let textWidth = element.scrollWidth;
    const containerWidth = element.parentNode.clientWidth;
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    while (textWidth !== containerWidth && iter < maxIter && fontSize > minSize && fontSize < maxSize) {
      element.style.fontSize = `${fontSize}px`;
      textWidth = element.scrollWidth;
      fontSize += step * (containerWidth - textWidth);
      iter++;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Escape') hideModal(event);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') nextImage(event);
  }
  
  function scrollCurtain(event) {
    const height = curtainYOffset - event.clientY;
    const curtain = document.getElementById('curtain');
    const baseHeight = parseFloat(window.getComputedStyle(curtain).height);
    curtain.style.height = `${Math.max(baseHeight, 0.2*window.innerHeight) + height}px`;
  }

  function hideModal(event) {
    // close modal when user clicked only on it and not on its children
    if ((event.type === 'pointerdown' && event.target === this) || event.type === 'keyup' || this.id === 'close') {
      document.getElementById('modal').classList.add('hidden');
      document.removeEventListener('keypress', handleKeyPress);
      document.children[0].style.overflowY = 'scroll';
    }
  }

  function initModal() {
    const image = document.createElement('img');  
    const modal = document.getElementById('modal');
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

  function getWindowDimensions() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vmin = (w > h) ? h / 100 : w / 100;
    const vmax = (w > h) ? w / 100 : h / 100;
    return {w: w, h: h, vmin: vmin, vmax: vmax};
  }

  function getModalImageDimensions(imageRatio) {
    let w, h;
    const dimensions = getWindowDimensions();
    const paddedWindowWidth = (dimensions.w <= breakPoints[2][0]) ? dimensions.w - 4*dimensions.vmin : dimensions.w - 24*dimensions.vmax;
    if (imageRatio < dimensions.h / paddedWindowWidth) {
      w = paddedWindowWidth;
      h = imageRatio * paddedWindowWidth;
    }
    else {
      h = dimensions.h;
      w = dimensions.h / imageRatio;
    }
    return {w: w, h: h};
  }

  function getColumnImageDimensions(imageRatio, columns) {
    const dimensions = getWindowDimensions();
    const w = (dimensions.w - 4*dimensions.vmin - (columns - 1)*2*dimensions.vmax) / columns;
    const h = imageRatio * w;
    return {w: w, h: h};
  }

  function getImageDescription(imageDataset) {
    let description = '';
    const authors = imageDataset.author.split(',').filter(s => s !== '');
    const numAuthors = authors.length;
    if (lang === 'en') {
      if (imageDataset.title) description += `‘${imageDataset.title}’`; 
      if (imageDataset.title && imageDataset.year !== '0') description += `, ${imageDataset.year}`;
      if (imageDataset.author && description.length) description += ' by ';
      else if (imageDataset.author && !description.length) description += ' By ';
      if (numAuthors) {
        if (numAuthors === 1) description += authors[0];
        else if (numAuthors === 2) description += `${authors[0]} and ${authors[1]}`;
        else if (numAuthors >= 3) {
          let i;
          for (i = 0; i < numAuthors - 1; i++) {
            description += `${authors[i]}, `;
          }
          description += `and ${authors[i]}`;
        }
      }
      if (description.length) description += '. ';
      if (imageDataset.note.length) description += `${imageDataset.note} `;
      description += `${imageDataset.location}, ${imageDataset.city}, ${imageDataset.country}`;
      return description;
    }
    else if (lang === 'ru') {
      if (imageDataset.title) description += `«${imageDataset.title}»`; 
      if (imageDataset.title && imageDataset.year !== '0') description += `, ${imageDataset.year}`;
      if (description.length) description += '. ';
      if (numAuthors) {
        if (numAuthors === 1) description += authors[0];
        else if (numAuthors === 2) description += `${authors[0]} и ${authors[1]}`;
        else if (numAuthors >= 3) {
          let i;
          for (i = 0; i < numAuthors - 1; i++) {
            description += `${authors[i]}, `;
          }
          description += `и ${authors[i]}`;
        }
        description += '. ';
      }
      if (imageDataset.note.length) description += `${imageDataset.note} `;
      description += `${imageDataset.location}, ${imageDataset.city}, ${imageDataset.country}`;
      return description;
    }
  }

  function handleLoadedImage(event) {
    const placeholder = document.getElementById(`${event.target.id}-placeholder`);
    if (placeholder) placeholder.remove();
    event.target.classList.remove('loading');
    event.target.classList.add('loaded');
  }

  function showModal(event) {
    const image = event.target;
    const modal = document.getElementById('modal');
    const imageDescriptionContainer = modal.children[0].children;
    const dimensions = getModalImageDimensions(image.dataset.ratio);
    imageDescriptionContainer[0].classList = 'loaded';
    imageDescriptionContainer[0].src = `images/${image.id}.jpg`;
    imageDescriptionContainer[0].setAttribute('data-src', image.id);
    imageDescriptionContainer[0].setAttribute('data-ratio', image.dataset.ratio);
    imageDescriptionContainer[0].style.width = `${dimensions.w}px`;
    imageDescriptionContainer[0].style.height = `${dimensions.h}px`;
    imageDescriptionContainer[1].textContent = getImageDescription(image.dataset);
    document.children[0].style.overflowY = 'hidden';
    imageDescriptionContainer[1].style.width = `${dimensions.w + 8}px`;
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
    const w = window.innerWidth / 2;
    const modal = document.getElementById('modal');
    const eventX = event.target.getBoundingClientRect().x;
    const imageDescriptionContainer = modal.children[0].children;
    while (i < imageFileNames.length && !found) {
      i++;
      if (imageFileNames[i] === imageDescriptionContainer[0].dataset.src) {
        if ((event.type === 'pointerdown' && eventX > w) || event.key === 'ArrowRight') {
          i = (i + 1) % imageFileNames.length; 
          found = true; 
        }
        else if ((event.type === 'pointerdown' && eventX < w) || event.key === 'ArrowLeft') {
          i = i - 1;
          if (i < 0) i = imageFileNames.length - 1;
          found = true;
        }
      }
    }
    const newImage = document.getElementById(imageFileNames[i]);
    const dimensions = getModalImageDimensions(newImage.dataset.ratio);
    imageDescriptionContainer[0].src = `images/${newImage.id}.jpg`;
    imageDescriptionContainer[0].setAttribute('data-src', newImage.id);
    imageDescriptionContainer[0].setAttribute('data-ratio', newImage.dataset.ratio);
    imageDescriptionContainer[0].style.width = `${dimensions.w}px`;
    imageDescriptionContainer[0].style.height = `${dimensions.h}px`;
    imageDescriptionContainer[1].textContent = getImageDescription(newImage.dataset);
    imageDescriptionContainer[1].style.width = `${imageDescriptionContainer[0].width + 8}px`;
  }

  function buildGallery() {
    let imageCount = 0;
    const dimensions = getWindowDimensions();
    breakPoints.forEach((bp, i) => {
      if (dimensions.w >= bp[0] && dimensions.w <= bp[1]) columns = i + 1;
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
            let imageTags = [];
            const col = document.getElementById(`col-${imageCount % columns}`);
            const picture = document.createElement('picture');
            const img = document.createElement('img');
            img.src = '#';
            img.alt = image.title;
            img.id = image.filename;
            img.setAttribute('data-year', image.year);
            img.setAttribute('data-city', image.city);
            img.setAttribute('data-note', image.note);
            img.setAttribute('data-title', image.title);
            img.setAttribute('data-ratio', image.ratio);
            img.setAttribute('data-author', image.author);
            img.setAttribute('data-country', data[key].title);
            img.setAttribute('data-location', image.location);

            imageTags.push(image.city);
            imageTags.push(`${image.year}`);
            imageTags.push(data[key].title);
            for (let category of image.category) {
              imageTags.push(category);
              if (categories.indexOf(category) === -1) {
                categories.push(category);
              }
            }
            for (let author of image.author) {
              imageTags.push(author);
              if (authors.indexOf(author) === -1) {
                authors.push(author);
              }
            }
            if (countries.indexOf(data[key].title) === -1) countries.push(data[key].title);
            if (years.indexOf(`${image.year}`) === -1 && image.year !== 0) years.push(`${image.year}`);
            if (cities.indexOf(image.city) === -1) cities.push(image.city);

            if (!checkedCategories.length || checkedCategories.every(v => imageTags.includes(v))) {
              const imageDimensions = getColumnImageDimensions(image.ratio, columns);
              const placeholder = document.createElement('div');
              placeholder.id = `${img.id}-placeholder`;
              placeholder.innerHTML = `<svg class="loading-roundbar" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.0 32.5C18.24 32.5 16.5 32.13 14.9 31.41C13.29 30.69 11.86 29.64 10.68 28.33L12.55 26.67C13.66 27.91 15.06 28.86 16.63 29.42C18.21 29.98 19.89 30.14 21.54 29.88C23.19 29.62 24.75 28.96 26.07 27.95C27.4 26.93 28.45 25.61 29.13 24.08C29.81 22.56 30.1 20.89 29.97 19.23C29.84 17.56 29.3 15.96 28.39 14.56C27.48 13.16 26.24 12.01 24.78 11.21C23.31 10.42 21.67 10.0 20.0 10.0V7.5C23.32 7.5 26.49 8.82 28.84 11.16C31.18 13.51 32.5 16.68 32.5 20.0C32.5 23.32 31.18 26.49 28.84 28.84C26.49 31.18 23.32 32.5 20.0 32.5Z" fill="var(--text-secondary)"/></svg>`;
              placeholder.classList.add('image-placeholder');
              placeholder.style.height = `${imageDimensions.h}px`;
              placeholder.style.width = `${imageDimensions.w}px`;
              picture.style.height = `${imageDimensions.h}px`;
              picture.style.width = `${imageDimensions.w}px`;
              img.style.height = `${imageDimensions.h}px`;
              img.style.width = `${imageDimensions.w}px`;
              img.addEventListener('click', showModal);
              img.addEventListener('load', handleLoadedImage, { once: true });
              imageFileNames.push(image.filename);
              picture.appendChild(placeholder);
              picture.appendChild(img);
              col.appendChild(picture);
              imageCount++;
            }
          });
        }
      }

      if (navBar.children.length !== 2*(categories.length + authors.length + countries.length + cities.length + years.length) + 4) {
        const delimiter = document.createElement('p');
        delimiter.textContent = '|';
        delimiter.classList.add('selector-delimiter');
        populateWithSelectors(authors, navBar, delimiter);
        populateWithSelectors(categories, navBar, delimiter);
        populateWithSelectors(countries, navBar, delimiter);
        populateWithSelectors(cities, navBar, delimiter);
        populateWithSelectors(years, navBar);        
      }
      if (!counter.textContent) {
        const imageCountString = `${imageCount}`;
        counter.textContent = imageCountString;
        for (const endDigits in hints['title'][lang]) {
          if (endDigits.includes(imageCountString[imageCountString.length - 1])) {
            title.childNodes[1].textContent = hints['title'][lang][endDigits];
          }
        }
        document.title = title.textContent;  
      }
      debounce(fitTextToWidth(title), waitDuration);
      document.getElementsByTagName('footer')[0].style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }).catch(error => console.error('Error fetching JSON:', error));
  }

  function populateWithSelectors(targetCategories, targetContainer, delimiter) {
    targetCategories.sort();
    targetCategories.forEach((category) => {
      let selectorLabel = document.createElement('label');
      let selector = document.createElement('input');
      selector.id = category;
      selector.value = category;
      selector.type = 'checkbox';
      selectorLabel.htmlFor = category;
      selector.name = 'category-selector';
      selectorLabel.textContent = category;
      selector.addEventListener('change', filterImages);
      targetContainer.appendChild(selector);
      targetContainer.appendChild(selectorLabel);
    });
    if (delimiter) targetContainer.appendChild(delimiter.cloneNode(true));
  }

  function filterImages(event) {
    const category = event.target.value;
    if (event.target.checked) checkedCategories.push(category);
    else checkedCategories = checkedCategories.filter(cat => cat !== category);
    buildGallery();
  }

  function resizePage() {
   const dimensions = getWindowDimensions();
    const paddedWindowWidth = (dimensions.w <= breakPoints[2][0]) ? dimensions.w - 4*dimensions.vmin : dimensions.w - 24*dimensions.vmax;
    const sizeChanged = (dimensions.w !== prevVW);
    let breakPointCrossed = false;
    breakPoints.forEach((bp, i) => {
      if (dimensions.w >= bp[0] && dimensions.w <= bp[1] && i + 1 !== columns) breakPointCrossed = true;
    });
    if (sizeChanged && breakPointCrossed) {
      buildGallery();
      prevVW = dimensions.w;
    }
    else {
      const images = document.getElementsByTagName('img');
      for (let image of images) {
        const imageDimensions = getColumnImageDimensions(image.dataset.ratio, columns);
        image.style.width = `${imageDimensions.w}px`;
        image.style.height = `${imageDimensions.h}px`;  
      }
      debounce(fitTextToWidth(title), waitDuration);
    }
    const imageDescriptionContainer = document.getElementById('modal').children[0].children;
    const modalImageDimensions = getModalImageDimensions(imageDescriptionContainer[0].dataset.ratio);
    imageDescriptionContainer[0].style.width = `${modalImageDimensions.w}px`;
    imageDescriptionContainer[0].style.height = `${modalImageDimensions.h}px`;
    imageDescriptionContainer[1].style.width = `${modalImageDimensions.w + 8}px`;
  }

  function changeLanguage() {
    const navBar = document.getElementById('nav-bar');
    radios.forEach((radio) => {
      if (radio.checked && radio.value !== lang) {
        lang = radio.value;
        localStorage.setItem('murals-lang', lang);
        while (years.length) years.pop();
        while (cities.length) cities.pop();
        while (authors.length) authors.pop();
        while (countries.length) countries.pop();
        while (categories.length) categories.pop();
        while (checkedCategories.length) checkedCategories.pop();
        while (navBar.children.length) navBar.children[0].remove();
        datafile = `data/${lang}.json`;
        const imageCountString = counter.textContent;
        for (const endDigits in hints['title'][lang]) {
          if (endDigits.includes(imageCountString[imageCountString.length - 1])) {
            title.childNodes[1].textContent = hints['title'][lang][endDigits];
          }
        }
        document.getElementById('contribution').textContent = hints['contribution'][lang];
        document.getElementById('contribution-link').href = hints['contribution-link'][lang];
        document.getElementById('signoff').textContent = hints['signoff'][lang];
        buildGallery();
        document.title = title.textContent;
      }
    });
  }

  let prevVW = 0;
  let columns = 1;
  let lang = 'en';
  let timeoutId = null;
  const categories = [];
  const authors = [];
  const years = [];
  const countries = [];
  const cities = [];
  let curtainYOffset = 0;
  let imageFileNames = [];
  const waitDuration = 450;
  let checkedCategories = [];
  let datafile = `data/${lang}.json`;
  const breakPoints = [[0,319], [320,767], [768,1023], [1024,10000]];
  const muralsContainer = document.getElementById('murals-container');
  const radios = document.getElementsByName('lang');
  let counter = document.getElementById('counter');
  const title = document.getElementById('title');
  const hints = {
    'title': {'en': {'1': ' ⁠mural', '234567890': ' ⁠murals'}, 'ru': {'1': ' ⁠мурал', '234': ' ⁠мурала', '567890': ' ⁠муралов'}},
    'contribution': {'en': 'About', 'ru': 'О проекте'},
    'contribution-link': {'en': 'https://github.com/otaniyoz/murals/blob/master/readme.md', 'ru': 'https://github.com/otaniyoz/murals/blob/master/readme_ru.md'},
    'signoff': {'en': 'Designed and\u00A0developed by\u00A0Otaniyoz in\u00A02024', 'ru': 'Задизайнил и\u00A0разработал Отаниёз в\u00A02024'}
  }
  initModal();
  if (localStorage.getItem('murals-lang') && localStorage.getItem('murals-lang') !== lang) {
    lang = localStorage.getItem('murals-lang');
    datafile = `data/${lang}.json`;
    document.getElementById(lang).checked = true;
    counter.remove();
    title.innerHTML = `<span id="counter"></span>${hints['title'][lang]}`;
    counter = document.getElementById('counter');
    document.getElementById('contribution').textContent = hints['contribution'][lang];
    document.getElementById('contribution-link').href = hints['contribution-link'][lang];
    document.getElementById('signoff').textContent = hints['signoff'][lang];
  }
  buildGallery();

  // sets up intersection observer to load images as they appear in the view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = `images/${lazyImage.id}.jpg`;
        lazyImage.classList.add('loading');
        io.unobserve(lazyImage);
      }
    });
  }, 
  {
    root: null,
    threshold: 0.05, // 5% of the image has to be visible to begin loading it
  });

  // sets up mutation observer to handle dynamically added images
  const config = { attributes: true, childList: true, subtree: true };
  const mo = new MutationObserver((mutationList, _) => {
    const images = muralsContainer.getElementsByTagName('img');
    for (const image of images) {
      if (!image.classList.contains('observing')) {
        io.observe(image);
        image.classList.add('observing');
      }
    }
  });
  mo.observe(muralsContainer, config);
  
  radios.forEach((radio) => { 
    radio.addEventListener('change', changeLanguage);
  });
  window.addEventListener('resize', resizePage);
};