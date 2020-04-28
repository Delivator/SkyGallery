export const uploadBlob = {
  methods: {
    uploadBlob(blob, fileName) {
      console.log(typeof blob);
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
    }
  }
};
