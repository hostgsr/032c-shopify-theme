class HoverQuickAdd extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.selectedVariants = {};
    this.productData = null;
    this.setupEventListeners();
    this.loadProductData();
  }

  setupEventListeners() {
    // Handle variant button clicks
    this.addEventListener('click', (e) => {
      if (e.target.classList.contains('hover-variant-btn') && !e.target.disabled) {
        this.handleVariantSelection(e.target);
      }
    });

    // Handle add to cart button clicks for variants
    this.addEventListener('click', (e) => {
      if (e.target.classList.contains('hover-add-to-cart-btn') && e.target.dataset.productId) {
        this.handleVariantAddToCart(e.target);
      }
    });
  }

  async loadProductData() {
    const productHandle = this.dataset.productHandle;
    if (!productHandle) return;

    try {
      const response = await fetch(`/products/${productHandle}.js`);
      this.productData = await response.json();
    } catch (error) {
      console.error('Failed to load product data:', error);
    }
  }

  handleVariantSelection(button) {
    const option = button.dataset.variantOption;
    const value = button.dataset.variantValue;
    const productId = button.dataset.productId;

    // Remove selected class from other buttons in the same option group
    const optionGroup = button.closest('.hover-variant-option');
    optionGroup.querySelectorAll('.hover-variant-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Add selected class to clicked button
    button.classList.add('selected');

    // Store the selected variant
    if (!this.selectedVariants[productId]) {
      this.selectedVariants[productId] = {};
    }
    this.selectedVariants[productId][option] = value;

    // Check if we can enable the add to cart button
    this.updateAddToCartButton(productId);
  }

  updateAddToCartButton(productId) {
    const addToCartBtn = this.querySelector(`[data-product-id="${productId}"].hover-add-to-cart-btn`);
    if (!addToCartBtn || !this.productData) return;

    // Find the matching variant based on selected options
    const selectedOptions = this.selectedVariants[productId] || {};
    const variant = this.findMatchingVariant(selectedOptions);

    if (variant && variant.available) {
      addToCartBtn.disabled = false;
      addToCartBtn.textContent = addToCartBtn.dataset.addToCartText || 'Add to cart';
      addToCartBtn.dataset.variantId = variant.id;
    } else {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = variant ? 'Sold out' : 'Select options';
    }
  }

  findMatchingVariant(selectedOptions) {
    if (!this.productData || !this.productData.variants) return null;

    return this.productData.variants.find(variant => {
      const options = [variant.option1, variant.option2, variant.option3].filter(Boolean);
      const selectedValues = Object.values(selectedOptions);
      
      // Check if all selected options match this variant
      return selectedValues.every(value => options.includes(value));
    });
  }

  async tryUpdateCartQuantity(variantId) {
    try {
      // Try to update cart quantity instead of adding new item
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      
      const formData = new FormData();
      formData.append('id', variantId);
      formData.append('quantity', '2'); // Try increasing to 2
      
      // Add cart sections for proper cart updates
      const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      if (cart && typeof cart.getSectionsToRender === 'function') {
        formData.append(
          'sections',
          cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
      }
      
      config.body = formData;
      
      const response = await fetch(routes.cart_change_url || '/cart/change.js', config);
      const responseText = await response.text();
      const result = responseText ? JSON.parse(responseText) : {};
      
      if (!result.status) {
        return result; // Success
      }
      
      return null; // Failed
    } catch (error) {
      console.log('Cart update failed:', error);
      return null;
    }
  }

  async handleVariantAddToCart(button) {
    const variantId = button.dataset.variantId;
    if (!variantId) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.classList.add('loading');
    button.textContent = 'Adding...';
    
    const spinner = button.querySelector('.loading__spinner');
    if (spinner) spinner.classList.remove('hidden');

    try {
      // Use the same config as the working product-form.js
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData();
      formData.append('id', variantId);
      formData.append('quantity', '1');
      
      // Add cart sections for proper cart updates (same as product-form.js)
      const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      if (cart && typeof cart.getSectionsToRender === 'function') {
        formData.append(
          'sections',
          cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
        cart.setActiveElement(document.activeElement);
      }
      
      config.body = formData;

      const response = await fetch(routes.cart_add_url, config);
      
      // Handle empty response (which causes JSON parsing error)
      const responseText = await response.text();
      let result;
      
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError, 'Response text:', responseText);
        throw new Error('Invalid server response');
      }

      // Handle errors the same way as product-form.js
      if (result.status) {
        // This means there was an error
        let errorMessage = result.description || result.message || 'Failed to add to cart';
        
        // Handle specific cart quantity limit errors with better messages
        if (errorMessage.toLowerCase().includes('limit') || 
            errorMessage.toLowerCase().includes('maximum') || 
            errorMessage.toLowerCase().includes('already in your cart') ||
            errorMessage.toLowerCase().includes('inventory') ||
            result.status === 422) { // Unprocessable Entity - usually inventory/quantity issues
          
          // Show specific user-friendly messages
          let displayMessage = 'Cart limit reached';
          if (errorMessage.toLowerCase().includes('inventory')) {
            displayMessage = 'Not enough in stock';
          } else if (errorMessage.toLowerCase().includes('maximum')) {
            displayMessage = 'Maximum quantity reached';
          } else if (errorMessage.toLowerCase().includes('already in your cart')) {
            // Try to increase quantity instead
            button.textContent = 'Updating quantity...';
            const updateResult = await this.tryUpdateCartQuantity(variantId);
            
            if (updateResult) {
              // Success - updated quantity
              button.textContent = 'Quantity updated!';
              
              // Update cart display
              if (cart && typeof cart.renderContents === 'function') {
                cart.renderContents(updateResult);
              }
              
              setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
              }, 2000);
              return;
            } else {
              displayMessage = 'Maximum quantity reached';
            }
          }
          
          button.textContent = displayMessage;
          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
          }, 3000); // Show message longer for limits
          return; // Don't throw error, just show message
        }
        
        throw new Error(errorMessage);
      }

      // Success - show feedback and update cart
      button.textContent = 'Added!';
      
      // Publish the same events as product-form.js
      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: 'hover-quick-add',
          productVariantId: variantId,
          cartData: result,
        });
      }

      // Update cart drawer or notification
      if (cart && typeof cart.renderContents === 'function') {
        cart.renderContents(result);
      }

      // Reset button after delay
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);

    } catch (error) {
      console.error('Add to cart error:', error);
      button.textContent = 'Error';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    } finally {
      button.classList.remove('loading');
      if (spinner) spinner.classList.add('hidden');
    }
  }
}

// Initialize hover quick add functionality
document.addEventListener('DOMContentLoaded', () => {
  // Convert hover overlays to custom elements
  document.querySelectorAll('.quick-add-hover-overlay').forEach(overlay => {
    if (!overlay.classList.contains('hover-quick-add-initialized')) {
      overlay.classList.add('hover-quick-add-initialized');
      
      // Copy methods from HoverQuickAdd prototype
      Object.setPrototypeOf(overlay, HoverQuickAdd.prototype);
      
      // Initialize
      overlay.init();
    }
  });
});

// Handle dynamic content loading
document.addEventListener('shopify:section:load', () => {
  document.querySelectorAll('.quick-add-hover-overlay:not(.hover-quick-add-initialized)').forEach(overlay => {
    overlay.classList.add('hover-quick-add-initialized');
    Object.setPrototypeOf(overlay, HoverQuickAdd.prototype);
    overlay.init();
  });
});
