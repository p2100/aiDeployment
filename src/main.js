import { createApp, defineAsyncComponent } from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

const Index = defineAsyncComponent(() => import("./views/index.vue"));

let app = null;

window.mount = () => {
  app = createApp(App);
  app.component("index", Index);
  app.use(ElementPlus);
  app.mount("#app");
};

window.unmount = () => {
  // app.$destroy();
  app.unmount();
  // app.$el.innerHTML = "";
  app = null;
};

if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}
