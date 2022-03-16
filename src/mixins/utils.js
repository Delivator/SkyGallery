import { parseSkylink } from "skynet-js";
import randomBytes from "randombytes";

export const utils = {
  data: () => ({
    skylinkRegex: /^([a-zA-Z0-9-_]{46}(\/.*)?)$/,
    albumFileRegex: /^skygallery-([a-f0-9]{32}|[a-f0-9]{64}).json$/,
    albumSkylinkRegex: /(\/a\/|sia:\/\/)([a-zA-Z0-9-_]{46})/,
  }),

  methods: {
    extractAlbumSkylink(str) {
      if (!this.albumSkylinkRegex.test(str)) return false;
      const skylink = str.match(this.albumSkylinkRegex)[2];
      return this.skylinkRegex.test(skylink) ? skylink : false;
    },

    checkValidAlbum(albumSkylink) {
      return new Promise((resolve, reject) => {
        this.$store.state.skynetClient
          .getMetadata(albumSkylink)
          .then(({ metadata }) => {
            if (this.albumFileRegex.test(metadata.filename)) {
              const albumID = metadata.filename.match(this.albumFileRegex)[1];
              resolve(albumID);
            } else {
              reject();
            }
          })
          .catch(reject);
      });
    },

    getAlbumData(albumSkylink) {
      return new Promise((resolve, reject) => {
        this.checkValidAlbum(albumSkylink)
          .then((albumID) => {
            fetch(window.PORTAL + albumSkylink, { credentials: "include" })
              .then((res) => res.json())
              .then((json) => {
                resolve({ ...json, albumID });
              })
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

    generateID() {
      return [...new Uint8Array(randomBytes(32))]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
    },

    migrateUserSettings(oldUserSettings) {
      function mapCallback(item) {
        if (!item.id) return;
        item.skylink = item.id;
        delete item.id;
        return item;
      }

      let newUserSettings = { ...oldUserSettings };
      newUserSettings.recentVisits =
        oldUserSettings.recentVisits.map(mapCallback);
      newUserSettings.recentCreated =
        oldUserSettings.recentCreated.map(mapCallback);
      return newUserSettings;
    },

    parseSkylink(skylink) {
      return skylink.match(/^.*([a-zA-Z0-9-_]{46}(\/.*)?)$/)?.[1] ?? false;
    },

    getSkylinkFilename(skylink) {
      return new Promise((resolve, reject) => {
        if (!skylink || !this.parseSkylink(skylink)) return reject(false);
        this.$store.state.skynetClient
          .getMetadata(parseSkylink(skylink))
          .then(({ metadata }) => {
            let filename = metadata?.filename;
            let splitSkylink = skylink.split("/");
            if (splitSkylink.length > 2) {
              let filepath = splitSkylink.slice(1).join("/");
              filename = metadata?.subfiles?.[filepath]?.filename;
            }
            if (filename) {
              resolve(filename);
            } else {
              reject(false);
            }
          })
          .catch(reject);
      });
    },

    stripFileEx(string) {
      let splitString = string.split(".");
      splitString.pop();
      return splitString.join(".");
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
