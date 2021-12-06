<template>
  <div id="viewDiv"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as intl from "@arcgis/core/intl";

//本地化
intl.setLocale("zh-CN");

export default defineComponent({
  name: "WebMap",
  props: {
    map_id: String,
  },
  async mounted() {
    const app = await import("../webmap/map");
    app.initialize(this.$el);
    app.addLayerToMap(app.tzqhLayer);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import url(https://js.arcgis.com/4.20/esri/themes/light/main.css);
#viewDiv {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  position: relative;
  //隐藏溢出的柱状图
  overflow: hidden;
}
</style>
