import { getProducts, getCategories, searchProducts, getProductsByCategory, getCategoryBySlug } from './api'

export const getProductsData = async () => {
  try {
    const products = await getProducts()
    console.log('✅ Fetched products from database:', products.length)
    return products
  } catch (error) {
    console.error('❌ Database error:', error)
    throw error
  }
}

export const getCategoriesData = async () => {
  try {
    const categories = await getCategories()
    console.log('✅ Fetched categories from database:', categories.length)
    return categories
  } catch (error) {
    console.error('❌ Database error:', error)
    throw error
  }
}

export const getCategoryBySlugData = async (slug: string) => {
  try {
    const category = await getCategoryBySlug(slug)
    console.log('✅ Fetched category from database:', category?.name)
    return category
  } catch (error) {
    console.error('❌ Database error:', error)
    throw error
  }
}

export const searchProductsData = async (query: string) => {
  try {
    const results = await searchProducts(query)
    console.log('✅ Search results from database:', results.length)
    return results
  } catch (error) {
    console.error('❌ Database error:', error)
    throw error
  }
}

export const getProductsByCategoryData = async (categorySlug: string) => {
  try {
    const products = await getProductsByCategory(categorySlug)
    console.log('✅ Fetched category products from database:', products.length)
    return products
  } catch (error) {
    console.error('❌ Database error:', error)
    throw error
  }
} 