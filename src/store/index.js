import Vue from "vue";
import Vuex from "vuex";
import SkyID from "skyid";

Vue.use(Vuex);

const skyidOptions = {
  disableLoadingScreen: true,
  devMode:
    window.location.hostname == "idtest.local" ||
    window.location.hostname == "localhost" ||
    window.location.protocol == "file:",
};

const skyid = new SkyID("SkyGallery", skyidCallback, skyidOptions);

function skyidCallback(message) {
  switch (message) {
    case "login_fail":
      console.log("Login failed");
      break;
    case "login_success":
      store.dispatch("getProfile");
      break;
    case "destroy":
      store.commit("setLoggedInUser", null);
      break;
    default:
      console.log(message);
      break;
  }
}

const defaultUserSettings = {
  volume: 1,
  diashow: false,
  darkMode: true,
  showInfo: false,
  recentVisits: [],
  recentCreated: [],
};

const store = new Vuex.Store({
  state: {
    loggedInUser: null,
    userSettings:
      JSON.parse(localStorage.getItem("userSettings")) ?? defaultUserSettings,
  },
  mutations: {
    setLoggedInUser: (state, payload) => {
      state.loggedInUser = payload;
    },

    setUserSettings(state, payload) {
      const skipSkyDB = payload.skipSkyDB;
      delete payload.skipSkyDB;
      const newUserSettings = {
        ...defaultUserSettings,
        ...state.userSettings,
        ...payload,
      };

      state.userSettings = newUserSettings;
      localStorage.userSettings = JSON.stringify(newUserSettings);
      if (!skipSkyDB && !!state.loggedInUser)
        skyid.setJSON("userSettings", newUserSettings);
    },
  },
  actions: {
    logInUser() {
      skyid.sessionStart();
    },

    logOutUser() {
      skyid.sessionDestroy();
    },

    getProfile({ commit }) {
      skyid.getProfile((data) => {
        if (data) {
          commit("setLoggedInUser", JSON.parse(data));
          store.dispatch("getUserSettings");
        } else {
          console.error("error getting profile");
        }
      });
    },

    getUserSettings({ commit, state }) {
      if (!state.loggedInUser) return;
      skyid.getJSON("userSettings", (data) => {
        if (data) commit("setUserSettings", { ...data, skipSkyDB: true });
      });
    },

    addRecentVisit({ commit, state }, payload) {
      let recentVisits = state.userSettings.recentVisits;
      recentVisits = recentVisits.filter((item) => item.id !== payload.id);
      recentVisits.unshift({
        id: payload.id,
        time: Date.now(),
        title: payload.title,
      });
      commit("setUserSettings", { recentVisits });
    },

    addRecentCreated({ commit, state }, payload) {
      const recentCreated = state.userSettings.recentCreated;
      recentCreated.unshift({
        id: payload.id,
        time: Date.now(),
        title: payload.title,
      });
      commit("setUserSettings", { recentCreated });
    },
  },
  modules: {},
});

export default store;
