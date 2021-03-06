import sha256 from "crypto-js/sha256";

export const publishAlbum = {
  methods: {
    publishAlbum() {
      let jsonData = {
        format: "skygallery",
        version: this.version,
        title: this.albumTitle,
        files: [],
      };
      this.items
        .filter((file) => file.status === "finished")
        .forEach((file) => {
          jsonData.files.push({
            type: file.type,
            skylinks: file.skylinks,
            name: file.newName,
            filename: file.filename,
            value: file.value,
            layout: file.layout,
            skylink: file.skylink,
            newTab: file.newTab,
          });
        });
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      this.loading = true;
      this.uploadBlob(
        blob,
        `skygallery-${sha256(Math.random().toString()).toString()}.json`
      )
        .then((skylink) => {
          this.loading = false;
          this.$store.dispatch("addRecentCreated", {
            id: skylink,
            title: this.albumTitle,
          });
          setTimeout(() => {
            this.$router.push("/a/" + skylink);
          }, 50);
        })
        .catch((err) => {
          this.loading = false;
          this.alertBox.send("error", err);
        });
    },
  },
};
