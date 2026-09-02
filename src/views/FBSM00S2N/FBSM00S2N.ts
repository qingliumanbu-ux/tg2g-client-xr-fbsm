/*
 * @Description:
 * @Author: Edward
 * @Date: 2022-06-02 17:21:37
 * @LastEditors: zhangTing
 * @LastEditTime: 2023-07-19 15:13:06
 */
import {
  defineComponent,
  onMounted,
  ref,
  reactive,
  computed,
  nextTick,
  toRaw,
  Ref,
} from "vue";
import { EI, EIManager } from "EIX/ei";
import { ER } from "ERX/Er";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";
import EFCallForm from 'EFX/EFCallForm';
import xrEfDialog from 'EFX/xrEfDialog';
import FBSMPLS2N from '../FBSMPLS2N/FBSMPLS2N.vue';
import { useRoute } from "vue-router";

export default defineComponent({
  name: "FBSM00S2N",
  components: {
    xrEfForm,
    xrEfPanel,
    erLayout,
    erGrid,
    xrEfDialog,
    FBSMPLS2N,
  },
  // 1.注册emit事件
  emit: ["handleF4ChildInfo"],
  setup: () => {
    const dropdownlistValue = ref("0");
    const dataSourceArray = [
      { text: "在线数据", value: "0" },
      { text: "历史数据", value: "1" },
    ];

    let selectedDataItems: any[] = [];

    // 画面相关数据初始化定义
    const erFormHelper = new ER.FormHelper();
    const initializeService = "fbsm_form_get";
    const mainGridData = ref<any>([]);
    const subGridData = ref<any>([]);
    let gridView1!: any;
    const initializeFlag = ref(0);
    let selectedMainGridRow: any = []; //焦点行数据
    // 画面相关数据初始化定义
    const efFormInfo = ref<{ [key: string]: any }>({});
    const efFormIsReady = ref(false);
    const layoutKey = ref("LayoutGroupFilter01");
    const layoutKey2 = ref("Prod1");
    const gridKey = ref("gridView01");
    const idKey = ref("tfbsm01");
    let dt_key = new EI.EiBlock();
    let factory_div: string;
    let table_name: string;
    let formPartition: string;
    let initFormParas: any;
    const route = useRoute();
    let formName = "FBSM00S2N";

    const toolbarOptions = ref({
      showToolbar: true,
      showIco: true,
      showText: true,
    });

    const getRouteParams = () => {
      // 本地调试 ----------------------------------------
      // route.query.TABLE_ID = "tfbsm01";
      // route.query.COMM_FMLY_CODE = "2";
      // route.query.MATERIAL_CODE = "005";
      // route.query.ST_NO = "1A1037";
      // route.query.BACKLOG_EA = "01";
      // ------------------------------------------------
      console.log('route', route);

      return {
        TABLE_ID: route.query.TABLE_ID || '',
        COMM_FMLY_CODE: route.query.COMM_FMLY_CODE || '',
        MATERIAL_CODE: route.query.MATERIAL_CODE || '',
        ST_NO: route.query.ST_NO || '',
        BACKLOG_EA: route.query.BACKLOG_EA || ''
      };
    };

    const staticTables = ref([
      {
        id: "tfbsm01",
        name: "工序投料品名维护",
        grid: "gridviewMain01",
        layout: "LayoutGroupFilter01",
        table_key: "MAT_CODE,STATION_ID",
        order_by: "MAT_CODE",
        service: "fbsma01_save",
        service_inq: "fbsm01_inq",
        colName: "*",
      },
      {
        id: "tfbsm24",
        name: "配料原则配置维护",
        grid: "gridviewMain24",
        layout: "LayoutGroupFilter24",
        table_key: "COMM_FMLY_CODE,MATERIAL_CODE,ST_NO",
        order_by: "ST_NO",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm05",
        name: "工序成分基准维护",
        grid: "gridviewMain05",
        layout: "LayoutGroupFilter05",
        table_key: "ELM_CODE,STATION_ID",
        order_by: "ST_NO",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm04",
        name: "收得率维护",
        grid: "gridviewMain04",
        layout: "LayoutGroupFilter04",
        table_key: "COMM_FMLY_CODE,STATION_ID",
        order_by: "COMM_FMLY_CODE",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm09",
        name: "工序投料比维护",
        grid: "gridviewMain09",
        layout: "LayoutGroupFilter09",
        table_key: "ST_NO,BACKLOG_EA",
        order_by: "COMM_FMLY_CODE",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm20",
        name: "AOD还原硅铁维护",
        grid: "gridviewMain20",
        layout: "LayoutGroupFilter20",
        table_key: "COMM_FMLY_CODE,BACKLOG_EA",
        order_by: "COMM_FMLY_CODE,BACKLOG_EA",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm11",
        name: "产品对应关系维护",
        grid: "gridviewMain11",
        layout: "LayoutGroupFilter11",
        table_key: "ST_NO",
        order_by: "ST_NO",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },

      {
        id: "tfbsm03",
        name: "原料基准价格",
        grid: "gridviewMain03",
        layout: "LayoutGroupFilter03",
        table_key: "VERSION_D,MAT_CODE",
        order_by: "VERSION_D DESC",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm07",
        name: "标准成本",
        grid: "gridviewMain07",
        layout: "LayoutGroupFilter07",
        table_key: "ST_NO",
        order_by: "ST_NO",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm08",
        name: "废钢基准成分维护",
        grid: "gridviewMain08",
        layout: "LayoutGroupFilter08",
        table_key: "MAT_CODE",
        order_by: "MAT_CODE",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm10",
        name: "废钢大类与品名维护",
        grid: "gridviewMain10",
        layout: "LayoutGroupFilter10",
        table_key: "MAT_CODE,BIG_CLASS_NAME",
        order_by: "BIG_CLASS_NAME",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm06",
        name: "出钢记号与路径对应关系维护",
        grid: "gridviewMain06",
        layout: "LayoutGroupFilter06",
        table_key: "ST_NO,BACKLOG_EA",
        order_by: "ST_NO",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm25",
        name: "AOD料槽配置维护",
        grid: "gridviewMain25",
        layout: "LayoutGroupFilter25",
        table_key: "MAT_CODE",
        order_by: "MAT_CODE",
        service: "fbsma_save",
        service_inq: "fbsma_inq",
        colName: "*",
      },
      {
        id: "tfbsm00",
        name: "钢种数据情况查询",
        grid: "gridviewMain00",
        layout: "LayoutGroupFilter00",
        table_key: "MAT_CODE",
        order_by: "MAT_CODE",
        service: "fbsma_save",
        service_inq: "fbsm00_inq",
        colName: "*",
      },

      //{ id: 'tfbsm16', name: '预溶液成分', grid: 'gridviewMain16', layout: 'LayoutGroupFilter16',table_key: 'PRODCLASSCODE,MATERIAL_CODE',order_by: 'PRODCLASSCODE,MATERIAL_CODE',service: 'fbsma_save',service_inq: 'fbsma_inq',colName: '*' },
    ]);
    const activeTableId = ref("");

    // #region 获取表参数配置
    const getgridNameById = (id: string): string => {
      const table = staticTables.value.find((item) => item.id === id);
      return table ? table.grid : "gridView01";
    };

    const getlayoutNameById = (id: string): string => {
      const table = staticTables.value.find((item) => item.id === id);
      return table ? table.layout : "LayoutGroupFilter01";
    };

    const gettablekeyById = (id: string): string => {
      const table = staticTables.value.find((item) => item.id === id);
      return table ? table.table_key : " ";
    };

    const getorderbyById = (id: string): string => {
      const table = staticTables.value.find((item) => item.id === id);
      return table ? table.order_by : " ";
    };

    const getserviceById = (id: string): string => {
      const table = staticTables.value.find((item) => item.id === id);
      return table ? table.service : " ";
    };

    const getserviceinqById = (id: string): string => {
      const table = staticTables.value.find((item) => item.id === id);
      return table ? table.service_inq : " ";
    };

    const getcolumnById = (id: string): string => {
      const table = staticTables.value.find((item) => item.id === id);
      return table ? table.colName : "*";
    };
    // #endregion

    // xr-ef-form提供了ready事件, 在这里获取画面配置信息
    const efFormReady = (e: any) => {
      efFormInfo.value = e.formInfo;
      efFormIsReady.value = true;
      formPartition = efFormInfo.value.formPartition; // 分区
      console.log('efFormInfo.value', efFormInfo.value);

      //formName = efFormInfo.value.formParams['formname'];
      //factory_div = efFormInfo.value.formParams['factory_div'];
      //table_name = efFormInfo.value.formParams['table_name'];
      //console.log("000分区"+formPartition+"画面名"+formName);
      Initialize();
    };

    // 画面相关数据初始化
    const Initialize = async () => {
      const routeParams = getRouteParams();

      // 参数校验（参考 MMHR21A5 模式）
      if (!routeParams.TABLE_ID) {
        erFormHelper.messageError('打开方式不正确：缺少必要参数！');
        return;
      }

      idKey.value = routeParams.TABLE_ID.toString();
      activeTableId.value = idKey.value; // 同步当前激活表ID
      layoutKey.value = getlayoutNameById(idKey.value);
      gridKey.value = getgridNameById(idKey.value);
      console.log("TABLE_ID", routeParams.TABLE_ID);
      // formPartition='XGEFP';
      const initialResult = await erFormHelper.Initialize(
        formPartition,
        formName,
        [layoutKey.value, layoutKey2.value, gridKey.value],
        initializeService,
        initFormParas,
      );

      if (initialResult.flag > 0) {
        initializeFlag.value = 1;

        // 回调函数获取控件信息及设置定义事件等操作
        nextTick(() => {
          dt_key = GetKey(gettablekeyById(idKey.value));
          setToolbarVisible(gridKey.value, true);
          // 获取画面上的主要控件信息
          erFormHelper.setControlValue(
            layoutKey.value,
            "COMM_FMLY_CODE",
            routeParams.COMM_FMLY_CODE,
          );
          erFormHelper.setControlValue(
            layoutKey.value,
            "MATERIAL_CODE",
            routeParams.MATERIAL_CODE,
          );
          erFormHelper.setControlValue(
            layoutKey.value,
            "ST_NO",
            routeParams.ST_NO,
          );
          if (idKey.value !== 'tfbsm01') {
            erFormHelper.setControlValue(
              layoutKey.value,
              "BACKLOG_EA",
              routeParams.BACKLOG_EA,
            );
          }
          nextTick(() => {
            query();
          });
        });
        // 初始化工具栏
      } else {
        erFormHelper.messageError(
          "ErFormHelper initialize faild, error msg is [" +
          initialResult.msg +
          "]!",
        );
      }
    };


    // 根据表ID生成对应的画面名
    const getFormNameByTableId = (tableId: string): string => {
      // // 从tfbsm08中提取数字08，拼成FBSM08S2N
      // const num = tableId.replace(/\D/g, ''); // 提取数字部分
      // return `FBSM${num}S2N`;
      return formName;
    };
    // 切换显示的表
    const switchTable = async (tableId: string) => {
      if (activeTableId.value !== tableId) {
        initializeFlag.value = 0;
        formName = getFormNameByTableId(tableId);
        activeTableId.value = tableId;
        console.log(tableId);
        layoutKey.value = getlayoutNameById(tableId);
        gridKey.value = getgridNameById(tableId);
        idKey.value = tableId;
        //console.log("重新初始化formName:", formName);
        console.log("重新初始化layoutKey:", layoutKey.value);
        console.log("重新初始化gridKey:", gridKey.value);
        await reinitializeForm();
        // nextTick(() => {
        //   initializeFlag.value = 1;
        // })
      }
    };
    // 添加重新初始化表单的方法
    const reinitializeForm = async () => {
      try {
        console.log("重新初始化 - 分区:", formPartition, "画面名:", formName);
        // 检查必需参数
        if (!formPartition || !formName) {
          console.error("重新初始化参数缺失:", { formPartition, formName });
          erFormHelper.messageError("画面重新初始化参数缺失！");
          return;
        }

        // 先将initializeFlag设为0，触发组件卸载
        initializeFlag.value = 0;

        // 等待下一个tick，确保组件完全卸载
        await nextTick();

        console.log("重新初始化formName:", formName);
        console.log("重新初始化initFormParas:", initFormParas);
        // 重新初始化
        const initialResult = await erFormHelper.Initialize(
          formPartition,
          formName,
          [layoutKey.value, layoutKey2.value, gridKey.value],
          initializeService,
          initFormParas,
        );

        if (initialResult.flag > 0) {
          initializeFlag.value = 1;
          console.log("重新初始化成功");

          // 等待组件渲染完成
          await nextTick();
          // 回调函数获取控件信息及设置定义事件等操作
          nextTick(() => {
            dt_key = GetKey(gettablekeyById(idKey.value));
            setToolbarVisible(gridKey.value, true);
            const routeParams = getRouteParams();
            // 获取画面上的主要控件信息
            if (idKey.value !== 'tfbsm24') {
              erFormHelper.setControlValue(
                layoutKey.value,
                "COMM_FMLY_CODE",
                routeParams.COMM_FMLY_CODE,
              );
              erFormHelper.setControlValue(
                layoutKey.value,
                "MATERIAL_CODE",
                routeParams.MATERIAL_CODE,
              );
              erFormHelper.setControlValue(
                layoutKey.value,
                "ST_NO",
                routeParams.ST_NO,
              );
              if (idKey.value !== 'tfbsm01') {
                erFormHelper.setControlValue(
                  layoutKey.value,
                  "BACKLOG_EA",
                  routeParams.BACKLOG_EA,
                );
              }
            }
            // 重新查询数据
            query();
          });
        } else {
          const errorMsg =
            "ErFormHelper重新初始化失败,错误信息:${initialResult.msg}";
          console.error(errorMsg);
          erFormHelper.messageError(errorMsg);

          // 如果失败，恢复之前的状态
          initializeFlag.value = 1;
        }
      } catch (error) {
        console.error("重新初始化异常:", error);
        erFormHelper.messageError("重新初始化异常: ${error}");

        // 如果异常，恢复之前的状态
        initializeFlag.value = 1;
      }
    };

    const erGrid1Ready = (e: any) => {
      gridView1 = erFormHelper.getGrid(gridKey);
      const routeParams = getRouteParams();
      console.log("addrow", routeParams.ST_NO);
      erFormHelper.initialGridToolbar(gridKey.value, {
        addrow: {
          visible: true,
          action: async () => {
            console.log("addrow1", routeParams.ST_NO);
            // erFormHelper.setControlValue(gridView1, 'BACKLOG_EA', routeParams.BACKLOG_EA);
            // erFormHelper.setControlValue(gridView1, 'COMM_FMLY_CODE', routeParams.COMM_FMLY_CODE);
            // erFormHelper.setControlValue(gridView1, 'MATERIAL_CODE', routeParams.MATERIAL_CODE);
            // erFormHelper.setControlValue(gridView1, 'ST_NO', routeParams.ST_NO);
            const rowData = erFormHelper.addRowToGrid(gridKey.value, true);
            console.log("addrow", routeParams.ST_NO);
            erFormHelper.setGridRowData(gridKey.value, rowData, {
              ST_NO: routeParams.ST_NO,
            });
            erFormHelper.setGridRowData(gridKey.value, rowData, {
              COMM_FMLY_CODE: routeParams.COMM_FMLY_CODE,
            });
            erFormHelper.setGridRowData(gridKey.value, rowData, {
              MATERIAL_CODE: routeParams.MATERIAL_CODE,
            });
            erFormHelper.setGridRowData(gridKey.value, rowData, {
              BACKLOG_EA: routeParams.BACKLOG_EA,
            });
          },
          // 是否阻止默认事件触发
          preventDefault: true,
        },
      });
    };

    const editable = ref(false);

    onMounted(() => {
      //   Initialize();
    });

    // 查询
    const f2Do = () => {
      query();
    };

    // const closeEfDialog = async (e: any) => {
    //   //关闭事件
    //   console.log("关闭事件触发");
    //   // 检查是否有未保存的修改
    //   if (erFormHelper.hasDataChange(gridKey.value)) {
    //     console.log("有修改的数据未保存");
    //     if (await erFormHelper.messageConfirm("有修改的数据未被保存，是否继续？") === false) {
    //       return false;
    //     }
    //   }
    //   const data = {
    //     ST_NO: "",
    //     closeEfDialog: true,
    //   };
    //   emit("handleF4ChildInfo", data);
    //   //returnparent();
    // };

    const F6_DO = async (e: any) => {
      if (!erFormHelper.hasDataChange(gridKey.value)) {
        erFormHelper.messageWarning("无数据更改,不需要保存");
        return;
      }
      const inInfo = erFormHelper.getGridChangedRowsAsEiInfo(gridKey.value);
      inInfo.addBlock(dt_key);
      console.log(inInfo);
      console.log(getserviceById(idKey.value));
      const outInfo = await erFormHelper.callService(
        getserviceById(idKey.value),
        inInfo,
      );
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError(outInfo.msg);
        return false;
      } else {
        erFormHelper.messageSuccess("保存成功！");
      }
      await query();
    };
    const F6_PRE_DO = async (e: any) => { };
    const F6_CANCEL = async (e: any) => { };

    // F7 批量复制
    const fbsmplDialogVisible = ref(false);
    const fbsmplParentInfo = ref<any>({});

    const F7_DO = async (e: any) => {
      if (activeTableId.value !== 'tfbsm01' && activeTableId.value !== 'tfbsm05') {
        erFormHelper.messageWarning('批量复制功能仅适用于工序投料品名维护和工序基准成分维护！');
        return;
      }
      const selectedBlock = erFormHelper.getGridSelectRowsAsBlock(gridKey.value);
      if (!selectedBlock || !selectedBlock.data || selectedBlock.data.length === 0) {
        erFormHelper.messageWarning('请先勾选至少一行数据！');
        return;
      }
      fbsmplParentInfo.value = {
        PARENT: 'FBSM00S2N',
        SELECTED_ROWS: selectedBlock.data,
        TABLE_ID: activeTableId.value,
        COMM_FMLY_CODE: erFormHelper.getControlValue(layoutKey.value, 'COMM_FMLY_CODE'),
        MATERIAL_CODE: erFormHelper.getControlValue(layoutKey.value, 'MATERIAL_CODE'),
        ST_NO: erFormHelper.getControlValue(layoutKey.value, 'ST_NO'),
      };
      fbsmplDialogVisible.value = true;
    };

    const handleFbsmplChildInfo = (info: any) => {
      if (info.closeEfDialog === true) {
        fbsmplDialogVisible.value = false;
        query();
      }
    };

    //查询
    const query = async () => {
      const inInfo = new EI.EIInfo();
      const eiBlock = erFormHelper.getAllControlValueAsEiBlock(layoutKey.value);
      console.log('查询传入数据：', eiBlock);
      inInfo.addBlock(eiBlock);
      const pageBlock = inInfo.addBlock(new EI.EiBlock(), "page");
      pageBlock.addColumns(
        "tableName",
        "colName",
        "ORDER_BY",
        "PAGE_NUM",
        "PAGE_SIZE",
      );
      pageBlock.addRow({
        tableName: idKey.value,
        colName: getcolumnById(idKey.value),
        ORDER_BY: getorderbyById(idKey.value),
      });
      //service_inq
      const outInfo = await erFormHelper.callService(
        getserviceinqById(idKey.value),
        inInfo,
      );
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError("查询错误:" + outInfo.sys.msg);
        return;
      } else {
        console.log(outInfo);
        erFormHelper.mergeDataToGrid(outInfo, gridKey.value);

        const data = outInfo.getBlock(0).data || [];
        let latestTime = "";
        let latestPerson = "";

        for (const row of data) {
          const reviseTime = row["REC_REVISE_TIME"] || "";
          const createTime = row["REC_CREATE_TIME"] || "";

          if (reviseTime && reviseTime > latestTime) {
            latestTime = reviseTime?.toString();
            latestPerson = row["REC_REVISOR"]?.toString() || "";
          }

          if (createTime && createTime > latestTime) {
            latestTime = createTime?.toString();
            latestPerson = row["REC_CREATOR"]?.toString() || "";
          }
        }

        erFormHelper.setControlValue(layoutKey2.value, "REC_REVISE_TIME", latestTime);
        erFormHelper.setControlValue(layoutKey2.value, "REC_REVISOR", latestPerson);
      }
    };

    //获取主键列
    function GetKey(tableKey: string) {
      const dt = new EI.EiBlock();
      dt.addColumns("COLNAME");
      if (tableKey !== "") {
        const colNames = tableKey.split(",");
        for (const colName in colNames) {
          dt.addRow({
            COLNAME: colNames[colName],
          });
        }
      }
      dt.name = "DT_KEY";
      return dt;
    }
    const setToolbarVisible = (configId: string, visible: boolean) => {
      erFormHelper.setGridToolbarVisible(configId, {
        import: true,
        excel: true,
      });
    };

    return {
      erFormHelper,
      toolbarOptions,
      initializeFlag,
      editable,
      dropdownlistValue,
      dataSourceArray,
      Initialize,
      f2Do,
      gridView1,
      efFormReady,
      erGrid1Ready,
      staticTables,
      activeTableId,
      switchTable,
      layoutKey,
      layoutKey2,
      gridKey,
      F6_PRE_DO,
      F6_CANCEL,
      F6_DO,
      fbsmplDialogVisible,
      fbsmplParentInfo,
      F7_DO,
      handleFbsmplChildInfo,
    };
  },
});
