import Vue from "vue";
import Vuex from "vuex";
import SkyID from "skyid";

Vue.use(Vuex);

const skyid = new SkyID("my-testapp", skyidCallback, skyidOptions);

const skyidOptions = {
  devMode:
    window.location.hostname == "idtest.local" ||
    window.location.hostname == "localhost" ||
    window.location.protocol == "file:",
};

function skyidCallback(message) {
  switch (message) {
    case "login_fail":
      console.log("Login failed");
      break;
    case "login_success":
      skyid.getProfile((data) => {
        if (data) {
          console.log(data);
          store.commit("setLoggedInUser", data);
        } else {
          store.commit("setLoggedInUser", "Anonym User");
        }
        console.log(data);
      });
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
  },
  mutations: {
    setLoggedInUser: (state, user) => {
      state.loggedInUser = user;
    },
  },
  actions: {
    logInUser() {
      skyid.sessionStart();
    },

    logOutUser() {
      skyid.sessionDestroy();
    },
  },
  modules: {},
});

export default store;
