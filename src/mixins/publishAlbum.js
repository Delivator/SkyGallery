import { MD5 } from "crypto-js";

export const publishAlbum = {
  methods: {
    publishAlbum(event) {
      if (event) event.preventDefault();
      let jsonData = {
        format: "skygallery",
        version: this.version,
        title: this.albumTitle,
        files: []
      };
      this.items
        .filter(file => file.status === "finished")
        .forEach(file => {
          jsonData.files.push({
            skylink: file.skylink,
            thumbnail: file.thumbnail.replace(/\//g, ""),
            name: file.newName
          });
        });
      const blob = new Blob([JSON.stringify(jsonData)], {
        type: "application/json"
      });
      this.loading = true;
      this.uploadBlob(blob, `skygallery-${MD5(Math.random())}.json`)
        .then(skylink => {
          this.loading = false;
          this.showShare = true;
          this.$router.push("/a/" + skylink);
        })
        .catch(err => {
          this.loading = false;
          this.alertBox.send("error", err);
        });
    }
  }
};
