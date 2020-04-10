<template>
  <v-container class="text-center">
    <v-row>
      <v-col cols="12" class="head">
        <h1 class="display-3">Welcome to SkyGallery</h1>
        <span class="subtitle-1"
          >Powered by
          <a
            href="https://siasky.net/"
            target="_blank"
            rel="noopener noreferrer"
            class="white--text"
            >Skynet</a
          ></span
        >
      </v-col>
      <v-col cols="12" class="logo">
        <v-img
          :src="require('../assets/skynet-logo-animated.svg')"
          contain
          height="400"
        />
      </v-col>
      <v-col cols="12" class="subtext">
        <span class="display-1">
          Start by creating a
          <v-btn color="primary" to="create" outlined
            ><v-icon left>add</v-icon>new album</v-btn
          >
          or open an existing one
        </span>
        <v-text-field
          single-line
          placeholder="Paste Skynet or sia:// link"
          outlined
          style="width: 14rem"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.subtext > * {
  display: inline-block;
}
.subtext > span {
  margin-right: 1rem;
}
.head {
  margin: 5rem 0;
}
.logo {
  margin-bottom: 5rem;
}
</style>

<script>
export default {
  name: "HelloWorld",

  data: () => ({
    //
  })
};
</script>
