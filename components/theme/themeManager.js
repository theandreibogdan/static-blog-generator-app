class ThemeManager {
    constructor() {
        this.themeOptions = document.querySelector('.theme-options');
        this.init();
    }

    init() {
        this.initializeRangeInputs();
        this.initializeFontSelector();
        this.initializeColorPickers();
        this.initializeResetButton();
        this.loadSavedTheme();
    }

    initializeRangeInputs() {
        const rangeInputs = this.themeOptions.querySelectorAll('input[type="range"]');
        
        rangeInputs.forEach(input => {
            const valueDisplay = input.parentElement.nextElementSibling;
            const unit = input.dataset.unit || '';

            // Set initial value
            valueDisplay.textContent = `${input.value}${unit}`;

            // Handle input changes
            input.addEventListener('input', (e) => {
                valueDisplay.textContent = `${e.target.value}${unit}`;
                this.applyStyle(input);
                this.debounceThemeSave();
            });

            // Handle direct value editing
            valueDisplay.addEventListener('blur', (e) => {
                let value = parseFloat(e.target.textContent);
                if (isNaN(value)) {
                    value = input.value;
                } else {
                    value = Math.min(Math.max(value, input.min), input.max);
                }
                input.value = value;
                valueDisplay.textContent = `${value}${unit}`;
                this.applyStyle(input);
                this.debounceThemeSave();
            });

            // Prevent invalid input
            valueDisplay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    valueDisplay.blur();
                }
            });
        });
    }

    initializeFontSelector() {
        const fontSelect = this.themeOptions.querySelector('.font-select');
        const fontSearch = this.themeOptions.querySelector('.font-search');
        const loadingStatus = this.themeOptions.querySelector('.font-loading-status');

        if (fontSelect && fontSearch) {
            // Debounce search
            let searchTimeout;
            fontSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = e.target.value.toLowerCase();
                    Array.from(fontSelect.options).forEach(option => {
                        const match = option.text.toLowerCase().includes(searchTerm);
                        option.style.display = match ? '' : 'none';
                    });
                }, 300);
            });

            // Handle font selection
            fontSelect.addEventListener('change', (e) => {
                this.applyFont(e.target.value);
                this.debounceThemeSave();
            });
        }
    }

    initializeColorPickers() {
        const colorInputs = this.themeOptions.querySelectorAll('input[type="color"]');
        
        colorInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.applyStyle(input);
            });

            input.addEventListener('change', () => {
                this.debounceThemeSave();
            });
        });
    }

    applyStyle(input) {
        const selector = input.dataset.selector;
        const style = input.dataset.style;
        const value = input.value + (input.dataset.unit || '');
        
        document.querySelectorAll(selector).forEach(element => {
            element.style[style] = value;
        });
    }

    applyFont(fontFamily) {
        const editor = document.querySelector('.editor-content');
        if (editor) {
            editor.style.fontFamily = fontFamily;
        }
    }

    // Debounced save to prevent excessive storage operations
    debounceThemeSave() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveTheme();
        }, 500);
    }

    saveTheme() {
        const theme = {
            ranges: {},
            colors: {},
            font: this.themeOptions.querySelector('.font-select')?.value
        };

        // Save range values
        this.themeOptions.querySelectorAll('input[type="range"]').forEach(input => {
            theme.ranges[input.dataset.selector + '-' + input.dataset.style] = input.value;
        });

        // Save color values
        this.themeOptions.querySelectorAll('input[type="color"]').forEach(input => {
            theme.colors[input.dataset.selector + '-' + input.dataset.style] = input.value;
        });

        localStorage.setItem('saved-theme', JSON.stringify(theme));
    }

    loadSavedTheme() {
        try {
            const savedTheme = JSON.parse(localStorage.getItem('saved-theme'));
            if (!savedTheme) return;

            // Apply saved range values
            Object.entries(savedTheme.ranges || {}).forEach(([key, value]) => {
                const [selector, style] = key.split('-');
                const input = this.themeOptions.querySelector(
                    `input[data-selector="${selector}"][data-style="${style}"]`
                );
                if (input) {
                    input.value = value;
                    this.applyStyle(input);
                    const valueDisplay = input.parentElement.nextElementSibling;
                    if (valueDisplay) {
                        valueDisplay.textContent = value + (input.dataset.unit || '');
                    }
                }
            });

            // Apply saved colors
            Object.entries(savedTheme.colors || {}).forEach(([key, value]) => {
                const [selector, style] = key.split('-');
                const input = this.themeOptions.querySelector(
                    `input[data-selector="${selector}"][data-style="${style}"]`
                );
                if (input) {
                    input.value = value;
                    this.applyStyle(input);
                }
            });

            // Apply saved font
            if (savedTheme.font) {
                const fontSelect = this.themeOptions.querySelector('.font-select');
                if (fontSelect) {
                    fontSelect.value = savedTheme.font;
                    this.applyFont(savedTheme.font);
                }
            }
        } catch (error) {
            console.error('Error loading saved theme:', error);
        }
    }

    initializeResetButton() {
        const resetButton = this.themeOptions.querySelector('#reset-theme');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all theme settings to defaults?')) {
                    localStorage.removeItem('saved-theme');
                    location.reload();
                }
            });
        }
    }
} 