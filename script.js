"use strict";
window.onload = () => {
  function fitTextToWidth(element) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const vmin = Math.min(vw / 100, vh / 100);
    let textWidth = parseFloat(window.getComputedStyle(element).width);
    let containerWidth = vw - 4 * vmin;
    if (textWidth <= containerWidth) {
      let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
      while (textWidth <= containerWidth && fontSize < 480) {
        fontSize += 0.5;
        element.style.fontSize = `${fontSize}px`;
        textWidth = parseFloat(window.getComputedStyle(element).width);
      }
    }
    else if (textWidth >= containerWidth) {
      let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
      while (textWidth >= containerWidth && fontSize > 16) {
        fontSize -= 0.5;
        element.style.fontSize = `${fontSize}px`;
        textWidth = parseFloat(window.getComputedStyle(element).width);
      }
    }
  }

  function removeModal(event) {
    // close modal when user clicked only on it and not on its children
    if ((event.type === 'pointerdown' && event.target === this) || event.type === 'keyup') {
      document.getElementById('modal').remove();
      document.removeEventListener('keypress', handleKeyPress);
      document.children[0].children[1].style.overflowY = 'scroll';
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Escape') removeModal(event);
    else if (event.key === 'ArrowRight') console.log(event.key);
    else if (event.key === 'ArrowLeft') console.log(event.key);
  }

  function openModal() {
    const modal = document.createElement('div');
    const imageDescriptionContainer = document.createElement('div');
    const clonedImage = this.cloneNode(true);
    const imageDescription = document.createElement('p');
    modal.id = 'modal';
    modal.classList.add('modal-container');
    imageDescription.textContent = `‘${clonedImage.dataset['title']}’ by ${clonedImage.dataset['author']}. ${clonedImage.dataset['location']}, ${clonedImage.dataset['country']}`;
    imageDescriptionContainer.classList.add('image-description-container');
    imageDescriptionContainer.appendChild(clonedImage);
    imageDescriptionContainer.appendChild(imageDescription);
    modal.appendChild(imageDescriptionContainer);
    document.children[0].children[1].appendChild(modal);
    document.children[0].children[1].style.overflowY = 'hidden';
    modal.addEventListener('pointerdown', removeModal);
    document.addEventListener('keyup', handleKeyPress);
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
            img.style.aspectRatio = `1/${image.ratio}`;

            img.setAttribute('data-src', `images/${image.filename}.jpg`);
            img.setAttribute('data-country', data[key].title);
            img.setAttribute('data-year', image.year);
            img.setAttribute('data-title', image.title);
            img.setAttribute('data-author', image.author);
            img.setAttribute('data-location', image.location);
            img.setAttribute('data-category', image.category);
            
            col.appendChild(img);
            img.addEventListener('pointerdown', openModal);
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
      prevVW = window.innerWidth;
    }
    fitTextToWidth(title);
  }

  let prevVW = 0;
  let columns = 1;
  const breakPoints = [[0,319], [320,767], [768,1023], [1024,10000]];
  const muralsContainer = document.getElementById('murals-container');
  const title = document.getElementById('title');
  const counter = document.getElementById('counter');
  buildGallery();
  fitTextToWidth(title);  

  // sets up intersection observer to load images as they appear in the view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = lazyImage.dataset.src;
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
};