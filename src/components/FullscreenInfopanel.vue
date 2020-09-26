<template>
  <div class="info-panel">
    <!--  -->
  </div>
</template>

<style scoped>
.info-panel {
  position: fixed;
  width: 20vw;
}
</style>

<script>
import { utils } from "../mixins/utils";

export default {
  name: "FullscreenInfopanel",
  props: [],
  mixins: [utils],
  data() {
    return {
      diashowTimeout: null,
    };
  },
};
</script>
