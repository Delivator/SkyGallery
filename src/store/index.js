import Vue from "vue";
import Vuex from "vuex";
import { SkynetClient } from "skynet-js";
Vue.use(Vuex);

const client = new SkynetClient(window.PORTAL.origin);

const dataDomain =
  window.location.hostname === "localhost" ? "localhost" : "skygallery.hns";

// define async setup function
async function initMySky() {
  try {
    // load invisible iframe and define app's data domain
    // needed for permissions write
    const mySky = await client.loadMySky(dataDomain);

    // check if user is already logged in with permissions
    const loggedIn = await mySky.checkLogin();

    // set react state for login status and
    // to access mySky in rest of app
    store.commit("setMySky", mySky);
    store.commit("setLoggedIn", loggedIn);
    if (loggedIn) {
      store.commit("setUserID", await mySky.userID());
      store.dispatch("getUserSettings");
      store.dispatch("getProfile");
    }
  } catch (e) {
    console.error(e);
  }
}

// call async setup function
initMySky();

// rename id to skylink
function migrateUserSettings(oldUserSettings) {
  function mapCallback(item) {
    if (!item.id) return;
    item.skylink = item.id;
    delete item.id;
    return item;
  }

  let newUserSettings = { ...oldUserSettings };
  newUserSettings.recentVisits = oldUserSettings.recentVisits.map(mapCallback);
  newUserSettings.recentCreated =
    oldUserSettings.recentCreated.map(mapCallback);
  return newUserSettings;
}

const defaultUserSettings = {
  volume: 1,
  muted: false,
  diashow: false,
  darkMode: true,
  showInfo: false,
  diashowShuffle: false,
  recentVisits: [],
  recentCreated: [],
};

let localUserSettings = JSON.parse(localStorage.getItem("userSettings"));

if (
  localUserSettings?.recentCreated[0]?.id ||
  localUserSettings?.recentVisits[0]?.id
)
  localUserSettings = migrateUserSettings(localUserSettings);

const store = new Vuex.Store({
  state: {
    mySky: null,
    userID: null,
    profile: null,
    loggedIn: false,
    skynetClient: client,
    userSettings: {
      ...defaultUserSettings,
      ...(localUserSettings ?? defaultUserSettings),
    },
  },
  mutations: {
    setMySky: (state, payload) => {
      state.mySky = payload;
    },

    setUserID: (state, payload) => {
      state.userID = payload;
    },

    setLoggedIn: (state, payload) => {
      state.loggedIn = payload;
    },

    setProfile: (state, payload) => {
      state.profile = payload;
    },

    setUserSettings(state, payload = {}) {
      const skipSync = payload.skipSync;
      delete payload.skipSync;
      const newUserSettings = {
        ...defaultUserSettings,
        ...state.userSettings,
        ...payload,
      };

      state.userSettings = newUserSettings;
      localStorage.userSettings = JSON.stringify(newUserSettings);
      if (!skipSync && state.loggedIn)
        state.mySky.setJSONEncrypted(
          `${dataDomain}/userSettings.json`,
          newUserSettings
        );
    },
  },
  actions: {
    async logInUser() {
      // Try login again, opening pop-up. Returns true if successful
      const status = await store.state.mySky.requestLoginAccess();

      store.commit("setLoggedIn", status);

      if (status) {
        store.commit("setUserID", await store.state.mySky.userID());
        store.dispatch("getUserSettings");
        store.dispatch("getProfile");
      }
    },

    async logOutUser() {
      // call logout to globally logout of mysky
      await store.state.mySky.logout();

      //set react state
      store.commit("setLoggedIn", false);
      store.commit("setProfile", null);
      store.commit("setUserID", null);
    },

    async getProfile({ commit, state }) {
      if (!state.loggedIn) return;

      try {
        const userProfile = await state.mySky.getJSON(
          "profile-dac.hns/profileIndex.json"
        );
        const userPreferences = await state.mySky.getJSON(
          "profile-dac.hns/preferencesIndex.json"
        );

        commit("setProfile", {
          ...userProfile.data.profile,
          ...userPreferences?.data?.preferences,
        });
      } catch (error) {
        console.error("error getting profile");
        console.error(error);
      }
    },

    async getUserSettings({ commit, state }) {
      if (!state.loggedIn) return;

      try {
        let { data } = await state.mySky.getJSONEncrypted(
          `${dataDomain}/userSettings.json`
        );
        if (data?.recentCreated[0]?.id || data?.recentVisits[0]?.id)
          data = migrateUserSettings(data);
        if (data) commit("setUserSettings", { ...data, skipSync: true });
      } catch (error) {
        console.error("error getting user settings");
        console.error(error);
      }
    },

    addRecentVisit({ commit, state }, payload) {
      let recentVisits = state.userSettings.recentVisits;
      recentVisits = recentVisits.filter(
        (item) => item.skylink !== payload.skylink
      );
      recentVisits.unshift({
        skylink: payload.skylink,
        time: Date.now(),
        title: payload.title,
      });
      commit("setUserSettings", { recentVisits });
    },

    addRecentCreated({ commit, state }, payload) {
      let recentCreated = state.userSettings.recentCreated;
      recentCreated = recentCreated.filter(
        (item) => item.skylink !== payload.skylink
      );
      recentCreated.unshift({
        skylink: payload.skylink,
        time: Date.now(),
        title: payload.title,
      });
      commit("setUserSettings", { recentCreated });
    },

    removeRecentCreated({ commit, state }, skylink) {
      let recentCreated = state.userSettings.recentCreated;
      recentCreated = recentCreated.filter((item) => item.skylink !== skylink);
      commit("setUserSettings", { recentCreated });
    },

    removeRecentVisit({ commit, state }, skylink) {
      let recentVisits = state.userSettings.recentVisits;
      recentVisits = recentVisits.filter((item) => item.skylink !== skylink);
      commit("setUserSettings", { recentVisits });
    },
  },
  modules: {},
});

export default store;
