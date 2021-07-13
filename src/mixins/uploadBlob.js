const axios = require("axios").default;

export const uploadBlob = {
  methods: {
    uploadBlob(blob, fileName) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", blob, fileName);
        fetch(window.PORTAL + "skynet/skyfile", {
          method: "POST",
          body: formData,
        })
          .then((resp) => {
            if (!resp.ok) return reject(resp.status);
            return resp.json();
          })
          .then((data) => {
            return resolve(data.skylink);
          })
          .catch(reject);
      });
    },
    uploadBlobs(files, id, item) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        for (const file of Object.values(files))
          formData.append("files[]", file[0], file[1]);
        axios
          .post(window.PORTAL + "skynet/skyfile?filename=" + id, formData, {
            onUploadProgress: ({ loaded, total }) => {
              item.progress = loaded / total;
              item.status = item.progress === 1 ? "uploaded" : "uploading";
            },
          })
          .then((resposne) => {
            const links = {};
            for (const [key, file] of Object.entries(files)) {
              links[key] = `${resposne.data.skylink}/${file[1]}`;
            }
            return resolve(links);
          })
          .catch(reject);
      });
    },
  },
};
