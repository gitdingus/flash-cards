'use client';
import { useRef, useState } from 'react';

interface LineInputProps {
  saveLine: (line: Line) => void,
  removeLine?: (line: Line) => void,
  line?: Line,
  editMode?: boolean,
  focusOnSave?: boolean,
}

export default function LineInput({ saveLine, removeLine, line, editMode = true, focusOnSave = false }: LineInputProps) {
  const [heading, setHeading] = useState(line?.heading || '');
  const [content, setContent] = useState(line?.content || '');
  const [editing, setEditing] = useState<boolean>(editMode);
  const headingInput = useRef<HTMLInputElement>(null);

  const toggleEditMode = () => {
    if (heading && content) {
      if (editing) {
        save();
      }

      if (line) {
        setEditing(!editing);
      } else {
        setHeading('');
        setContent('');

        if (focusOnSave && headingInput.current) {
          headingInput.current.focus();
        }
      }
    }
  }

  const save = () => {
    const line: Line = { heading, content };
    saveLine(line);
  }
  
  if (editing) {
    return (
      <div>
        <div>
          <label>
            Heading
            <input
              value={ heading }
              onChange={ (e) => setHeading(e.target.value) }
              ref={headingInput}
            />
          </label>
        </div>
        <div>
          <label>
            Content
            <textarea
              value={ content }
              onChange={ (e) => setContent(e.target.value) }
            ></textarea>
          </label>
        </div>
        <div>
          <button type="button" onClick={toggleEditMode}>Check</button>
        </div>
      </div>  
    )
  } else {
    return (
      <div>
        <p><span>{heading}</span>: <span>{content}</span></p>
        <button type="button" onClick={toggleEditMode}>Edit</button>
        <button type="button" onClick={() => { if (removeLine) removeLine({heading, content}); }}>Delete</button>
      </div>
    )
  }


}