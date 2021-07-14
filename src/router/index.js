import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/new",
    name: "New",
    component: () => import("../views/New.vue"),
  },
  {
    path: "/a/:id",
    name: "Album",
    component: () => import("../views/Album.vue"),
  },
  // {
  //   path: "/a*",
  //   name: "Album",
  //   component: () => import("../views/Album.vue"),
  // },
  {
    path: "/edit/:id",
    name: "Edit",
    component: () => import("../views/Edit.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
