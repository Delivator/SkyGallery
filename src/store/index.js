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

const skyid = new SkyID("my-testapp", skyidCallback, skyidOptions);

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

const store = new Vuex.Store({
  state: {
    loggedInUser: null,
    recentVisits: JSON.parse(localStorage.getItem("recentVisits")) ?? [],
    recentCreated: JSON.parse(localStorage.getItem("recentCreated")) ?? [],
  },
  mutations: {
    setLoggedInUser: (state, payload) => {
      state.loggedInUser = payload;
    },

    setRecentVisits: (state, payload) => {
      state.recentVisits = payload;
      localStorage.recentVisits = JSON.stringify(payload);
    },

    setRecentCreated: (state, payload) => {
      state.recentCreated = payload;
      localStorage.recentCreated = JSON.stringify(payload);
    },
  },
  actions: {
    logInUser() {
      skyid.sessionStart();
    },

    logOutUser() {
      skyid.sessionDestroy();
    },

    getProfile({ commit, dispatch }) {
      skyid.getProfile((data) => {
        if (data) {
          commit("setLoggedInUser", JSON.parse(data));
        } else {
          console.error("error getting profile");
        }
        dispatch("getRecentVisit");
        dispatch("getRecentCreated");
      });
    },

    addRecentVisit({ commit, state }, payload) {
      commit(
        "setRecentVisits",
        state.recentVisits.filter((item) => item.id !== payload.id)
      );

      commit("setRecentVisits", [
        {
          id: payload.id,
          time: Date.now(),
          title: payload.title,
        },
        ...state.recentVisits,
      ]);

      // save to SkyDB using SkyID
      if (state.loggedInUser)
        skyid.setJSON("recentVisits.json", state.recentVisits);
    },

    getRecentVisit({ commit, state }) {
      if (!state.loggedInUser) return;
      skyid.getJSON("recentVisits.json", (data) => {
        if (data) commit("setRecentVisits", data);
      });
    },

    addRecentCreated({ commit, state }, payload) {
      commit("setRecentCreated", [
        {
          id: payload.id,
          time: Date.now(),
          title: payload.title,
        },
        ...state.recentCreated,
      ]);

      // save to SkyDB using SkyID
      if (state.loggedInUser)
        skyid.setJSON("recentCreated.json", state.recentCreated);
    },

    getRecentCreated({ commit, state }) {
      if (!state.loggedInUser) return;
      skyid.getJSON("recentCreated.json", (data) => {
        if (data) commit("recentCreated", data);
      });
    },
  },
  modules: {},
});

export default store;
