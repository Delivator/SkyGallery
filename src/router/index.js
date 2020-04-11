import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/create",
    name: "Create",
    component: () => import("../views/Create.vue")
  },
  {
    path: "/a/:id",
    name: "Album",
    component: () => import("../views/Album.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
