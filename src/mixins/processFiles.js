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
          progress: 0.0,
        };
        // if file is larger than 50MiB
        console.log(file.size, file.size >= 52428800);
        if (file.size >= 52428800) item.status = "toobig";
        item.newName = file.name.split(".");
        item.newName.pop();
        item.newName = item.newName.join(".");
        this.items.push(item);
        this.generateThumbnails();
      });
    },
  },
};
