import React from 'react';

const Folder = ({ name, children }) => {
  return (
    <div>
      <div>{name}</div>
      <div>{children}</div>
    </div>
  );
};

export default Folder;
