import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

// get portal url from response header
fetch("", { method: "HEAD" })
  .then((response) => response.headers)
  .then((headers) => {
    let portal = headers.get("skynet-portal-api");
    if (!portal) {
      // if no header, default to siasky.net
      portal = "https://siasky.net";
    }

    let portalNoProtocol = portal.replace(/^https?:\/\//i, "");

    // path for sky-id, easier than subdomain logic
    let path = "https://sky-id.hns." + portalNoProtocol;

    // create script tag
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = path + "/skyid.js";
    script.onload = () => {
      initSkyID(path);
    }; //once loaded, call method to run code that relies on it
    document.head.appendChild(script);
  });

let skyid;

function initSkyID(path) {
  // var skyid = new SkyID("App Name", null, { customSkyidUrl: path });
  const skyidOptions = {
    customSkyidUrl: path,
    disableLoadingScreen: true,
    devMode:
      window.location.hostname == "idtest.local" ||
      window.location.hostname == "localhost" ||
      window.location.protocol == "file:",
  };

  skyid = new window.SkyID("SkyGallery", skyidCallback, skyidOptions);
}

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
