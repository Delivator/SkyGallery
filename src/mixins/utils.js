export const utils = {
  data: () => ({
    skylinkRegex: /^([a-zA-Z0-9-_]{46}(\/.*)?)$/,
    albumFileRegex: /^skygallery-([a-f0-9]{32}|[a-f0-9]{64}).json$/,
    albumIdRegex: /(\/a\/|sia:\/\/)([a-zA-Z0-9-_]{46})/,
  }),

  methods: {
    extractAlbumSkylink(str) {
      if (!this.albumIdRegex.test(str)) return false;
      const skylink = str.match(this.albumIdRegex)[2];
      return this.skylinkRegex.test(skylink) ? skylink : false;
    },

    checkValidAlbum(albumId) {
      return new Promise((resolve, reject) => {
        fetch(`${window.PORTAL}skynet/metadata/${albumId}`)
          .then((res) => res.json())
          .then((data) => {
            if (this.albumFileRegex.test(data.filename)) {
              resolve(data);
            } else {
              reject();
            }
          })
          .catch(reject);
      });
    },

    getAlbumData(albumId) {
      return new Promise((resolve, reject) => {
        this.checkValidAlbum(albumId)
          .then(() => {
            fetch(window.PORTAL + albumId)
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

    shortDate(date) {
      return new Date(date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });
    },

    longDate(date) {
      return new Date(date).toLocaleDateString(undefined, {
        hour: "numeric",
        minute: "numeric",
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    portalSrc(src) {
      return window.PORTAL + src;
    },
  },

  mounted() {
    // handle old SkyGallery localStorage settings
    const oldRecentVisits = JSON.parse(localStorage.getItem("recentVisits"));
    if (oldRecentVisits) {
      const combined = [
        ...oldRecentVisits,
        this.$store.state.userSettings.recentVisits,
      ].sort((a, b) => a.time < b.time);
      this.$store.commit("setUserSettings", { recentVisits: combined });
      localStorage.removeItem("recentVisits");
    }
    const oldRecentCreated = JSON.parse(localStorage.getItem("recentCreated"));
    if (oldRecentCreated) {
      const combined = [
        ...oldRecentCreated,
        this.$store.state.userSettings.recentCreated,
      ].sort((a, b) => a.time < b.time);
      this.$store.commit("setUserSettings", { recentCreated: combined });
      localStorage.removeItem("recentCreated");
    }
  },
};
