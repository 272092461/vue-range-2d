<template>
  <div class="vue-range-2d" ref="area" :style="{height: realArea.height + 'px'}">
    <canvas :width="realArea.width" :height="realArea.height" ref="canvas"></canvas>
    <div class="range-box">
      <span class="range-pointer pointer1"
        :style="{left: range.left, top: range.top}"
        @touchstart.prevent="dragstart($event, 0)"
        @mousedown.prevent="dragstart($event, 0)"
      >
      </span>
      <span class="range-pointer pointer2"
        :style="{left: range.center, top: range.top}"
        @touchstart.prevent="dragstart($event, 1)"
        @mousedown.prevent="dragstart($event, 1)"
      >
      </span>
      <span class="range-pointer pointer3"
        :style="{left: range.right, top: range.top}"
        @touchstart.prevent="dragstart($event, 2)"
        @mousedown.prevent="dragstart($event, 2)"
      >
      </span>
      <span class="range-pointer pointer4"
        :style="{left: range.right, top: range.middle}"
        @touchstart.prevent="dragstart($event, 3)"
        @mousedown.prevent="dragstart($event, 3)"
      >
      </span>
      <span class="range-pointer pointer5"
        :style="{left: range.right, top: range.bottom}"
        @touchstart.prevent="dragstart($event, 4)"
        @mousedown.prevent="dragstart($event, 4)"
      >
      </span>
      <span class="range-pointer pointer6"
        :style="{left: range.center, top: range.bottom}"
        @touchstart.prevent="dragstart($event, 5)"
        @mousedown.prevent="dragstart($event, 5)"
      >
      </span>
      <span class="range-pointer pointer7"
        :style="{left: range.left, top: range.bottom}"
        @touchstart.prevent="dragstart($event, 6)"
        @mousedown.prevent="dragstart($event, 6)"
      >
      </span>
      <span class="range-pointer pointer8"
        :style="{left: range.left, top: range.middle}"
        @touchstart.prevent="dragstart($event, 7)"
        @mousedown.prevent="dragstart($event, 7)"
      >
      </span>
      <div class="range-area"
        :style="{left: range.left, width: range.width, top: range.top, height: range.height}"
        @touchstart.prevent="dragstart($event, 8)"
        @mousedown.prevent="dragstart($event, 8)"
      >
        <span class="range-info">{{range.offsetWidth}} x {{range.offsetHeight}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 坐标区域大小
      width: parseInt(this.rangeMaxWidth),
      height: parseInt(this.rangeMaxHeight),
      // 选区最小值
      minWidth: parseInt(this.rangeMinWidth),
      minHeight: parseInt(this.rangeMinHeight),
      // 真实canvas宽度
      offsetWidth: 0,
      // canvas中选区范围
      range_right: 0,
      range_left: 0,
      range_top: 0,
      range_bottom: 0,
      startX: 0,
      startY: 0,
      // canvas context
      ctx: null,
      // 图片DoM
      image: null,
      middleware: [
        this.minRangeLimit,
        this.topRange,
        this.leftRange,
        this.bottomRange,
        this.rightRange,
        this.moveInside
      ]
    }
  },
  props: {
    rangeMaxWidth: [String, Number],
    rangeMaxHeight: [String, Number],
    rangeMinWidth: [String, Number],
    rangeMinHeight: [String, Number],
    rangeTop: [String, Number],
    rangeRight: [String, Number],
    rangeBottom: [String, Number],
    rangeLeft: [String, Number],
    isFullRange: {
      default: false
    },
    imageUrl: [String],
    quality: {
      default: 1
    },
    mimeType: {
      default: 'image/png'
    }
  },
  methods: {
    // range to blob
    getImageBlob: function (callback) {
      return new Promise ((res, rej) => {
        const canvas = this.createRangeCanvas()
        canvas.toBlob((blob) => {
          res(blob)
          callback && callback(blob)
        }, this.mimeType, this.quality)
      })
    },
    // range to DataUrl
    getImageData: function (callback) {
      return this.createRangeCanvas().toDataURL(this.mineType, this.quality)
    },
    // 创建选区内的图片canvas
    createRangeCanvas: function () {
      const canvas = document.createElement('canvas')
      const {top, right, bottom, left} = this.getRange()
      const width = right - left
      const height = bottom - top
      const naturalWidth = this.image.naturalWidth
      const naturalHeight = this.image.naturalHeight
      const rate = naturalWidth / this.width
      canvas.setAttribute('width', width)
      canvas.setAttribute('height', height)
      debugger
      console.log('try')
      let context = canvas.getContext('2d')
      context.drawImage(this.image, left * rate, top * rate, width * rate, height * rate, 0, 0, width, height)
      return canvas
    },
    // 以区域中心为原点的坐标值
    getRangeCenter: function () {
      let halfWidth = this.width / 2
      let halfHeight = this.height /2
      let pos = this.getRange()
      // 坐标原点变换
      pos.top -= halfHeight
      pos.bottom -= halfHeight
      pos.left -= halfWidth
      pos.right -= halfWidth

      return pos
    },
    // 获得坐标区域选区
    getRange: function () {
      let times = this.width / this.realArea.width
      return {
        right: ~~(this.range_right * times),
        left: ~~(this.range_left * times),
        top: ~~(this.range_top * times),
        bottom: ~~(this.range_bottom * times)
      }
    },
    // 改变选区
    changeRange: function (e) {
      // 选区改变策略 cw 为宽度改变， 0 不变， 1 改变range_left, -1 改变range_right, ch: 1 => range_top, -1 => range_bottom
      // mw 平移x轴  mh 平移y轴
      let strategys = {
        0: {cw: 1, ch: 1},
        1: {cw: 0, ch: 1},
        2: {cw: -1, ch: 1},
        3: {cw: -1, ch: 0},
        4: {cw: -1, ch: -1},
        5: {cw: 0, ch: -1},
        6: {cw: 1, ch: -1},
        7: {cw: 1, ch: 0},
        8: {cw: 0, ch: 0, mw: true, mh: true}
      }

      let moveStatus = {
        ...strategys[this.rangetype],
        moveX: ~~(e.clientX - this.startX),
        moveY: ~~(e.clientY - this.startY) 
      }

      this.middleware.forEach(fn => fn.bind(this)(moveStatus))

      let {cw, ch, mw, mh, moveX, moveY} = moveStatus

      if (cw > 0 || mw) {
        this.range_left += moveX
      }
      if (cw < 0 || mw) {
        this.range_right += moveX
      }
      if (ch > 0 || mh) {
        this.range_top += moveY
      }
      if (ch < 0 || mh) {
        this.range_bottom += moveY
      }
      this.startX = e.clientX
      this.startY = e.clientY
    },
    // 拖动坐标点
    dragstart: function (e, type) {
      let area = this.$refs.area
      window.addEventListener('mousemove', this.changeRange)
      window.addEventListener('mouseup', this.dragEnd)
      window.addEventListener('touchmove', this.changeRange)
      window.addEventListener('touchend', this.dragEnd)

      this.rangetype = type
      this.startX = e.clientX
      this.startY = e.clientY
    },
    // 拖动设置range top、left
    dragTopLeft: function (e) {
      this.changeRange(e, 1, 1)
    },
    // 拖动结束
    dragEnd: function () {
      let area = this.$refs.area
      window.removeEventListener('mousemove', this.changeRange)
      window.removeEventListener('mouseup', this.dragEnd)
      window.removeEventListener('touchmove', this.changeRange)
      window.removeEventListener('touchend', this.dragEnd)
    },
    // set offsetWidth
    setOffsetWidth: function () {
      this.offsetWidth = this.$refs.area.clientWidth
    },
    // 最小选区限制
    minRangeLimit: function (status) {
      if(status.cw || status.ch) {
        let rate = this.realArea.width / this.width
        let rate2 = this.width / this.realArea.width
        let minRangeWidth = this.minWidth * rate
        let minRangeHeight = this.minHeight * rate
        let {moveX, moveY} = status
        if (status.ch == 1 && this.range_top + moveY > this.range_bottom - minRangeHeight) {
          this.range_top = (this.range_bottom * rate2 - this.minHeight) * rate
          status.ch = 0
        } else if (status.ch == -1 && this.range_bottom + moveY < this.range_top + minRangeHeight) {
          this.range_bottom = this.range_top + minRangeHeight
          status.ch = 0
        }
        if (status.cw == 1 && this.range_left + moveX > this.range_right - minRangeWidth) {
          this.range_left = this.range_right - minRangeWidth
          status.cw = 0
        } else if (status.cw == -1 && this.range_right + moveX < this.range_left + minRangeWidth) {
          this.range_right = this.range_left + minRangeWidth
          status.cw = 0
        }
      }
    },
    // 选区只能在区域内移动
    moveInside: function (status) {
      if (status.mh || status.mw) {
        let {range_right, range_left, range_top, range_bottom} = this
        let {moveX, moveY} = status
        // x轴移动超过边界
        if (range_right + moveX > this.realArea.width) {
          status.mw = false
          let old = this.range_right
          this.range_right = this.realArea.width
          this.range_left += this.range_right - old
        } else if (range_left + moveX < 0) {
          status.mw = false
          let old = this.range_left
          this.range_left = 0
          this.range_right += this.range_left - old
        }
        // y轴移动超过边界
        if (range_bottom + moveY > this.realArea.height) {
          status.mh = false
          let old = this.range_bottom
          this.range_bottom = this.realArea.height
          this.range_top += this.range_bottom - old
        } else if (range_top + moveY < 0) {
          status.mh = false
          let old = this.range_top
          this.range_top = 0
          this.range_bottom += this.range_top - old
        }
      }
    },
    // top线区域控制
    topRange: function (status) {
      if (status.ch == 1) {
        let {moveX, moveY} = status
        if(this.range_top + moveY < 0) {
          this.range_top = 0
          status.ch = 0
        } else if (this.range_top + moveY + 10 >= this.range_bottom) {
          this.range_top = this.range_bottom - 10
          status.ch = 0
        }
      }
    },
    // bottom线区域控制
    bottomRange: function (status) {
      if (status.ch == -1) {
        let {moveX, moveY} = status
        if(this.range_bottom + moveY > this.realArea.height) {
          this.range_bottom = this.realArea.height
          status.ch = 0
        } else if (this.range_bottom + moveY - 10 <= this.range_top) {
          this.range_bottom = this.range_top + 10
          status.ch = 0
        }
      }
    },
    // top线区域控制
    leftRange: function (status) {
      if (status.cw == 1) {
        let {moveX, moveY} = status
        if(this.range_left + moveX < 0) {
          this.range_left = 0
          status.cw = 0
        } else if (this.range_left + moveX + 10 >= this.range_right) {
          this.range_left = this.range_right - 10
          status.cw = 0
        }
      }
    },
    // bottom线区域控制
    rightRange: function (status) {
      if (status.cw == -1) {
        let {moveX, moveY} = status
        if(this.range_right + moveX > this.realArea.width) {
          this.range_right = this.realArea.width
          status.cw = 0
        } else if (this.range_right + moveX - 10 <= this.range_left) {
          this.range_right = this.range_left + 10
          status.cw = 0
        }
      }
    },
    posInit: function () {
      if(this.isFullRange) {
        this.range_top = 0
        this.range_right = this.realArea.width
        this.range_bottom = this.realArea.height
        this.range_left = 0
        return
      }
      let pos = {
        top: parseInt(this.rangeTop),
        right: parseInt(this.rangeRight),
        bottom: parseInt(this.rangeBottom),
        left: parseInt(this.rangeLeft),
      }

      let {top, right, bottom, left} = this.toCanvasPos(pos)
  
      this.range_top = top
      this.range_right = right
      this.range_bottom = bottom
      this.range_left = left

      this.$nextTick(this.drawCanvas)
    },
    // 转换为canvas上的坐标
    toCanvasPos: function ({top, right, bottom, left}) {
      let rate = this.realArea.width / this.width
      return {
        top: top * rate,
        right: right * rate,
        bottom: bottom * rate,
        left: left * rate
      }
    },
    // 绘制图片
    initImage: function () {
      if(this.imageUrl) {
        let image = new Image ()
        image.setAttribute('src', this.imageUrl)
        image.onload = () => {
          this.image = image
          this.drawCanvas()
        }
        image.onerror = (e) => {
          console.log(e)
        }
      }
    },
    drawCanvas: function () {
      // 清空
      this.ctx.globalAlpha = 1
      this.ctx.clearRect(0, 0, this.realArea.width, this.realArea.height);
      if (this.image) {
        this.ctx.drawImage(this.image, 0, 0, this.realArea.width, this.realArea.height)
      }
      this.drawShadow()
    },
    drawShadow: function () {
      this.ctx.globalAlpha = 0.5
      this.ctx.fillStyle = "black";
      this.ctx.beginPath();
      // 利用非0环绕数规则，绘制非选中区域
      // 逆时针边界
      this.ctx.moveTo(0, 0)
      this.ctx.lineTo(0, this.realArea.height)
      this.ctx.lineTo(this.realArea.width, this.realArea.height)
      this.ctx.lineTo(this.realArea.width, 0)
      this.ctx.moveTo(0, 0)
      // 顺时针选区
      this.ctx.rect(
        this.range_left,
        this.range_top,
        this.range_right- this.range_left,
        this.range_bottom - this.range_top
      )
      // this.ctx.moveTo(this.range_left, this.range_top)
      // this.ctx.lineTo(this.range_left, this.range_bottom)
      // this.ctx.lineTo(this.range_right, this.range_bottom)
      // this.ctx.lineTo(this.range_right, this.range_top)
      // this.ctx.lineTo(this.range_left, this.range_top)
      // 利用4个矩形绘制路径
      // // 顶部未选中区域
      // this.ctx.rect(0, 0, this.realArea.width, this.range_top)
      // // 右侧未选中区域
      // this.ctx.rect(this.range_right, 0, this.realArea.width - this.range_right, this.realArea.height)
      // // 底部未选中区域
      // this.ctx.rect(0, this.range_bottom, this.realArea.width, this.realArea.height - this.range_bottom)
      // // 左侧未选中区域
      // this.ctx.rect(0, 0, this.range_left, this.realArea.height)
      this.ctx.fill()
      this.ctx.closePath();
      
    }
  },
  computed: {
    // canvas区域宽高
    realArea: function () {
      let realWidth = this.offsetWidth
      let realHeight = ~~(realWidth / this.width * this.height)
      return {
        width: realWidth,
        height: realHeight
      }
    },
    // canvas坐标中的选区属性
    range: function () {
      let center = this.range_left + (this.range_right - this.range_left)/2
      let middle = this.range_top + (this.range_bottom - this.range_top)/2

      let {
        top: offsetTop,
        bottom: offsetBottom,
        left: offsetLeft,
        right: offsetRight
      } = this.getRange()

      return {
        right: this.range_right + 'px',
        left: this.range_left + 'px',
        top: this.range_top + 'px',
        bottom: this.range_bottom + 'px',
        center: center + 'px',
        middle: middle + 'px',
        width: this.range_right - this.range_left + 'px',
        height: this.range_bottom - this.range_top + 'px',
        offsetWidth: offsetRight - offsetLeft,
        offsetHeight: offsetBottom - offsetTop
      }
    }
  },
  watch: {
    range: function (val, oldval) {
      this.drawCanvas()
    }
  },
  mounted: function () {
    this.ctx = this.$refs.canvas.getContext('2d')
    this.$nextTick(this.setOffsetWidth)
    this.$nextTick(this.posInit)
    this.$nextTick(this.initImage)
    this.range_right = this.realArea.width
    this.range_bottom = this.realArea.height
  } 
}
</script>

<style lang="scss">
// 选区边框颜色
$range-color: #39f;

@mixin position-full {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.vue-range-2d {
  position: relative;
  width: 100%;
  canvas {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC")
  }
  .range-box {
    position: absolute;
    @include position-full;
  }
  .range-area {
    position: absolute;
    cursor: move;
    z-index: 1;
    border: 1px solid $range-color;
  }
  $pointer-width: 9px;
  .range-pointer {
    position: absolute;
    background-color: $range-color;
    width: $pointer-width;
    height: $pointer-width;
    z-index: 2;
    margin-left: - floor($pointer-width / 2);
    margin-top: - floor($pointer-width / 2);
  }

  $cursors: "nw", "n", "ne", "w", "nw", "s", "sw", "w";
  @for $i from 1 through length($cursors) {
    .pointer#{$i} {
      cursor: unquote(nth($cursors, $i) + -resize);
    }
  }
  .range-info {
    position: absolute;
    background: rgba(0,0,0,.8);
    color: white;
    line-height: 20px;
    font-size: 12px;
    padding: 0 10px;
    white-space: nowrap;
  }
}

</style>
