class CustomTagFilter {
  constructor() {
    this.filterButton = document.getElementById('customFilterButton');
    this.filterPanel = document.getElementById('customTagFilterPanel');
    this.filterClose = document.getElementById('customFilterClose');
    this.filterClear = document.getElementById('customFilterClear');
    this.filterApply = document.getElementById('customFilterApply');
    this.filterTags = document.getElementById('customTagFilterTags');
    this.filterSelected = document.getElementById('customTagFilterSelected');
    this.filterSelectedTags = document.getElementById('customTagFilterSelectedTags');
    this.productGrid = document.getElementById('product-grid');
    this.products = [];
    this.allTags = new Set();
    this.selectedTags = new Set();
    this.allProducts = []; // Store all products from all pages
    
    this.init();
  }

  init() {
    if (!this.filterButton || !this.filterPanel) return;
    
    this.loadAllProducts();
    this.collectCurrentPageProductsAndTags();
    this.renderTagButtons();
    this.bindEvents();
  }

  async loadAllProducts() {
    try {
      // Get the current collection URL
      const currentUrl = window.location.pathname;
      const collectionHandle = currentUrl.split('/collections/')[1]?.split('/')[0];
      
      if (!collectionHandle) return;
      
      // Fetch all products from the collection
      const response = await fetch(`/collections/${collectionHandle}/products.json?limit=250`);
      const data = await response.json();
      
      this.allProducts = data.products.map(product => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        tags: product.tags.map(tag => tag.toLowerCase()),
        available: product.available,
        featured_media: product.featured_media
      }));
      
      // Collect all unique tags
      this.allProducts.forEach(product => {
        product.tags.forEach(tag => {
          if (tag) {
            this.allTags.add(tag);
          }
        });
      });
      
    } catch (error) {
      console.error('Error loading all products:', error);
      // Fallback to current page products only
      this.collectCurrentPageProductsAndTags();
    }
  }

  collectCurrentPageProductsAndTags() {
    if (!this.productGrid) return;
    
    const productItems = this.productGrid.querySelectorAll('.grid__item[data-product-tags]');
    
    productItems.forEach(item => {
      const tags = item.getAttribute('data-product-tags').split(',').map(tag => tag.trim());
      this.products.push({
        element: item,
        tags: tags
      });
      
      tags.forEach(tag => {
        if (tag) {
          this.allTags.add(tag);
        }
      });
    });
  }

  renderTagButtons() {
    if (!this.filterTags) return;
    
    this.filterTags.innerHTML = '';
    
    const sortedTags = Array.from(this.allTags).sort();
    
    sortedTags.forEach(tag => {
      const button = document.createElement('button');
      button.className = 'custom-tag-button';
      button.textContent = tag;
      button.setAttribute('data-tag', tag);
      button.addEventListener('click', () => this.toggleTag(tag));
      
      this.filterTags.appendChild(button);
    });
  }

  toggleTag(tag) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    
    this.updateTagButtons();
    this.updateSelectedFiltersDisplay();
  }

  updateTagButtons() {
    const tagButtons = this.filterTags.querySelectorAll('.custom-tag-button');
    
    tagButtons.forEach(button => {
      const tag = button.getAttribute('data-tag');
      if (this.selectedTags.has(tag)) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  updateSelectedFiltersDisplay() {
    if (!this.filterSelected || !this.filterSelectedTags) return;
    
    this.filterSelectedTags.innerHTML = '';
    
    if (this.selectedTags.size === 0) {
      this.filterSelected.style.display = 'none';
      return;
    }
    
    this.filterSelected.style.display = 'block';
    
    this.selectedTags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'custom-tag-filter-selected-tag';
      tagElement.innerHTML = `
        <span>${tag}</span>
        <button class="custom-tag-filter-selected-tag-remove" data-tag="${tag}">×</button>
      `;
      
      // Add click handler for remove button
      const removeButton = tagElement.querySelector('.custom-tag-filter-selected-tag-remove');
      removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeTag(tag);
      });
      
      this.filterSelectedTags.appendChild(tagElement);
    });
  }

  removeTag(tag) {
    this.selectedTags.delete(tag);
    this.updateTagButtons();
    this.updateSelectedFiltersDisplay();
  }

  filterProducts() {
    if (this.selectedTags.size === 0) {
      // Show all products
      this.products.forEach(product => {
        product.element.style.display = '';
      });
    } else {
      // Filter products by selected tags
      this.products.forEach(product => {
        const hasMatchingTag = product.tags.some(tag => this.selectedTags.has(tag));
        product.element.style.display = hasMatchingTag ? '' : 'none';
      });
    }
    
    this.updateProductCount();
  }

  updateProductCount() {
    const visibleProducts = this.products.filter(product => 
      product.element.style.display !== 'none'
    ).length;
    
    const totalProducts = this.products.length;
    const totalAllProducts = this.allProducts.length;
    
    // Update product count display if it exists
    const productCountElements = document.querySelectorAll('#ProductCount, #ProductCountDesktop');
    productCountElements.forEach(element => {
      if (this.selectedTags.size === 0) {
        element.textContent = `${totalProducts} products`;
      } else {
        element.textContent = `${visibleProducts} of ${totalProducts} products`;
      }
    });
  }

  clearFilters() {
    this.selectedTags.clear();
    this.updateTagButtons();
    this.updateSelectedFiltersDisplay();
    this.filterProducts();
  }

  bindEvents() {
    // Filter button toggle
    this.filterButton.addEventListener('click', () => {
      const isOpen = this.filterPanel.style.display !== 'none';
      this.filterPanel.style.display = isOpen ? 'none' : 'block';
      this.filterButton.setAttribute('aria-expanded', !isOpen);
      
      if (!isOpen) {
        this.filterButton.classList.add('active');
      } else {
        this.filterButton.classList.remove('active');
      }
    });

    // Close button
    this.filterClose.addEventListener('click', () => {
      this.filterPanel.style.display = 'none';
      this.filterButton.setAttribute('aria-expanded', 'false');
      this.filterButton.classList.remove('active');
    });

    // Clear button
    this.filterClear.addEventListener('click', () => {
      this.clearFilters();
    });

    // Apply button
    this.filterApply.addEventListener('click', () => {
      this.filterProducts();
      this.filterPanel.style.display = 'none';
      this.filterButton.setAttribute('aria-expanded', 'false');
      this.filterButton.classList.remove('active');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const filterWrapper = this.filterButton.closest('.collection-hero__filter-wrapper');
      if (!filterWrapper.contains(e.target) && 
          this.filterPanel.style.display !== 'none') {
        this.filterPanel.style.display = 'none';
        this.filterButton.setAttribute('aria-expanded', 'false');
        this.filterButton.classList.remove('active');
      }
    });

    // Close panel on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.filterPanel.style.display !== 'none') {
        this.filterPanel.style.display = 'none';
        this.filterButton.setAttribute('aria-expanded', 'false');
        this.filterButton.classList.remove('active');
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CustomTagFilter();
});