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

      let item = this.items[index];

      let options = {
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };

      if (item.type === "image") {
        item.status = "processing";
        item.log += "Generating thumbnail... ";

        try {
          const blob = await imageCompression(item.file, options);
          item.thumbnailBlob = blob;
          item.thumbnail = URL.createObjectURL(item.thumbnailBlob);
          item.status = "processed";
          item.log += "done\n";
          this.$forceUpdate();
          this.uploadFiles();
          this.generateThumbnails();
        } catch (error) {
          item.log += "\nError while generating the thumbnail!";
          item.status = "error";
          console.error(error);
        }
      } else if (item.type === "video") {
        const videoElement = document.querySelector(`#video-${item.id}`);
        if (!videoElement) return;
        if (!item.canplay) return;
        item.status = "processing";
        item.log = item.log.replace(/^Up.*thu.*(\n|$)/gm, "");
        item.log = item.log.replace(/^Gen.*(\n|$)/gm, "");
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
          item.log += "done\n";
          item.status = "processed";
          this.uploadFiles();
          this.generateThumbnails();
        } catch (error) {
          item.status = "error";
          item.log += "Error generating thumbnail";
          console.error(error);
        }
      }
    },
  },
};
