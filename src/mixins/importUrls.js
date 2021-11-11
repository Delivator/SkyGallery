import sha256 from "crypto-js/sha256";

export const importUrls = {
  methods: {
    importUrls(urls) {
      urls.forEach(async (url) => {
        const id = sha256(url).toString();
        const filename = url.split("/").reverse()[0] ?? url;

        if (this.items.find((item) => item.id === id)) return;

        let item = {
          id,
          filename,
          progress: 0.0,
          log: "Added\n",
          status: "queued",
          newName: filename,
          skylinks: {},
        };

        const fetchURL = this.parseSkylink(url)
          ? this.portalSrc(this.parseSkylink(url))
          : url;

        if (this.parseSkylink(url)) item.skylinks = { source: url };

        const resp = await fetch(fetchURL, { method: "HEAD" });
        if (!resp.headers.has("content-type")) return;
        const contentType = resp.headers.get("content-type");

        try {
          if (/^image\//.test(contentType)) {
            // always download images
            const response = await fetch(fetchURL);
            item.file = await response.blob();
            item.type = "image";
          } else if (/^video\//.test(contentType)) {
            // only download non skynet videos
            if (!this.parseSkylink(url)) {
              const response = await fetch(fetchURL);
              item.file = await response.blob();
            }
            item.videoUrl = fetchURL;
            item.type = "video";
            item.canplay = false;
          }
        } catch (error) {
          return console.error(error);
        }
        this.items.push(item);
        this.generateThumbnails();
      });

      return urls;
    },
  },
};
