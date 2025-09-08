import * as monaco from 'monaco-editor';

export function initEditor() {
    const container = document.getElementById('editor-view');
    if (!container) return;

    const editor = monaco.editor.create(container, {
        value: `function hello() {\n  console.log("Hello Monaco!");\n}`,
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: true
    });

    window.api?.onFileOpened((content: string) => {
        editor.setValue(content);
    });

    window.api?.onRequestSave(() => {
        const content = editor.getValue();
        window.api?.saveFile(content);
    });

}