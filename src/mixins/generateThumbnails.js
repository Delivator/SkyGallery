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

      item.status = "processing";
      item.log += "Generating thumbnail... ";

      if (item.type === "video") return;

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

    async generateVideoThumbnail(item, videoElement) {
      if (!item) return;
      item = this.items.find((item) => item.id === item.id);
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
        console.log(item.skylinks);
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
        if (item.status !== "finished") item.status = "processed";
        this.$forceUpdate();

        let fileName = item.file.name.split(".").reverse();
        fileName[0] = "jpg";
        fileName[1] += "-thumbnail";
        fileName = fileName.reverse().join(".");

        let skylink = await this.uploadBlob(blob, fileName);
        item.thumbnail = `${skylink}/${fileName}`;
        item.skylinks.thumbnail = item.thumbnail;
        console.log(item.skylinks);
        item.log += "Video thumbnail uploaded\n";
        this.uploadFiles();
        this.$forceUpdate();
      } catch (error) {
        console.error(error);
      }
    },
  },
};
