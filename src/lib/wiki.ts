
import { decode } from 'html-entities';

export async function searchWikipedia(query: string) {
  const response = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch from Wikipedia');
  }
  return response.json();
}

function formatWikiContent(htmlContent: string): string {
  // Remove HTML tags while preserving important formatting
  let content = htmlContent
    .replace(/<p class="mw-empty-elt">.*?<\/p>/g, '') // Remove empty paragraphs
    .replace(/<p>/g, '\n') // Convert paragraph starts to newlines
    .replace(/<\/p>/g, '') // Remove paragraph ends
    .replace(/<b>(.*?)<\/b>/g, '*$1*') // Convert bold to asterisks
    .replace(/<i>(.*?)<\/i>/g, '_$1_') // Convert italic to underscores
    .replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags

  // Decode HTML entities
  content = decode(content)
    .replace(/\n+/g, '\n') // Normalize line breaks
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  return content;
}

export function extractWikiContent(apiResponse: any): {
  summary: string;
  fullContent: string;
  sections: { [key: string]: string };
} {
  const main = apiResponse.main?.query?.pages;
  const full = apiResponse.full?.query?.pages;
  if (!main || !full) return { summary: '', fullContent: '', sections: {} };

  const mainPageId = Object.keys(main)[0];
  const fullPageId = Object.keys(full)[0];

  const mainContent = main[mainPageId]?.extract || '';
  const fullContent = full[fullPageId]?.extract || '';

  // Split full content into sections
  const sections = {
    'Overview': formatWikiContent(mainContent),
    'History': extractSection(fullContent, 'History', 'Career'),
    'Notable Achievements': extractSection(fullContent, 'Career', 'Personal life'),
    'Playing Style': extractSection(fullContent, 'Style of play', 'Honours'),
    'Personal Life': extractSection(fullContent, 'Personal life', 'References')
  };

  return {
    summary: sections['Overview'].split('\n')[0], // First paragraph as summary
    fullContent: sections['Overview'],
    sections
  };
}

function extractSection(content: string, startSection: string, endSection: string): string {
  const startIdx = content.indexOf(startSection);
  const endIdx = content.indexOf(endSection);

  if (startIdx === -1) return '';

  const sectionContent = content.slice(
    startIdx + startSection.length,
    endIdx > startIdx ? endIdx : undefined
  );

  return sectionContent.trim();
}

export async function getDetailedInfo(query: string): Promise<{
  title: string;
  summary: string;
  sections: { [key: string]: string };
  suggestions?: string[];
}> {
  try {
    const apiResponse = await searchWikipedia(query);
    const { summary, sections } = extractWikiContent(apiResponse);

    // Get related pages for suggestions
    const mainData = apiResponse.main;
    const pages = mainData?.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    const links = pages[pageId]?.links || [];

    const suggestions = links
      .map((link: any) => link.title)
      .filter((title: string) => 
        title.toLowerCase().includes(query.toLowerCase()) ||
        title.toLowerCase().includes('career') ||
        title.toLowerCase().includes('biography')
      )
      .slice(0, 5);

    return {
      title: query,
      summary,
      sections,
      suggestions
    };
  } catch (error) {
    console.error('Error fetching detailed info:', error);
    return { title: query, summary: '', sections: {} };
  }
}
