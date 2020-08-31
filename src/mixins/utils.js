export const utils = {
  data() {
    return {
      skylinkRegex: /^([a-zA-Z0-9-_]{46}(\/.*)?)$/,
      albumRegex: /skygallery-([a-f0-9]{32}|[a-f0-9]{64}).json/gm,
    };
  },
  methods: {
    extractAlbumSkylink(str) {
      let skylink = str
        .replace("sia://", "")
        .replace("https://skygallery.xyz/", "")
        .replace(location.origin, "")
        .replace(location.pathname, "")
        .replace("#/", "")
        .replace("a/", "");
      skylink = skylink.replace(/\//g, "");
      return this.skylinkRegex.test(skylink) ? skylink : false;
    },

    checkValidAlbum(albumId) {
      return new Promise((resolve, reject) => {
        fetch(`/${albumId}`, { method: "HEAD" })
          .then((res) => {
            if (res.ok && res.headers.has("skynet-file-metadata")) {
              let data = JSON.parse(res.headers.get("skynet-file-metadata"));
              if (this.albumRegex.test(data.filename)) resolve(data);
            } else {
              reject();
            }
          })
          .catch((err) => reject(err));
      });
    },

    getAlbumData(albumId) {
      return new Promise((resolve, reject) => {
        this.checkValidAlbum(albumId)
          .then(() => {
            fetch(`/${albumId}`)
              .then((res) => res.json())
              .then(resolve)
              .catch(reject);
          })
          .catch(reject);
      });
    },

    itemsClass: function (type) {
      if (type === "title") {
        return "col-12";
      } else {
        return "col-md-6 col-lg-4 col-xl-2 col-12";
      }
    },
  },
};
