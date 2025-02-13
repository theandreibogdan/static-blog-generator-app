class ExportManager {
    constructor() {
        this.zip = new JSZip();
        this.initializeExportButton();
    }

    initializeExportButton() {
        const exportButton = document.querySelector('.export-site-btn');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.handleExport());

            // Add tooltip
            exportButton.setAttribute('data-tooltip', 'Export as website (Ctrl + E)');

            // Add keyboard shortcut
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                    e.preventDefault();
                    this.handleExport();
                }
            });
        }
    }

    async handleExport() {
        const exportButton = document.querySelector('.export-site-btn');

        try {
            // Show loading state
            this.setExportButtonState(exportButton, true);

            // Generate export package
            const fileName = await this.generateExportPackage();

            // Show success message
            this.showExportSuccess(fileName);

        } catch (error) {
            console.error('Export failed:', error);
            this.showExportError();
        } finally {
            // Reset button state
            this.setExportButtonState(exportButton, false);
        }
    }

    setExportButtonState(button, isLoading) {
        if (button) {
            button.disabled = isLoading;
            const icon = button.querySelector('i');
            icon.className = isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-download';
        }
    }

    sanitizeFileName(fileName) {
        return fileName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/--+/g, '-');
    }

    async generateExportPackage() {
        // Get the page title for the file name
        const titleInput = document.querySelector('.seo-control input[data-meta="title"]');
        const fileName = this.sanitizeFileName(titleInput?.value || 'untitled-page');

        // Generate files
        const html = await this.generateHTML();
        const css = await this.generateCSS();
        const analytics = this.generateAnalytics();

        // Create the export package
        this.zip.file('index.html', this.wrapHTML(html, analytics));
        this.zip.file('styles.css', css);

        // Generate and trigger download
        const blob = await this.zip.generateAsync({ type: 'blob' });
        this.downloadZip(blob, fileName);

        return fileName;
    }

    wrapHTML(content, analytics) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${this.generateMetaTags()}
    <link rel="stylesheet" href="styles.css">
    ${analytics}
</head>
<body>
    <main class="content">
        ${content}
    </main>
</body>
</html>`;
    }

    generateMetaTags() {
        const metaTags = [];
        document.querySelectorAll('.seo-control input, .seo-control textarea').forEach(control => {
            const meta = control.dataset.meta;
            const value = control.value.trim();
            if (value) {
                if (meta === 'title') {
                    metaTags.push(`    <title>${value}</title>`);
                } else if (meta.startsWith('og:')) {
                    metaTags.push(`    <meta property="${meta}" content="${value}">`);
                } else {
                    metaTags.push(`    <meta name="${meta}" content="${value}">`);
                }
            }
        });
        return metaTags.join('\n');
    }

    generateAnalytics() {
        // Get tracking codes from settings sidebar inputs
        const gaInput = document.querySelector('textarea[data-tracking="google-analytics"]');
        const clarityInput = document.querySelector('textarea[data-tracking="microsoft-clarity"]');

        let analytics = '';

        // Add Google Analytics if code exists
        if (gaInput && gaInput.value.trim()) {
            analytics += `\n    ${gaInput.value.trim()}`;
        }

        // Add Microsoft Clarity if code exists
        if (clarityInput && clarityInput.value.trim()) {
            analytics += `\n    ${clarityInput.value.trim()}`;
        }

        return analytics;
    }

    downloadZip(blob, fileName) {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${fileName}.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    showExportSuccess(fileName) {
        window.toastManager?.show({
            title: 'Export Successful',
            description: `Your site has been exported as ${fileName}.zip`,
            type: 'success',
            position: 'top-right',
            duration: 3000,
            className: 'toast-success'
        });
        window.audioManager?.play('success');
    }

    showExportError() {
        window.toastManager?.show({
            title: 'Export Failed',
            description: 'There was an error exporting your site. Please try again.',
            type: 'error',
            position: 'top-right',
            duration: 5000,
            className: 'toast-error'
        });
        window.audioManager?.play('error');
    }

    async generateHTML() {
        // Get the Quill editor content
        const quillEditor = window.editor?.quill;
        if (!quillEditor) {
            throw new Error('Editor not initialized');
        }

        // Get the header image if it exists
        const headerImageContainer = document.querySelector('.header-image-container');
        const headerImage = headerImageContainer?.querySelector('img');
        let headerHTML = '';

        if (headerImage && !headerImageContainer.classList.contains('empty')) {
            // Convert image to base64 to include it in the export
            try {
                const imgUrl = headerImage.src;
                const response = await fetch(imgUrl);
                const blob = await response.blob();
                const base64 = await this.blobToBase64(blob);
                headerHTML = `<div class="header-image"><img src="${base64}" alt="Header"></div>`;
            } catch (error) {
                console.error('Error processing header image:', error);
            }
        }

        // Get the content as HTML
        const content = quillEditor.root.innerHTML;

        // Clean up the content
        const cleanContent = this.cleanEditorContent(content);

        // Combine header and content
        return `${headerHTML}${cleanContent}`;
    }

    // Helper method to convert blob to base64
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    cleanEditorContent(content) {
        // Create a temporary div to manipulate the content
        const temp = document.createElement('div');
        temp.innerHTML = content;

        // Remove editor-specific attributes and classes
        const elements = temp.querySelectorAll('*');
        elements.forEach(el => {
            // Remove Quill-specific attributes except for code blocks
            if (!el.classList.contains('ql-code-block') &&
                !el.classList.contains('ql-code-block-container')) {
                el.removeAttribute('contenteditable');
                el.removeAttribute('data-gramm');
                el.removeAttribute('data-placeholder');
                el.removeAttribute('spellcheck');

                // Remove Quill classes except for code-related ones
                const classes = Array.from(el.classList);
                classes.forEach(className => {
                    if (className.startsWith('ql-') &&
                        !['ql-code-block', 'ql-code-block-container'].includes(className)) {
                        el.classList.remove(className);
                    }
                });
            }

            // Remove empty attributes
            Array.from(el.attributes).forEach(attr => {
                if (!attr.value) {
                    el.removeAttribute(attr.name);
                }
            });
        });

        return temp.innerHTML;
    }

    async generateCSS() {
        // Get base font size from theme settings
        const baseFontSize = document.querySelector('input[data-style="fontSize"][data-selector=".editor-content > *"]')?.value
            || this.editor?.defaultTheme.fontSize
            || '18px';

        // Get theme settings from the theme controls
        const themeControls = document.querySelectorAll('.theme-control input');

        // Get padding values from settings
        const paddingTop = document.querySelector('.padding-range[data-padding="top"]')?.value || '40';
        const paddingRight = document.querySelector('.padding-range[data-padding="right"]')?.value || '48';
        const paddingBottom = document.querySelector('.padding-range[data-padding="bottom"]')?.value || '40';
        const paddingLeft = document.querySelector('.padding-range[data-padding="left"]')?.value || '48';

        // Get content width from settings
        const contentWidth = document.querySelector('.width-range')?.value || '1200';

        let css = `
/* Base styles */
:root {
    --content-width: ${contentWidth}px;
    --padding-top: ${paddingTop}px;
    --padding-right: ${paddingRight}px;
    --padding-bottom: ${paddingBottom}px;
    --padding-left: ${paddingLeft}px;
}

body {
    margin: 0;
    padding: 0;
    font-family: ${document.querySelector('.font-select')?.value || 'Arial, sans-serif'};
    line-height: 1.6;
    color: ${document.querySelector('input[data-style="color"][data-selector*="> *"]')?.value || '#000000'};
    background-color: ${document.querySelector('input[data-style="backgroundColor"]')?.value || '#ffffff'};
}

.content {
    max-width: var(--content-width);
    margin: 0 auto;
    padding: var(--padding-top) var(--padding-right) var(--padding-bottom) var(--padding-left);
    box-sizing: border-box;
}

/* Image Styles */
img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5rem auto;
}

/* Ensure images don't overflow their containers */
p img {
    max-width: 100%;
    height: auto;
}

/* Header Image Styles */
.header-image {
    width: 100%;
    margin-bottom: 2rem;
    border-radius: 8px;
    overflow: hidden;
}

.header-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    margin: 0; /* Override default image margin for header image */
}

/* Responsive image adjustments */
@media (max-width: 768px) {
    img {
        margin: 1.25rem auto;
    }
    
    .header-image {
        border-radius: 6px;
        margin-bottom: 1.5rem;
    }
}

@media (max-width: 480px) {
    img {
        margin: 1rem auto;
    }
    
    .header-image {
        border-radius: 4px;
        margin-bottom: 1rem;
    }
}

/* Typography */
`;

        // Add styles for headings and paragraphs
        const elements = ['h1', 'h2', 'h3', 'h4', 'p'];
        elements.forEach(tag => {
            const sizeInput = document.querySelector(`input[data-style="fontSize"][data-selector*="${tag}"]`);
            const spacingInput = document.querySelector(`input[data-style="marginBottom"][data-selector*="${tag}"]`);
            const lineHeightInput = document.querySelector(`input[data-style="lineHeight"][data-selector*="${tag}"]`);

            css += `
${tag} {
    font-size: ${sizeInput?.value || '16'}px;
    margin-bottom: ${spacingInput?.value || '1rem'};
    ${lineHeightInput ? `line-height: ${lineHeightInput.value};` : ''}
}`;
        });

        // Add link styles
        const linkColor = document.querySelector('input[data-style="color"][data-selector*="a"]')?.value || '#2196f3';
        css += `
/* Links */
a {
    color: ${linkColor};
    text-decoration: none;
    transition: color 0.2s ease;
}

a:hover {
    color: ${this.adjustColor(linkColor, -20)};
    text-decoration: underline;
}

/* Responsive typography */
@media (max-width: 768px) {
    body {
        font-size: 95%;
    }
    h1 { font-size: 90%; }
    h2 { font-size: 90%; }
    h3 { font-size: 90%; }
    h4 { font-size: 90%; }
}

@media (max-width: 480px) {
    body {
        font-size: 90%;
    }
    h1 { font-size: 85%; }
    h2 { font-size: 85%; }
    h3 { font-size: 85%; }
    h4 { font-size: 85%; }
}`;

        // Add Quill code block styles
        css += `
/* Code Block Styles */
.ql-code-block-container {
    background-color: #23241f;
    color: #f8f8f2;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    font-size: calc(${baseFontSize} * 0.85); /* Scale relative to base font size */
    padding: 12px 15px;
    margin: 1rem 0;
    border-radius: 4px;
    position: relative;
    tab-size: 4;
    -moz-tab-size: 4;
}

.ql-code-block {
    counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    padding: 0;
    line-height: 1.42;
}

/* Code block container styles */
.ql-container .ql-code-block-container {
    margin: 0;
    position: relative;
    font-size: inherit;
}

.ql-container .ql-code-block {
    font-size: inherit;
}

/* Responsive code block styles */
@media (max-width: 768px) {
    .ql-code-block-container {
        font-size: calc(${baseFontSize} * 0.8);
        padding: 10px 12px;
    }
}

@media (max-width: 480px) {
    .ql-code-block-container {
        font-size: calc(${baseFontSize} * 0.75);
        padding: 8px 10px;
    }
}`;

        return css;
    }

    adjustColor(color, amount) {
        // Helper function to darken/lighten colors
        const clamp = (num) => Math.min(255, Math.max(0, num));

        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Adjust each component
        const adjustR = clamp(r + amount);
        const adjustG = clamp(g + amount);
        const adjustB = clamp(b + amount);

        // Convert back to hex
        const getHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${getHex(adjustR)}${getHex(adjustG)}${getHex(adjustB)}`;
    }
}

// Initialize export manager
window.exportManager = new ExportManager(); 