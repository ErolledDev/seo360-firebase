import { NextResponse } from 'next/server'
import { redirectsApi } from '../../lib/redirectsApi'

export async function GET() {
  try {
    // Force the correct base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo360.xyz'
    console.log('Sitemap generation - Base URL:', baseUrl)
    
    const currentDate = new Date().toISOString().split('T')[0]
    
    // Force refresh the cache to get latest data
    let redirects = {}
    try {
      console.log('Force refreshing redirects cache for sitemap...')
      redirects = await redirectsApi.refreshCache()
      console.log('Sitemap generation - Fresh redirects loaded:', Object.keys(redirects).length)
    } catch (error) {
      console.error('Error fetching redirects for sitemap:', error)
      // Continue with empty redirects if API fails
    }
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/disclaimer</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
    
    // Add each redirect slug
    Object.entries(redirects).forEach(([slug]) => {
      const escapedSlug = encodeURIComponent(slug)
      
      sitemap += `
  <url>
    <loc>${baseUrl}/${escapedSlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    })
    
    sitemap += `
</urlset>`
    
    console.log('Sitemap generated successfully with base URL:', baseUrl)
    console.log('Total URLs in sitemap:', Object.keys(redirects).length + 5) // +5 for static pages
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // Reduce cache time to see changes faster
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Add timestamp to help with debugging
        'X-Generated-At': new Date().toISOString(),
        'X-Redirect-Count': Object.keys(redirects).length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return a basic sitemap even if there's an error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo360.xyz'
    const currentDate = new Date().toISOString().split('T')[0]
    
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/disclaimer</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`
    
    return new NextResponse(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Generated-At': new Date().toISOString(),
        'X-Error': 'true',
      },
    })
  }
}