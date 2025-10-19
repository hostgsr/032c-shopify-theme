/**
 * Simple Custom Tag Filter
 * Works by directly navigating to tag-filtered URLs
 * Uses Shopify's native tag filtering: /collections/handle/tag
 */

class CustomTagFilter {
  constructor() {
    this.init();
  }

  init() {
    console.log('CustomTagFilter: Starting initialization...');
    
    // Find filter containers
    this.filterTags = document.getElementById('customTagFilterTags');
    this.sizeFilter = document.getElementById('customSizeFilter');
    this.priceFilter = document.getElementById('customPriceFilter');
    this.clearButton = document.getElementById('customFilterClear');
    
    if (!this.filterTags) {
      console.log('CustomTagFilter: Filter tags container not found');
      return;
    }

    // Get collection info
    const match = window.location.pathname.match(/\/collections\/([^\/]+)/);
    if (!match) {
      console.log('CustomTagFilter: Not on a collection page');
      return;
    }

    this.collectionHandle = match[1];
    console.log('CustomTagFilter: Collection:', this.collectionHandle);

    // Load and render all filters
    this.loadAndRenderFilters();
    
    // Bind clear button
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.clearAllFilters());
    }
  }

  async loadAndRenderFilters() {
    try {
      console.log('CustomTagFilter: Loading filters...');
      
      // Fetch all products from collection
      let allProducts = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page < 10) {
        const response = await fetch(`/collections/${this.collectionHandle}/products.json?limit=250&page=${page}`);
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
          allProducts = allProducts.concat(data.products);
          hasMore = data.products.length === 250;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      if (allProducts.length === 0) {
        console.error('CustomTagFilter: No products found');
        return;
      }

      console.log(`CustomTagFilter: Found ${allProducts.length} products`);

      // Collect tags, sizes, and prices
      const tags = new Set();
      const sizes = new Set();
      let minPrice = Infinity;
      let maxPrice = 0;
      
      allProducts.forEach(product => {
        // Collect tags
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => {
            const cleanTag = tag.trim().toLowerCase();
            if (cleanTag) tags.add(cleanTag);
          });
        }
        
        // Collect sizes and prices from variants
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach(variant => {
            // Collect sizes from variant options
            if (variant.option1) sizes.add(variant.option1);
            if (variant.option2) sizes.add(variant.option2);
            if (variant.option3) sizes.add(variant.option3);
            
            // Track price range
            const price = parseFloat(variant.price);
            if (price > 0) {
              minPrice = Math.min(minPrice, price);
              maxPrice = Math.max(maxPrice, price);
            }
          });
        }
      });

      const sortedTags = Array.from(tags).sort();
      const sortedSizes = Array.from(sizes).sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.localeCompare(b);
      });
      
      console.log(`CustomTagFilter: Found ${sortedTags.length} tags, ${sortedSizes.length} sizes`);
      console.log(`CustomTagFilter: Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`);

      // Get currently active filters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const pathParts = window.location.pathname.split('/').filter(p => p);
      const collectionIndex = pathParts.indexOf('collections');
      let activeTags = [];
      if (collectionIndex !== -1 && pathParts.length > collectionIndex + 2) {
        const tagPart = pathParts[collectionIndex + 2];
        activeTags = tagPart.split('+');
      }
      const activeSizes = urlParams.getAll('filter.v.option.size');
      const activeMinPrice = urlParams.get('filter.v.price.gte');
      const activeMaxPrice = urlParams.get('filter.v.price.lte');

      console.log('CustomTagFilter: Active filters:', { tags: activeTags, sizes: activeSizes, minPrice: activeMinPrice, maxPrice: activeMaxPrice });

      // Render Tags
      if (sortedTags.length > 0) {
        this.filterTags.innerHTML = sortedTags.map(tag => {
          const isActive = activeTags.includes(tag);
          const activeClass = isActive ? ' active' : '';
          return `<button type="button" 
                          class="custom-tag-button${activeClass}" 
                          data-tag="${this.escapeHtml(tag)}"
                          onclick="customTagFilterClick('${this.escapeHtml(tag)}')">
            ${this.escapeHtml(tag)}
          </button>`;
        }).join('');
        console.log('CustomTagFilter: Tags rendered');
      } else {
        this.filterTags.innerHTML = '<p>No tags available</p>';
      }
      
      // Render Sizes
      if (this.sizeFilter && sortedSizes.length > 0) {
        this.sizeFilter.innerHTML = `
          <h4>Size:</h4>
          <div class="custom-size-buttons">
            ${sortedSizes.map(size => {
              const isActive = activeSizes.includes(size);
              const activeClass = isActive ? ' active' : '';
              return `<button type="button" 
                              class="custom-tag-button${activeClass}" 
                              data-size="${this.escapeHtml(size)}"
                              onclick="customSizeFilterClick('${this.escapeHtml(size)}')">
                ${this.escapeHtml(size)}
              </button>`;
            }).join('')}
          </div>
        `;
        console.log('CustomTagFilter: Sizes rendered');
      }
      
      // Render Price Range
      if (this.priceFilter && minPrice !== Infinity && maxPrice > 0) {
        const currentMin = activeMinPrice || Math.floor(minPrice);
        const currentMax = activeMaxPrice || Math.ceil(maxPrice);
        
        this.priceFilter.innerHTML = `
          <h4>Price Range:</h4>
          <div class="custom-price-range">
            <div class="price-inputs">
              <input type="number" id="minPriceInput" class="price-input" 
                     min="${Math.floor(minPrice)}" 
                     max="${Math.ceil(maxPrice)}" 
                     value="${currentMin}" 
                     placeholder="Min">
              <span>-</span>
              <input type="number" id="maxPriceInput" class="price-input" 
                     min="${Math.floor(minPrice)}" 
                     max="${Math.ceil(maxPrice)}" 
                     value="${currentMax}" 
                     placeholder="Max">
            </div>
            <button type="button" class="custom-tag-button" onclick="customPriceFilterApply()">Apply</button>
          </div>
        `;
        console.log('CustomTagFilter: Price range rendered');
      }

      console.log('CustomTagFilter: All filters rendered successfully');

    } catch (error) {
      console.error('CustomTagFilter: Error:', error);
      if (this.filterTags) this.filterTags.innerHTML = '<p>Error loading filters</p>';
    }
  }
  
  clearAllFilters() {
    // Navigate to clean collection URL
    window.location.href = `/collections/${this.collectionHandle}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global click handler
window.customTagFilterClick = function(tag) {
  console.log('=========================================');
  console.log('Tag clicked:', tag);
  
  // Get current path
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const collectionIndex = pathParts.indexOf('collections');
  
  if (collectionIndex === -1) {
    console.error('Not on a collection page!');
    return;
  }

  const collectionHandle = pathParts[collectionIndex + 1];
  console.log('Collection:', collectionHandle);

  // Get current tags
  let currentTags = [];
  if (pathParts.length > collectionIndex + 2) {
    const tagPart = pathParts[collectionIndex + 2];
    currentTags = tagPart.split('+');
  }

  console.log('Current tags:', currentTags);

  // Toggle tag
  let newTags;
  if (currentTags.includes(tag)) {
    console.log('Removing tag');
    newTags = currentTags.filter(t => t !== tag);
  } else {
    console.log('Adding tag');
    newTags = [...currentTags, tag];
  }

  console.log('New tags:', newTags);

  // Build URL
  let newUrl = `/collections/${collectionHandle}`;
  if (newTags.length > 0) {
    newUrl += '/' + newTags.join('+');
  }

  console.log('Navigating to:', newUrl);
  console.log('=========================================');

  // Navigate
  window.location.href = newUrl;
};

// Global size filter handler
window.customSizeFilterClick = function(size) {
  console.log('=========================================');
  console.log('Size clicked:', size);
  
  const urlParams = new URLSearchParams(window.location.search);
  const currentSizes = urlParams.getAll('filter.v.option.size');
  
  console.log('Current sizes:', currentSizes);
  
  // Toggle size
  if (currentSizes.includes(size)) {
    console.log('Removing size');
    urlParams.delete('filter.v.option.size');
    currentSizes.filter(s => s !== size).forEach(s => {
      urlParams.append('filter.v.option.size', s);
    });
  } else {
    console.log('Adding size');
    urlParams.append('filter.v.option.size', size);
  }
  
  // Remove page parameter
  urlParams.delete('page');
  
  // Build new URL
  const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
  
  console.log('Navigating to:', newUrl);
  console.log('=========================================');
  
  window.location.href = newUrl;
};

// Global price filter handler
window.customPriceFilterApply = function() {
  console.log('=========================================');
  console.log('Price filter apply clicked');
  
  const minPrice = document.getElementById('minPriceInput')?.value;
  const maxPrice = document.getElementById('maxPriceInput')?.value;
  
  console.log('Min price:', minPrice);
  console.log('Max price:', maxPrice);
  
  const urlParams = new URLSearchParams(window.location.search);
  
  // Update price filters
  if (minPrice) {
    urlParams.set('filter.v.price.gte', minPrice);
  } else {
    urlParams.delete('filter.v.price.gte');
  }
  
  if (maxPrice) {
    urlParams.set('filter.v.price.lte', maxPrice);
  } else {
    urlParams.delete('filter.v.price.lte');
  }
  
  // Remove page parameter
  urlParams.delete('page');
  
  // Build new URL
  const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
  
  console.log('Navigating to:', newUrl);
  console.log('=========================================');
  
  window.location.href = newUrl;
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CustomTagFilter());
} else {
  new CustomTagFilter();
}
