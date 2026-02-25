import re

with open('components/pages/business/merchant-dashboard/modals/EditProductModal.tsx', 'r') as f:
    content = f.read()

# 1. Add import
if "import AddonsSection" not in content:
    search_import = "import FormFooter from './EditProduct/FormFooter';"
    replace_import = search_import + "\nimport AddonsSection from './EditProduct/AddonsSection';"
    content = content.replace(search_import, replace_import)

# 2. Update JSX to include AddonsSection
if "<AddonsSection" not in content:
    search_jsx = """          {!isRestaurant && (
            <>
              <AdditionalImagesSection"""

    replace_jsx = """          <AddonsSection
            addonItems={addonItems}
            setAddonItems={setAddonItems}
            addToast={addToast}
          />

          {!isRestaurant && (
            <>
              <AdditionalImagesSection"""

    content = content.replace(search_jsx, replace_jsx)

# 3. Update handleSubmit updatePayload
if "addons: addonItems.length > 0" not in content:
    search_payload = "trackStock: isRestaurant ? false : true,"
    addons_payload = """
        addons: addonItems.length > 0 ? [{
          id: 'product-addons',
          title: 'إضافات إضافية',
          options: addonItems.map(a => ({
            id: a.id || `${Date.now()}-${Math.random()}`,
            name: a.name,
            imageUrl: a.imageUrl,
            variants: [{ id: 'default', label: 'إضافة', price: parseNumberInput(a.priceSmall) || 0 }]
          }))
        }] : [],"""
    replace_payload = search_payload + addons_payload
    content = content.replace(search_payload, replace_payload)

with open('components/pages/business/merchant-dashboard/modals/EditProductModal.tsx', 'w') as f:
    f.write(content)
