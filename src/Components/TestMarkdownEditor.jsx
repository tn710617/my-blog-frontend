import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

export default function TestMarkdownEditor() {
    const [value, setValue] = useState("**Hello world!!!**");

    return (
        <div style={{ padding: '20px' }}>
            <h2>Testing @uiw/react-md-editor with React 19</h2>
            <MDEditor
                value={value}
                onChange={setValue}
                height={400}
                preview="edit"
            />
            <div style={{ marginTop: '20px' }}>
                <h3>Current Value:</h3>
                <pre>{value}</pre>
            </div>
        </div>
    );
}