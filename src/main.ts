import "@/styles/index.scss";
import "splitpanes/dist/splitpanes.css";
// dayjs国际化文件
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-hk";
import "dayjs/locale/en";
import "dayjs/locale/ar";
import "dayjs/locale/id";

import {
  AdvancedFilterModule,
  ClientSideRowModelModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  MenuModule,
  ModuleRegistry,
  MultiFilterModule,
  RangeSelectionModule,
  RichSelectModule,
  RowGroupingModule,
  ServerSideRowModelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
} from "EFX/agPlugins";
import Antd,{ message } from "ant-design-vue";
import {
  IAxiosInitConfig,
  init,
  setCurrentEnvironment,
  setCurrentUser,
  setRefreshToken,
  setRememberMe,
  setToken,
} from "EIX/ei";
import { Pane, Splitpanes } from "splitpanes";

import AgGridVue from "EFX/AgGridVue";
import App from "./App.vue";
import type { App as TypeApp } from "vue";
import { createApp } from "vue";
import getVueI18n from "EFX/locale";
import { importAllLocales } from "./utils/i18n";
import {
  RouterHistory,
  Router as TypeRouter,
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from "vue-router";
import routes from "./router";

// -----------国际化功能相关配置start---------
const localeMessages = importAllLocales();
// 初始化vue i8n
const vueI18n = getVueI18n({
  ...localeMessages,
});
// -----------国际化功能相关配置end---------

// 注册模块
ModuleRegistry.registerModules([
  ExcelExportModule,
  StatusBarModule,
  SideBarModule,
  ClientSideRowModelModule,
  RowGroupingModule,
  SetFilterModule,
  FiltersToolPanelModule,
  AdvancedFilterModule,
  MultiFilterModule,
  ColumnsToolPanelModule,
  MenuModule,
  ClipboardModule,
  RichSelectModule,
  ServerSideRowModelModule,
  RangeSelectionModule
]);

declare global {
  interface Window {
    // 是否存在无界
    __POWERED_BY_WUJIE__?: boolean;
    // 子应用mount函数
    __WUJIE_MOUNT?: () => void;
    // 子应用unmount函数
    __WUJIE_UNMOUNT?: () => void;
    // 子应用无界实例
    __WUJIE: { mount: () => void };
  }
}
declare const window: Window & Record<string, any>;
let app: TypeApp | undefined = undefined;
let router: TypeRouter | undefined = undefined;
let history: RouterHistory | undefined = undefined;
const appName = import.meta.env.VITE_APP_NAME;
function render(props: any = {}) {
  const { routerHistory } = props ?? {};

  const { appContext } = window.$wujie?.props ?? {};

  const baseURL =
    import.meta.env.DEV && window.__POWERED_BY_WUJIE__
      ? import.meta.env.VITE_APP_BASE_API
      : appContext ??
      (window as any).top._APP_OPTIONS_?.appContext ??
      import.meta.env.VITE_APP_BASE_API ??
      '/'

  app = createApp(App);
  const historyBase =
    import.meta.env.PROD ? `${baseURL}child/${appName}/` : "";
  history =
    routerHistory === "memory"
      ? createMemoryHistory(historyBase)
      : createWebHistory(historyBase);
  // 创建路由实例
  router = createRouter({
    history: history,
    routes: routes,
  });
  // app.provide("parentRouter", parentRouter || router);
  // app.provide("parentStore", parentStore);
  app.use(router);
  app.use(vueI18n);
  app.use(Antd);
  app.component("ag-grid-vue", AgGridVue);
  app.component("v-splitter", Splitpanes);
  app.component("v-splitter-pane", Pane);

  const eiInitOptions: IAxiosInitConfig = {
    baseURL: baseURL,
    powerByQianKun: window.__POWERED_BY_WUJIE__ ?? false,
    currentRouter: router,
    platType: "4C",
    messageService: message,
  };

  if (import.meta.env.VITE_APP_USE_GATEWAY_PROXY && !import.meta.env.PROD) {
    (eiInitOptions as any).useGatewayProxy = true;
  }
  init(eiInitOptions);
  app.mount("#sub-app");
}
function mount() {
  console.log("%c%s", "color: blue;", `${appName} app mount`);
  render();
}
function unmount() {
  console.log("%c%s", "color: blue;", `${appName} app unmount`);
  // 清理资源
  app && app.unmount();
  app = undefined;

  history && history.destroy();
  history = undefined;

  router && router.clearRoutes();
  router = undefined;
  if (window.__POWERED_BY_WUJIE__) {
    delete window.__WUJIE_MOUNT;
    delete window.__WUJIE_UNMOUNT;
  }
}
if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = mount;
  window.__WUJIE_UNMOUNT = unmount;

  //@ts-ignore
  // window.__WUJIE.mount();
  window.__WUJIE.mount();
} else {
  render();
}

(async () => {
  //TODO: 测试环境模拟登录用户
  //?: 本地测试在父框架运行的话需注释，单独运行的话请解注释
  //!: 是否考虑用户名也放在环境变量中，还是直接在这里改动
  if (!import.meta.env.PROD && !window.__POWERED_BY_WUJIE__) {
    setRememberMe(true);
    const token = import.meta.env.VITE_APP_SIGNATURE_TOKEN;
    const splitArr = token.split(":");
    setToken(token);
    setRefreshToken(import.meta.env.VITE_APP_REFRESH_TOKEN);
    if (splitArr.length > 2) {
      const userName = splitArr[1];
      setCurrentUser({
        id: "999999",
        userId: splitArr[1],
        userName: userName,
        deptId: "",
        deptEName: "",
        deptCName: "",
      });
    }

    setCurrentEnvironment({
      skinName: "default",
      culture: import.meta.env.VITE_APP_LANG,
      companyCode: import.meta.env.VITE_APP_COMPANY_CODE || "BS",
      companyName: "宝信软件",
      appName: import.meta.env.VITE_APPLICATION_NAME || "IPLAT4C",
    });
  }
})();
// export { mount,  unmount, render};
console.log(
  `%c===================================================`,
  "color:green"
);
console.log(`%capp name: %c${appName}`, "color: blue", "color:red");
// console.log(`%cversion: %c${appVersion}`, "color: blue", "color:red");
console.log(`%cversion: %c${new URL(window.location.href).searchParams.get('ver') ?? ''}`, "color: blue", "color:red");
console.log(
  `%cbuild time: %c${process.env.BUILD_TIMESTAMP}`,
  "color: blue",
  "color:red"
);
console.log(
  `%c===================================================`,
  "color:green"
);
