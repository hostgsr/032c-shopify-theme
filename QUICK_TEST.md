# Quick Filter Test

## Step 1: Open Browser Console

Press `F12` or `Cmd+Option+J` (Mac) / `Ctrl+Shift+J` (Windows)

## Step 2: Check Initialization

When you load `/collections/all`, you should see:

```
CustomTagFilter: Initializing...
CustomTagFilter: Filter tags element: [object HTMLDivElement]
CustomTagFilter: Current path: /collections/all
CustomTagFilter: Collection handle: all
CustomTagFilter: Loading collection "all" metadata...
CustomTagFilter: Loaded X products
CustomTagFilter: Found X tags, X sizes
CustomTagFilter: Rendering X tags
CustomTagFilter: Initialization complete!
```

## Step 3: Click a Tag Button

When you click on "poster", you should see:

```
=========================================
CustomTagFilter: BUTTON CLICKED
Button element: <button>...</button>
Filter type: tag
Filter value: poster
=========================================
CustomTagFilter: TOGGLE FILTER
Type: tag
Value: poster
Current URL: /collections/all
=========================================
CustomTagFilter: toggleTagFilter called
Tag to toggle: poster
Current pathname: /collections/all
Path parts: ["collections", "all"]
Collection index: 0
Collection handle: all
Current tags in path: []
Action: ADDING tag
New tags array: ["poster"]
New path: /collections/all/poster
Final new URL: /collections/all/poster
=========================================
CustomTagFilter: APPLYING FILTERS
Current URL: http://127.0.0.1:9292/collections/all
New URL: /collections/all/poster
...
CustomTagFilter: Products before: 36
CustomTagFilter: Products after: 5
CustomTagFilter: Filter applied successfully!
```

## What to Check

### ❌ If you see NO console logs:

- JavaScript file not loaded
- Check Network tab for `custom-tag-filter.js` (should be 200 OK)

### ❌ If you see "Filter container not found":

- The HTML element `<div id="customTagFilterTags">` is missing
- Check if `{% render 'custom-tag-filter' %}` is in your template

### ❌ If you see "BUTTON CLICKED" but nothing else:

- The button doesn't have `data-filter-type` or `data-filter-value` attributes
- Check the HTML of the button in Inspector

### ❌ If you see "toggleTagFilter called" but no product changes:

- Check the "Final new URL" - does it look correct?
- Try manually visiting that URL
- Check "Products before" vs "Products after" numbers

### ✅ If Everything Works:

You should see:

1. URL changes to `/collections/all/poster`
2. Only poster products are shown
3. The "poster" button gets `active` class (dotted underline)
4. Products count updates

## Manual Test

Type in browser address bar:
`http://127.0.0.1:9292/collections/all/poster`

If this works, the filter should work!
If this doesn't work, the issue is with Shopify/product tagging, not the filter code.
