class PreviewManager {
    constructor() {
        this.appContainer = document.querySelector('.app-container');
        this.previewModeBtn = document.querySelector('.preview-mode-btn');
        this.mainContent = document.querySelector('.main-content');
        this.sidebar = document.querySelector('.sidebar');
        this.settingsSidebar = document.querySelector('.settings-sidebar');
        this.editor = document.querySelector('.editor');
        this.blocksBtn = document.querySelector('.blocks-btn');
        this.settingsBtn = document.querySelector('.settings-btn');

        // Add state tracking for sidebars
        this.sidebarStates = {
            blocks: false,
            settings: false
        };

        // Add preview mode state
        this.isPreviewMode = false;

        // Initialize settings sidebar if it exists
        if (this.settingsSidebar) {
            // Set initial transform and opacity
            this.settingsSidebar.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            this.settingsSidebar.style.transform = 'translateX(100%)';
            this.settingsSidebar.style.opacity = '0';
        }

        this.init();
    }

    init() {
        if (!this.previewModeBtn) return;

        this.previewModeBtn.addEventListener('click', () => this.togglePreviewMode());

        // Add keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                e.preventDefault(); // Prevent browser's print dialog
                this.togglePreviewMode();
            }
        });
    }

    togglePreviewMode() {
        const isEnteringPreview = !this.appContainer.classList.contains('preview-mode');
        this.isPreviewMode = isEnteringPreview;  // Track preview mode state

        // Show appropriate toast notification in top-center position
        if (isEnteringPreview) {
            window.toastManager.show({
                title: 'Preview Mode Enabled',
                description: 'You are now viewing the preview version of your content',
                type: 'info',
                duration: 3000,
                position: 'top-center'  // Changed from 'center' to 'top-center'
            });
        } else {
            window.toastManager.show({
                title: 'Edit Mode Enabled',
                description: 'You can now edit your content',
                type: 'success',
                duration: 3000,
                position: 'top-center'  // Changed from 'center' to 'top-center'
            });
        }

        if (isEnteringPreview) {
            // Store current sidebar states before entering preview
            this.sidebarStates.blocks = this.appContainer.classList.contains('blocks-open');
            this.sidebarStates.settings = this.appContainer.classList.contains('settings-open');

            // Hide both sidebars
            this.appContainer.classList.remove('blocks-open', 'settings-open');
            this.blocksBtn.classList.remove('active');
            this.settingsBtn.classList.remove('active');

            // Disable sidebar buttons
            this.blocksBtn.disabled = true;
            this.settingsBtn.disabled = true;

            // Add visual indication that buttons are disabled
            this.blocksBtn.style.opacity = '0.5';
            this.blocksBtn.style.cursor = 'not-allowed';
            this.settingsBtn.style.opacity = '0.5';
            this.settingsBtn.style.cursor = 'not-allowed';

            // Update sidebar transforms and margins
            if (this.sidebar) {
                this.sidebar.style.transform = 'translateX(-100%)';
                this.sidebar.style.opacity = '0';
            }
            if (this.settingsSidebar) {
                this.settingsSidebar.style.transform = 'translateX(100%)';
                this.settingsSidebar.style.opacity = '0';
                this.settingsSidebar.style.visibility = 'hidden';
            }

            // Reset editor margins
            this.editor.style.marginLeft = '0';
            this.editor.style.marginRight = '0';
        } else {
            // Re-enable sidebar buttons
            this.blocksBtn.disabled = false;
            this.settingsBtn.disabled = false;

            // Remove visual indication
            this.blocksBtn.style.opacity = '';
            this.blocksBtn.style.cursor = '';
            this.settingsBtn.style.opacity = '';
            this.settingsBtn.style.cursor = '';

            // Restore previous sidebar states
            if (this.sidebarStates.blocks) {
                this.appContainer.classList.add('blocks-open');
                this.blocksBtn.classList.add('active');
                this.sidebar.style.transform = 'translateX(0)';
                this.sidebar.style.opacity = '1';
                this.editor.style.marginLeft = 'var(--sidebar-width)';
            }

            if (this.sidebarStates.settings) {
                this.appContainer.classList.add('settings-open');
                this.settingsBtn.classList.add('active');
                if (this.settingsSidebar) {
                    this.settingsSidebar.style.visibility = 'visible';
                    this.settingsSidebar.style.transform = 'translateX(0)';
                    this.settingsSidebar.style.opacity = '1';
                    this.editor.style.marginRight = 'var(--sidebar-width)';
                }
            }
        }

        // Toggle preview mode class and button
        this.appContainer.classList.toggle('preview-mode');
        this.previewModeBtn.classList.toggle('active');

        // Update the icon with transition
        const icon = this.previewModeBtn.querySelector('i');
        if (isEnteringPreview) {
            icon.style.transform = 'rotate(360deg)';
            icon.classList.replace('fa-eye', 'fa-edit');
        } else {
            icon.style.transform = 'rotate(0deg)';
            icon.classList.replace('fa-edit', 'fa-eye');
        }

        // Update button title
        this.previewModeBtn.title = isEnteringPreview ? 'Exit preview mode' : 'Enter preview mode';

        // Update main content background with transition
        if (this.mainContent) {
            this.mainContent.style.backgroundColor = isEnteringPreview ? '#ffffff' : '';
        }

        // Handle media blocks with transition
        this.updateMediaBlocks(isEnteringPreview);
    }

    updateMediaBlocks(isPreviewMode) {
        document.querySelectorAll('.media-block').forEach(block => {
            block.classList.toggle('preview-mode', isPreviewMode);

            const previewBtn = block.querySelector('.preview-btn i');
            if (previewBtn) {
                previewBtn.textContent = isPreviewMode ? 'visibility_off' : 'visibility';
                // Add transition for the icon change
                previewBtn.style.transition = 'transform 0.3s ease';
                previewBtn.style.transform = isPreviewMode ? 'rotate(360deg)' : 'rotate(0deg)';
            }

            const overlay = block.querySelector('.preview-mode-overlay');
            if (overlay) {
                overlay.style.opacity = isPreviewMode ? '1' : '0';
                // Use setTimeout to handle display property after opacity transition
                if (isPreviewMode) {
                    overlay.style.display = 'flex';
                    setTimeout(() => overlay.style.opacity = '1', 0);
                } else {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.style.display = 'none', 300); // Match transition duration
                }
            }
        });
    }

    // Add method to check preview mode state
    isInPreviewMode() {
        return this.isPreviewMode;
    }
}

// Initialize preview manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.previewManager = new PreviewManager();
}); 