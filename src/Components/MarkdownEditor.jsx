import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

const MarkdownEditor = forwardRef(({ 
    initialValue = "", 
    height = "600px", 
    previewStyle = "tab", 
    onChange = () => {} 
}, ref) => {
    const [value, setValue] = useState(initialValue);
    const isInitialized = useRef(false);

    // Expose methods that match Toast UI Editor API
    useImperativeHandle(ref, () => ({
        getInstance: () => ({
            getMarkdown: () => value,
            setMarkdown: (newValue) => {
                setValue(newValue || "");
            }
        })
    }));

    // Memoize the change handler to prevent cursor jumping
    const handleChange = useCallback((newValue) => {
        setValue(newValue || "");
        // Call onChange after state is updated - pass the new value
        onChange(newValue || "");
    }, [onChange]);

    // Only update on initial load or when explicitly loading existing content
    useEffect(() => {
        if (!isInitialized.current && initialValue && initialValue.trim() !== "") {
            setValue(initialValue);
            isInitialized.current = true;
        }
    }, [initialValue]);

    return (
        <div data-color-mode="light">
            <MDEditor
                value={value}
                onChange={handleChange}
                height={parseInt(height)}
                preview={previewStyle === "tab" ? "edit" : "live"}
                hideToolbar={false}
                data-color-mode="light"
            />
        </div>
    );
});

MarkdownEditor.displayName = 'MarkdownEditor';

// Memoize the component to prevent unnecessary re-renders
export default React.memo(MarkdownEditor);