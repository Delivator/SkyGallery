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
        const videoElement = document.querySelector(`#video-${item.id}`);
        if (!videoElement) return;
        if (!item.canplay) return;
        item.status = "processing";
        item.log = item.log.replace(/^Up.*thu.*\.(\n|$)/gm, "");
        item.log = item.log.replace(/^Gen.*\.(\n|$)/gm, "");
        item.log += "Generating thumbnail... ";
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        if (!item.skylinks.thumbnail) {
          videoElement.currentTime = 0;
          await sleep(250);
        }
        canvas
          .getContext("2d")
          .drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        try {
          let file = await imageCompression.canvasToFile(canvas, "image/jpeg");
          let blob = await imageCompression(file, options);
          item.thumbnailBlob = blob;
          item.thumbnail = URL.createObjectURL(item.thumbnailBlob);
          item.log += "done.\n";

          let fileName = item.filename.split(".").reverse();
          fileName[0] = "jpg";
          fileName[1] += "-thumbnail";
          fileName = fileName.reverse().join(".");

          item.status = "uploading";
          item.log += "Uploading thumbnail... ";

          this.generateThumbnails();
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
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
};
