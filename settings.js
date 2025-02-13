class SettingsManager {
    constructor() {
        this.appContainer = document.querySelector('.app-container');
        this.settingsBtn = document.querySelector('.settings-btn');
        this.blocksBtn = document.querySelector('.blocks-btn');
        this.editor = document.querySelector('.editor');
        this.leftSidebar = document.querySelector('.sidebar');
        this.init();

        // Add preview mode awareness
        this.previewMode = false;
        document.addEventListener('click', (e) => {
            if (e.target.closest('.preview-mode-btn')) {
                this.previewMode = !this.previewMode;
            }
        });

        this.screenSizes = {
            mobile: {
                width: 360,
                padding: { top: 40, right: 24, bottom: 40, left: 24 }
            },
            tablet: {
                width: 768,
                padding: { top: 80, right: 60, bottom: 80, left: 60 }
            },
            desktop: {
                sm: {
                    width: 1000,
                    padding: { top: 120, right: 100, bottom: 120, left: 100 }
                },
                md: {
                    width: 1200,
                    padding: { top: 140, right: 120, bottom: 140, left: 120 }
                },
                lg: {
                    width: 1400,
                    padding: { top: 160, right: 140, bottom: 160, left: 140 }
                },
                xl: {
                    width: 1600,
                    padding: { top: 180, right: 160, bottom: 180, left: 160 }
                }
            }
        };

        this.currentDevice = 'desktop-sm'; // Set default to desktop small
    }

    init() {
        if (!this.settingsBtn || !this.blocksBtn) return;

        this.createSettingsSidebar();
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.blocksBtn.addEventListener('click', () => this.toggleBlocks());

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                this.toggleSettings();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleBlocks();
            }
        });

        // Set initial state based on HTML class
        if (this.appContainer.classList.contains('blocks-open')) {
            this.blocksBtn.classList.add('active');
            this.leftSidebar.style.transform = 'translateX(0)';
            this.leftSidebar.style.opacity = '1';
            this.editor.style.marginLeft = 'var(--sidebar-width)';
        }
    }

    createSettingsSidebar() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'settings-sidebar';

        // Update the sidebar HTML to include the new controls
        sidebar.innerHTML = `
            <div class="settings-content">
                <div class="settings-section device-preview">
                    <h3>Preview Size</h3>
                    <div class="device-switcher">
                        <button class="device-btn" data-device="mobile" data-tooltip="Mobile">
                            <i class="fas fa-mobile-alt"></i>
                        </button>
                        <button class="device-btn" data-device="tablet" data-tooltip="Tablet">
                            <i class="fas fa-tablet-alt"></i>
                        </button>
                        <button class="device-btn active" data-device="desktop" id="desktop-btn" data-tooltip="Desktop">
                            <i class="fas fa-desktop"></i>
                        </button>
                    </div>
                    <div class="desktop-sizes">
                        <button class="size-btn active" data-device="desktop-sm">
                            <i class="fas fa-desktop"></i>
                            <span>Small (1000px)</span>
                        </button>
                        <button class="size-btn" data-device="desktop-md">
                            <i class="fas fa-desktop"></i>
                            <span>Medium (1200px)</span>
                        </button>
                        <button class="size-btn" data-device="desktop-lg">
                            <i class="fas fa-desktop"></i>
                            <span>Large (1400px)</span>
                        </button>
                        <button class="size-btn" data-device="desktop-xl">
                            <i class="fas fa-desktop"></i>
                            <span>Extra Large (1600px)</span>
                        </button>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Content Width</h3>
                    <div class="settings-control">
                        <label>Max Width</label>
                        <div class="range-with-value">
                            <input type="range" min="360" max="1600" value="1200" 
                                data-style="maxWidth" 
                                data-selector=".editor-content"
                                class="width-range">
                            <span class="value">1200px</span>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Content Padding</h3>
                    <div class="padding-controls">
                        <div class="settings-control">
                            <label>Top Padding</label>
                            <div class="range-with-value">
                                <input type="range" min="0" max="300" value="40" 
                                    data-padding="top"
                                    class="padding-range">
                                <span class="value">40px</span>
                            </div>
                        </div>
                        <div class="settings-control">
                            <label>Right Padding</label>
                            <div class="range-with-value">
                                <input type="range" min="0" max="300" value="48" 
                                    data-padding="right"
                                    class="padding-range">
                                <span class="value">48px</span>
                            </div>
                        </div>
                        <div class="settings-control">
                            <label>Bottom Padding</label>
                            <div class="range-with-value">
                                <input type="range" min="0" max="300" value="40" 
                                    data-padding="bottom"
                                    class="padding-range">
                                <span class="value">40px</span>
                            </div>
                        </div>
                        <div class="settings-control">
                            <label>Left Padding</label>
                            <div class="range-with-value">
                                <input type="range" min="0" max="300" value="48" 
                                    data-padding="left"
                                    class="padding-range">
                                <span class="value">48px</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Spacing</h3>
                    <div class="settings-control">
                        <label>Block Spacing</label>
                        <div class="range-with-value">
                            <input type="range" min="8" max="48" value="16" 
                                data-style="marginBottom" 
                                data-selector=".editor-content > *">
                            <span class="value">16px</span>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Container Style</h3>
                    <div class="settings-control">
                        <label>Border Radius</label>
                        <div class="range-with-value">
                            <input type="range" min="0" max="24" value="12" 
                                data-style="borderRadius" 
                                data-selector=".editor-content">
                            <span class="value">12px</span>
                        </div>
                    </div>
                    
                    <div class="settings-control">
                        <label>Shadow Intensity</label>
                        <div class="range-with-value">
                            <input type="range" min="0" max="24" value="12" 
                                data-style="boxShadow" 
                                data-selector=".editor-content">
                            <span class="value">12px</span>
                        </div>
                    </div>
                </div>

                <button class="advanced-settings-btn">
                    <i class="fas fa-cog"></i>
                    Advanced Settings
                </button>
                
                <div class="advanced-settings">
                    <div class="tracking-code-field">
                        <label>
                            <i class="fab fa-google"></i>
                            Google Analytics Tracking Code
                        </label>
                        <textarea 
                            placeholder="<!-- Paste your Google Analytics code here -->"
                            spellcheck="false"
                            data-tracking="google-analytics"
                        ></textarea>
                        <div class="helper-text">
                            <i class="fas fa-info-circle"></i>
                            Paste your Google Analytics tracking code here (starts with <!-- Google tag (gtag.js) -->)
                        </div>
                    </div>

                    <div class="tracking-code-field">
                        <label>
                            <i class="fab fa-microsoft"></i>
                            Microsoft Clarity Tracking Code
                        </label>
                        <textarea 
                            placeholder="<!-- Paste your Microsoft Clarity code here -->"
                            spellcheck="false"
                            data-tracking="microsoft-clarity"
                        ></textarea>
                        <div class="helper-text">
                            <i class="fas fa-info-circle"></i>
                            Paste your Microsoft Clarity tracking code here (starts with <!-- Clarity tracking code -->)
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.appContainer.appendChild(sidebar);
        this.settingsSidebar = sidebar;

        // Add input event listeners
        sidebar.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => this.handleSettingChange(e));
            // Initialize value display
            this.updateValueDisplay(input);
        });

        // Add device switcher listeners
        this.initDeviceSwitcher(sidebar);
        this.initPaddingControls(sidebar);

        // Set initial active state for desktop-sm
        setTimeout(() => {
            const desktopBtn = sidebar.querySelector('#desktop-btn');
            const desktopSmBtn = sidebar.querySelector('[data-device="desktop-sm"]');
            if (desktopBtn && desktopSmBtn) {
                desktopBtn.classList.add('active');
                desktopSmBtn.classList.add('active');

                // Update the editor content with default size
                const editorContent = document.querySelector('.editor-content');
                const widthRange = sidebar.querySelector('.width-range');
                this.updateDeviceSize('desktop-sm', widthRange, editorContent);
            }
        }, 0);

        // Add the advanced settings toggle handler
        const advancedBtn = sidebar.querySelector('.advanced-settings-btn');
        const advancedSettings = sidebar.querySelector('.advanced-settings');

        advancedBtn.addEventListener('click', () => {
            const isVisible = advancedSettings.style.display === 'block';
            advancedBtn.classList.toggle('active');

            if (!isVisible) {
                advancedSettings.style.display = 'block';
                // Trigger reflow
                advancedSettings.offsetHeight;
                advancedSettings.style.animation = 'slideDown 0.3s ease forwards';
            } else {
                advancedSettings.style.animation = 'slideDown 0.3s ease reverse';
                setTimeout(() => {
                    advancedSettings.style.display = 'none';
                }, 300);
            }
        });

        // Add tracking code save functionality
        const trackingFields = sidebar.querySelectorAll('[data-tracking]');
        trackingFields.forEach(field => {
            // Load saved tracking codes
            const savedCode = localStorage.getItem(`tracking-${field.dataset.tracking}`);
            if (savedCode) {
                field.value = savedCode;
            }

            // Save tracking codes on change
            field.addEventListener('input', () => {
                localStorage.setItem(`tracking-${field.dataset.tracking}`, field.value);
            });
        });
    }

    handleSettingChange(e) {
        const input = e.target;
        const value = input.value;
        const style = input.dataset.style;
        const selector = input.dataset.selector;
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            if (style === 'boxShadow') {
                element.style[style] = `0 2px ${value}px rgba(0, 0, 0, 0.08)`;
            } else {
                element.style[style] = `${value}px`;
            }
        });

        this.updateValueDisplay(input);
    }

    updateValueDisplay(input) {
        const valueDisplay = input.parentElement.querySelector('.value');
        if (valueDisplay) {
            // Make the value span editable
            valueDisplay.contentEditable = true;
            valueDisplay.textContent = `${input.value}px`;

            // Handle value editing
            valueDisplay.addEventListener('focus', () => {
                valueDisplay.textContent = valueDisplay.textContent.replace('px', '');
            });

            valueDisplay.addEventListener('blur', () => {
                let newValue = parseInt(valueDisplay.textContent);
                if (isNaN(newValue)) {
                    newValue = input.value;
                } else {
                    // Clamp the value between min and max
                    newValue = Math.min(Math.max(newValue, input.min), input.max);
                    input.value = newValue;
                }
                valueDisplay.textContent = `${newValue}px`;

                // Trigger the input event to update the editor
                input.dispatchEvent(new Event('input'));
            });

            valueDisplay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    valueDisplay.blur();
                }
            });
        }
    }

    toggleSettings() {
        // Don't allow toggling if in preview mode
        if (this.previewMode) return;

        const isOpen = this.appContainer.classList.toggle('settings-open');

        // Toggle settings button state
        this.settingsBtn.classList.toggle('active');
        const settingsIcon = this.settingsBtn.querySelector('i');
        settingsIcon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';

        // Handle sidebar transitions
        if (isOpen) {
            this.settingsSidebar.style.transform = 'translateX(0)';
            this.editor.style.marginRight = 'var(--sidebar-width)';
        } else {
            this.settingsSidebar.style.transform = 'translateX(100%)';
            this.editor.style.marginRight = '0';
        }
    }

    toggleBlocks() {
        // Don't allow toggling if in preview mode
        if (this.previewMode) return;

        const isOpen = this.appContainer.classList.toggle('blocks-open');

        // Toggle blocks button state
        this.blocksBtn.classList.toggle('active');
        const blocksIcon = this.blocksBtn.querySelector('i');
        blocksIcon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';

        // Handle sidebar transitions
        if (isOpen) {
            this.leftSidebar.style.transform = 'translateX(0)';
            this.leftSidebar.style.opacity = '1';
            this.editor.style.marginLeft = 'var(--sidebar-width)';
        } else {
            this.leftSidebar.style.transform = 'translateX(-100%)';
            this.leftSidebar.style.opacity = '0';
            this.editor.style.marginLeft = '0';
        }
    }

    initDeviceSwitcher(sidebar) {
        const deviceBtns = sidebar.querySelectorAll('.device-btn');
        const sizeBtns = sidebar.querySelectorAll('.size-btn');
        const desktopBtn = sidebar.querySelector('#desktop-btn');
        const desktopSizes = sidebar.querySelector('.desktop-sizes');
        const widthRange = sidebar.querySelector('.width-range');
        const editorContent = document.querySelector('.editor-content');

        // Handle desktop button click with smooth animation
        desktopBtn.addEventListener('click', () => {
            const sizes = sidebar.querySelector('.desktop-sizes');
            const isShowing = sizes.classList.contains('show');

            // Deselect other buttons if showing sizes
            if (!isShowing) {
                deviceBtns.forEach(btn => {
                    if (btn !== desktopBtn) btn.classList.remove('active');
                });
            }

            if (!isShowing) {
                sizes.style.display = 'flex';
                // Trigger reflow
                sizes.offsetHeight;
                sizes.classList.add('show');
                desktopBtn.classList.add('active');
            } else {
                sizes.classList.remove('show');
                // Only remove active if no size is selected
                if (!this.currentDevice.startsWith('desktop-')) {
                    desktopBtn.classList.remove('active');
                }
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    if (!sizes.classList.contains('show')) {
                        sizes.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Handle device button clicks (mobile and tablet)
        deviceBtns.forEach(btn => {
            if (btn.id !== 'desktop-btn') {
                btn.addEventListener('click', () => {
                    const device = btn.dataset.device;
                    this.currentDevice = device;

                    // Remove active class from all buttons
                    deviceBtns.forEach(b => b.classList.remove('active'));
                    sizeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Close desktop sizes panel
                    desktopSizes.classList.remove('show');
                    setTimeout(() => {
                        desktopSizes.style.display = 'none';
                    }, 300);

                    this.updateDeviceSize(device, widthRange, editorContent);
                });
            }
        });

        // Handle size button clicks
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const device = btn.dataset.device;
                this.currentDevice = device;

                // Remove active class from size buttons
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Ensure desktop button stays active
                deviceBtns.forEach(b => b.classList.remove('active'));
                desktopBtn.classList.add('active');

                // Close the dropdown with animation
                desktopSizes.classList.remove('show');
                setTimeout(() => {
                    desktopSizes.style.display = 'none';
                }, 300);

                this.updateDeviceSize(device, widthRange, editorContent);
            });
        });

        // Close desktop sizes panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#desktop-btn') && !e.target.closest('.desktop-sizes')) {
                desktopSizes.classList.remove('show');
                setTimeout(() => {
                    desktopSizes.style.display = 'none';
                }, 300);

                // Only remove active if no size is selected
                if (!this.currentDevice.startsWith('desktop-')) {
                    desktopBtn.classList.remove('active');
                }
            }
        });
    }

    updateDeviceSize(device, widthRange, editorContent) {
        let width, padding;
        if (device.startsWith('desktop-')) {
            const size = device.split('-')[1];
            width = this.screenSizes.desktop[size].width;
            padding = this.screenSizes.desktop[size].padding;
        } else {
            width = this.screenSizes[device].width;
            padding = this.screenSizes[device].padding;
        }

        // Update the width range input
        widthRange.value = width;
        this.updateValueDisplay(widthRange);

        // Update the padding range inputs
        Object.entries(padding).forEach(([side, value]) => {
            const input = this.settingsSidebar.querySelector(`[data-padding="${side}"]`);
            if (input) {
                input.value = value;
                this.updateValueDisplay(input);
            }
        });

        // Apply the changes with transition
        editorContent.style.transition = 'all 0.3s ease-in-out';
        editorContent.style.maxWidth = `${width}px`;
        editorContent.style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    }

    initPaddingControls(sidebar) {
        const paddingInputs = sidebar.querySelectorAll('.padding-range');
        const editorContent = document.querySelector('.editor-content');

        paddingInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const side = input.dataset.padding;
                const value = e.target.value;

                editorContent.style.transition = 'padding 0.3s ease-in-out';
                editorContent.style[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] = `${value}px`;

                this.updateValueDisplay(input);
            });
        });
    }
}

// Initialize settings manager
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
}); 