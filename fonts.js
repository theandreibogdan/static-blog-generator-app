const fonts = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Ubuntu',
    'Nunito', 'Source Sans Pro', 'PT Sans', 'Rubik', 'Work Sans', 'Inter',
    'Quicksand', 'Noto Sans', 'Roboto Condensed', 'Oswald', 'Roboto Mono',
    'Roboto Slab', 'Merriweather', 'Playfair Display', 'Fira Sans', 'Mulish',
    'Noto Serif', 'Source Code Pro', 'Inconsolata', 'Space Mono', 'DM Sans',
    'Karla', 'Josefin Sans', 'IBM Plex Sans', 'IBM Plex Mono', 'IBM Plex Serif',
    'Crimson Text', 'Dancing Script', 'Pacifico', 'Caveat', 'Permanent Marker',
    'Architects Daughter', 'Indie Flower', 'Shadows Into Light', 'Sacramento',
    'Satisfy', 'Great Vibes', 'Amatic SC', 'Lobster', 'Comfortaa', 'Righteous',
    'Fredoka One', 'Patrick Hand', 'Abril Fatface', 'Passion One', 'Russo One',
    'Concert One', 'Bungee', 'Press Start 2P'
];

class FontManager {
    constructor() {
        this.loadedFonts = new Set();
        this.loadingFonts = new Set();
        this.fontLoadingQueue = [...fonts];
    }

    async loadGoogleFont(font) {
        if (this.loadedFonts.has(font) || this.loadingFonts.has(font)) return;

        this.loadingFonts.add(font);
        const formattedFont = font.replace(/ /g, '+');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';

        try {
            await new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
            this.loadedFonts.add(font);
        } catch (error) {
            console.error(`Failed to load font: ${font}`);
        } finally {
            this.loadingFonts.delete(font);
            this.updateFontLoadingStatus();
        }
    }

    updateFontLoadingStatus() {
        const label = document.querySelector('.font-loading-status');
        if (!label) return;

        const totalFonts = fonts.length;
        const loadedCount = this.loadedFonts.size;

        if (loadedCount < totalFonts) {
            label.textContent = `Loading fonts (${loadedCount}/${totalFonts})...`;
            label.style.color = '#f0ad4e';
        } else {
            label.textContent = `All fonts loaded`;
            label.style.color = '#5cb85c';
        }
    }

    async loadFontsInBackground() {
        const BATCH_SIZE = 5;
        const DELAY = 500;

        while (this.fontLoadingQueue.length > 0) {
            const batch = this.fontLoadingQueue.splice(0, BATCH_SIZE);
            await Promise.all(batch.map(font => this.loadGoogleFont(font)));
            if (this.fontLoadingQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, DELAY));
            }
        }
    }

    createFontSelector() {
        const wrapper = document.querySelector('.font-select-wrapper');
        if (!wrapper) return;

        const currentSelect = wrapper.querySelector('select');
        const selectedFont = currentSelect?.value || 'Roboto';

        wrapper.innerHTML = this.createFontSelectorHTML(selectedFont);
        this.initializeFontSelector(wrapper);
    }

    createFontSelectorHTML(selectedFont) {
        return `
            <div class="font-select" style="display: none;">
                <div class="font-search-container">
                    <input type="text" class="font-search" placeholder="Search fonts...">
                </div>
                <div class="font-options">
                    ${fonts.sort().map(font => `
                        <div class="font-option ${font === selectedFont ? 'selected' : ''}" 
                             data-font="${font}" 
                             style="font-family: ${font}">
                            <span>
                                ${font} - The quick brown fox jumps over the lazy dog
                            </span>
                            ${!this.loadedFonts.has(font) ? '<div class="font-loading-spinner"></div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="selected-font">
                <span style="font-family: ${selectedFont}">${selectedFont}</span>
            </div>
        `;
    }

    initializeFontSelector(wrapper) {
        const fontSelect = wrapper.querySelector('.font-select');
        const selectedDisplay = wrapper.querySelector('.selected-font');
        const searchInput = wrapper.querySelector('.font-search');
        const options = wrapper.querySelectorAll('.font-option');

        this.setupFontSelectorEvents(wrapper, fontSelect, selectedDisplay, searchInput, options);
        this.startLoadingStateUpdates(options);
    }

    setupFontSelectorEvents(wrapper, fontSelect, selectedDisplay, searchInput, options) {
        selectedDisplay.addEventListener('click', () => {
            const isHidden = fontSelect.style.display === 'none';
            fontSelect.style.display = isHidden ? 'block' : 'none';
            selectedDisplay.classList.toggle('hidden', isHidden);
            if (isHidden) searchInput.focus();
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                fontSelect.style.display = 'none';
                selectedDisplay.classList.remove('hidden');
            }
        });

        this.setupFontOptions(options, selectedDisplay, fontSelect);
        this.setupFontSearch(searchInput, options);
    }

    setupFontOptions(options, selectedDisplay, fontSelect) {
        options.forEach(option => {
            option.addEventListener('click', async () => {
                const font = option.dataset.font;
                await this.loadGoogleFont(font);

                document.documentElement.style.setProperty('--selected-font', `'${font}', sans-serif`);
                selectedDisplay.querySelector('span').textContent = font;
                selectedDisplay.querySelector('span').style.fontFamily = `'${font}', sans-serif`;
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                fontSelect.style.display = 'none';
                selectedDisplay.classList.remove('hidden');
            });
        });
    }

    setupFontSearch(searchInput, options) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            options.forEach(option => {
                const fontName = option.dataset.font.toLowerCase();
                option.style.display = fontName.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

    startLoadingStateUpdates(options) {
        const loadingStateInterval = setInterval(() => {
            this.updateFontOptionLoadingState(options);
            if (this.loadedFonts.size === fonts.length) {
                clearInterval(loadingStateInterval);
            }
        }, 100);
    }

    updateFontOptionLoadingState(options) {
        options.forEach(option => {
            const font = option.dataset.font;
            const spinner = option.querySelector('.font-loading-spinner');

            if (this.loadedFonts.has(font)) {
                spinner?.remove();
                option.classList.remove('loading');
            } else {
                option.classList.add('loading');
                if (!spinner) {
                    const newSpinner = document.createElement('div');
                    newSpinner.className = 'font-loading-spinner';
                    option.appendChild(newSpinner);
                }
            }
        });
    }
}

// Export for use in other files
window.FontManager = FontManager; 