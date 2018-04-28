import Vue from 'vue'
import Range2d from './index'

new Vue({
  el: '#app',
  components: {
    'v-range': Range2d
  },
  data () {
    return {
      image: null
    }
  },
  methods: {
    getImage: function () {
      this.image = this.$refs.range.getImageData()
    }
  }
})