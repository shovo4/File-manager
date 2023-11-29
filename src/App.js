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
    setClipboard({ path, itemName, content: { ...ref[itemName] }, action: 'copy' });
  };
  
  const cutItem = (path, itemName) => {
    const ref = getItemRef(path);
    setClipboard({ path, itemName, content: { ...ref[itemName] }, action: 'cut' });
  };
  

  const pasteItem = (targetPath) => {
    if (!clipboard) return;
    const { path: sourcePath, itemName, content, action } = clipboard;
    const targetRef = getItemRef(targetPath);
  
    // Check if pasting in the same location
    if (JSON.stringify(targetPath) === JSON.stringify(sourcePath) && action === 'copy') {
      alert('Item already exists in this folder.');
      return;
    }
  
    // Check if item with the same name exists in the target location
    if (targetRef[itemName]) {
      alert('An item with the same name already exists in the target folder.');
      return;
    }
  
    // Paste the item
    targetRef[itemName] = content;
  
    // If it's a cut operation, remove the item from the original location
    if (action === 'cut') {
      const sourceRef = getItemRef(sourcePath);
      delete sourceRef[itemName];
      setClipboard(null);
    }
  
    setFileSystem({ ...fileSystem });
  };
  

  const renderFileSystem = (fs, path = []) => {
    const filteredItems = Object.keys(fs).filter((key) => {
      return key.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filteredItems.map((key) => {
      const currentPath = [...path, key];
      if (fs[key].isFolder) {
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
          >
            {renderFileSystem(fs[key].children, currentPath)}
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
