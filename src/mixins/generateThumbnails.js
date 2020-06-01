import imageCompression from "browser-image-compression";

export const generateThumbnails = {
  methods: {
    async generateThumbnails() {
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

      async function videoToImg() {
        let video = document.querySelector(`#video-${id}`);
        let canvas = document.createElement("canvas");
        let w = video.videoWidth;
        let h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, w, h);
        let file = await imageCompression.canvasToFile(canvas, "image/jpeg");
        console.log(file);
        return file;
      }

      switch (item.type) {
        case "image":
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
          break;
        case "video":
          imageCompression(await videoToImg(), options)
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
          break;
        default:
          break;
      }
    },
  },
};
