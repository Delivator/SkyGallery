import { SkynetClient, parseSkylink } from "skynet-js";

const client = new SkynetClient(window.PORTAL.origin);

export const uploadFiles = {
  methods: {
    uploadFile(file) {
      return new Promise((resolve, reject) => {
        client
          .uploadFile(file)
          .then(({ skylink }) => {
            resolve(skylink);
          })
          .catch(reject);
      });
    },

    async uploadFiles() {
      // Max three uploads at once
      if (
        this.items.filter((item) => /^(uploading|uploaded)$/.test(item.status))
          .length > 2
      )
        return;

      const index = this.items.findIndex((item) => item.status === "processed");
      if (index < 0) return;

      const item = this.items[index];

      item.status = "uploading";
      item.log += `Uploading ${
        item.skylinks.source ? "thumbnail" : "files"
      }... progress`;

      let files = {};

      if (item.file && !item.skylinks.source)
        files.source = {
          file: item.file,
          name: item.filename,
        };

      if (item.thumbnailBlob) {
        let fileName = item.filename.split(".").reverse();
        fileName[0] = "jpg";
        fileName[1] += "-thumbnail";
        files.thumbnail = {
          file: item.thumbnailBlob,
          name: fileName.reverse().join("."),
        };
      }

      if (files.length < 1) return;

      const onUploadProgress = (progress) => {
        item.progress = progress;
        // currentItem.status =
        //   currentItem.progress === 1 ? "uploaded" : "uploading";
      };

      let fileDirectory = {};

      for (const file of Object.values(files))
        fileDirectory[file.name] = file.file;

      const directoryName = item.filename ?? files.thumbnail.name ?? item.id;

      try {
        const { skylink } = await client.uploadDirectory(
          fileDirectory,
          directoryName,
          { onUploadProgress }
        );
        const links = {};
        for (const [key, file] of Object.entries(files)) {
          links[key] = `${parseSkylink(skylink)}/${file.name}`;
        }
        Object.assign(item.skylinks, links);
        if (links.thumbnail) item.thumbnail = links.thumbnail;
        item.status = "finished";
        item.log = item.log.replace("progress", "");
        item.log += "done\n";
        this.$forceUpdate();
        this.uploadFiles();
      } catch (error) {
        console.error(error);
        item.status = "error";
        item.log = item.log.replace("progress", "");
        item.log += "Error while uploading\n";
        this.uploadFiles();
      }
    },
  },
};
