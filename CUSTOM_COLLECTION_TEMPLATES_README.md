# Custom Collection Templates

This theme includes custom collection templates that won't be overwritten during theme updates. These templates allow you to display different primary images based on the collection type.

## Files Created

### Templates

- `templates/collection.women.json` - Template for women's collections
- `templates/collection.men.json` - Template for men's collections

### Sections

- `sections/custom-collection-product-grid-women.liquid` - Women's collection grid section
- `sections/custom-collection-product-grid-men.liquid` - Men's collection grid section

### Snippets

- `snippets/card-product-women.liquid` - Product card for women's collections (shows 2nd image as primary)
- `snippets/card-product-men.liquid` - Product card for men's collections (shows 1st image as primary)

## How It Works

### Women's Collections

- **Primary Image**: Shows the second product image if available, falls back to first image
- **Hover Image**: Shows the first image or third image (if different from primary)
- Collections starting with "women" will use this template

### Men's Collections

- **Primary Image**: Shows the first product image (default behavior)
- **Hover Image**: Shows the second image (standard behavior)
- Collections starting with "men" will use this template

## How to Apply Templates

### Method 1: Shopify Admin (Recommended)

1. Go to Online Store > Themes > Customize
2. Navigate to the collection you want to customize
3. In the theme settings, change the template:
   - For women's collections: Select "women" template
   - For men's collections: Select "men" template

### Method 2: Collection Settings

1. Go to Products > Collections in your Shopify admin
2. Select the collection you want to customize
3. In the "Search engine listing preview" section, click "Edit website SEO"
4. Set the Template suffix:
   - For women's collections: `women`
   - For men's collections: `men`

## Examples

### Women's Collections

- Collection handle: `womens-coats-jackets`
- Template: `collection.women.json`
- Result: Second image shows as primary in product grid

### Men's Collections

- Collection handle: `mens-shirts`
- Template: `collection.men.json`
- Result: First image shows as primary in product grid (default behavior)

## Automatic Assignment (Future Enhancement)

To automatically assign templates based on collection handle, you could modify the theme's collection detection logic. Currently, manual assignment is required.

## Customization

All settings from the original collection template are preserved:

- Products per page
- Grid columns (desktop/mobile)
- Color schemes
- Image ratios and shapes
- Secondary image hover
- Vendor display
- Rating display
- Quick add functionality
- Filtering and sorting
- Section padding

## Theme Updates

These custom files will NOT be overwritten when you update your theme because they use different filenames than the default theme files. Your customizations will be preserved.

## Troubleshooting

1. **Template not applying**: Check that the collection has the correct template suffix set
2. **Images not showing correctly**: Ensure products have multiple images uploaded
3. **Styling issues**: Custom CSS may need to be added to match your theme's design

## Support

These custom templates maintain the same functionality as the original theme while adding the gender-specific image logic. All original theme features and settings are preserved.
