import sha256 from "crypto-js/sha256";

export const importUrls = {
  methods: {
    async importUrls(urls, callback) {
      for (const url of urls) {
        const id = sha256(url).toString();

        // skip already added urls
        if (this.items.find((item) => item.id === id)) continue;

        const fetchURL = this.parseSkylink(url)
          ? this.portalSrc(this.parseSkylink(url))
          : url;

        let filename = url;
        let logUrl = url;

        if (this.parseSkylink(url)) {
          logUrl = `sia://${this.parseSkylink(url)}`;
          try {
            filename = await this.getSkylinkFilename(url);
          } catch (error) {
            console.error(error);
          }
        }

        filename = filename.split("/").reverse()[0] ?? filename;
        filename = filename.replace(/(\?|#).*/, "");

        // push new item
        const index = this.items.push({
          id,
          filename,
          progress: 0.0,
          log: "Importing ",
          status: "downloading",
          newName: this.stripFileEx(filename),
          skylinks: this.parseSkylink(url) ? { source: url } : {},
        });
        const item = this.items[index - 1];

        // print url in log
        if (logUrl.length > 23) {
          item.log += `${logUrl.substr(0, 23)}...\n`;
        } else {
          item.log += `${logUrl}\n`;
        }

        // download from url
        try {
          item.log += "Downloading... ";

          const resp = await fetch(fetchURL, {
            method: "HEAD",
            credentials: this.parseSkylink(url) ? "include" : "omit",
          });
          if (!resp.headers.has("content-type")) return;
          const contentType = resp.headers.get("content-type");

          if (/^image\//.test(contentType)) {
            // always download images
            const response = await fetch(fetchURL, { credentials: "include" });
            item.file = await response.blob();
            item.type = "image";
          } else if (/^video\//.test(contentType)) {
            item.type = "video";
            item.canplay = false;
            item.videoUrl = fetchURL;
            item.crossorigin = "use-credentials";
            // only download non skynet videos
            if (!this.parseSkylink(url)) {
              const response = await fetch(fetchURL);
              item.file = await response.blob();
              item.crossorigin = "anonymous";
            }
          }
          item.log += "done\n";
          callback();
        } catch (error) {
          item.status = "error";
          item.log += "Error while importing!";
          console.error(error);
          continue;
        }
        item.status = "queued";
        this.generateThumbnails();
      }
    },
  },
};
