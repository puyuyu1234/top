import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/kudamono",
      name: "kudamono",
      component: () => import("@/views/games/KudamonoView.vue"),
    },
    {
      path: "/aa2picture",
      name: "aa2picture",
      component: () => import("@/views/tools/Aa2PictureView.vue"),
    },
    {
      path: "/nouen-chara",
      name: "nouen-chara",
      component: () => import("@/views/NouenCharaView.vue"),
    },
    {
      path: "/page2",
      name: "page2",
      component: () => import("@/views/Page2View.vue"),
    },
  ],
});

export default router;
