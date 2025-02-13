document.addEventListener('DOMContentLoaded', async () => {
    // Handle tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = {
        templates: document.querySelector('.template-options'),
        theme: document.querySelector('.theme-options'),
        seo: document.querySelector('.seo-options')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding content
            Object.values(tabContents).forEach(content => {
                if (content) {
                    content.style.display = 'none';
                }
            });
            const tabName = tab.textContent.toLowerCase();
            if (tabContents[tabName]) {
                tabContents[tabName].style.display = 'block';
            }
        });
    });

    // Theme controls
    document.querySelectorAll('.theme-control input, .theme-control select').forEach(control => {
        control.addEventListener('input', (e) => {
            const style = e.target.dataset.style;
            const unit = e.target.dataset.unit || '';
            const selector = e.target.dataset.selector || '*';
            const value = e.target.value + unit;

            // Update value display if it exists
            const valueDisplay = e.target.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('value')) {
                valueDisplay.textContent = value;
            }

            // Apply style to editor content
            const elements = document.querySelectorAll(
                selector.includes('.editor-content') ?
                    selector :
                    `.editor-content ${selector}`
            );

            elements.forEach(el => {
                if (style === 'linkColor') {
                    el.style.setProperty('--link-color', value);
                } else {
                    el.style[style] = value;
                }
            });
        });
    });

    // SEO controls
    document.querySelectorAll('.seo-control input, .seo-control textarea').forEach(control => {
        control.addEventListener('input', (e) => {
            const meta = e.target.dataset.meta;
            const value = e.target.value;

            // Update character count
            const countDisplay = e.target.nextElementSibling;
            if (countDisplay && countDisplay.classList.contains('character-count')) {
                const max = meta === 'description' ? 160 : 60;
                countDisplay.textContent = `${value.length}/${max}`;
                countDisplay.style.color = value.length > max ? '#ff4444' : '#666';
            }

            // Update meta tag
            let metaTag = document.querySelector(`meta[name="${meta}"], meta[property="${meta}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute(meta.startsWith('og:') ? 'property' : 'name', meta);
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', value);
        });
    });

    // Initialize font manager
    const fontManager = new FontManager();
    await fontManager.loadGoogleFont('Roboto');
    fontManager.createFontSelector();
    fontManager.loadFontsInBackground();

    // Add click handler for back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const url = backBtn.getAttribute('href');
            if (url) {
                window.location.href = url;
            }
        });
    }

    // Add this function to handle navigation
    function handleBackNavigation(e) {
        // Check if there are unsaved changes
        if (window.editor?.quill?.hasFocus()) {
            const confirmMessage = 'You have unsaved changes. Are you sure you want to leave?';
            if (!confirm(confirmMessage)) {
                e.preventDefault();
            }
        }
    }

    // Add the event listener
    document.querySelector('.back-btn').addEventListener('click', handleBackNavigation);
});