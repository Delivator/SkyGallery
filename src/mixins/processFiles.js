import { MD5 } from "crypto-js";

export const processFiles = {
  methods: {
    processFiles(files) {
      files.forEach((file) => {
        const imageType = /^image\//;
        if (!imageType.test(file.type)) return;
        let item = {
          file,
          id: MD5(Math.random().toString()).toString(),
          status: "queued",
          log: "Added\n",
          type: "image",
        };
        item.newName = file.name.split(".");
        item.newName.pop();
        item.newName = item.newName.join(".");
        this.items.push(item);
        this.generateThumbnails();
      });
    },
  },
};
