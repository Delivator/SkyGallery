export const utils = {
  data: () => ({
    skylinkRegex: /^([a-zA-Z0-9-_]{46}(\/.*)?)$/,
    albumFileRegex: /^skygallery-([a-f0-9]{32}|[a-f0-9]{64}).json$/,
    albumIdRegex: /(\/a\/|sia:\/\/)([a-zA-Z0-9-_]{46})/,
    userSettings: {},
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

    setUserSettings(newSettings) {
      if (!newSettings) return;
      this.userSettings = Object.assign(this.userSettings, newSettings);
      localStorage.setItem(
        "skygallery-settings",
        JSON.stringify(this.userSettings)
      );
    },

    loadUserSettings() {
      let userSettings = localStorage.getItem("skygallery-settings");
      if (!userSettings) {
        this.setUserSettings({
          diashow: false,
          volume: 0.5,
          showInfo: false,
          recentVisits: [],
          recentCreated: [],
        });
        userSettings = localStorage.getItem("skygallery-settings");
      }
      this.userSettings = JSON.parse(userSettings);
      return userSettings;
    },

    addRecentVisit(albumId, title) {
      let recentVisits = this.userSettings.recentVisits;
      recentVisits = recentVisits.filter((id) => id !== albumId);
      recentVisits.unshift({
        id: albumId,
        title,
        time: Date.now(),
      });
      recentVisits.slice(0, 25);
      this.setUserSettings({ recentVisits });
    },

    addRecentCreated(albumId, title) {
      let recentCreated = this.userSettings.recentCreated;
      recentCreated.unshift({
        id: albumId,
        title,
        time: Date.now(),
      });
      this.setUserSettings({ recentCreated });
    },
  },

  mounted() {
    this.loadUserSettings();
  },
};
