import {
  SkynetClient,
  parseSkylink,
  genKeyPairFromSeed,
  getEntryLink,
} from "skynet-js";

const dataDomain =
  window.location.hostname === "localhost" ? "localhost" : "skygallery.hns";

const client = new SkynetClient(window.PORTAL.origin);

export const publishAlbum = {
  computed: {
    loggedIn() {
      return this.$store.state.loggedIn;
    },

    mySky() {
      return this.$store.state.mySky;
    },
  },

  methods: {
    async publishAlbum() {
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
            name: file.newName,
            filename: file.filename,
            skylinks: file.skylinks,
            value: file.value,
            layout: file.layout,
            skylink: file.skylink,
            newTab: file.newTab,
          });
        });
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const file = new File([blob], `skygallery-${this.albumID}.json`);
      this.loading = true;

      try {
        let { skylink } = await client.uploadFile(file);
        if (this.loggedIn) {
          const seed = await this.mySky.getEncryptedFileSeed(
            `${dataDomain}/album/${this.albumID}`,
            false
          );
          const { publicKey, privateKey } = genKeyPairFromSeed(seed);
          await client.db.setDataLink(privateKey, this.albumID, skylink);
          skylink = getEntryLink(publicKey, this.albumID);
        }
        skylink = parseSkylink(skylink);
        this.loading = false;
        this.$store.dispatch("addRecentCreated", {
          skylink,
          title: this.albumTitle,
        });
        setTimeout(() => {
          this.$router.push("/a/" + skylink);
        }, 50);
      } catch (error) {
        this.loading = false;
        this.alertBox.send("error", error);
      }
    },
  },
};
