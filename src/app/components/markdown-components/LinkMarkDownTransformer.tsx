import { getLinksFromMarkdown } from "@/utils/markdown";
import { v4 as uuid } from 'uuid';
import { headers } from 'next/headers';

interface LinkMarkDownTransformerConfig {
  text: string,
  baseUrl: string | null, 
}

export default function LinkMarkDownTransformer({ text, baseUrl }: LinkMarkDownTransformerConfig){
  if (baseUrl === null) {
    return <p>{text}</p>
  }
  const elements = [];

  const links = getLinksFromMarkdown(baseUrl, text);
  let link = links.next();
  let currIndex = 0;

  if (link.value === undefined) {
    return <p>{text}</p>
  }
  while (link.done !== true || currIndex < text.length) {
    if (link.value === undefined) {
      elements.push(<span key={uuid()}>{text.slice(currIndex)}</span>);
      break;
    }

    let url = link.value[2].startsWith('http://') ? link.value[2] : 'http://' + link.value[2];
    let urlText = link.value[1];
    let markdown = link.value[0];
    elements.push(<span key={uuid()}>{text.slice(currIndex, link.value.index)}</span>);
    elements.push(<span key={uuid()}><a href={url}>{urlText}</a></span>);
    currIndex = link.value.index + markdown.length;

    link = links.next();
  } 

  return (
    <p>
      {
        elements.map((elem) => elem)
      }
    </p>
  )
}