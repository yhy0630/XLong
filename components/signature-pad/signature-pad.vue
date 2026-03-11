<template>
  <view class="sig-root">
    <canvas
      class="sig-canvas"
      :canvas-id="canvasId"
      :id="canvasId"
      :disable-scroll="true"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    ></canvas>
  </view>
</template>

<script>
function getTouchPoint(e) {
  const t = e?.touches?.[0] || e?.changedTouches?.[0];
  if (!t) return null;
  return { x: t.x, y: t.y };
}

export default {
  name: "SignaturePad",
  props: {
    canvasId: {
      type: String,
      default: "sigCanvas",
    },
    lineWidth: {
      type: Number,
      default: 4,
    },
    strokeStyle: {
      type: String,
      default: "#111111",
    },
    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
  },
  data() {
    return {
      ctx: null,
      drawing: false,
      hasSigned: false,
      lastPoint: null,
      canvasRect: { width: 0, height: 0 },
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      // 初始化绘图上下文
      this.ctx = uni.createCanvasContext(this.canvasId, this);
      this.ctx.setLineWidth(this.lineWidth);
      this.ctx.setLineCap("round");
      this.ctx.setLineJoin("round");
      this.ctx.setStrokeStyle(this.strokeStyle);

      // 获取 canvas 尺寸，用于导出时裁剪
      this.$nextTick(() => {
        uni
          .createSelectorQuery()
          .in(this)
          .select(`#${this.canvasId}`)
          .boundingClientRect((rect) => {
            if (rect) {
              this.canvasRect = { width: rect.width, height: rect.height };
              this.fillBackground();
            }
          })
          .exec();
      });
    },
    fillBackground() {
      if (!this.ctx) return;
      const w = this.canvasRect.width || 300;
      const h = this.canvasRect.height || 150;
      this.ctx.setFillStyle(this.backgroundColor);
      this.ctx.fillRect(0, 0, w, h);
      // 覆盖绘制，避免残留
      this.ctx.draw(false);
    },
    clear() {
      this.hasSigned = false;
      this.lastPoint = null;
      if (!this.ctx) this.initCanvas();
      const w = this.canvasRect.width || 300;
      const h = this.canvasRect.height || 150;
      // 先清空再铺底色，确保笔迹完全清除
      this.ctx.clearRect(0, 0, w, h);
      this.ctx.draw(false);
      this.fillBackground();
      this.$emit("change", false);
    },
    onTouchStart(e) {
      const p = getTouchPoint(e);
      if (!p || !this.ctx) return;
      this.drawing = true;
      this.lastPoint = p;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
    },
    onTouchMove(e) {
      if (!this.drawing || !this.ctx) return;
      const p = getTouchPoint(e);
      if (!p) return;
      const lp = this.lastPoint || p;
      this.ctx.beginPath();
      this.ctx.moveTo(lp.x, lp.y);
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
      this.ctx.draw(true);
      this.lastPoint = p;
      if (!this.hasSigned) {
        this.hasSigned = true;
        this.$emit("change", true);
      }
    },
    onTouchEnd() {
      this.drawing = false;
      this.lastPoint = null;
    },
    exportImage() {
      return new Promise((resolve, reject) => {
        if (!this.hasSigned) {
          reject(new Error("EMPTY_SIGNATURE"));
          return;
        }
        const w = Math.max(1, Math.floor(this.canvasRect.width || 300));
        const h = Math.max(1, Math.floor(this.canvasRect.height || 150));
        uni.canvasToTempFilePath(
          {
            canvasId: this.canvasId,
            width: w,
            height: h,
            destWidth: w * 2,
            destHeight: h * 2,
            fileType: "png",
            quality: 1,
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(err),
          },
          this
        );
      });
    },
  },
};
</script>

<style scoped>
.sig-root {
  width: 100%;
  height: 100%;
}
.sig-canvas {
  width: 100%;
  height: 100%;
  background: #ffffff;
}
</style>

