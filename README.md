# vue 2D坐标选择及图片裁剪工具

## 参数

```html
<!-- 基于webpack组件化开发 -->
<vue-range-2d
  ref="range"
  :imgUrl="option.img"
  :rangeMaxWidth="1920"
  :rangeMaxHeight="1080"
  :isFullRange="true"
></vue-range-2d>

<!-- 直接使用html开发需注意html不支持驼峰规则 -->
<vue-range-2d
  ref="range"
  :img-url="option.img"
  :range-max-width="1920"
  :range-max-height="1080"
  :is-full-range="true"
></vue-range-2d>
```

<table style="text-align: center">
  <thead>
    <tr>
        <td>名称</td>
        <td>功能</td>
        <td>默认值</td>
        <td>可选值</td>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>rangeMaxWidth</td>
        <td>选区最大宽度(此参数决定图片缩放大小,组件在浏览器中的宽度由父组件决定)</td>
        <td>必需</td>
        <td>Number</td>
    </tr>
    <tr>
        <td>rangeMaxHeight</td>
        <td>选区最大高度</td>
        <td>必需</td>
        <td>Number</td>
    </tr>
    <tr>
        <td>rangeMinWidth</td>
        <td>选区最小宽度</td>
        <td>空</td>
        <td>Number</td>
    </tr>
    <tr>
        <td>rangeMinHeight</td>
        <td>选区最小高度</td>
        <td>空</td>
        <td>Number</td>
    </tr>
    <tr>
        <td>rangeTop</td>
        <td>选区顶部坐标</td>
        <td>空</td>
        <td>0 - rangeBottom</td>
    </tr>
    <tr>
        <td>rangeBottom</td>
        <td>选区底部坐标</td>
        <td>空</td>
        <td>rangeTop - rangeMaxHeight</td>
    </tr>
    <tr>
        <td>rangeLeft</td>
        <td>选区左侧坐标</td>
        <td>空</td>
        <td>0 - rangeRight</td>
    </tr>
    <tr>
        <td>rangeRight</td>
        <td>选区右侧坐标</td>
        <td>空</td>
        <td>rangeLeft - rangeMaxWidth</td>
    </tr>
    <tr>
        <td>isFullRange</td>
        <td>是否选中整张图片</td>
        <td>false</td>
        <td>Boolean</td>
    </tr>
    <tr>
        <td>imgUrl</td>
        <td>裁剪图片的地址</td>
        <td>空</td>
        <td>url 地址 || base64 || blob</td>
    </tr>
    <tr>
        <td>quaility</td>
        <td>裁剪生成图片的质量</td>
        <td>1</td>
        <td>0.1 - 1</td>
    </tr>
  </tbody>
</table>

## 方法

```html
<vue-range-2d
  ref="range"
  :imgUrl="option.img"
  :rangeMaxWidth="1920"
  :rangeMaxHeight="1080"
  :isFullRange="true"
></vue-range-2d>
```

### 获取选区四条边界坐标(原点为左上角)

``` javascript
this.$refs.range.getRange()
// return {top, right, bottom, left}
```

### 获取选区图片blob(异步函数)

``` javascript
// 使用回调
this.$refs.range.getImageBlob((blob) => {

})
// 支持promise
this.$refs.range.getImageBlob().then((res) => {

})
```

### 获取选区图片DataURL

``` javascript
// 使用回调
this.$refs.range.getImageData()
```