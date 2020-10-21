<template>
  <v-dialog
    :value="unfinishedDialog"
    max-width="500"
    @input="$emit('update:unfinishedDialog', unfinishedDialog)"
  >
    <v-card>
      <v-card-title>
        You have unfinished uploads that will be lost. <br />
        Are you sure you want to continue?
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn outlined color="primary" @click="publish(null, true)">
          Yes
        </v-btn>
        <v-btn color="error" @click="$emit('update:unfinishedDialog', false)">
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
