class Editor {
    constructor() {
        this.defaultTheme = {
            textColor: '#000000',
            backgroundColor: '#ffffff',
            linkColor: '#2196f3',
            fontSize: '18px',         // Base text size
            lineHeight: '1.8',
            h1: {
                fontSize: '36px',     // Primary heading
                marginBottom: '1.5rem'
            },
            h2: {
                fontSize: '30px',     // 36px * 0.833
                marginBottom: '1.25rem'
            },
            h3: {
                fontSize: '24px',     // 30px * 0.833
                marginBottom: '1rem'
            },
            h4: {
                fontSize: '20px',     // 24px * 0.833
                marginBottom: '0.875rem'
            },
            paragraph: {
                marginBottom: '1rem'
            }
        };

        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing editor...');
        try {
            // Check if Quill is loaded
            if (typeof Quill === 'undefined') {
                throw new Error('Quill is not loaded. Please check the CDN URL.');
            }

            // Create Quill container if it doesn't exist
            const editorContent = document.querySelector('.article-content');
            if (!editorContent) {
                throw new Error('Editor content container not found');
            }

            // Create editor container
            const editorContainer = document.createElement('div');
            editorContainer.id = 'quill-editor';
            editorContent.appendChild(editorContainer);
            console.log('Quill container created');

            // Add a small delay to ensure Quill is fully loaded
            setTimeout(() => {
                try {
                    // Initialize Quill with bubble theme and formatting options
                    this.quill = new Quill('#quill-editor', {
                        theme: 'bubble',
                        placeholder: 'Start writing your blog post...',
                        modules: {
                            toolbar: [
                                ['bold', 'italic', 'underline', 'strike'],
                                ['blockquote', 'code-block'],
                                [{ 'header': [1, 2, 3, 4, false] }],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                [{ 'script': 'sub' }, { 'script': 'super' }],
                                ['image'],
                                ['clean']
                            ]
                        }
                    });

                    // Add image handler
                    this.quill.getModule('toolbar').addHandler('image', () => {
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');
                        input.click();

                        input.onchange = () => {
                            const file = input.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const range = this.quill.getSelection(true);
                                    this.quill.insertEmbed(range.index, 'image', e.target.result);
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                    });

                    // Set initial content
                    this.quill.setContents([
                        { insert: 'Getting Started with Blog Builder\n', attributes: { header: 1 } },
                        { insert: 'Welcome to your new article!\n', attributes: { header: 2 } },
                        { insert: 'Start writing your content here...\n' }
                    ]);

                    // Initialize theme listeners
                    this.initThemeListeners();

                    console.log('Quill initialized successfully');
                } catch (error) {
                    console.error('Error during Quill initialization:', error);
                }
            }, 100);

        } catch (error) {
            console.error('Error initializing Quill:', error);
        }
    }

    initThemeListeners() {
        // Listen for theme control changes
        document.querySelectorAll('.theme-control input, .theme-control select').forEach(control => {
            control.addEventListener('input', (e) => this.handleThemeChange(e));

            // Add editable value display for range inputs
            if (control.type === 'range') {
                const valueDisplay = control.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('value')) {
                    valueDisplay.contentEditable = true;

                    // Handle focus
                    valueDisplay.addEventListener('focus', () => {
                        valueDisplay.textContent = valueDisplay.textContent.replace(/[^\d.-]/g, '');
                    });

                    // Handle input validation and update
                    valueDisplay.addEventListener('blur', () => {
                        let value = parseFloat(valueDisplay.textContent);
                        const min = parseFloat(control.min);
                        const max = parseFloat(control.max);

                        // Validate and constrain the value
                        if (isNaN(value)) value = parseFloat(control.value);
                        value = Math.min(Math.max(value, min), max);

                        // Update the display and control
                        control.value = value;
                        valueDisplay.textContent = value + (control.dataset.unit || 'px');

                        // Trigger the input event to apply changes
                        control.dispatchEvent(new Event('input'));
                    });

                    // Handle enter key
                    valueDisplay.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            valueDisplay.blur();
                        }
                    });
                }
            }
        });

        // Listen for font changes
        const fontSelect = document.querySelector('.font-select');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => this.handleFontChange(e));
        }

        // Add reset button listener
        const resetButton = document.getElementById('reset-theme');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetTheme());
        }
    }

    handleThemeChange(e) {
        const control = e.target;
        const style = control.dataset.style;
        const selector = control.dataset.selector;
        const unit = control.dataset.unit || '';
        let value = control.value + unit;

        console.log('Theme Change:', { style, selector, value }); // Debug log

        // Update the value display if it exists
        const valueDisplay = control.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('value')) {
            valueDisplay.textContent = value;
        }

        // Apply styles to Quill editor
        const editorElement = this.quill.root;

        switch (style) {
            case 'fontSize':
                if (selector.includes('.ql-editor')) {
                    this.updateBaseFontSize(value);
                } else if (selector.includes('h1')) {
                    this.updateHeadingStyle('h1', 'fontSize', value);
                } else if (selector.includes('h2')) {
                    this.updateHeadingStyle('h2', 'fontSize', value);
                } else if (selector.includes('h3')) {
                    this.updateHeadingStyle('h3', 'fontSize', value);
                } else if (selector.includes('h4')) {
                    this.updateHeadingStyle('h4', 'fontSize', value);
                }
                break;

            case 'lineHeight':
                if (selector.includes('.ql-editor')) {
                    this.updateBaseLineHeight(value);
                } else {
                    this.updateHeadingStyle(selector.split(' ').pop(), 'lineHeight', value);
                }
                break;

            case 'marginBottom':
                if (selector.includes('p')) {
                    this.updateElementSpacing('p', value);
                } else if (selector.includes('h1')) {
                    this.updateElementSpacing('h1', value);
                } else if (selector.includes('h2')) {
                    this.updateElementSpacing('h2', value);
                } else if (selector.includes('h3')) {
                    this.updateElementSpacing('h3', value);
                } else if (selector.includes('h4')) {
                    this.updateElementSpacing('h4', value);
                }
                break;

            case 'color':
                if (selector.includes('> *')) {
                    editorElement.style.color = value;
                } else if (selector.includes('a')) {
                    this.updateLinkStyle('color', value);
                }
                break;

            case 'backgroundColor':
                editorElement.style.backgroundColor = value;
                break;
        }
    }

    updateHeadingStyle(tag, property, value) {
        const style = document.createElement('style');
        style.textContent = `
            #quill-editor .ql-editor ${tag} {
                ${property}: ${value} !important;
            }
        `;

        // Remove existing style for this heading if it exists
        const existingStyle = document.querySelector(`style[data-heading="${tag}"]`);
        if (existingStyle) {
            existingStyle.remove();
        }

        style.setAttribute('data-heading', tag);
        document.head.appendChild(style);
    }

    updateElementSpacing(selector, value) {
        const style = document.createElement('style');
        style.textContent = `
            #quill-editor .ql-editor ${selector} {
                margin-bottom: ${value} !important;
            }
        `;

        // Remove existing spacing style if it exists
        const existingStyle = document.querySelector(`style[data-spacing="${selector}"]`);
        if (existingStyle) {
            existingStyle.remove();
        }

        style.setAttribute('data-spacing', selector);
        document.head.appendChild(style);
    }

    updateLinkStyle(property, value) {
        const style = document.createElement('style');
        style.textContent = `
            #quill-editor .ql-editor a {
                ${property}: ${value} !important;
            }
        `;

        // Remove existing link style if it exists
        const existingStyle = document.querySelector('style[data-link-style]');
        if (existingStyle) {
            existingStyle.remove();
        }

        style.setAttribute('data-link-style', '');
        document.head.appendChild(style);
    }

    handleFontChange(e) {
        const fontFamily = e.target.value;
        this.quill.root.style.fontFamily = fontFamily;
    }

    getContent() {
        if (!this.quill) {
            console.error('Quill not initialized');
            return { delta: null, html: '' };
        }
        return {
            delta: this.quill.getContents(),
            html: this.quill.root.innerHTML
        };
    }

    setContent(delta) {
        if (!this.quill) {
            console.error('Quill not initialized');
            return;
        }
        this.quill.setContents(delta);
    }

    resetTheme() {
        const resetButton = document.getElementById('reset-theme');
        resetButton.disabled = true;
        resetButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';

        if (!confirm('Are you sure you want to reset all theme settings to defaults?')) {
            resetButton.disabled = false;
            resetButton.innerHTML = '<i class="fas fa-undo"></i> Reset to Defaults';
            return;
        }

        // Reset all theme controls to their default values
        const themeControls = document.querySelectorAll('.theme-control input, .theme-control select');

        themeControls.forEach(control => {
            const style = control.dataset.style;
            const selector = control.dataset.selector || '';

            // Skip if no style attribute
            if (!style) return;

            // Set the control value to default
            switch (true) {
                case selector.includes('> *') || style === 'color':
                    control.value = this.defaultTheme.textColor;
                    break;
                case selector.includes('.editor-content') && style === 'backgroundColor':
                    control.value = this.defaultTheme.backgroundColor;
                    break;
                case selector.includes('a'):
                    control.value = this.defaultTheme.linkColor;
                    break;
                case selector.includes('p') && style === 'fontSize':
                    control.value = parseInt(this.defaultTheme.fontSize);
                    break;
                case selector.includes('h1'):
                    if (style === 'fontSize') control.value = parseInt(this.defaultTheme.h1.fontSize);
                    if (style === 'marginBottom') control.value = parseInt(this.defaultTheme.h1.marginBottom);
                    break;
                case selector.includes('h2'):
                    if (style === 'fontSize') control.value = parseInt(this.defaultTheme.h2.fontSize);
                    if (style === 'marginBottom') control.value = parseInt(this.defaultTheme.h2.marginBottom);
                    break;
                case selector.includes('h3'):
                    if (style === 'fontSize') control.value = parseInt(this.defaultTheme.h3.fontSize);
                    if (style === 'marginBottom') control.value = parseInt(this.defaultTheme.h3.marginBottom);
                    break;
                case selector.includes('h4'):
                    if (style === 'fontSize') control.value = parseInt(this.defaultTheme.h4.fontSize);
                    if (style === 'marginBottom') control.value = parseInt(this.defaultTheme.h4.marginBottom);
                    break;
                case style === 'lineHeight':
                    control.value = this.defaultTheme.lineHeight;
                    break;
                case style === 'fontFamily':
                    control.value = 'Arial, sans-serif';
                    break;
            }

            // Update the value display if it exists
            const valueDisplay = control.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('value')) {
                valueDisplay.textContent = control.value + (control.dataset.unit || '');
            }

            // Trigger the input event to apply the changes
            control.dispatchEvent(new Event('input'));
        });

        // Show success message
        if (window.showToast) {
            window.showToast('Theme reset to defaults', 'success');
        }

        // Re-enable button
        resetButton.disabled = false;
        resetButton.innerHTML = '<i class="fas fa-undo"></i> Reset to Defaults';
    }

    saveThemePreset() {
        const name = prompt('Enter a name for this theme preset:');
        if (!name) return;

        const preset = {
            name,
            settings: this.getCurrentThemeSettings()
        };

        const presets = JSON.parse(localStorage.getItem('themePresets') || '[]');
        presets.push(preset);
        localStorage.setItem('themePresets', JSON.stringify(presets));
    }

    updateBaseFontSize(value) {
        // Update the Quill editor root and its contents
        if (this.quill && this.quill.root) {
            this.quill.root.style.fontSize = value;

            // Force Quill to update its contents
            const delta = this.quill.getContents();
            this.quill.setContents(delta);
        }

        // Add a style tag to ensure all text inherits the font size
        let styleTag = document.getElementById('quill-base-size');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'quill-base-size';
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = `
            .ql-editor {
                font-size: ${value} !important;
            }
            .ql-editor p {
                font-size: inherit !important;
            }
        `;

        console.log('Updated font size to:', value);
    }

    updateBaseLineHeight(value) {
        // Add a style tag to ensure all text gets the line height
        let styleTag = document.getElementById('quill-base-lineheight');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'quill-base-lineheight';
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = `
            .ql-editor {
                line-height: ${value} !important;
            }
            .ql-editor p {
                line-height: inherit !important;
            }
        `;

        console.log('Updated line height to:', value);
    }
}

// Initialize editor
const editor = new Editor();
window.editor = editor; 