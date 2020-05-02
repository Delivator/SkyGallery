export const uploadBlob = {
  methods: {
    uploadBlob(blob, fileName) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", blob, fileName);
        fetch("/skynet/skyfile", {
          method: "POST",
          body: formData
        })
          .then(resp => {
            if (!resp.ok) return reject(resp.status);
            return resp.json();
          })
          .then(data => {
            return resolve(data.skylink);
          })
          .catch(reject);
      });
    },
    uploadBlobs(blobs, id) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        blobs.forEach(blob => formData.append("files[]", blob[0], blob[1]));
        fetch("/skynet/skyfile?filename=" + id, {
          method: "POST",
          body: formData
        })
          .then(resp => {
            if (!resp.ok) return reject(resp.status);
            return resp.json();
          })
          .then(data => {
            let skylinks = {
              source: `${data.skylink}/${blobs[0][1]}`
            };
            if (blobs[1]) skylinks.thumbnail = `${data.skylink}/${blobs[1][1]}`;
            return resolve(skylinks);
          })
          .catch(reject);
      });
    }
  }
};
