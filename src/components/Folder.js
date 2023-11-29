import React, { useState} from 'react';
const FolderComponent = ({ name, children, onDelete, onRename, onPaste, onAddFile, onAddFolder, onCut }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleRename = () => {
    onRename(name, newName);
    setIsRenaming(false);
  };

  const handleAddFile = () => {
    if (newItemName) {
      onAddFile(newItemName);
      setNewItemName('');
      setIsAddingFile(false);
    }
  };

  const handleAddFolder = () => {
    if (newItemName) {
      onAddFolder(newItemName);
      setNewItemName('');
      setIsAddingFolder(false);
    }
  };

  return (
    <div style={{ marginLeft: '20px' }}>
      {isRenaming ? (
        <>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={handleRename}>Rename</button>
          <button onClick={() => setIsRenaming(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h2>{name}</h2>
          <button onClick={() => setIsRenaming(true)}>Rename Folder</button>
          <button onClick={() => onDelete()}>Delete Folder</button>
          <button onClick={() => onCut()}>Cut Folder</button>
          <button onClick={() => onPaste()}>Paste Here</button>
          {isAddingFile ? (
            <>
              <input
                type="text"
                value={newItemName}
                placeholder="New file name"
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <button onClick={handleAddFile}>Add File</button>
              <button onClick={() => setIsAddingFile(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setIsAddingFile(true)}>Add File</button>
          )}
          {isAddingFolder ? (
            <>
              <input
                type="text"
                value={newItemName}
                placeholder="New folder name"
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <button onClick={handleAddFolder}>Add Folder</button>
              <button onClick={() => setIsAddingFolder(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setIsAddingFolder(true)}>Add Folder</button>
          )}
          <div>{children}</div>
        </>
      )}
    </div>
  );
};
export default FolderComponent;