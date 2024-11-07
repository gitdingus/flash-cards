'use client';
import { useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

interface LineInputProps {
  saveLine: (line: Line) => void,
  editLine?: (line: Line) => void,
  removeLine?: (line: Line) => void,
  line?: Line,
  editMode?: boolean,
  focusOnSave?: boolean,
}

export default function LineInput({ saveLine, editLine, removeLine, line, editMode = true, focusOnSave = false }: LineInputProps) {
  const [heading, setHeading] = useState(line?.heading || '');
  const [content, setContent] = useState(line?.content || '');
  const [id, setId] = useState(line?.id || uuid());
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
        setId(uuid());
        setHeading('');
        setContent('');

        if (focusOnSave && headingInput.current) {
          headingInput.current.focus();
        }
      }
    }
  }

  const save = () => {
    const line: Line = { id, heading, content };
    if (line && editLine) {
      editLine(line);
    } else {
      saveLine(line);
    }
  }
  
  if (editing) {
    return (
      <div>
        <div>
          <label htmlFor="heading">
            Heading
          </label>
          <input
            id="heading"
            value={ heading }
            onChange={ (e) => setHeading(e.target.value) }
            ref={headingInput}
          />
        </div>
        <div>
          <label htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            value={ content }
            onChange={ (e) => setContent(e.target.value) }
          ></textarea>
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
        <button type="button" onClick={() => { if (removeLine) removeLine({id, heading, content}); }}>Delete</button>
      </div>
    )
  }


}