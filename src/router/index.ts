/*
 * @Description:
 * @Author: Edward
 * @Date: 2023-10-17 15:48:42
 * @LastEditors: Edward
 * @LastEditTime: 2023-10-19 09:53:31
 */
import { RouteRecordNormalized, RouteRecordRaw } from "vue-router";

//TODO： 一定要注意这里的修改，不能遗漏
// 移除 eager: true 选项，使用懒加载
const viewsList = import.meta.glob('@/views/**/*.vue');


const basicRoutes: Array<RouteRecordRaw> = [
  // {
  //   name: 'dashboard',
  //   path: '/childHome',
  //   component: () => import('@/views/dashboard/index.vue')
  // },
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404/index.vue')
  }
];
const dynamicRoutes: Array<RouteRecordRaw> = [];

// 动态生成路由
Object.keys(viewsList).forEach((key) => {
  const statIndex = key.indexOf('/', 5);
  const endIndex = key.lastIndexOf('/');
  const folderName = key.substring(statIndex + 1, endIndex);
  const appName = import.meta.env.VITE_APP_NAME;

  const fileNameEndIndex = key.lastIndexOf('.');
  const fileName = key.substring(endIndex + 1, fileNameEndIndex);

  if (fileName !== folderName) return;

  // 排除特殊页面
  if (appName && basicRoutes.findIndex(item => item.name === fileName) === -1) {
    const route: RouteRecordRaw = {
      name: fileName,
      path: `/${fileName}`,
      component: viewsList[key] // 使用懒加载组件
    };
    dynamicRoutes.push(route);
  }
});


const routes = dynamicRoutes.concat(basicRoutes);
export default routes;
