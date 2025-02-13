class AuthorProfileManager {
    constructor() {
        this.initializeModal();
        this.bindEvents();
    }

    initializeModal() {
        const modalHTML = `
            <div class="author-modal-overlay">
                <div class="author-modal">
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="author-modal-header">
                        <div class="author-avatar"></div>
                        <div class="author-info">
                            <h2>Andrei Bogdan</h2>
                            <p>Solopreneur & Noob Developer</p>
                        </div>
                    </div>
                    <div class="social-links">
                        <a href="https://www.youtube.com/@andreibogdandev" class="social-link" target="_blank">
                            <i class="fab fa-youtube"></i>
                            YouTube
                        </a>
                        <a href="https://x.com/TheAndreiBogdan" class="social-link" target="_blank">
                            <i class="fa-brands fa-x-twitter"></i>
                            X (Twitter)
                        </a>
                        <a href="https://www.linkedin.com/in/andrei-bogdan-%E2%98%A6%EF%B8%8F-b62324302/" class="social-link" target="_blank">
                            <i class="fab fa-linkedin"></i>
                            LinkedIn
                        </a>
                        <a href="https://github.com/theandreibogdan" class="social-link" target="_blank">
                            <i class="fab fa-github"></i>
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.querySelector('.author-modal-overlay');
    }

    bindEvents() {
        const profileButton = document.querySelector('.header-controls .icon-btn:nth-child(7)');
        const closeButton = this.modal.querySelector('.close-modal');

        profileButton.addEventListener('click', () => this.openModal());
        closeButton.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal.style.display = 'flex';
        // Trigger reflow
        this.modal.offsetHeight;
        this.modal.classList.add('active');
        this.modal.querySelector('.author-modal').classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.modal.querySelector('.author-modal').classList.remove('active');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 200);
    }
} 