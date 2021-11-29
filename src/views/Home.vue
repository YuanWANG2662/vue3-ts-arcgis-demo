<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <WebMap msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import WebMap from "@/components/WebMap.vue"; // @ is an alias to /src

@Options({
  components: {
    WebMap,
  },
})
export default class Home extends Vue {}
</script>
