import imageCompression from "browser-image-compression";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const generateThumbnails = {
  methods: {
    async generateThumbnails() {
      // Only process one image at the time
      if (this.items.find((upload) => upload.status === "processing")) return;

      let index = this.items.findIndex((upload) => upload.status === "queued");

      if (index < 0) return;

      let id = this.items[index].id;
      let item = this.items.find((item) => item.id === id);

      let options = {
        maxWidthOrHeight: 500,
      };

      if (item.type === "image") {
        item.status = "processing";
        item.log += "Generating thumbnail... ";

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
      } else if (item.type === "video") {
        if (!item.videoElement)
          item.videoElement = document.querySelector(`#video-${item.id}`);
        if (!item.videoElement) return;
        item.status = "processing";
        item.log = item.log.replace(/^Up.*thu.*\.(\n|$)/gm, "");
        item.log = item.log.replace(/^Gen.*\.(\n|$)/gm, "");
        item.log += "Generating thumbnail... ";
        let canvas = document.createElement("canvas");
        canvas.width = item.videoElement.videoWidth;
        canvas.height = item.videoElement.videoHeight;
        if (!item.skylinks.thumbnail) {
          item.videoElement.currentTime = 0;
        }
        await sleep(500);
        canvas
          .getContext("2d")
          .drawImage(item.videoElement, 0, 0, canvas.width, canvas.height);
        try {
          let file = await imageCompression.canvasToFile(canvas, "image/jpeg");
          let blob = await imageCompression(file, options);
          item.thumbnailBlob = blob;
          item.thumbnail = URL.createObjectURL(item.thumbnailBlob);
          item.log += "done.\n";
          this.$forceUpdate();

          let fileName = item.filename.split(".").reverse();
          fileName[0] = "jpg";
          fileName[1] += "-thumbnail";
          fileName = fileName.reverse().join(".");

          item.log += "Uploading thumbnail... ";
          let skylink = await this.uploadBlob(blob, fileName);
          item.thumbnail = `${skylink}/${fileName}`;
          item.skylinks.thumbnail = item.thumbnail;
          item.log += "done.\n";

          if (item.skylinks.source) {
            item.status = "finished";
          } else {
            item.status = "processed";
          }

          this.uploadFiles();
          this.generateThumbnails();
          this.$forceUpdate();
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
};
