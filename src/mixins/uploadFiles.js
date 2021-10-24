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
      // Max ten uploads at once
      if (
        this.items.filter((item) => /^(uploading|uploaded)$/.test(item.status))
          .length > 9
      )
        return;

      const index = this.items.findIndex((item) => item.status === "processed");
      if (index < 0) return;

      const id = this.items[index].id;
      const currentItem = this.items.find((element) => element.id === id);

      currentItem.status = "uploading";
      currentItem.log += "progress";
      let files = {};

      if (currentItem.file && !currentItem.skylinks.source)
        files.source = {
          file: currentItem.file,
          name: currentItem.filename,
        };

      if (currentItem.thumbnailBlob) {
        let fileName = currentItem.filename.split(".").reverse();
        fileName[0] = "jpg";
        fileName[1] += "-thumbnail";
        files.thumbnail = {
          file: currentItem.thumbnailBlob,
          name: fileName.reverse().join("."),
        };
      }

      if (files.length < 1) return;

      const onUploadProgress = (progress) => {
        currentItem.progress = progress;
        currentItem.status =
          currentItem.progress === 1 ? "uploaded" : "uploading";
      };

      let fileDirectory = {};

      for (const file of Object.values(files))
        fileDirectory[file.name] = file.file;

      const directoryName =
        currentItem.filename ?? files.thumbnail.name ?? currentItem.id;

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
        Object.assign(currentItem.skylinks, links);
        if (links.thumbnail) currentItem.thumbnail = links.thumbnail;
        currentItem.status = "finished";
        currentItem.log = currentItem.log.replace("progress", "");
        currentItem.log += "done.\n";
        this.$forceUpdate();
        this.uploadFiles();
      } catch (error) {
        console.error(error);
        currentItem.status = "error";
        currentItem.log = currentItem.log.replace("progress", "");
        currentItem.log += "Error.\n";
        this.uploadFiles();
      }
    },
  },
};
