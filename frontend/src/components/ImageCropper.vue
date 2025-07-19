<template>
  <div v-if="show" class="cropper-overlay" @click="$emit('cancel')">
    <div class="cropper-modal" @click.stop>
      
      <div class="cropper-header">
        <button class="cropper-btn-cancel" @click="$emit('cancel')">
          Annuler
        </button>
        <h3 class="cropper-title">
          {{ cropType === 'avatar' ? 'Modifier votre photo de profil' : 'Modifier votre bannière' }}
        </h3>
        <button class="cropper-btn-save" @click="applyCrop" :disabled="!imageLoaded">
          Appliquer
        </button>
      </div>

      
      <div class="cropper-container">
        <div class="cropper-canvas-container" ref="canvasContainer">
          <canvas 
            ref="canvas" 
            class="cropper-canvas"
            @mousedown="startDrag"
            @mousemove="drag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            @wheel="handleZoom"
          ></canvas>
          
          
          <div class="cropper-overlay-mask" :class="{ 'circular': cropType === 'avatar' }">
            <div class="cropper-selection" :class="{ 'circular': cropType === 'avatar' }"></div>
          </div>
        </div>

        
        <div class="cropper-controls">
          
          <div class="control-group">
            <label class="control-label">Zoom</label>
            <div class="zoom-control">
              <button @click="adjustZoom(-0.1)" class="zoom-btn">-</button>
              <input 
                type="range" 
                v-model="zoom" 
                min="0.1" 
                max="3" 
                step="0.05"
                class="zoom-slider"
                @input="updateCanvas"
              />
              <button @click="adjustZoom(0.1)" class="zoom-btn">+</button>
            </div>
          </div>

          
          <div v-if="cropType === 'avatar'" class="control-group">
            <label class="control-label">Rotation</label>
            <div class="rotation-control">
              <button @click="rotate(-90)" class="rotate-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.91c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/>
                </svg>
              </button>
              <input 
                type="range" 
                v-model="rotation" 
                min="0" 
                max="360" 
                step="1"
                class="rotation-slider"
                @input="updateCanvas"
              />
              <button @click="rotate(90)" class="rotate-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"/>
                </svg>
              </button>
            </div>
          </div>

          
          <div class="control-group">
            <button @click="resetTransform" class="reset-btn">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageCropper',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    imageData: {
      type: String,
      required: true
    },
    cropType: {
      type: String,
      required: true,
      validator: value => ['avatar', 'banner'].includes(value)
    }
  },
  data() {
    return {

      canvas: null,
      ctx: null,
      image: null,
      imageLoaded: false,

      zoom: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,

      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,

      cropWidth: 300,
      cropHeight: 300
    }
  },
  computed: {
    cropAspectRatio() {
      return this.cropType === 'avatar' ? 1 : 3; // 1:1 for avatar, 3:1 for banner
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initCanvas();
        });
      }
    },
    imageData(newVal) {
      if (newVal) {
        this.loadImage();
      }
    }
  },
  mounted() {
    if (this.show) {
      this.$nextTick(() => {
        this.initCanvas();
      });
    }
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');

      if (this.cropType === 'avatar') {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.cropWidth = 300;
        this.cropHeight = 300;
      } else {
        this.canvas.width = 600;
        this.canvas.height = 300;
        this.cropWidth = 500;
        this.cropHeight = 167; // 3:1 aspect ratio
      }
      
      this.loadImage();
    },
    
    loadImage() {
      if (!this.imageData) return;
      
      this.image = new Image();
      this.image.onload = () => {
        this.imageLoaded = true;
        this.resetTransform();
        this.updateCanvas();
      };
      this.image.src = this.imageData;
    },
    
    resetTransform() {
      this.zoom = 1;
      this.rotation = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.updateCanvas();
    },
    
    updateCanvas() {
      if (!this.canvas || !this.ctx || !this.image || !this.imageLoaded) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.save();

      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

      this.ctx.rotate((this.rotation * Math.PI) / 180);
      this.ctx.scale(this.zoom, this.zoom);
      this.ctx.translate(this.offsetX, this.offsetY);

      const imageWidth = this.image.width;
      const imageHeight = this.image.height;
      this.ctx.drawImage(
        this.image,
        -imageWidth / 2,
        -imageHeight / 2,
        imageWidth,
        imageHeight
      );

      this.ctx.restore();
    },
    
    startDrag(e) {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    },
    
    drag(e) {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      
      this.offsetX += deltaX / this.zoom;
      this.offsetY += deltaY / this.zoom;
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      
      this.updateCanvas();
    },
    
    endDrag() {
      this.isDragging = false;
    },
    
    handleZoom(e) {
      e.preventDefault();
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      this.adjustZoom(zoomDelta);
    },
    
    adjustZoom(delta) {
      const newZoom = Math.max(0.1, Math.min(3, this.zoom + delta));
      this.zoom = newZoom;
      this.updateCanvas();
    },
    
    rotate(degrees) {
      this.rotation = (this.rotation + degrees) % 360;
      if (this.rotation < 0) this.rotation += 360;
      this.updateCanvas();
    },
    
    applyCrop() {
      if (!this.canvas || !this.ctx || !this.image || !this.imageLoaded) return;

      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');

      cropCanvas.width = this.cropWidth;
      cropCanvas.height = this.cropHeight;

      const cropX = (this.canvas.width - this.cropWidth) / 2;
      const cropY = (this.canvas.height - this.cropHeight) / 2;

      cropCtx.drawImage(
        this.canvas,
        cropX, cropY, this.cropWidth, this.cropHeight,
        0, 0, this.cropWidth, this.cropHeight
      );

      cropCanvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$emit('crop-complete', {
            dataUrl: e.target.result,
            blob: blob,
            cropType: this.cropType
          });
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.9);
    }
  }
}
</script>

<style scoped>
.cropper-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(40, 48, 63, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.cropper-modal {
  background: var(--white);
  border-radius: var(--border-radius);
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
}

.cropper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: white;
}

.cropper-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--title-color);
}

.cropper-btn-cancel,
.cropper-btn-save {
  padding: 8px 16px;
  border: none;
  border-radius: calc(var(--border-radius) * 2.5);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cropper-btn-cancel {
  background: var(--primary-bg);
  color: var(--dark);
  border: 1px solid #e8e8e8;
}

.cropper-btn-cancel:hover {
  background: var(--primary-light);
  border-color: var(--primary-light);
}

.cropper-btn-save {
  background: var(--accent);
  color: var(--white);
}

.cropper-btn-save:hover:not(:disabled) {
  background: var(--title-color);
}

.cropper-btn-save:disabled {
  background: #aab8c2;
  cursor: not-allowed;
}

.cropper-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.cropper-canvas-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  overflow: hidden;
}

.cropper-canvas {
  display: block;
  cursor: grab;
  border-radius: var(--border-radius);
}

.cropper-canvas:active {
  cursor: grabbing;
}

.cropper-overlay-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(40, 48, 63, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.cropper-selection {
  background: transparent;
  border: 2px solid var(--accent);
  box-shadow: 
    0 0 0 1000px rgba(40, 48, 63, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.cropper-selection:not(.circular) {
  width: 500px;
  height: 167px;
}

.cropper-selection.circular {
  width: 300px;
  height: 300px;
  border-radius: 50%;
}

.cropper-controls {
  width: 250px;
  padding: 20px;
  background: white;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--title-color);
}

.zoom-control,
.rotation-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-btn,
.rotate-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e8e8e8;
  background: var(--white);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  color: var(--dark);
}

.zoom-btn:hover,
.rotate-btn:hover {
  background: var(--primary-light);
  border-color: var(--accent);
  color: var(--title-color);
}

.zoom-slider,
.rotation-slider {
  flex: 1;
  height: 4px;
  background: #e8e8e8;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.zoom-slider::-webkit-slider-thumb,
.rotation-slider::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  appearance: none;
}

.zoom-slider::-moz-range-thumb,
.rotation-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.reset-btn {
  padding: 10px 16px;
  background: var(--white);
  border: 1px solid #e8e8e8;
  border-radius: var(--border-radius);
  color: var(--dark);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: var(--primary-light);
  border-color: var(--accent);
  color: var(--title-color);
}


@media (max-width: 768px) {
  .cropper-modal {
    width: 95vw;
    height: 95vh;
  }
  
  .cropper-container {
    flex-direction: column;
  }
  
  .cropper-controls {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    border-left: none;
    border-top: 1px solid #e8e8e8;
  }
  
  .control-group {
    flex: 1;
    min-width: 150px;
  }
}
</style>

