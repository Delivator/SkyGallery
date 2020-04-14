export const getAlbum = {
  methods: {
    checkValidAlbum(albumId) {
      return new Promise((resolve, reject) => {
        fetch(`/${albumId}`, { method: "HEAD" })
          .then(res => {
            if (res.ok && res.headers.has("skynet-file-metadata")) {
              let data = JSON.parse(res.headers.get("skynet-file-metadata"));
              if (/skygallery-[a-f0-9]{32}.json/gm.test(data.filename))
                resolve(data);
            } else {
              reject();
            }
          })
          .catch(err => reject(err));
      });
    },
    getAlbumData(albumId) {
      return new Promise((resolve, reject) => {
        this.checkValidAlbum(albumId)
          .then(() => {
            fetch(`/${albumId}`)
              .then(res => res.json())
              .then(resolve)
              .catch(reject);
          })
          .catch(reject);
      });
    }
  }
};
