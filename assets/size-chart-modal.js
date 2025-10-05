class SizeChartModal {
  constructor() {
    this.modals = {
      unisex: document.getElementById('SizeChartModal'),
      men: document.getElementById('SizeChartModalMen'),
      women: document.getElementById('SizeChartModalWomen')
    };
    this.currentModal = null;
    
    this.init();
  }
  
  init() {
    // Initialize each modal
    Object.keys(this.modals).forEach(type => {
      const modal = this.modals[type];
      if (!modal) return;
      
      const closeBtn = modal.querySelector('.size-chart-modal__close');
      const overlay = modal.querySelector('.size-chart-modal__overlay');
      const toggleBtns = modal.querySelectorAll('.size-chart-toggle__btn');
      
      // Close modal events
      closeBtn?.addEventListener('click', () => this.close());
      overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
      
      // Unit toggle events
      toggleBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
          const unit = btn.dataset.unit;
          this.toggleUnit(unit, modal);
        });
      });
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
    
    // Size chart button click event
    document.addEventListener('click', (e) => {
      const sizeChartButton = e.target.closest('.size-chart-button');
      if (sizeChartButton) {
        e.preventDefault();
        const span = sizeChartButton.querySelector('span[data-size-chart-type]');
        const chartType = span?.dataset.sizeChartType || 'unisex';
        this.open(chartType);
      }
    });
  }
  
  open(type = 'unisex') {
    const modal = this.modals[type];
    if (!modal) return;
    
    this.currentModal = modal;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Trigger animation
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });
    
    // Focus management for accessibility
    setTimeout(() => {
      const closeBtn = modal.querySelector('.size-chart-modal__close');
      closeBtn?.focus();
    }, 350);
  }
  
  close() {
    if (!this.currentModal) return;
    
    this.currentModal.classList.remove('is-open');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.currentModal.style.display = 'none';
      document.body.style.overflow = '';
      this.currentModal = null;
    }, 300);
  }
  
  isOpen() {
    return this.currentModal && this.currentModal.classList.contains('is-open');
  }
  
  toggleUnit(unit, modal) {
    if (!modal) return;
    
    const toggleBtns = modal.querySelectorAll('.size-chart-toggle__btn');
    const cmRows = modal.querySelectorAll('.size-chart-row--cm');
    const inRows = modal.querySelectorAll('.size-chart-row--in');
    
    // Update toggle button active state
    toggleBtns?.forEach(btn => {
      btn.classList.toggle('size-chart-toggle__btn--active', btn.dataset.unit === unit);
    });
    
    // Show/hide appropriate rows
    if (unit === 'cm') {
      cmRows?.forEach(row => row.style.display = '');
      inRows?.forEach(row => row.style.display = 'none');
    } else {
      cmRows?.forEach(row => row.style.display = 'none');
      inRows?.forEach(row => row.style.display = '');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SizeChartModal();
});

// Also initialize if script loads after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SizeChartModal();
  });
} else {
  new SizeChartModal();
}
