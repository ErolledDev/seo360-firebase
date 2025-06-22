// Centralized API client with caching for redirects
interface RedirectData {
  title: string
  desc: string
  url: string
  image: string
  video?: string
  keywords: string
  site_name: string
  type: string
  created_at?: string
  updated_at?: string
}

interface RedirectsData {
  [slug: string]: RedirectData
}

class RedirectsApiClient {
  private static instance: RedirectsApiClient
  private cache: RedirectsData | null = null
  private cacheTimestamp: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly API_URL = 'https://seo-redirects.netlify.app/api/redirects.json'
  private fetchPromise: Promise<RedirectsData> | null = null

  private constructor() {}

  static getInstance(): RedirectsApiClient {
    if (!RedirectsApiClient.instance) {
      RedirectsApiClient.instance = new RedirectsApiClient()
    }
    return RedirectsApiClient.instance
  }

  private isCacheValid(): boolean {
    return this.cache !== null && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION
  }

  private async fetchFromApi(): Promise<RedirectsData> {
    try {
      const response = await fetch(this.API_URL, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Update cache
      this.cache = data
      this.cacheTimestamp = Date.now()
      this.fetchPromise = null

      return data
    } catch (error) {
      this.fetchPromise = null
      console.error('Error fetching redirects:', error)
      
      // Return cached data if available, even if expired
      if (this.cache) {
        console.warn('Using expired cache due to fetch error')
        return this.cache
      }
      
      throw error
    }
  }

  async getAllRedirects(): Promise<RedirectsData> {
    // Return cached data if valid
    if (this.isCacheValid()) {
      return this.cache!
    }

    // If already fetching, wait for that promise
    if (this.fetchPromise) {
      return this.fetchPromise
    }

    // Start new fetch
    this.fetchPromise = this.fetchFromApi()
    return this.fetchPromise
  }

  async getRedirect(slug: string): Promise<RedirectData | null> {
    const allRedirects = await this.getAllRedirects()
    return allRedirects[slug] || null
  }

  // Force refresh cache
  async refreshCache(): Promise<RedirectsData> {
    this.cache = null
    this.cacheTimestamp = 0
    return this.getAllRedirects()
  }

  // Get cache status for debugging
  getCacheStatus() {
    return {
      hasCachedData: this.cache !== null,
      cacheAge: this.cache ? Date.now() - this.cacheTimestamp : 0,
      isValid: this.isCacheValid()
    }
  }
}

// Export singleton instance
export const redirectsApi = RedirectsApiClient.getInstance()

// Export types
export type { RedirectData, RedirectsData }