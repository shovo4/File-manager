import React, { useState, useEffect } from 'react';
import './App.css';
import Modal from './modal.js';
import FileComponent from './components/File'; // Assuming FileComponent is in FileComponent.js
import FolderComponent from './components/Folder'; // Assuming FolderComponent is in FolderComponent.js

function App() {
  const [fileSystem, setFileSystem] = useState(
    JSON.parse(localStorage.getItem('fileSystem')) || { root: { isFolder: true, children: {} } }
  );
  const [clipboard, setClipboard] = useState(
    JSON.parse(localStorage.getItem('clipboard')) || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
  }, [fileSystem]);

  useEffect(() => {
    localStorage.setItem('clipboard', JSON.stringify(clipboard));
  }, [clipboard]);

  // Helper function to search within the file system recursively
  const searchFileSystem = (fs, query) => {
    return Object.keys(fs).reduce((acc, key) => {
      const item = fs[key];
      const lowerCaseQuery = query.toLowerCase();

      // If it's a folder, recursively search its children
      if (item.isFolder) {
        const filteredChildren = searchFileSystem(item.children, query);
        if (Object.keys(filteredChildren).length > 0 || key.toLowerCase().includes(lowerCaseQuery)) {
          // If any children match, or the folder name matches, include the folder
          acc[key] = { ...item, children: filteredChildren };
        }
      } else if (key.toLowerCase().includes(lowerCaseQuery)) {
        // If it's a file and it matches the query, include the file
        acc[key] = item;
      }
      return acc;
    }, {});
  };

  const getItemRef = (path) => {
    let ref = fileSystem.root.children;
    path.forEach((p, index) => {
      if (index < path.length - 1) {
        ref = ref[p].children;
      }
    });
    return ref;
  };

  const addNewItem = (path, isFolder, itemName) => {
    const newFileSystem = { ...fileSystem }; // Create a copy of the current state
    let ref = newFileSystem.root.children;    // Start from the root

    // Navigate to the correct folder
    for (const p of path) {
        if (!ref[p]) {
            alert('Path not found');
            return;
        }
        ref = ref[p].children;
    }

    // Check if item already exists
    if (ref[itemName]) {
        alert('An item with this name already exists.');
        return;
    }

    // Add new folder or file
    ref[itemName] = isFolder ? { isFolder: true, children: {} } : 'New content';

    // Update the state
    setFileSystem(newFileSystem);
};


  const updateFileContent = (path, fileName, content) => {
    const ref = getItemRef(path);
    ref[fileName] = content;
    setFileSystem({ ...fileSystem });
  };

  const renameItem = (path, oldName, newName) => {
    if (oldName !== newName) {
      const ref = getItemRef(path);
      if (ref[newName]) {
        alert('A file or folder with the new name already exists.');
        return;
      }
      ref[newName] = ref[oldName];
      delete ref[oldName];
      setFileSystem({ ...fileSystem });
    }
  };

  const deleteItem = (path, itemName) => {
    const ref = getItemRef(path);
    delete ref[itemName];
    setFileSystem({ ...fileSystem });
  };

  const copyItem = (path, itemName) => {
    const ref = getItemRef(path);
    // Deep copy the item to preserve its structure and content
    const itemCopy = JSON.parse(JSON.stringify(ref[itemName]));
    setClipboard({ path, itemName, content: itemCopy, action: 'copy' });
  };
  
  const cutItem = (path, itemName) => {
    const ref = getItemRef(path);
    // Copy the reference of the item for a cut operation
    const itemCut = ref[itemName];
    setClipboard({ path, itemName, content: itemCut, action: 'cut' });
  };
  
  const pasteItem = (targetPath) => {
    if (!clipboard) return;
    const { path: sourcePath, itemName, content, action } = clipboard;
    
    const targetRef = getItemRef(targetPath);
    
    if (targetRef[itemName]) {
      alert('An item with the same name already exists in the target folder.');
      return;
    }
  
    // Paste the item
    if (targetRef) {
      if (action === 'cut') {
        // For a cut operation, move the item
        targetRef[itemName] = content;
        // Remove the item from the original location
        const sourceRef = getItemRef(sourcePath);
        delete sourceRef[itemName];
        setClipboard(null);
      } else {
        // For a copy operation, create a deep copy of the item
        targetRef[itemName] = JSON.parse(JSON.stringify(content));
      }
      setFileSystem({ ...fileSystem });
    } else {
      alert('Invalid target path for pasting.');
    }
  };
  
  
  const renderFileSystem = (fs, path = []) => {
    const filteredFs = searchQuery ? searchFileSystem(fs, searchQuery) : fs;

    return Object.keys(filteredFs).map((key) => {
      const currentPath = [...path, key];
      const item = filteredFs[key];

      if (item.isFolder) {
        return (
          <FolderComponent
            key={key}
            name={key}
            onDelete={() => deleteItem(currentPath, key)}
            onPaste={() => pasteItem(currentPath)}
            onAddFile={(fileName) => addNewItem(currentPath, false, fileName)}
            onAddFolder={(folderName) => addNewItem(currentPath, true, folderName)}
            onRename={(oldName, newName) => renameItem(currentPath, oldName, newName)}
            onCut={() => cutItem(currentPath, key)}
            onCopy={() => copyItem(currentPath, key)}
          >
            {renderFileSystem(item.children, currentPath)}
          </FolderComponent>
        );
      } else {
        return (
          <FileComponent
            key={key}
            name={key}
            content={fs[key]}
            onContentSave={(name, content) => updateFileContent(currentPath, name, content)}
            onRename={(oldName, newName) => renameItem(currentPath, oldName, newName)}
            onDelete={() => deleteItem(currentPath, key)}
            onCopy={() => copyItem(currentPath, key)}
            onCut={() => cutItem(currentPath, key)}
          />
        );
      }
    });
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddItem = (itemName) => {
    addNewItem([], modalType === 'folder', itemName);
    handleModalClose();
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search files and folders"
      />
      <button onClick={() => openModal('folder')}>Add Folder</button>
      <button onClick={() => openModal('file')}>Add File</button>
      {clipboard && (
        <button onClick={() => pasteItem([])}>Paste into root</button>
      )}
      <div style={{ marginTop: '20px' }}>
        {renderFileSystem(fileSystem.root.children)}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAdd={handleAddItem}
        placeholder={modalType === 'folder' ? 'Folder name' : 'File name'}
      />
    </div>
  );
}

export default App;
