class ModalBuilder {
    constructor() {
        this.modal = null;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'crop-modal';
        modal.innerHTML = `
            <div class="crop-container">
                <div class="crop-header">
                    <h3>Crop Image</h3>
                    <button class="close-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="crop-content">
                    <div class="crop-preview-container">
                        <div class="crop-area">
                            <img class="crop-image" src="" alt="Image to crop">
                        </div>
                        <div class="preview-area">
                            <h4>Quality Preview</h4>
                            <div class="preview-image-container">
                                <img class="preview-image" src="" alt="Quality preview">
                            </div>
                        </div>
                    </div>
                    <div class="quality-control">
                        <div class="quality-header">
                            <span>Image Quality</span>
                            <span class="quality-value">80%</span>
                        </div>
                        <input type="range" 
                               class="quality-slider" 
                               min="10" 
                               max="100" 
                               value="80"
                               step="5">
                        <div class="quality-info">
                            <span class="file-size">Estimated size: --</span>
                            <span class="quality-hint">Higher quality = Larger file size</span>
                        </div>
                    </div>
                    <div class="crop-controls">
                        <button class="crop-btn secondary">
                            <i class="fas fa-undo"></i>
                            Reset
                        </button>
                        <button class="crop-btn primary">
                            <i class="fas fa-crop"></i>
                            Apply Crop
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
    }

    setupEventListeners(onClose, onApply, onReset, onQualityChange) {
        const closeBtn = this.modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', onClose);

        const applyBtn = this.modal.querySelector('.crop-btn.primary');
        applyBtn.addEventListener('click', onApply);

        const resetBtn = this.modal.querySelector('.crop-btn.secondary');
        resetBtn.addEventListener('click', onReset);

        const qualitySlider = this.modal.querySelector('.quality-slider');
        qualitySlider.addEventListener('input', (e) => onQualityChange(e.target.value));
    }

    show() {
        this.modal.classList.add('visible');
    }

    hide() {
        this.modal.classList.remove('visible');
    }
}

class ImageCompressor {
    constructor(maxImageSize) {
        this.maxImageSize = maxImageSize;
        this.quality = 0.8;
    }

    async compress(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = this.calculateNewDimensions(img.width, img.height);

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((compressedBlob) => {
                        if (compressedBlob.size > this.maxImageSize && this.quality > 0.2) {
                            this.quality -= 0.1;
                            this.compress(blob).then(resolve);
                        } else {
                            this.quality = 0.8;
                            resolve(compressedBlob);
                        }
                    }, 'image/jpeg', this.quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(blob);
        });
    }

    calculateNewDimensions(width, height) {
        const maxDimension = 1920;

        if (width <= maxDimension && height <= maxDimension) {
            return { width, height };
        }

        if (width > height) {
            return {
                width: maxDimension,
                height: Math.round((height / width) * maxDimension)
            };
        } else {
            return {
                width: Math.round((width / height) * maxDimension),
                height: maxDimension
            };
        }
    }
}

class LoadingStateManager {
    constructor(container) {
        this.container = container;
    }

    show() {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'crop-loading';
        loadingEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading image...';
        this.container.appendChild(loadingEl);
    }

    hide() {
        const loadingEl = this.container.querySelector('.crop-loading');
        if (loadingEl) {
            loadingEl.remove();
        }
    }
}

class CropperUtils {
    static async getCroppedBlob(cropper, quality) {
        if (!cropper) return null;

        const canvas = cropper.getCroppedCanvas({
            width: 1600,
            height: 900,
        });

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
        });
    }
}

class ImageCropper {
    constructor() {
        this.modalBuilder = new ModalBuilder();
        this.modalBuilder.createModal();
        this.modalBuilder.setupEventListeners(
            () => this.hide(),
            () => this.applyCrop(),
            () => this.resetCrop(),
            (value) => this.updateQuality(value)
        );

        this.cropper = null;
        this.imageCompressor = new ImageCompressor(1024 * 1024);
        this.loadingStateManager = new LoadingStateManager(this.modalBuilder.modal.querySelector('.crop-area'));
        this.previewDebounceTimeout = null;
    }

    updateQuality(value) {
        this.imageCompressor.quality = value / 100;
        const qualityValue = this.modalBuilder.modal.querySelector('.quality-value');
        qualityValue.textContent = `${value}%`;

        if (this.previewDebounceTimeout) {
            clearTimeout(this.previewDebounceTimeout);
        }
        this.previewDebounceTimeout = setTimeout(() => {
            this.updatePreview();
        }, 100);
    }

    async updatePreview() {
        const fileSize = this.modalBuilder.modal.querySelector('.file-size');
        const previewImage = this.modalBuilder.modal.querySelector('.preview-image');
        fileSize.textContent = 'Calculating...';

        try {
            const blob = await CropperUtils.getCroppedBlob(this.cropper, this.imageCompressor.quality);
            const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            fileSize.textContent = `Estimated size: ${sizeMB}MB`;
            fileSize.className = 'file-size' + (blob.size > this.imageCompressor.maxImageSize ? ' warning' : '');

            const url = URL.createObjectURL(blob);
            previewImage.src = url;

            previewImage.onload = () => {
                URL.revokeObjectURL(url);
            };
        } catch (error) {
            fileSize.textContent = 'Error calculating size';
        }
    }

    show(imageUrl, onCropComplete) {
        this.onCropComplete = onCropComplete;
        const image = this.modalBuilder.modal.querySelector('.crop-image');

        const qualitySlider = this.modalBuilder.modal.querySelector('.quality-slider');
        qualitySlider.value = 80;
        this.imageCompressor.quality = 0.8;
        this.updateQuality(80);

        this.loadingStateManager.show();

        const img = new Image();
        img.onload = () => {
            image.src = imageUrl;
            this.loadingStateManager.hide();

            if (this.cropper) {
                this.cropper.destroy();
            }

            this.cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                viewMode: 1,
                guides: true,
                autoCropArea: 1,
                crop: () => {
                    this.updatePreview();
                }
            });
        };
        img.src = imageUrl;

        this.modalBuilder.show();
    }

    hide() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        this.modalBuilder.hide();
    }

    async applyCrop() {
        if (!this.cropper) return;

        const applyBtn = this.modalBuilder.modal.querySelector('.crop-btn.primary');
        const originalText = applyBtn.innerHTML;
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cropping...';

        const blob = await CropperUtils.getCroppedBlob(this.cropper, 1);
        const compressedBlob = await this.imageCompressor.compress(blob);

        applyBtn.disabled = false;
        applyBtn.innerHTML = originalText;

        this.onCropComplete(URL.createObjectURL(compressedBlob));
        this.hide();
    }

    resetCrop() {
        if (this.cropper) {
            this.cropper.reset();
        }
    }
} 