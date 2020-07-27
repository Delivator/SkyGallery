<template>
  <v-dialog v-model="unfinishedDialog" max-width="400">
    <v-card>
      <v-card-title>
        You have unfinished uploads that will be lost, are you sure you want to
        continue?
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn outlined text @click="publish(null, true)">
          Yes
        </v-btn>
        <v-btn
          color="error"
          text
          @click="$emit('update:unfinishedDialog', false)"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "UploadDialog",
  props: ["unfinishedDialog", "publish"],
};
</script>
