class CustomContentSlider {
  constructor(element) {
    this.slider = element;
    this.track = this.slider.querySelector('.custom-slider__track');
    this.slides = this.slider.querySelectorAll('.custom-slide');
    this.dots = this.slider.querySelectorAll('.custom-slider__dot');
    this.prevArrow = this.slider.querySelector('.custom-slider__arrow--prev');
    this.nextArrow = this.slider.querySelector('.custom-slider__arrow--next');
    
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.isAutoplay = this.slider.dataset.autoplay === 'true';
    this.autoplaySpeed = parseInt(this.slider.dataset.autoplaySpeed) || 5000;
    this.autoplayTimer = null;
    this.isTransitioning = false;
    
    if (this.totalSlides <= 1) return;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateSlider();
    
    if (this.isAutoplay) {
      this.startAutoplay();
    }
    
    // Pause autoplay when user interacts
    this.slider.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.slider.addEventListener('mouseleave', () => {
      if (this.isAutoplay) this.startAutoplay();
    });
    
    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoplay();
      } else if (this.isAutoplay) {
        this.startAutoplay();
      }
    });
  }
  
  setupEventListeners() {
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Arrow navigation
    if (this.prevArrow) {
      this.prevArrow.addEventListener('click', () => this.previousSlide());
    }
    
    if (this.nextArrow) {
      this.nextArrow.addEventListener('click', () => this.nextSlide());
    }
    
    // Keyboard navigation
    this.slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      }
    });
    
    // Touch/swipe support
    this.setupTouchEvents();
  }
  
  setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let distX = 0;
    let distY = 0;
    let threshold = 50; // Minimum distance for swipe
    
    this.track.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true });
    
    this.track.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;
      
      const touch = e.touches[0];
      distX = touch.clientX - startX;
      distY = touch.clientY - startY;
    }, { passive: true });
    
    this.track.addEventListener('touchend', () => {
      if (!startX || !startY) return;
      
      // Check if horizontal swipe is more significant than vertical
      if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
        if (distX > 0) {
          this.previousSlide();
        } else {
          this.nextSlide();
        }
      }
      
      // Reset values
      startX = 0;
      startY = 0;
      distX = 0;
      distY = 0;
    }, { passive: true });
  }
  
  goToSlide(index, direction = 'next') {
    if (this.isTransitioning || index === this.currentSlide) return;
    
    this.isTransitioning = true;
    this.pauseAutoplay();
    
    // Update current slide
    this.currentSlide = index;
    
    // Update slider position
    this.updateSlider();
    
    // Reset autoplay after transition
    setTimeout(() => {
      this.isTransitioning = false;
      if (this.isAutoplay) {
        this.startAutoplay();
      }
    }, 500); // Match CSS transition duration
  }
  
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex, 'next');
  }
  
  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex, 'prev');
  }
  
  updateSlider() {
    // Move track to show current slide
    const translateX = -this.currentSlide * 100;
    this.track.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('custom-slider__dot--active', index === this.currentSlide);
    });
    
    // Update aria-labels for accessibility
    this.slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index !== this.currentSlide);
    });
    
    // Announce slide change to screen readers
    this.announceSlideChange();
  }
  
  announceSlideChange() {
    // Create or update live region for screen readers
    let liveRegion = this.slider.querySelector('.slider-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'slider-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      this.slider.appendChild(liveRegion);
    }
    
    liveRegion.textContent = `Slide ${this.currentSlide + 1} of ${this.totalSlides}`;
  }
  
  startAutoplay() {
    if (!this.isAutoplay || this.totalSlides <= 1) return;
    
    this.pauseAutoplay(); // Clear any existing timer
    this.autoplayTimer = setInterval(() => {
      if (!this.isTransitioning) {
        this.nextSlide();
      }
    }, this.autoplaySpeed);
  }
  
  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  // Public methods for external control
  play() {
    this.isAutoplay = true;
    this.startAutoplay();
  }
  
  pause() {
    this.isAutoplay = false;
    this.pauseAutoplay();
  }
  
  destroy() {
    this.pauseAutoplay();
    // Remove event listeners if needed
  }
}

// Initialize sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.custom-slider');
  sliders.forEach(slider => {
    new CustomContentSlider(slider);
  });
});

// Re-initialize on Shopify theme editor changes
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    const slider = event.target.querySelector('.custom-slider');
    if (slider) {
      new CustomContentSlider(slider);
    }
  });
  
  document.addEventListener('shopify:section:reorder', () => {
    // Re-initialize all sliders after reordering
    setTimeout(() => {
      const sliders = document.querySelectorAll('.custom-slider');
      sliders.forEach(slider => {
        new CustomContentSlider(slider);
      });
    }, 100);
  });
}
