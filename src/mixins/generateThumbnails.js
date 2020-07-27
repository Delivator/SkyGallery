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

      if (item.type === "video") return;

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

    async generateVideoThumbnail(id, videoElement) {
      if (!id) return;
      let item = this.items.find((item) => item.id === id);
      if (!videoElement)
        videoElement = document.querySelector(`#video-${item.id}`);
      if (!videoElement) return;

      let options = {
        maxWidthOrHeight: 500,
      };

      let canvas = document.createElement("canvas");
      let w = videoElement.videoWidth;
      let h = videoElement.videoHeight;
      canvas.width = w;
      canvas.height = h;
      let ctx = canvas.getContext("2d");
      if (!item.skylinks.thumbnail) {
        videoElement.currentTime = 0;
      }
      await sleep(500);
      ctx.drawImage(videoElement, 0, 0, w, h);

      try {
        let file = await imageCompression.canvasToFile(canvas, "image/jpeg");
        let blob = await imageCompression(file, options);
        item.thumbnailBlob = blob;
        item.thumbnail = URL.createObjectURL(item.thumbnailBlob);
        item.log += "Video thumbnail generated\n";
        this.$forceUpdate();

        item.status = "processing";

        let fileName = item.filename.split(".").reverse();
        fileName[0] = "jpg";
        fileName[1] += "-thumbnail";
        fileName = fileName.reverse().join(".");

        let skylink = await this.uploadBlob(blob, fileName);
        item.thumbnail = `${skylink}/${fileName}`;
        item.skylinks.thumbnail = item.thumbnail;
        item.log += "Video thumbnail uploaded\n";

        if (item.skylinks.source) {
          item.status = "finished";
        } else {
          item.status = "processed";
        }

        this.uploadFiles();
        this.$forceUpdate();
      } catch (error) {
        console.error(error);
      }
    },
  },
};
