export const uploadFiles = {
  methods: {
    async uploadFiles() {
      // Max five uploads at once
      if (this.items.filter(item => item.status === "uploading").length > 4)
        return;

      let index = this.items.findIndex(item => item.status === "processed");

      if (index < 0) return;

      let id = this.items[index].id;
      let item = this.items.find(el => el.id === id);

      item.status = "uploading";
      item.log += "Uploading files... ";
      let files = [[item.file, item.file.name]];
      if (item.thumbnailBlob) {
        let fileName = item.file.name.split(".").reverse();
        fileName[1] += "-thumbnail";
        fileName = fileName.reverse().join(".");
        files.push([item.thumbnailBlob, fileName]);
      }
      await this.uploadBlobs(files, item.id)
        .then(skylinks => {
          if (skylinks.thumbnail) item.thumbnail = skylinks.thumbnail;
          item.skylinks = skylinks;
          item.status = "finished";
          item.log += "done.\n";
          this.uploadFiles();
        })
        .catch(error => {
          this.alertBox.send("error", error);
          item.status = "error";
          item.log += "Error.";
          this.uploadFiles();
        });
    }
  }
};
