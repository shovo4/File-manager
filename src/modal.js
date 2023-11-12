import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, onAdd, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    onAdd(inputValue);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <input 
          type="text" 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)}
          placeholder={placeholder}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
};

export default Modal;
