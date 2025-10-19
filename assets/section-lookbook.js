// Lookbook Lightbox Functionality
class LookbookLightbox {
  constructor() {
    this.lightbox = document.getElementById('lookbook-lightbox');
    this.images = [];
    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.collectImages();
    this.bindEvents();
  }

  collectImages() {
    // Collect all images with lightbox data
    const imageWrappers = document.querySelectorAll('[data-lightbox-trigger]');
    console.log('Found image wrappers:', imageWrappers.length);
    this.images = Array.from(imageWrappers).map(wrapper => {
      const img = wrapper.querySelector('img[data-lightbox-image]');
      if (img) {
        return {
          src: img.getAttribute('data-lightbox-image'),
          title: img.getAttribute('data-lightbox-title') || '',
          alt: img.getAttribute('alt') || ''
        };
      }
      return null;
    }).filter(Boolean);
    console.log('Collected images:', this.images);
  }

  bindEvents() {
    // Bind click events to image wrappers
    document.querySelectorAll('[data-lightbox-trigger]').forEach((wrapper, index) => {
      wrapper.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLightbox(index);
      });
    });

    // Bind lightbox controls
    if (this.lightbox) {
      const closeBtn = this.lightbox.querySelector('.lookbook-lightbox__close');
      const prevBtn = this.lightbox.querySelector('.lookbook-lightbox__prev');
      const nextBtn = this.lightbox.querySelector('.lookbook-lightbox__next');
      const overlay = this.lightbox.querySelector('.lookbook-lightbox__overlay');

      closeBtn?.addEventListener('click', () => this.closeLightbox());
      prevBtn?.addEventListener('click', () => this.previousImage());
      nextBtn?.addEventListener('click', () => this.nextImage());
      overlay?.addEventListener('click', () => this.closeLightbox());

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (this.lightbox.style.display !== 'none') {
          switch(e.key) {
            case 'Escape':
              this.closeLightbox();
              break;
            case 'ArrowLeft':
              this.previousImage();
              break;
            case 'ArrowRight':
              this.nextImage();
              break;
          }
        }
      });
    }
  }

  openLightbox(index) {
    if (this.images.length === 0) {
      console.log('No images found for lightbox');
      return;
    }
    
    console.log('Opening lightbox with index:', index);
    this.currentIndex = index;
    this.updateLightboxContent();
    this.lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    console.log('Lightbox should now be visible');
  }

  closeLightbox() {
    this.lightbox.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }

  previousImage() {
    if (this.images.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateLightboxContent();
  }

  nextImage() {
    if (this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateLightboxContent();
  }

  updateLightboxContent() {
    if (this.images.length === 0) return;
    
    const currentImage = this.images[this.currentIndex];
    const lightboxImage = this.lightbox.querySelector('.lookbook-lightbox__image');
    const lightboxTitle = this.lightbox.querySelector('.lookbook-lightbox__title');
    
    if (lightboxImage) {
      lightboxImage.src = currentImage.src;
      lightboxImage.alt = currentImage.alt;
    }
    
    if (lightboxTitle) {
      lightboxTitle.textContent = currentImage.title;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new LookbookLightbox();
});

// Re-initialize if content is dynamically loaded
document.addEventListener('shopify:section:load', () => {
  new LookbookLightbox();
});
