class Sidebar {
    constructor() {
        this.setupBlockHandlers();
    }

    setupBlockHandlers() {
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const blockType = e.currentTarget.dataset.block;
                this.insertBlock(blockType);
            });
        });
    }

    insertBlock(blockType) {
        const quill = window.editor.quill;
        if (!quill) return;

        const range = quill.getSelection(true);
        let index = range ? range.index : 0;

        // Insert a newline if we're not at the start of a line
        if (index > 0 && quill.getText(index - 1, 1) !== '\n') {
            quill.insertText(index, '\n');
            index += 1;
        }

        switch (blockType) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
                const level = parseInt(blockType.charAt(1));
                quill.formatLine(index, 1, 'header', level);
                break;

            case 'p':
                quill.formatLine(index, 1, 'header', false);
                quill.formatLine(index, 1, 'list', false);
                quill.formatLine(index, 1, 'blockquote', false);
                quill.formatLine(index, 1, 'code-block', false);
                break;

            case 'blockquote':
                quill.formatLine(index, 1, 'blockquote', true);
                break;

            case 'code':
                quill.formatLine(index, 1, 'code-block', true);
                break;

            case 'ul':
                quill.formatLine(index, 1, 'list', 'bullet');
                break;

            case 'ol':
                quill.formatLine(index, 1, 'list', 'ordered');
                break;

            case 'hr':
                quill.insertEmbed(index, 'divider', true);
                quill.insertText(index + 1, '\n');
                break;

            // Handle media blocks
            case 'img':
                this.handleImageInsertion(index);
                break;

            case 'vid':
                this.handleVideoInsertion(index);
                break;

            case 'aud':
                this.handleAudioInsertion(index);
                break;
        }

        // Focus the editor
        quill.focus();
    }

    handleImageInsertion(index) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    window.editor.quill.insertEmbed(index, 'image', e.target.result);
                    window.editor.quill.insertText(index + 1, '\n');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    handleVideoInsertion(index) {
        const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
        if (url) {
            window.editor.quill.insertEmbed(index, 'video', url);
            window.editor.quill.insertText(index + 1, '\n');
        }
    }

    handleAudioInsertion(index) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    window.editor.quill.insertEmbed(index, 'audio', e.target.result);
                    window.editor.quill.insertText(index + 1, '\n');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
}

// Initialize the sidebar
document.addEventListener('DOMContentLoaded', () => {
    window.sidebar = new Sidebar();
}); 