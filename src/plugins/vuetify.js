import Vue from "vue";
import Vuetify from "vuetify/lib";
import VueObserveVisibility from "vue-observe-visibility";

Vue.use(Vuetify);
Vue.use(VueObserveVisibility);

export default new Vuetify({
  icons: {
    iconfont: "md"
  },
  theme: {
    dark: true
  }
});
