// Register Video Blot
const VideoBlot = Quill.import('blots/block/embed');
class VideoBlotClass extends VideoBlot {
    static create(url) {
        const node = super.create();
        node.setAttribute('contenteditable', false);

        if (url.includes('youtube.com/embed/')) {
            // YouTube embed
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', url);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.style.width = '100%';
            iframe.style.aspectRatio = '16/9';
            node.appendChild(iframe);
        } else {
            // Regular video
            const video = document.createElement('video');
            video.setAttribute('controls', true);
            video.setAttribute('src', url);
            video.style.width = '100%';
            video.style.maxHeight = '400px';
            node.appendChild(video);
        }

        return node;
    }

    static value(node) {
        const video = node.querySelector('video');
        const iframe = node.querySelector('iframe');
        return video ? video.getAttribute('src') : iframe.getAttribute('src');
    }
}
VideoBlotClass.blotName = 'video';
VideoBlotClass.tagName = 'div';
Quill.register(VideoBlotClass);

// Register Audio Blot
class AudioBlotClass extends VideoBlot {
    static create(url) {
        const node = super.create();
        node.setAttribute('contenteditable', false);
        const audio = document.createElement('audio');
        audio.setAttribute('controls', true);
        audio.setAttribute('src', url);
        audio.style.width = '100%';
        node.appendChild(audio);
        return node;
    }

    static value(node) {
        return node.querySelector('audio').getAttribute('src');
    }
}
AudioBlotClass.blotName = 'audio';
AudioBlotClass.tagName = 'div';
Quill.register(AudioBlotClass);

class CommandPalette {
    constructor() {
        this.commands = [
            // Text blocks
            { id: 'h1', label: 'Heading 1', description: 'Add a main heading', icon: 'title', format: { type: 'header', value: 1 } },
            { id: 'h2', label: 'Heading 2', description: 'Add a section heading', icon: 'title', format: { type: 'header', value: 2 } },
            { id: 'h3', label: 'Heading 3', description: 'Add a subsection heading', icon: 'title', format: { type: 'header', value: 3 } },
            { id: 'h4', label: 'Heading 4', description: 'Add a minor heading', icon: 'title', format: { type: 'header', value: 4 } },
            { id: 'p', label: 'Paragraph', description: 'Add a paragraph of text', icon: 'notes', format: { type: 'paragraph' } },
            { id: 'quote', label: 'Blockquote', description: 'Add a quote block', icon: 'format_quote', format: { type: 'blockquote' } },
            { id: 'code', label: 'Code Block', description: 'Add a code block', icon: 'code', format: { type: 'code-block' } },

            // Media blocks
            { id: 'img', label: 'Image', description: 'Add an image', icon: 'image', handler: 'image' },
            { id: 'vid', label: 'Video', description: 'Add a video', icon: 'videocam' },
            { id: 'aud', label: 'Audio', description: 'Add audio content', icon: 'audiotrack' },

            // List blocks
            { id: 'ul', label: 'Bullet List', description: 'Add an unordered list', icon: 'format_list_bulleted' },
            { id: 'ol', label: 'Numbered List', description: 'Add an ordered list', icon: 'format_list_numbered' },
            { id: 'dl', label: 'Definition List', description: 'Add a definition list', icon: 'subject' },

            // Other blocks
            { id: 'table', label: 'Table', description: 'Add a table', icon: 'table_chart' },
            { id: 'hr', label: 'Divider', description: 'Add a horizontal line', icon: 'horizontal_rule' },

            // Add preview command
            {
                id: 'preview',
                label: 'Toggle Preview Mode',
                description: 'Switch between edit and preview modes',
                icon: 'visibility',
                shortcut: 'Ctrl + P'
            },

            // Add sidebar commands
            {
                id: 'blocks-sidebar',
                label: 'Toggle Blocks Sidebar',
                description: 'Show or hide the blocks sidebar',
                icon: 'view_sidebar',
                shortcut: 'Ctrl + B'
            },
            {
                id: 'settings-sidebar',
                label: 'Toggle Settings Sidebar',
                description: 'Show or hide the settings sidebar',
                icon: 'settings',
                shortcut: 'Ctrl + ,'
            },
        ];

        // Add property to store cursor position
        this.lastSelection = null;

        this.createModal();
        this.createMediaModal();
        this.setupEventListeners();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'command-palette-modal';
        modal.innerHTML = `
            <div class="command-palette-container">
                <div class="command-palette-search">
                    <i class="material-icons">search</i>
                    <input type="text" placeholder="Type a command or search..." autofocus>
                </div>
                <div class="command-palette-results"></div>
            </div>
        `;
        document.body.appendChild(modal);

        this.modal = modal;
        this.searchInput = modal.querySelector('input');
        this.resultsContainer = modal.querySelector('.command-palette-results');
    }

    createMediaModal() {
        const modal = document.createElement('div');
        modal.className = 'media-upload-modal';
        modal.innerHTML = `
            <div class="media-upload-container">
                <h3 class="media-upload-title">Add Media</h3>
                <div class="media-upload-tabs">
                    <button class="media-tab active" data-tab="file">Upload File</button>
                    <button class="media-tab" data-tab="url">From URL</button>
                </div>
                <div class="media-upload-content">
                    <div class="media-tab-content file-upload active">
                        <div class="file-drop-area">
                            <i class="material-icons">cloud_upload</i>
                            <p>Drop file here or click to upload</p>
                            <input type="file" class="file-input" accept="">
                            <div class="file-size-limit">Maximum file size: 10MB</div>
                        </div>
                        <div class="media-preview"></div>
                        <div class="loading-indicator" style="display: none;">
                            <div class="spinner"></div>
                            <span>Processing...</span>
                        </div>
                    </div>
                    <div class="media-tab-content url-input">
                        <input type="url" placeholder="Enter media URL or YouTube link..." class="url-input-field">
                        <p class="url-help-text">Supported formats: MP4, WebM, MP3, WAV, JPG, PNG, GIF, YouTube URLs</p>
                        <div class="media-preview"></div>
                    </div>
                </div>
                <div class="media-upload-actions">
                    <button class="cancel-btn">Cancel</button>
                    <button class="insert-btn" disabled>Insert</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.mediaModal = modal;
        this.setupMediaModalEvents();

        // Add styles for new elements
        const style = document.createElement('style');
        style.textContent += `
            .loading-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 16px;
            }

            .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #2196f3;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .media-preview {
                margin-top: 16px;
                max-width: 100%;
                display: none;
                background: #f5f5f5;
                padding: 16px;
                border-radius: 4px;
            }

            .media-preview.active {
                display: block;
            }

            .media-preview img {
                max-width: 100%;
                max-height: 200px;
                object-fit: contain;
            }

            .media-preview video,
            .media-preview audio {
                width: 100%;
            }

            .media-preview iframe {
                width: 100%;
                aspect-ratio: 16/9;
                border: none;
            }

            .file-size-limit {
                font-size: 12px;
                color: #666;
                margin-top: 8px;
            }

            .error-message {
                color: #f44336;
                font-size: 14px;
                margin-top: 8px;
                display: none;
            }

            .url-help-text {
                font-size: 12px !important;
                color: #666;
                margin: 8px 0;
            }

            .media-tab-content {
                display: none;
            }

            .media-tab-content.active {
                display: block;
            }

            .media-tab {
                padding: 8px 16px;
                border: none;
                background: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .media-tab:hover {
                background: #f0f0f0;
            }

            .media-tab.active {
                background: #e3f2fd;
                color: #1976d2;
                font-weight: 500;
            }

            .file-drop-area {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 32px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                background: #fff;
            }

            .file-drop-area.drag-active {
                border-color: #2196f3;
                background: #e3f2fd;
            }

            .file-drop-area.drag-active::after {
                content: 'Drop file here';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1.2em;
                color: #1976d2;
                pointer-events: none;
            }

            .file-drop-area.drag-active > * {
                opacity: 0.3;
            }

            .file-input {
                display: none;
            }

            .file-drop-area i {
                font-size: 48px;
                color: #666;
                margin-bottom: 16px;
            }

            .file-drop-area p {
                margin: 0;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Add button click handler
        const commandPaletteBtn = document.querySelector('.command-palette-btn');
        if (commandPaletteBtn) {
            commandPaletteBtn.addEventListener('click', () => {
                // Store selection before opening
                this.lastSelection = window.getSelection();
                if (this.lastSelection.rangeCount > 0) {
                    this.lastSelection = this.lastSelection.getRangeAt(0).cloneRange();
                }
                this.openModal();
            });
        }

        // Open/close modal with keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.altKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();

                // If modal is already open, close it
                if (this.modal.classList.contains('open')) {
                    this.closeModal();
                    return;
                }

                // Otherwise, open the modal
                this.lastSelection = window.getSelection();
                if (this.lastSelection.rangeCount > 0) {
                    this.lastSelection = this.lastSelection.getRangeAt(0).cloneRange();
                }
                this.openModal();
            }
        });

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('open')) {
                this.closeModal();
            }
        });

        // Handle search input
        this.searchInput.addEventListener('input', () => {
            this.filterCommands();
        });

        // Handle keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.handleArrowKeys(e.key);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSelectedCommand();
            }
        });
    }

    setupMediaModalEvents() {
        const modal = this.mediaModal;
        const tabs = modal.querySelectorAll('.media-tab');
        const fileInput = modal.querySelector('.file-input');
        const urlInput = modal.querySelector('.url-input-field');
        const insertBtn = modal.querySelector('.insert-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const fileUpload = modal.querySelector('.file-upload');
        const urlInputContent = modal.querySelector('.media-tab-content.url-input');
        const fileDropArea = modal.querySelector('.file-drop-area');
        const loadingIndicator = modal.querySelector('.loading-indicator');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        modal.querySelector('.media-upload-container').appendChild(errorMessage);

        // Add tab switching functionality
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update tab buttons
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update tab content visibility
                if (tab.dataset.tab === 'file') {
                    fileUpload.classList.add('active');
                    urlInputContent.classList.remove('active');
                    // Reset URL input when switching to file tab
                    urlInput.value = '';
                    // Reset preview for URL tab
                    const urlPreview = urlInputContent.querySelector('.media-preview');
                    urlPreview.innerHTML = '';
                    urlPreview.classList.remove('active');
                } else {
                    fileUpload.classList.remove('active');
                    urlInputContent.classList.add('active');
                    // Reset file input when switching to URL tab
                    fileInput.value = '';
                    // Reset preview for file tab
                    const filePreview = fileUpload.querySelector('.media-preview');
                    filePreview.innerHTML = '';
                    filePreview.classList.remove('active');
                }

                // Reset the insert button
                insertBtn.disabled = true;

                // Clear error messages
                this.hideError();

                // Clear stored file data
                this.currentFileData = null;
            });
        });

        // Add drag and drop handling
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Add visual feedback when dragging
        ['dragenter', 'dragover'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.remove('drag-active');
            });
        });

        // Handle the actual drop
        fileDropArea.addEventListener('drop', async (e) => {
            const file = e.dataTransfer.files[0];
            if (!file) return;

            // Validate file type based on current mediaType
            const isValidType = this.validateFileType(file);
            if (!isValidType) {
                this.showError('Invalid file type for selected media');
                return;
            }

            // Check file size (10MB limit)
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > MAX_FILE_SIZE) {
                this.showError('File size exceeds 10MB limit');
                insertBtn.disabled = true;
                return;
            }

            this.hideError();
            this.showLoading();
            insertBtn.disabled = true;

            try {
                const dataUrl = await this.readFileAsDataURL(file);
                await this.previewMedia(file);
                this.currentFileData = dataUrl;
                insertBtn.disabled = false;
            } catch (error) {
                this.showError('Error processing file');
            } finally {
                this.hideLoading();
            }
        });

        // Make the entire drop area clickable
        fileDropArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input handling with size validation and preview
        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;

            // Validate file type
            const isValidType = this.validateFileType(file);
            if (!isValidType) {
                this.showError('Invalid file type for selected media');
                return;
            }

            // Check file size (10MB limit)
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > MAX_FILE_SIZE) {
                this.showError('File size exceeds 10MB limit');
                insertBtn.disabled = true;
                return;
            }

            this.hideError();
            this.showLoading();
            insertBtn.disabled = true;

            try {
                const dataUrl = await this.readFileAsDataURL(file);
                await this.previewMedia(file);
                this.currentFileData = dataUrl;
                insertBtn.disabled = false;
            } catch (error) {
                this.showError('Error processing file');
            } finally {
                this.hideLoading();
            }
        });

        // URL input handling with YouTube support and preview
        urlInput.addEventListener('input', async () => {
            const url = urlInput.value.trim();
            if (!url) {
                insertBtn.disabled = true;
                return;
            }

            try {
                await this.previewMediaUrl(url);
                insertBtn.disabled = false;
            } catch (error) {
                this.showError('Invalid URL or unsupported format');
                insertBtn.disabled = true;
            }
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            this.closeMediaModal();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeMediaModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                this.closeMediaModal();
            }
        });
    }

    showError(message) {
        const errorMessage = this.mediaModal.querySelector('.error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    hideError() {
        const errorMessage = this.mediaModal.querySelector('.error-message');
        errorMessage.style.display = 'none';
    }

    showLoading() {
        const loadingIndicator = this.mediaModal.querySelector('.loading-indicator');
        loadingIndicator.style.display = 'flex';
    }

    hideLoading() {
        const loadingIndicator = this.mediaModal.querySelector('.loading-indicator');
        loadingIndicator.style.display = 'none';
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }

    openModal() {
        this.modal.classList.add('open');
        this.searchInput.value = '';
        this.searchInput.focus();
        this.filterCommands();
        // Select first item by default
        this.selectedIndex = 0;
        const firstItem = this.resultsContainer.querySelector('.command-palette-item');
        if (firstItem) {
            firstItem.classList.add('selected');
        }
    }

    closeModal() {
        this.modal.classList.remove('open');
        this.searchInput.value = '';
        this.selectedIndex = -1;
        this.lastSelection = null;
        this.resultsContainer.innerHTML = '';
    }

    filterCommands() {
        const searchTerm = this.searchInput.value.toLowerCase();
        let filteredCommands = this.commands;

        // If in preview mode, filter out sidebar and block-related commands
        if (window.previewManager?.isInPreviewMode()) {
            filteredCommands = this.commands.filter(command =>
                command.id === 'preview' // Only allow preview toggle command
            );
        }

        // Apply search filter
        filteredCommands = filteredCommands.filter(command =>
            command.id.toLowerCase().includes(searchTerm) ||
            command.label.toLowerCase().includes(searchTerm) ||
            command.description.toLowerCase().includes(searchTerm)
        );

        this.renderResults(filteredCommands);

        // Select first item after filtering
        this.selectedIndex = 0;
        const firstItem = this.resultsContainer.querySelector('.command-palette-item');
        if (firstItem) {
            firstItem.classList.add('selected');
        }
    }

    renderResults(commands) {
        this.resultsContainer.innerHTML = commands.map((command, index) => `
            <div class="command-palette-item" data-command="${command.id}">
                <div class="command-icon">
                    <i class="material-icons">${command.icon}</i>
                </div>
                <div class="command-info">
                    <div class="command-label">${command.label}</div>
                    <div class="command-description">${command.description}</div>
                </div>
                <div class="command-shortcut">${command.id}</div>
            </div>
        `).join('');

        // Add click handlers to items
        this.resultsContainer.querySelectorAll('.command-palette-item').forEach(item => {
            item.addEventListener('click', () => {
                const commandId = item.dataset.command;
                this.executeCommand(commandId);
            });
        });
    }

    handleArrowKeys(key) {
        const items = this.resultsContainer.querySelectorAll('.command-palette-item');
        if (!items.length) return;

        if (typeof this.selectedIndex === 'undefined') {
            this.selectedIndex = -1;
        }

        // Remove current selection
        items[this.selectedIndex]?.classList.remove('selected');

        // Update index
        if (key === 'ArrowDown') {
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
        } else {
            this.selectedIndex = this.selectedIndex <= 0 ? items.length - 1 : this.selectedIndex - 1;
        }

        // Add selection to new item
        const selectedItem = items[this.selectedIndex];
        selectedItem.classList.add('selected');
        selectedItem.scrollIntoView({ block: 'nearest' });
    }

    executeSelectedCommand() {
        const selectedItem = this.resultsContainer.querySelector('.command-palette-item.selected');
        if (selectedItem) {
            const commandId = selectedItem.dataset.command;
            this.executeCommand(commandId);
        }
    }

    executeCommand(commandId) {
        const command = this.commands.find(cmd => cmd.id === commandId);
        if (!command) return;

        // Handle special commands
        if (commandId === 'preview') {
            window.previewManager?.togglePreviewMode();
            this.closeModal();
            return;
        }

        // Handle sidebar toggles
        if (commandId === 'blocks-sidebar' || commandId === 'settings-sidebar') {
            document.querySelector(`.${command.id.split('-')[0]}-btn`)?.click();
            this.closeModal();
            return;
        }

        const quill = window.editor.quill;

        // Handle media blocks
        if (command.handler === 'image' || command.id === 'vid' || command.id === 'aud') {
            this.mediaType = command.id === 'vid' ? 'video' :
                command.id === 'aud' ? 'audio' :
                    'image';
            this.openMediaModal(this.mediaType);
            this.closeModal();
            return;
        }

        // Handle format commands
        if (command.format) {
            const range = quill.getSelection(true);

            // Insert a new line if we're not at the start of a line
            const currentLine = quill.getText(range.index, 1);
            if (currentLine !== '\n' && range.index > 0) {
                quill.insertText(range.index, '\n');
                range.index += 1;
            }

            // Apply the format
            if (command.format.type === 'header') {
                quill.formatLine(range.index, 1, 'header', command.format.value);
            } else if (command.format.type === 'blockquote') {
                quill.formatLine(range.index, 1, 'blockquote', true);
            } else if (command.format.type === 'code-block') {
                quill.formatLine(range.index, 1, 'code-block', true);
            } else if (command.format.type === 'paragraph') {
                quill.formatLine(range.index, 1, 'header', false);
                quill.formatLine(range.index, 1, 'blockquote', false);
                quill.formatLine(range.index, 1, 'code-block', false);
            }

            // Set cursor position
            quill.setSelection(range.index);
        }

        this.closeModal();
    }

    openMediaModal(mediaType) {
        const modal = this.mediaModal;
        const fileInput = modal.querySelector('.file-input');

        // Reset the modal state first
        this.closeMediaModal();

        // Then set up for new use
        this.mediaType = mediaType;
        modal.classList.add('open');

        // Set accept attribute based on media type
        switch (mediaType) {
            case 'video':
                fileInput.accept = 'video/*';
                break;
            case 'audio':
                fileInput.accept = 'audio/*';
                break;
            case 'image':
                fileInput.accept = 'image/*';
                break;
        }

        // Setup insert button handler
        const insertBtn = modal.querySelector('.insert-btn');
        insertBtn.onclick = () => {
            const activeTab = modal.querySelector('.media-tab.active').dataset.tab;
            const quill = window.editor.quill;
            const range = quill.getSelection(true);

            if (activeTab === 'file' && this.currentFileData) {
                // Use the stored file data for file uploads
                this.insertMedia(this.currentFileData, range);
            } else if (activeTab === 'url') {
                // Use the URL input for URL tab
                const url = modal.querySelector('.url-input-field').value.trim();
                if (url) {
                    this.insertMedia(url, range);
                }
            }

            this.closeMediaModal();
        };
    }

    closeMediaModal() {
        this.mediaModal.classList.remove('open');

        // Reset file input
        const fileInput = this.mediaModal.querySelector('.file-input');
        fileInput.value = '';

        // Reset URL input
        const urlInput = this.mediaModal.querySelector('.url-input-field');
        urlInput.value = '';

        // Reset insert button
        const insertBtn = this.mediaModal.querySelector('.insert-btn');
        insertBtn.disabled = true;

        // Reset previews
        const previews = this.mediaModal.querySelectorAll('.media-preview');
        previews.forEach(preview => {
            preview.innerHTML = '';
            preview.classList.remove('active');
        });

        // Reset error message
        const errorMessage = this.mediaModal.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
        }

        // Reset loading indicator
        const loadingIndicator = this.mediaModal.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // Reset tabs to default state
        const tabs = this.mediaModal.querySelectorAll('.media-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        this.mediaModal.querySelector('.media-tab[data-tab="file"]').classList.add('active');

        // Reset tab contents
        const tabContents = this.mediaModal.querySelectorAll('.media-tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        this.mediaModal.querySelector('.media-tab-content.file-upload').classList.add('active');

        // Clear the stored file data
        this.currentFileData = null;
    }

    async previewMedia(file) {
        const preview = this.mediaModal.querySelector('.file-upload .media-preview');
        preview.innerHTML = '';

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const previewElement = this.createPreviewElement(file.type, e.target.result);
                if (previewElement) {
                    preview.appendChild(previewElement);
                    preview.classList.add('active');
                    resolve();
                } else {
                    reject(new Error('Unsupported file type'));
                }
            };

            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }

    async previewMediaUrl(url) {
        const preview = this.mediaModal.querySelector('.url-input .media-preview');
        preview.innerHTML = '';

        // Check if it's a YouTube URL
        const youtubeId = this.getYouTubeVideoId(url);
        if (youtubeId) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            preview.appendChild(iframe);
            preview.classList.add('active');
            return;
        }

        // For other URLs, try to determine the type and preview
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentType = response.headers.get('content-type');
            const previewElement = this.createPreviewElement(contentType, url);

            if (previewElement) {
                preview.appendChild(previewElement);
                preview.classList.add('active');
            } else {
                throw new Error('Unsupported media type');
            }
        } catch (error) {
            throw new Error('Invalid URL');
        }
    }

    createPreviewElement(type, src) {
        let element;

        if (type.startsWith('image/')) {
            element = document.createElement('img');
        } else if (type.startsWith('video/')) {
            element = document.createElement('video');
            element.controls = true;
        } else if (type.startsWith('audio/')) {
            element = document.createElement('audio');
            element.controls = true;
        } else {
            return null;
        }

        element.src = src;
        return element;
    }

    getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    insertMedia(source, range) {
        const quill = window.editor.quill;
        const activeTab = this.mediaModal.querySelector('.media-tab.active').dataset.tab;

        // Insert a new line if we're not at the start of a line
        const currentLine = quill.getText(range.index, 1);
        if (currentLine !== '\n' && range.index > 0) {
            quill.insertText(range.index, '\n');
            range.index += 1;
        }

        // Check if it's a YouTube URL when in URL tab and media type is video
        if (this.mediaType === 'video' && activeTab === 'url') {
            const youtubeId = this.getYouTubeVideoId(source);
            if (youtubeId) {
                source = `https://www.youtube.com/embed/${youtubeId}`;
            }
        }

        // Insert the appropriate media element
        try {
            quill.insertEmbed(range.index, this.mediaType, source, 'user');

            // Insert a new line after the media
            quill.insertText(range.index + 1, '\n', 'user');

            // Move cursor to next line
            quill.setSelection(range.index + 2, 0);
        } catch (error) {
            console.error('Error inserting media:', error);
            this.showError('Error inserting media');
        }

        // Clear the stored file data
        this.currentFileData = null;
    }

    validateFileType(file) {
        switch (this.mediaType) {
            case 'image':
                return file.type.startsWith('image/');
            case 'video':
                return file.type.startsWith('video/');
            case 'audio':
                return file.type.startsWith('audio/');
            default:
                return false;
        }
    }
}

// Add styles to the page
const style = document.createElement('style');
style.textContent = `
    .command-palette-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .command-palette-modal.open {
        display: flex;
    }

    .command-palette-container {
        width: 600px;
        max-height: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .command-palette-search {
        padding: 16px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .command-palette-search input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 16px;
        padding: 8px;
    }

    .command-palette-results {
        overflow-y: auto;
        max-height: 344px;
        padding: 8px;
    }

    .command-palette-item {
        display: flex;
        align-items: center;
        padding: 12px;
        gap: 16px;
        cursor: pointer;
        border-radius: 6px;
        transition: background-color 0.2s;
    }

    .command-palette-item:hover,
    .command-palette-item.selected {
        background-color: #f5f5f5;
    }

    .command-icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .command-icon i {
        font-size: 20px;
        color: #666;
    }

    .command-info {
        flex: 1;
    }

    .command-label {
        font-weight: 500;
        margin-bottom: 4px;
    }

    .command-description {
        font-size: 14px;
        color: #666;
    }

    .command-shortcut {
        padding: 4px 8px;
        background: #f0f0f0;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
        font-family: monospace;
    }

    .ql-editor video {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1em 0;
    }

    .ql-editor audio {
        width: 100%;
        display: block;
        margin: 1em 0;
    }

    .media-upload-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    }

    .media-upload-modal.open {
        display: flex;
    }

    .media-upload-container {
        width: 500px;
        background: white;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    }

    .media-upload-title {
        margin: 0 0 16px;
        font-size: 20px;
    }

    .media-upload-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    }

    .media-tab {
        padding: 8px 16px;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .media-tab:hover {
        background: #f0f0f0;
    }

    .media-tab.active {
        background: #e3f2fd;
        color: #1976d2;
        font-weight: 500;
    }

    .media-tab-content {
        display: none;
    }

    .media-tab-content.active {
        display: block;
    }

    .file-drop-area {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 32px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        background: #fff;
    }

    .file-drop-area.drag-active {
        border-color: #2196f3;
        background: #e3f2fd;
    }

    .file-drop-area.drag-active::after {
        content: 'Drop file here';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.2em;
        color: #1976d2;
        pointer-events: none;
    }

    .file-drop-area.drag-active > * {
        opacity: 0.3;
    }

    .file-input {
        display: none;
    }

    .file-drop-area i {
        font-size: 48px;
        color: #666;
        margin-bottom: 16px;
    }

    .file-drop-area p {
        margin: 0;
        color: #666;
    }

    .url-input-field {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .url-help-text {
        font-size: 14px;
        color: #666;
        margin: 0;
    }

    .media-upload-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
    }

    .media-upload-actions button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .cancel-btn {
        background: #f0f0f0;
    }

    .insert-btn {
        background: #2196f3;
        color: white;
    }

    .insert-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

document.head.appendChild(style);

// Initialize the command palette after editor is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for editor to be initialized
    const checkEditor = setInterval(() => {
        if (window.editor?.quill) {
            window.commandPalette = new CommandPalette();
            clearInterval(checkEditor);
        }
    }, 100);
}); 