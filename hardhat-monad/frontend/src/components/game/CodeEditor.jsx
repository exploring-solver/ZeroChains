// src/components/game/CodeEditor.jsx
import React from 'react';
import { Box } from '@mui/material';
import Editor from '@monaco-editor/react';

const CodeEditor = ({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false
}) => {
  const handleEditorChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
      <Editor
        height={height}
        language={language}
        value={value}
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true
        }}
      />
    </Box>
  );
};

export default CodeEditor;