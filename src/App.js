import React, { useState, useEffect } from 'react';

const FileComponent = ({ name, content, isFolder, onContentSave, onRename, onDelete, onCopy, onCut }) => {
  const [editContent, setEditContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleSave = () => {
    if (!isFolder) {
      onContentSave(name, editContent);
      setIsEditing(false);
    }
  };

  const handleRename = () => {
    onRename(name, newName);
    setIsRenaming(false);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {isRenaming ? (
        <>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={handleRename}>Rename</button>
          <button onClick={() => setIsRenaming(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h3>{name}</h3>
          {isEditing ? (
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
              <button onClick={() => onCut(name, name)}>Cut</button>
              <button onClick={() => onDelete(name)}>Delete</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

const FolderComponent = ({ name, children, onDelete, onRename, onPaste, onAddFile, onAddFolder, onCut }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleRename = () => {
    onRename(name, newName, true); // true indicates it's a folder
    setIsRenaming(false);
  };

  const handleAddFile = () => {
    if (newItemName) {
      onAddFile(name, newItemName);
      setNewItemName('');
      setIsAddingFile(false);
    }
  };

  const handleAddFolder = () => {
    if (newItemName) {
      onAddFolder(name, newItemName);
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
          <button onClick={() => onDelete(name, true)}>Delete Folder</button>
          <button onClick={() => onCut(name, name)}>Cut Folder</button> 
          <button onClick={() => onPaste(name)}>Paste Here</button>
          {children}
          {isAddingFile ? (
            <>
              <input
                type="text"
                value={newItemName}
                placeholder="New file name"
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <button onClick={handleAddFile}>Add File</button>
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
            </>
          ) : (
            <button onClick={() => setIsAddingFolder(true)}>Add Folder</button>
          )}
        </>
      )}
    </div>
  );
};
function App() {
  const [fileSystem, setFileSystem] = useState(
    JSON.parse(localStorage.getItem('fileSystem')) || { root: { isFolder: true, children: {} } }
  );

  const [newItemName, setNewItemName] = useState('');
  const [clipboard, setClipboard] = useState(
    JSON.parse(localStorage.getItem('clipboard')) || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
  }, [fileSystem]);

  useEffect(() => {
    localStorage.setItem('clipboard', JSON.stringify(clipboard));
  }, [clipboard]);

  const addNewItem = (isFolder) => {
    const newFileSystem = { ...fileSystem };
    if (newFileSystem[newItemName]) {
      alert('A file or folder with this name already exists.');
      return;
    }
    const content = isFolder ? {} : 'New content';
    newFileSystem[newItemName] = content;
    setFileSystem(newFileSystem);
    setNewItemName('');
  };

  const updateFileContent = (fileName, content) => {
    const newFileSystem = { ...fileSystem };
    newFileSystem[fileName] = content;
    setFileSystem(newFileSystem);
  };

  const renameItem = (oldName, newName) => {
    if (oldName !== newName) {
      const newFileSystem = { ...fileSystem };
      if (newFileSystem[newName]) {
        alert('A file or folder with the new name already exists.');
        return;
      }
      newFileSystem[newName] = newFileSystem[oldName];
      delete newFileSystem[oldName];
      setFileSystem(newFileSystem);
    }
  };

  const deleteItem = (itemName) => {
    const newFileSystem = { ...fileSystem };
    delete newFileSystem[itemName];
    setFileSystem(newFileSystem);
  };

  const copyItem = (itemName) => {
    const contentCopy = JSON.parse(JSON.stringify(fileSystem[itemName]));
    setClipboard({ itemName, content: contentCopy, action: 'copy' });
  };
  

  const cutItem = (itemName, itemPath) => {
    setClipboard({ itemName, itemPath, content: fileSystem[itemName], action: 'cut' });
  };

  const pasteItem = (targetFolderName) => {
    if (!clipboard) return;
  
    const { itemName, content, action } = clipboard;
    const newFileSystem = { ...fileSystem };
  
    if (targetFolderName === '') {
      // Paste into the root
      if (newFileSystem[itemName]) {
        alert('A file with the same name already exists in the root folder.');
      } else {
        newFileSystem[itemName] = content;
      }
    } else {
      // Paste into a specific folder
      if (newFileSystem[targetFolderName]) {
        if (newFileSystem[targetFolderName][itemName]) {
          alert('A file with the same name already exists in the target folder.');
        } else {
          newFileSystem[targetFolderName][itemName] = content;
        }
      } else {
        newFileSystem[targetFolderName] = { [itemName]: content };
      }
    }
  
    // Remove from clipboard if it was a cut operation
    if (action === 'cut') {
      setClipboard(null);
    }
  
    setFileSystem(newFileSystem);
  };

  const renderFileSystem = (fs) => {
    const filteredItems = Object.keys(fs).filter((key) => {
      return key.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filteredItems.map((key) => {
      if (typeof fs[key] === 'object' && fs[key] !== null && !(fs[key] instanceof Array)) {
        return (
          <FolderComponent
            key={key}
            name={key}
            onDelete={() => deleteItem(key)}
            onPaste={() => pasteItem(key)}
            onRename={(oldName, newName) => renameItem(oldName, newName)}
            onCut={cutItem}  // Passing onCut prop to FolderComponent
          >
            {renderFileSystem(fs[key])}
          </FolderComponent>
        );
      } else {
        return (
          <FileComponent
            key={key}
            name={key}
            content={fs[key]}
            onContentSave={(name, content) => updateFileContent(name, content)}
            onRename={(oldName, newName) => renameItem(oldName, newName)}
            onDelete={() => deleteItem(key)}
            onCopy={() => copyItem(key)}
            onCut={cutItem}  // Passing onCut prop to FileComponent
          />
        );
      }
    });
  };
  

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search files and folders"
      />
      <input
        type="text"
        value={newItemName}
        placeholder="New file or folder name"
        onChange={(e) => setNewItemName(e.target.value)}
      />
      <button onClick={() => addNewItem(true)}>Add Folder</button>
      <button onClick={() => addNewItem(false)}>Add File</button>
      {clipboard && (
        <button onClick={() => pasteItem('')}>Paste into root</button>
      )}
      <div style={{ marginTop: '20px' }}>
        {renderFileSystem(fileSystem)}
      </div>
    </div>
  );
}

export default App;
