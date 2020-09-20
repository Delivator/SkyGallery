export const uploadFiles = {
  methods: {
    async uploadFiles() {
      // Max ten uploads at once
      if (
        this.items.filter((item) => /^(uploading|uploaded)$/.test(item.status))
          .length > 9
      )
        return;

      let index = this.items.findIndex((item) => item.status === "processed");

      if (index < 0) return;

      let id = this.items[index].id;
      let item = this.items.find((el) => el.id === id);

      item.status = "uploading";
      item.log += "progress";
      let files = {};

      if (item.file && !item.skylinks.source)
        files.source = [item.file, item.file.name];

      if (item.thumbnailBlob) {
        let fileName = item.file.name.split(".").reverse();
        fileName[0] = "jpg";
        fileName[1] += "-thumbnail";
        fileName = fileName.reverse().join(".");
        files.thumbnail = [item.thumbnailBlob, fileName];
      }

      if (files.length < 1) return;
      await this.uploadBlobs(files, item.id, item)
        .then((skylinks) => {
          console.log("uploadedBlobs", skylinks);
          Object.assign(item.skylinks, skylinks);
          if (skylinks.thumbnail) item.thumbnail = skylinks.thumbnail;
          item.status = "finished";
          item.log = item.log.replace("progress", "");
          item.log += "done.\n";
          this.$forceUpdate();
          this.uploadFiles();
        })
        .catch((error) => {
          console.error(error);
          item.status = "error";
          item.log = item.log.replace("progress", "");
          item.log += "Error.\n";
          this.uploadFiles();
        });
    },
  },
};
