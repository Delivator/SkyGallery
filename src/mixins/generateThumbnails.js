import imageCompression from "browser-image-compression";

export const generateThumbnails = {
  methods: {
    generateThumbnails() {
      // Only process one image at the time
      if (this.items.find((upload) => upload.status === "processing")) return;

      let index = this.items.findIndex((upload) => upload.status === "queued");

      if (index < 0) return;

      let id = this.items[index].id;
      let item = this.items.find((item) => item.id === id);

      if (index < 0) return;
      item.status = "processing";
      item.log += "Generating thumbnail... ";
      let options = {
        maxWidthOrHeight: 500,
      };

      imageCompression(item.file, options)
        .then((blob) => {
          item.thumbnailBlob = blob;
          item.thumbnail = URL.createObjectURL(item.thumbnailBlob);
          item.status = "processed";
          item.log += "done.\n";
          this.$forceUpdate();
          this.uploadFiles();
          this.generateThumbnails();
        })
        .catch(console.error);
    },
  },
};
