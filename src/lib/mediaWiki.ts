/**
 * MediaWiki API client for fetching information from Wikipedia
 */

// Default Wikipedia endpoint (English)
const WIKIPEDIA_API_ENDPOINT = "https://en.wikipedia.org/w/api.php";

export interface WikipediaSearchResponse {
  title: string;
  summary: string;
  sections: Record<string, string>;
  suggestions?: string[];
  url?: string;
  imageUrl?: string;
}

/**
 * Search for information on Wikipedia
 */
export async function searchWikipedia(query: string, language = "en"): Promise<WikipediaSearchResponse> {
  // Only search Wikipedia if the query has more than 3 letters
  if (query.trim().length <= 3) {
    return {
      title: query,
      summary: `Query "${query}" is too short for Wikipedia search. Please use at least 4 characters.`,
      sections: {},
      suggestions: []
    };
  }
  
  const endpoint = `https://${language}.wikipedia.org/w/api.php`;
  
  // First search for the page
  const searchParams = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    format: "json",
    origin: "*", // Important for CORS
    srlimit: "1" // Just get the top result
  });
  
  try {
    const searchResponse = await fetch(`${endpoint}?${searchParams.toString()}`);
    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      return {
        title: query,
        summary: `No Wikipedia results found for "${query}"`,
        sections: {},
        suggestions: []
      };
    }
    
    const pageTitle = searchData.query.search[0].title;
    
    // Then get the content of that page
    const contentParams = new URLSearchParams({
      action: "query",
      prop: "extracts|pageimages",
      exintro: "1", // Just get the intro section
      explaintext: "1", // Get plain text
      titles: pageTitle,
      format: "json",
      origin: "*",
      pithumbsize: "300" // Get a thumbnail image if available
    });
    
    const contentResponse = await fetch(`${endpoint}?${contentParams.toString()}`);
    const contentData = await contentResponse.json();
    
    const pages = contentData.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    
    if (!pageId || pageId === "-1") {
      return {
        title: pageTitle,
        summary: `Failed to retrieve content for "${pageTitle}"`,
        sections: {},
        suggestions: []
      };
    }
    
    const page = pages[pageId];
    const extract = page.extract || "";
    
    // Now get sections of the page
    const sectionsParams = new URLSearchParams({
      action: "parse",
      page: pageTitle,
      prop: "sections",
      format: "json",
      origin: "*"
    });
    
    const sectionsResponse = await fetch(`${endpoint}?${sectionsParams.toString()}`);
    const sectionsData = await sectionsResponse.json();
    
    // Build a section-by-section object
    const sections: Record<string, string> = {};
    
    // If we have sections, get their content
    if (sectionsData.parse?.sections?.length) {
      // Just get the first few sections
      const topSections = sectionsData.parse.sections
        .slice(0, 3)
        .map((section: any) => section.line);
        
      // For each top section, get its content
      for (const sectionTitle of topSections) {
        const sectionParams = new URLSearchParams({
          action: "parse",
          page: pageTitle,
          section: topSections.indexOf(sectionTitle).toString(),
          prop: "text",
          format: "json",
          origin: "*"
        });
        
        try {
          const sectionResponse = await fetch(`${endpoint}?${sectionParams.toString()}`);
          const sectionData = await sectionResponse.json();
          
          // Extract text from HTML
          const sectionHtml = sectionData.parse?.text?.["*"] || "";
          const tempElement = document.createElement("div");
          tempElement.innerHTML = sectionHtml;
          
          // Simple extraction of text
          const sectionText = tempElement.textContent || "";
          
          // Clean up and store
          sections[sectionTitle] = sectionText.trim()
            .replace(/\n+/g, "\n")
            .replace(/\[\d+\]/g, ""); // Remove reference numbers [1], [2], etc.
            
        } catch (error) {
          console.error(`Error fetching section "${sectionTitle}":`, error);
        }
      }
    }
    
    // Get the page URL
    const pageUrl = `https://${language}.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;
    
    return {
      title: pageTitle,
      summary: extract,
      sections,
      url: pageUrl,
      imageUrl: page.thumbnail?.source,
      suggestions: [] // We can implement this later
    };
    
  } catch (error) {
    console.error("Wikipedia API error:", error);
    return {
      title: query,
      summary: `Error searching Wikipedia: ${error instanceof Error ? error.message : String(error)}`,
      sections: {},
      suggestions: []
    };
  }
}

/**
 * Format MediaWiki API response for the AI agent
 */
export function formatWikipediaResponseForAI(response: WikipediaSearchResponse): string {
  let formattedResponse = `*${response.title}*\n\n${response.summary}\n\n`;
  
  // Add sections
  Object.entries(response.sections).forEach(([title, content]) => {
    if (content && content.length > 0) {
      formattedResponse += `*${title}*\n${content.substring(0, 500)}...\n\n`;
    }
  });
  
  // Add link
  if (response.url) {
    formattedResponse += `\nRead more: ${response.url}\n`;
  }
  
  return formattedResponse;
}
