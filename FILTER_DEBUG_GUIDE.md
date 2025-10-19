# Custom Tag Filter - Debugging Guide

## How to Debug

### 1. Open Browser Console

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari**: Enable Developer menu in Preferences, then press `Cmd+Option+C`

### 2. Look for CustomTagFilter Messages

When you load the collection page, you should see:

```
CustomTagFilter: Initializing...
CustomTagFilter: Loading collection "your-collection-name" metadata...
CustomTagFilter: Loaded X products
CustomTagFilter: Found X tags, X sizes
CustomTagFilter: Rendering X tags
```

### 3. When You Click a Filter Button

You should see detailed output:

```
=========================================
CustomTagFilter: TOGGLE FILTER
Type: tag
Value: poster
Current URL: ...
Param name: filter.v.tag
Current values: []
Value exists: false
Action: ADDING filter
New params: filter.v.tag=poster
Final params (after removing page): filter.v.tag=poster
=========================================
```

Then:

```
=========================================
CustomTagFilter: APPLYING FILTERS
Current URL: /collections/your-collection
New URL: /collections/your-collection?filter.v.tag=poster
...
CustomTagFilter: Products before: 36
CustomTagFilter: Products after: 5
CustomTagFilter: Filter applied successfully!
=========================================
```

## Common Issues & Solutions

### Issue 1: No console logs at all

**Problem**: JavaScript not loading
**Solution**:

- Check if `custom-tag-filter.js` is loaded in Network tab
- Check for JavaScript errors in Console (red text)
- Make sure the script is included in your template

### Issue 2: "Filter container not found"

**Problem**: HTML elements missing
**Solution**:

- Make sure `{% render 'custom-tag-filter' %}` is in your template
- Check if `customTagFilterTags` element exists in page source

### Issue 3: Tags list is empty

**Problem**: No tags found in products
**Solution**:

- Check console for "Found X tags" - should be > 0
- Make sure your products have tags in Shopify admin
- Check if API is returning tags: open `/collections/YOUR-COLLECTION/products.json?limit=250` in browser

### Issue 4: Filter button doesn't do anything

**Problem**: Click handler not working
**Solution**:

- Check console when clicking - should see "TOGGLE FILTER" logs
- Check if button has `data-filter-type` and `data-filter-value` attributes
- Try clicking slowly/precisely on the button text

### Issue 5: Products don't change after filtering

**Problem**: AJAX request failing or ProductGridContainer not found
**Solution**:

- Check console for "ProductGridContainer" found: should be `true`
- Check Network tab for failed requests (red)
- Look for "Products before" vs "Products after" - they should be different
- If "Falling back to page reload" appears, there's an error

### Issue 6: URL changes but products stay the same

**Problem**: Shopify not recognizing filter parameters
**Solution**:

- Check if URL has `filter.p.tag=poster` (correct) not `filter.v.tag=poster` (wrong)
- Try manually visiting: `/collections/YOUR-COLLECTION?filter.p.tag=poster`
- If manual URL doesn't filter, Shopify may not support tag filtering in your theme
- Note: `filter.p.tag` is for product tags, `filter.v.option` is for variant options

## Quick Test

1. Open Console (F12)
2. Type: `new CustomTagFilter()` and press Enter
3. Should see initialization logs
4. If no logs, there's a JavaScript error above

## Manual Filter Test

Try visiting these URLs directly:

- `/collections/YOUR-COLLECTION?filter.p.tag=poster`
- `/collections/YOUR-COLLECTION?filter.p.tag=sale`
- Alternative format: `/collections/YOUR-COLLECTION/poster`

If these URLs don't filter products, the issue is with Shopify's filtering system, not the JavaScript.

**Important**: The correct parameter is `filter.p.tag` (p = product) not `filter.v.tag` (v = variant)!

## What to Share for Help

If still not working, share:

1. Collection URL
2. Full console logs (screenshot)
3. Screenshot of tags rendered on page
4. One product that should match the filter (with its tags)
