export function getLinksFromMarkdown(baseUrl: string, text: string) {
  // strip trailing / to work with regex
  baseUrl = baseUrl.charAt(baseUrl.length - 1) === '/' ? baseUrl.slice(0, -1) : baseUrl;
  const linkRegExp = new RegExp(`\\[([^\\]]+)\\]\\((${baseUrl}(?:\\/[^)]*)*)\\)`, 'g');
  const matches = text.matchAll(linkRegExp);

  return matches;
}