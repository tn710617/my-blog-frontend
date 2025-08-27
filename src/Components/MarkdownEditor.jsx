import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import './MarkdownEditor.css';

const MarkdownEditor = ({ 
    value = "", 
    onChange = () => {}, 
    height = 600,
    ...props 
}) => {
    return (
        <div data-color-mode="light" className="markdown-editor-container">
            <MDEditor
                value={value}
                onChange={onChange}
                height={height}
                preview="edit"
                hideToolbar={false}
                data-color-mode="light"
                {...props}
            />
        </div>
    );
};

export default MarkdownEditor;