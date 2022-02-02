export const processFiles = {
  methods: {
    processFiles(files) {
      files.forEach((file) => {
        let item = {
          file,
          id: this.generateID(),
          filename: file.name,
          status: "queued",
          log: "Added\n",
          progress: 0.0,
          skylinks: {},
        };
        if (/^image\//.test(file.type)) {
          item.type = "image";
          // if file is larger than 50MiB
          if (file.size >= 52428800) item.status = "toobig";
        } else if (/^video\//.test(file.type)) {
          item.type = "video";
          item.canplay = false;
          // if file is larger than 500MiB.
          if (file.size >= 524288000) item.status = "toobig";
          item.videoUrl = URL.createObjectURL(file);
        } else {
          return;
        }
        item.newName = this.stripFileEx(file.name);
        this.items.push(item);
        this.generateThumbnails();
      });
    },
  },
};
