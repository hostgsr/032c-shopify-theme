# Shopify Theme Development Workflow Guide

## 🚨 CRITICAL: Preserving Customizer Changes

**The settings_data.json file contains ALL your customizer changes. NEVER overwrite this file when pushing code changes.**

## Current Theme Structure Analysis

Your theme has several custom sections:

- `custom-content-dual.liquid` - Dual column content section
- `custom-content-hero.liquid` - Hero content section
- `custom-content-marquee.liquid` - Scrolling marquee section
- `custom-liquid.liquid` - Custom liquid code section

## Recommended Development Workflow

### 1. Initial Setup & Backup

```bash
# Always start by backing up your current live theme
# In Shopify Admin: Themes → Actions → Duplicate
```

### 2. Local Development Setup

```bash
# Install Shopify CLI if not already installed
npm install -g @shopify/cli @shopify/theme

# Login to Shopify
shopify auth login

# Pull current theme to local
shopify theme pull --store=032c-workshop
```

### 3. Development Process

#### A. Before Making Changes

```bash
# ALWAYS pull latest changes first to get current customizer settings
shopify theme pull --only=config/settings_data.json --store=032c-workshop
```

#### B. Developing Custom Sections

1. Create new section files in `/sections/` directory
2. Follow existing naming convention: `custom-[name].liquid`
3. Include proper JSON schema for customizer integration
4. Test locally using Shopify CLI development server

#### C. Header Modifications

**⚠️ IMPORTANT: Use the Theme Customizer for header changes, NOT code edits**

1. Go to: https://admin.shopify.com/store/032c-workshop/themes/183643472137/editor
2. Navigate to Header section
3. Make your changes in the customizer
4. Save changes
5. These changes are automatically saved to `config/settings_data.json`

### 4. Deployment Workflow

#### Step-by-Step Push Process:

1. **Pull Latest Settings Before Push**

   ```bash
   shopify theme pull --only=config/settings_data.json --store=032c-workshop
   ```

2. **Push Code Changes (Exclude Settings)**

   ```bash
   # Push everything EXCEPT settings_data.json
   shopify theme push --ignore=config/settings_data.json --store=032c-workshop
   ```

3. **Verify Changes**
   - Check your live site
   - Verify custom sections appear correctly
   - Confirm header customizations are preserved

#### Alternative: Safe Push Method

```bash
# Push to a development theme first
shopify theme push --theme-id=YOUR_DEV_THEME_ID --store=032c-workshop

# Test thoroughly, then publish when ready
```

### 5. File Management Rules

#### ✅ SAFE TO PUSH:

- `/sections/*.liquid` (your custom sections)
- `/snippets/*.liquid`
- `/templates/*.json` and `*.liquid`
- `/assets/*.css`, `*.js`, `*.svg`, etc.
- `/layout/*.liquid`
- `/locales/*.json`
- `/config/settings_schema.json`

#### 🚨 NEVER OVERWRITE:

- `/config/settings_data.json` (contains all customizer changes)

#### 📝 HANDLE WITH CARE:

- Template JSON files that reference sections used in customizer
- Any files that contain dynamic content set via customizer

### 6. Custom Section Development Best Practices

#### Section Structure Example:

```liquid
{%- style -%}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
{%- endstyle -%}

<div class="color-{{ section.settings.color_scheme }} gradient">
  <div class="section-{{ section.id }}-padding">
    <!-- Your section content -->
  </div>
</div>

{% schema %}
{
  "name": "Your Custom Section",
  "tag": "section",
  "class": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Default heading"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    }
  ],
  "presets": [
    {
      "name": "Your Custom Section"
    }
  ]
}
{% endschema %}
```

### 7. Testing Checklist

Before pushing any changes:

- [ ] Test section functionality locally
- [ ] Verify responsive design (mobile/desktop)
- [ ] Check customizer integration works
- [ ] Confirm no JavaScript errors
- [ ] Test with different color schemes
- [ ] Validate Liquid syntax

### 8. Emergency Recovery

If you accidentally overwrite customizer settings:

1. **Revert from Shopify Admin:**

   - Go to Themes → Actions → View history
   - Restore previous version

2. **Or restore from backup theme:**
   - Copy `settings_data.json` from backup theme
   - Push only that file

### 9. Collaboration Workflow

When working with team members:

1. **Always communicate customizer changes**
2. **Use version control for code files only**
3. **Document any theme-level settings changes**
4. **Create staging themes for testing**

## Quick Reference Commands

```bash
# Pull only settings (before making changes)
shopify theme pull --only=config/settings_data.json

# Push code only (preserve customizer settings)
shopify theme push --ignore=config/settings_data.json

# Pull everything (initial setup)
shopify theme pull

# Push to development theme
shopify theme push --theme-id=DEV_THEME_ID

# Start local development server
shopify theme dev
```

## Key URLs for Your Store

- **Theme Editor:** https://admin.shopify.com/store/032c-workshop/themes/183643472137/editor
- **Theme Library:** https://admin.shopify.com/store/032c-workshop/themes
- **Store Admin:** https://admin.shopify.com/store/032c-workshop

---

**Remember: Code changes go through version control, customizer changes stay in Shopify. Keep them separate!**
