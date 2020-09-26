import { isMobile } from "mobile-device-detect";

export const utils = {
  data: () => ({
    skylinkRegex: /^([a-zA-Z0-9-_]{46}(\/.*)?)$/,
    albumFileRegex: /^skygallery-([a-f0-9]{32}|[a-f0-9]{64}).json$/,
    albumIdRegex: /(\/a\/|sia:\/\/)([a-zA-Z0-9-_]{46})/,
    userSettings: {},
    isMobile,
  }),

  methods: {
    extractAlbumSkylink(str) {
      if (!this.albumIdRegex.test(str)) return false;
      const skylink = str.match(this.albumIdRegex)[2];
      return this.skylinkRegex.test(skylink) ? skylink : false;
    },

    checkValidAlbum(albumId) {
      return new Promise((resolve, reject) => {
        fetch(`/${albumId}`, { method: "HEAD" })
          .then((res) => {
            if (res.ok && res.headers.has("skynet-file-metadata")) {
              let data = JSON.parse(res.headers.get("skynet-file-metadata"));
              if (this.albumFileRegex.test(data.filename)) resolve(data);
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

    itemsClass(type) {
      if (type === "title") {
        return "title col-12";
      } else {
        return "col-md-6 col-lg-4 col-xl-2 col-12";
      }
    },

    selectText(event, test) {
      if (event.target.value === test) event.target.select();
    },

    loadUserSettings() {
      const userSettings = localStorage.getItem("skygallery-settings");
      if (userSettings) this.userSettings = JSON.parse(userSettings);
      return userSettings;
    },

    setUserSettings(newSettings) {
      if (!newSettings) return;
      this.userSettings = Object.assign(this.userSettings, newSettings);
      localStorage.setItem(
        "skygallery-settings",
        JSON.stringify(this.userSettings)
      );
    },
  },

  mounted() {
    this.loadUserSettings();
  },
};
