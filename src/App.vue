<template>
  <WebMap />
</template>

<script lang="ts">
import WebMap from "@/components/WebMap.vue"; // @ is an alias to /src
export default {
  name: "App",
  components: {
    WebMap,
  },
};
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
