class MediaGalleryWithThumbnails extends HTMLElement {
  constructor() {
    super();
    this.currentGroup = 1;
    this.currentMobileIndex = 1;
    this.mediaCount = parseInt(this.dataset.mediaCount) || 0;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeGallery();
  }

  setupEventListeners() {
    // Desktop thumbnail navigation
    const thumbnailButtons = this.querySelectorAll('.media-gallery-thumbnails__nav-item');
    thumbnailButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const mediaPosition = parseInt(button.dataset.mediaPosition);
        this.scrollToImage(mediaPosition);
      });
    });

    // Mobile thumbnail navigation
    const mobileThumbnailButtons = this.querySelectorAll('.media-gallery-thumbnails__mobile-nav-item');
    mobileThumbnailButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(button.dataset.mobileTarget);
        this.showMobileImage(targetIndex);
      });
    });

    // Mobile arrow navigation
    const prevArrow = this.querySelector('.media-gallery-thumbnails__mobile-arrow--prev');
    const nextArrow = this.querySelector('.media-gallery-thumbnails__mobile-arrow--next');
    
    if (prevArrow) {
      prevArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showMobileImage(Math.max(1, this.currentMobileIndex - 1));
      });
    }
    
    if (nextArrow) {
      nextArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showMobileImage(Math.min(this.mediaCount, this.currentMobileIndex + 1));
      });
    }

    // Keyboard navigation
    this.addEventListener('keydown', this.handleKeydown.bind(this));

    // Touch/swipe support for mobile
    this.setupTouchNavigation();
  }

  initializeGallery() {
    // Show all images on desktop
    const allItems = this.querySelectorAll('.media-gallery-thumbnails__item');
    allItems.forEach(item => {
      item.classList.add('is-active');
    });
    
    // Check mobile elements
    const mobileGallery = this.querySelector('.media-gallery-thumbnails__mobile');
    const mobileItems = this.querySelectorAll('.media-gallery-thumbnails__mobile-item');
    
    // Initialize mobile gallery - show first image
    this.showMobileImage(1);
    
    // Ensure mobile layout is visible on mobile devices
    if (window.innerWidth < 750) {
      if (mobileGallery) {
        mobileGallery.style.display = 'block';
      }
    }
  }

  scrollToImage(mediaPosition) {
    if (mediaPosition < 1 || mediaPosition > this.mediaCount) return;

    this.currentGroup = mediaPosition;

    // Find the grid container and target image
    const grid = this.querySelector('.media-gallery-thumbnails__grid');
    const targetItem = this.querySelector(`.media-gallery-thumbnails__item[data-media-position="${mediaPosition}"]`);
    
    if (!targetItem || !grid) return;

    // Clone the target item
    const clonedItem = targetItem.cloneNode(true);
    
    // Remove the original
    targetItem.remove();
    
    // Insert the clone at the beginning
    grid.insertBefore(clonedItem, grid.firstChild);

    // Update thumbnail navigation active state
    const thumbnailButtons = this.querySelectorAll('.media-gallery-thumbnails__nav-item');
    thumbnailButtons.forEach(button => {
      button.classList.remove('is-active');
      if (parseInt(button.dataset.mediaPosition) === mediaPosition) {
        button.classList.add('is-active');
      }
    });

    // Update gallery status for screen readers
    this.updateGalleryStatus(`Viewing image ${mediaPosition} of ${this.mediaCount}`);
  }

  showMobileImage(imageIndex) {
    if (imageIndex < 1 || imageIndex > this.mediaCount) return;

    this.currentMobileIndex = imageIndex;

    // Hide all mobile images
    const allMobileItems = this.querySelectorAll('.media-gallery-thumbnails__mobile-item');
    allMobileItems.forEach(item => {
      item.classList.remove('is-active');
    });

    // Show current mobile image
    const currentItem = this.querySelector(`[data-mobile-position="${imageIndex}"]`);
    if (currentItem) {
      currentItem.classList.add('is-active');
    }

    // Update mobile thumbnail navigation active state
    const mobileThumbnailButtons = this.querySelectorAll('.media-gallery-thumbnails__mobile-nav-item');
    mobileThumbnailButtons.forEach(button => {
      button.classList.remove('is-active');
      if (parseInt(button.dataset.mobileTarget) === imageIndex) {
        button.classList.add('is-active');
      }
    });

    // Update gallery status for screen readers
    this.updateGalleryStatus(`Showing image ${imageIndex} of ${this.mediaCount}`);
  }

  handleKeydown(event) {
    if (!event.target.closest('.media-gallery-thumbnails__nav-item') && 
        !event.target.closest('.media-gallery-thumbnails__mobile-nav-item')) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (window.innerWidth >= 750) {
          this.scrollToImage(Math.max(1, this.currentGroup - 1));
        } else {
          this.showMobileImage(Math.max(1, this.currentMobileIndex - 1));
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (window.innerWidth >= 750) {
          this.scrollToImage(Math.min(this.mediaCount, this.currentGroup + 1));
        } else {
          this.showMobileImage(Math.min(this.mediaCount, this.currentMobileIndex + 1));
        }
        break;
      case 'Home':
        event.preventDefault();
        if (window.innerWidth >= 750) {
          this.scrollToImage(1);
        } else {
          this.showMobileImage(1);
        }
        break;
      case 'End':
        event.preventDefault();
        if (window.innerWidth >= 750) {
          this.scrollToImage(this.mediaCount);
        } else {
          this.showMobileImage(this.mediaCount);
        }
        break;
    }
  }

  setupTouchNavigation() {
    const mobileGallery = this.querySelector('.media-gallery-thumbnails__mobile-current');
    if (!mobileGallery) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    mobileGallery.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    mobileGallery.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      this.handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 50;

      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe right - previous image
          this.showMobileImage(Math.max(1, this.currentMobileIndex - 1));
        } else {
          // Swipe left - next image
          this.showMobileImage(Math.min(this.mediaCount, this.currentMobileIndex + 1));
        }
      }
    };

    this.handleSwipe = handleSwipe;
  }

  updateGalleryStatus(message) {
    const statusElement = this.querySelector('#GalleryStatus-' + this.id.split('-')[1]);
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  // Handle window resize to switch between desktop and mobile views
  handleResize() {
    // Reset to appropriate view based on screen size
    if (window.innerWidth >= 750) {
      // On desktop, all images are visible, just update thumbnail state
      const thumbnailButtons = this.querySelectorAll('.media-gallery-thumbnails__nav-item');
      thumbnailButtons.forEach(button => {
        button.classList.remove('is-active');
        if (parseInt(button.dataset.mediaPosition) === this.currentGroup) {
          button.classList.add('is-active');
        }
      });
    } else {
      this.showMobileImage(this.currentMobileIndex);
    }
  }
}

// Register the custom element
customElements.define('media-gallery-with-thumbnails', MediaGalleryWithThumbnails);

// Handle window resize
window.addEventListener('resize', () => {
  const galleries = document.querySelectorAll('media-gallery-with-thumbnails');
  galleries.forEach(gallery => {
    if (gallery.handleResize) {
      gallery.handleResize();
    }
  });
});

// Preload images for better performance
document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.querySelectorAll('media-gallery-with-thumbnails');
  galleries.forEach(gallery => {
    const images = gallery.querySelectorAll('img[loading="lazy"]');
    
    // Preload images in viewport
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      imageObserver.observe(img);
    });
  });
});
