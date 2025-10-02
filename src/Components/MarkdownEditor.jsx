import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import * as CMVim from '@replit/codemirror-vim';
import { EditorView } from '@codemirror/view';
import { useCallback } from 'react';

const MarkdownEditor = ({
  value = "",
  onChange = () => {},
  height = 600,
  onRevert,
  onSave,
  onQuit,
  ...props
}) => {
  const extensions = useMemo(() => [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.lineWrapping,
    CMVim.vim(),
  ], []);

  const cmHeight = typeof height === 'number' ? `${height}px` : height;

  // Ensure caret is visible within page viewport on big jumps (e.g., Vim 'G')
  const handleUpdate = useCallback((vu) => {
    if (!vu.selectionSet) return;
    const view = vu.view;
    const head = vu.state.selection.main.head;
    const rect = view.coordsAtPos(head);
    if (!rect) return;
    const margin = 100;
    if (rect.top < margin) {
      window.scrollBy({ top: rect.top - margin, behavior: 'auto' });
    } else if (rect.bottom > window.innerHeight - margin) {
      window.scrollBy({ top: rect.bottom - (window.innerHeight - margin), behavior: 'auto' });
    }
  }, []);

  // Define :cq ex command to trigger parent-provided revert behavior
  // Define once; the handler uses the latest onRevert via closure update below
  React.useEffect(() => {
    const Vim = CMVim && CMVim.Vim;
    if (!Vim || typeof Vim.defineEx !== 'function') return;
    // Define/overwrite so it always uses the latest onRevert from props
    Vim.defineEx('cq', 'cq', () => {
      try {
        if (typeof onRevert === 'function') onRevert({ preventDefault: () => {} });
      } catch {}
    });
  }, [onRevert]);

  // Define :w to trigger save/update
  React.useEffect(() => {
    const Vim = CMVim && CMVim.Vim;
    if (!Vim || typeof Vim.defineEx !== 'function') return;
    Vim.defineEx('w', 'w', () => {
      try {
        if (typeof onSave === 'function') onSave({ preventDefault: () => {} });
      } catch {}
    });
  }, [onSave]);

  // Define :wq to trigger save/update (no implicit navigation)
  React.useEffect(() => {
    const Vim = CMVim && CMVim.Vim;
    if (!Vim || typeof Vim.defineEx !== 'function') return;
    Vim.defineEx('wq', 'wq', () => {
      try {
        if (typeof onSave === 'function') onSave({ preventDefault: () => {} });
      } catch {}
    });
  }, [onSave]);

  // Define :q to quit (navigate home or perform parent-defined action)
  React.useEffect(() => {
    const Vim = CMVim && CMVim.Vim;
    if (!Vim || typeof Vim.defineEx !== 'function') return;
    Vim.defineEx('q', 'q', () => {
      try {
        if (typeof onQuit === 'function') onQuit();
      } catch {}
    });
  }, [onQuit]);

  return (
    <div data-color-mode="light">
      <CodeMirror
        value={value}
        height={cmHeight}
        extensions={extensions}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: true,
        }}
        onUpdate={handleUpdate}
        onChange={(val) => onChange(val)}
        {...props}
      />
    </div>
  );
};

export default MarkdownEditor;
