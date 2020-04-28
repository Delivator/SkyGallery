export const uploadFiles = {
  methods: {
    async uploadFiles() {
      // Max three uploads at once
      if (this.items.filter(upload => upload.status === "uploading").length > 2)
        return;

      let index = this.items.findIndex(upload => upload.status === "processed");

      if (index < 0) return;

      let id = this.items[index].id;
      let item = this.items.find(item => item.id === id);

      item.status = "uploading";
      if (item.thumbnailBlob) {
        item.log += "Uploading thumbnail... ";

        let fileName = item.file.name.split(".").reverse();
        fileName[1] += "-thumbnail";
        await this.uploadBlob(item.thumbnailBlob, fileName.reverse().join("."))
          .then(skylink => {
            item.thumbnail = `/${skylink}`;
            item.log += "done.\n";
            this.uploadFiles();
          })
          .catch(error => {
            this.alertBox.send("error", error);
            item.log += "Error.\n";
            this.uploadFiles();
          });
      }
      item.log += "Uploading image... ";
      await this.uploadBlob(item.file, item.name)
        .then(skylink => {
          item.skylink = skylink;
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
