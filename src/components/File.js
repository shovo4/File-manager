import React, { useState} from 'react';
import './components.css';

const FileComponent = ({ name, content, onContentSave, onRename, onDelete, onCopy, onCut }) => {
  const [editContent, setEditContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleSave = () => {
    onContentSave(name, editContent);
    setIsEditing(false);
  };

  const handleRename = () => {
    onRename(name, newName);
    setIsRenaming(false);
  };

  return (
    <div className="file-component">
      <div className="name-and-icon">
        <span className="file-icon"></span>
        <h3>{name}</h3>
      </div>
      <div className="file-actions">
        {isRenaming ? (
          <>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button onClick={handleRename}>Rename</button>
            <button onClick={() => setIsRenaming(false)}>Cancel</button>
          </>
        ) : isEditing ? (
          <>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => setIsRenaming(true)}>Rename</button>
            <button onClick={() => onCopy(name)}>Copy</button>
            <button onClick={() => onCut(name)}>Cut</button>
            <button onClick={() => onDelete(name)}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
};
export default FileComponent;