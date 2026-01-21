export interface Subtitle {
  id: string;
  url: string;
  lang: string;
  label: string;
}

export async function searchSubtitles(query: string, lang: string = 'vie'): Promise<Subtitle[]> {
  try {
    // OpenSubtitles.com API requires API Key.
    // However, some public instances or proxies might exist.
    // For now, we will implement a search using a public rest API if available or fallback.
    // OpenSubtitles.org has a REST API but it's being deprecated.
    
    // As a fallback for "free/no key", we might need to use a proxy or a known public API.
    // For this implementation, I'll use a mockable structure that can be easily updated with a real endpoint.
    // Many movie sites use something like 'https://rest.opensubtitles.org/search/query-${query}/sublanguageid-${lang}'
    // but it requires a User-Agent.
    
    const response = await fetch(`https://rest.opensubtitles.org/search/query-${encodeURIComponent(query)}/sublanguageid-${lang}`, {
      headers: {
        'X-User-Agent': 'TemporaryUserAgent' // Typically requires a registered UA
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item: any) => ({
      id: item.IDSubtitleFile,
      url: item.SubDownloadLink.replace('.gz', '').replace('.srt', '.vtt'), // Try to get VTT or use a converter
      lang: item.SubLanguageID,
      label: `${item.LanguageName} (${item.SubFormat})`
    }));
  } catch (error) {
    console.error("Subtitle search failed:", error);
    return [];
  }
}
