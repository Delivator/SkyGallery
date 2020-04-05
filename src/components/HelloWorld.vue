<template>
  <v-container fill-height>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/skynet-logo-animated.svg')"
          contain
          height="500"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HelloWorld",

  data: () => ({
    //
  })
};
</script>
