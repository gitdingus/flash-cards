'use client';
import { useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Image from 'next/image';
import editSvg from '@/app/images/text-box-edit-outline.svg';
import deleteSvg from '@/app/images/trash-can-outline.svg';
import '@/app/styles/set-tools/line-input.css';

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
        <div className="form-input">
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
        <div className="form-input">
          <label htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            value={ content }
            onChange={ (e) => setContent(e.target.value) }
          ></textarea>
        </div>
        <div className='buttons'>
          <button type="button" onClick={toggleEditMode}>Add to card</button>
        </div>
      </div>  
    )
  } else {
    return (
      <div className="line">
        <div className="line-heading">
          <h3>{heading}</h3>
          <button type="button" onClick={toggleEditMode}><Image src={editSvg} alt={`edit line ${heading}`} width={25} height={25} /></button>
          <button type="button" onClick={() => { if (removeLine) removeLine({id, heading, content}); }}><Image src={deleteSvg} alt={`remove line ${heading}`} width={25} height={25} /></button>
        </div>
        <div className="line-content">
          <p>{content}</p>
        </div>
      </div>
    )
  }


}