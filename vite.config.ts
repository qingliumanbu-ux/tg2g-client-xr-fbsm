import { defineConfig, loadEnv, ConfigEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import federation, {
  VitePluginFederationOptions,
} from "@originjs/vite-plugin-federation";

import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import topLevelAwait from "vite-plugin-top-level-await";

import { toIsoString } from "./build/utils";
import { FederationTypesPlugin } from "./build/vite-plugin-federation-types";

// https://vitejs.dev/config/
export default (configEnv: ConfigEnv) => {
  const { mode } = configEnv;
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as ImportMetaEnv;
  const {
    VITE_APP_NAME: appName,
    VITE_APP_BASE_API: baseApi,
    VITE_APP_PUBLIC_PATH: publicPath,
    VITE_APP_USE_GATEWAY_PROXY: useGatewayProxy,
  } = viteEnv;
  const __DEV__ = mode === "development";
  const useProxy = useGatewayProxy === "true";

  const moduleFederationConfig: VitePluginFederationOptions = {
    name: `${appName}_general`,
    filename: "remoteEntry.js",
    remotes: {
      EFX: __DEV__
        ? `${baseApi}remote_exposes/EFX/assets/remoteEntry.js`
        : {
            external: `Promise.resolve(
              window.top._APP_OPTIONS_  ?
              window.top._APP_OPTIONS_.appContext + 'remote_exposes/EFX/assets/remoteEntry.js'
                : '/remote_exposes/EFX/assets/remoteEntry.js'
              )`,
            externalType: "promise",
          },
      EIX: __DEV__
        ? `${baseApi}remote_exposes/EIX/assets/remoteEntry.js`
        : {
            external: `Promise.resolve(
              window.top._APP_OPTIONS_  ?
              window.top._APP_OPTIONS_.appContext + 'remote_exposes/EIX/assets/remoteEntry.js'
                : '/remote_exposes/EIX/assets/remoteEntry.js'
              )`,
            externalType: "promise",
          },
      ERX: __DEV__
        ? `${baseApi}remote_exposes/ERX/assets/remoteEntry.js`
        : {
            external: `Promise.resolve(
          window.top._APP_OPTIONS_  ?
          window.top._APP_OPTIONS_.appContext + 'remote_exposes/ERX/assets/remoteEntry.js'
            : '/remote_exposes/ERX/assets/remoteEntry.js'
          )`,
            externalType: "promise",
          },
      // 附件上传组件引用关系。若不需要请注释掉，否则应用会报错
      // EPTF: __DEV__
      //   ? `${baseApi}remote_exposes/EPTF/assets/remoteEntry.js`
      //   : {
      //       external: `Promise.resolve(
      //     window.top._APP_OPTIONS_  ?
      //     window.top._APP_OPTIONS_.appContext + 'remote_exposes/EPTF/assets/remoteEntry.js'
      //       : '/remote_exposes/EPTF/assets/remoteEntry.js'
      //     )`,
      //       externalType: "promise",
      //     },
      // 报表组件引用关系。若不需要请注释掉，否则应用会报错
        EBFR: __DEV__
        ? `${baseApi}remote_exposes/EBFR/assets/remoteEntry.js`
        : {
            external: `Promise.resolve(
          window.top._APP_OPTIONS_  ?
          window.top._APP_OPTIONS_.appContext + 'remote_exposes/EBFR/assets/remoteEntry.js'
            : '/remote_exposes/EBFR/assets/remoteEntry.js'
          )`,
            externalType: "promise",
          },
    },
    shared: ["vue"],
  };
  const remoteNames = Object.keys(moduleFederationConfig.remotes!);
  const remoteZips = remoteNames.map((it) => {
    return {
      remoteName: it,
      remoteUrl: `${baseApi}remote_exposes/${it}/${it}.d.zip`,
    };
  });
  return defineConfig({
    define: {
      //viteEnv
      "process.env": {
        BUILD_TIMESTAMP: `${toIsoString(new Date())}`,
      },
    },
    base: __DEV__ ? "/" : `./`,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        "@": resolve(__dirname, "./src"),
        "#": resolve(__dirname),
        public: resolve(__dirname, "./public"),
      },
    },
    plugins: [
      vue(),

      FederationTypesPlugin({ targetDir: "@mf-types", remoteZips: remoteZips }),
      federation(moduleFederationConfig),
      topLevelAwait({
        promiseExportName: "__tla",
        promiseImportName: (i) => `__tla_${i}`,
      }),
      visualizer({
        template: "treemap", // or sunburst
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: "./dist/analyse.html", // will be saved in project's root
      }),
      viteCompression({
        verbose: true, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用压缩
        threshold: 10240, // 启用压缩的文件大小限制
        algorithm: "gzip", // 采用的压缩算法
        ext: ".gz", // 生成的压缩包后缀
      }),
    ],
    server: {
      //开发时代理
      proxy: {
        // 使用正则表达式匹配 URL
        "^/.*/api": {
          target: `${baseApi}${useProxy ? "proxyApi/" : ""}`,
          changeOrigin: true,
        },
        "/EX": {
          target: baseApi,
          changeOrigin: true,
        },
        "/refreshToken": {
          target: baseApi,
          changeOrigin: true,
        },
        "/remote_exposes": {
          target: baseApi,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: `./dist/${appName}`,
      sourcemap: false,
      minify: true,
      rollupOptions: {
        treeshake: true, // 开启 Tree Shaking，消除未使用的代码，减小最终的包大小
      },
    },
  });
};
