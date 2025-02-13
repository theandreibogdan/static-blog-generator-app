class ToastManager {
    constructor() {
        this.containers = new Map();
        this.init();
    }

    init() {
        // Don't create any default container
    }

    getContainer(position = 'top-right') {
        if (!this.containers.has(position)) {
            const container = document.createElement('div');
            container.className = `toast-container ${position}`;
            document.body.appendChild(container);
            this.containers.set(position, container);
        }
        return this.containers.get(position);
    }

    show({ title, description = '', type = 'info', duration = 3000, position = 'top-right' }) {
        const container = this.getContainer(position);
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Remove the animation end handler since we don't need hover animations anymore
        if (type === 'error') {
            toast.addEventListener('animationend', () => {
                toast.style.animation = 'none'; // Prevent any future animations
            }, { once: true });
        }

        const iconPath = this.getIconPath(type);

        toast.innerHTML = `
            <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="${iconPath}" clip-rule="evenodd" />
            </svg>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${description ? `<div class="toast-description">${description}</div>` : ''}
            </div>
            <button class="toast-close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
            </button>
        `;

        // Insert new toast at the beginning for top positions
        if (position.startsWith('top')) {
            container.insertBefore(toast, container.firstChild);
        } else {
            container.appendChild(toast);
        }

        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        if (duration) {
            setTimeout(() => {
                if (toast.parentElement) {
                    this.dismiss(toast);
                }
            }, duration);
        }

        return toast;
    }

    dismiss(toast) {
        // Remove any existing animations before adding fade-out
        toast.style.animation = '';

        // Add fade-out class to trigger animation
        toast.classList.add('fade-out');

        // Remove the toast after animation completes
        setTimeout(() => {
            if (toast.parentElement) {
                // Ensure smooth removal by fading out first
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';

                // Remove the element after transition
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.parentElement.removeChild(toast);
                    }
                }, 300);
            }
        }, 300);
    }

    getIconPath(type) {
        switch (type) {
            case 'success':
                return "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z";
            case 'error':
                return "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z";
            case 'warning':
                return "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.25-5.75a.75.75 0 1 0 1.5 0v-3.5a.75.75 0 0 0-1.5 0v3.5Zm.75 1.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z";
            default: // info
                return "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-7.25a.75.75 0 1 1-1.5 0v-3.5a.75.75 0 1 1 1.5 0v3.5ZM10 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z";
        }
    }
}

// Initialize toast manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.toastManager = new ToastManager();
}); 