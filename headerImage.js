class HeaderImageManager {
    constructor() {
        this.initialize();
        this.setupMutationObserver();
        this.cropper = new ImageCropper();
        this.observerTimeout = null;
    }

    setupMutationObserver() {
        // Create a mutation observer to watch for unwanted paragraph elements
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeName === 'P') {
                            const container = document.querySelector('.header-image-container');
                            if (container && container.contains(node)) {
                                node.remove();
                            }
                        }
                    });
                }
            });
        });

        // Don't start observing immediately
        this.observerActive = false;
    }

    startObserver() {
        if (!this.observerActive) {
            const editorContent = document.querySelector('.editor-content');
            this.observer.observe(editorContent, {
                childList: true,
                subtree: true
            });
            this.observerActive = true;
        }

        // Reset the timeout
        if (this.observerTimeout) {
            clearTimeout(this.observerTimeout);
        }

        // Set new timeout to stop observer after 30 seconds
        this.observerTimeout = setTimeout(() => {
            this.stopObserver();
        }, 30000);
    }

    stopObserver() {
        if (this.observerActive) {
            this.observer.disconnect();
            this.observerActive = false;
        }
    }

    initialize() {
        const editorContent = document.querySelector('.editor-content');

        // Create article-content div if it doesn't exist
        let articleContent = editorContent.querySelector('.article-content');
        if (!articleContent) {
            articleContent = document.createElement('div');
            articleContent.className = 'article-content';
            // Move all existing content into article-content
            while (editorContent.firstChild) {
                articleContent.appendChild(editorContent.firstChild);
            }
            editorContent.appendChild(articleContent);
        }

        // Add header image container if it doesn't exist
        if (!editorContent.querySelector('.header-image-container')) {
            const headerContainer = this.createHeaderImageContainer();
            editorContent.insertBefore(headerContainer, articleContent);
        }

        // Remove any existing unwanted paragraphs
        this.removeUnwantedParagraphs();

        this.setupEventListeners();
    }

    removeUnwantedParagraphs() {
        const container = document.querySelector('.header-image-container');
        if (container) {
            const unwantedParagraphs = container.querySelectorAll('p');
            unwantedParagraphs.forEach(p => p.remove());
        }
    }

    createHeaderImageContainer() {
        const container = document.createElement('div');
        container.className = 'header-image-container empty';
        container.innerHTML = this.getEmptyStateHTML();
        return container;
    }

    getEmptyStateHTML() {
        return `
            <div class="loading-spinner"></div>
            <div class="content-wrapper">
                <input type="file" class="header-image-input" accept="image/*">
                <div class="upload-icon">
                    <i class="fas fa-image"></i>
                </div>
                <div class="upload-text">
                    <span class="primary-text">Add a header image</span>
                    <span class="secondary-text">Drag and drop or click to upload (max 10MB)</span>
                </div>
            </div>
            <div class="header-image-overlay" style="display: none;">
                <div class="header-image-controls">
                    <button class="header-image-btn change-btn">
                        <i class="fas fa-exchange-alt"></i>
                        Change Image
                    </button>
                    <button class="header-image-btn remove-btn">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const container = document.querySelector('.header-image-container');
        const input = container.querySelector('.header-image-input');
        const contentWrapper = container.querySelector('.content-wrapper');

        // Click to upload
        contentWrapper?.addEventListener('click', (e) => {
            if (container.classList.contains('empty')) {
                input.click();
            }
        });

        // File input change
        input?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFile(file);
        });

        // Drag and drop
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (container.classList.contains('empty')) {
                container.style.borderColor = '#2196f3';
            }
        });

        container.addEventListener('dragleave', () => {
            if (container.classList.contains('empty')) {
                container.style.borderColor = '#ccc';
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.style.borderColor = '#ccc';
            const file = e.dataTransfer.files[0];
            if (file && container.classList.contains('empty')) {
                this.handleFile(file);
            }
        });

        // Remove image
        const removeBtn = container.querySelector('.remove-btn');
        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage();
        });

        // Change image
        const changeBtn = container.querySelector('.change-btn');
        changeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            input.click();
        });

        // Start observer when interacting with the container
        container.addEventListener('mouseenter', () => this.startObserver());
        container.addEventListener('click', () => this.startObserver());
        container.addEventListener('dragover', () => this.startObserver());
    }

    showLoading() {
        const container = document.querySelector('.header-image-container');
        const spinner = container.querySelector('.loading-spinner');
        spinner.style.display = 'block';
    }

    hideLoading() {
        const container = document.querySelector('.header-image-container');
        const spinner = container.querySelector('.loading-spinner');
        spinner.style.display = 'none';
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        this.showLoading();

        const reader = new FileReader();
        reader.onload = (e) => {
            // Instead of setting image directly, show cropper
            this.hideLoading();
            this.cropper.show(e.target.result, (croppedImageUrl) => {
                this.setImage(croppedImageUrl);
            });
        };
        reader.onerror = () => {
            alert('Error reading file');
            this.hideLoading();
        };
        reader.readAsDataURL(file);
    }

    setImage(src) {
        const container = document.querySelector('.header-image-container');
        const overlay = container.querySelector('.header-image-overlay');
        const contentWrapper = container.querySelector('.content-wrapper');

        // Remove empty class and content wrapper
        container.classList.remove('empty');
        if (contentWrapper) contentWrapper.remove();

        // Create or update image
        let img = container.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            container.insertBefore(img, overlay);
        }
        img.src = src;

        // Show overlay
        overlay.style.display = 'flex';

        // Remove any unwanted paragraphs that might have been added
        this.removeUnwantedParagraphs();
    }

    removeImage() {
        const container = document.querySelector('.header-image-container');

        // Reset the container
        container.innerHTML = this.getEmptyStateHTML();
        container.classList.add('empty');

        // Remove any unwanted paragraphs
        this.removeUnwantedParagraphs();

        // Reattach event listeners
        this.setupEventListeners();
    }
} 