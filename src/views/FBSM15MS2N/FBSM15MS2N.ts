import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
  toRaw,
  nextTick,
} from "vue";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import xrEfDialog from "EFX/xrEfDialog";
import EFUtility from "EFX/EFUtility";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";
import { ER } from "ERX/Er";
import { SiUtils } from "ERX/SiUtils";
import { FiUtils } from "ERX/FiUtils";
import { EI, EP } from "EIX/ei";
import { Console } from "console";

export default defineComponent({
  name: "FBSM15MS2N",
  components: {
    xrEfForm,
    xrEfPanel,
    xrEfSearchBox,
    xrEfDialog,
    erGrid,
    erLayout,
  },
  props: {
    openInDialog: {
      type: Boolean,
      default: false,
    },
    dialogFormName: {
      type: String,
      default: "",
    },
    parentInfo: {
      type: Object,
      default: "",
    },
  },
  // 1.注册emit事件
  emits: ["getChildInfo"],
  setup: (props, { emit }) => {
    // 获取画面的分区信息及设置画面初始化service
    const formPartition = ref("");
    const initializeService = "fbsm_form_get";

    // 变量定义
    const formName = "FBSM15MS2N";
    const form_name = ref("");
    const base_code = ref(""); //基地
    const function_id = ref(0);
    const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
    const initializeFlag = ref(0);
    const efFormInfo = ref<{ [key: string]: any }>({});
    const efFormIsReady = ref(false);
    const factory_div = ref(""); //产线
    const LayoutGroupFilter = ref("LayoutGroupFilter");
    const gridView_mat_name = ref("gridView3");
    // const LayoutGroupFilterdeal = ref('LayoutGroupNotion');

    let gridView1: any;
    let gridView2: any;
    let gridView3: any;
    let gridviewMain: any;
    const tabStrip = ref("AntTabPane_xGWay564"); // Tab1当前选中的标签页的键值
    const tabStrip_process = ref("Iron"); // Tab2当前选中的标签页的键值
    const call_id = ref(0);
    const s_id = ref<string[]>([]); // 定义为响应式数组
    const showGrid1 = ref(true);
    const showGrid2 = ref(true);
    const showGrid3 = ref(true);
    const splitterKey = computed(() => `${showGrid1.value}-${showGrid2.value}-${showGrid3.value}`);

    const pendingGridData = reactive<{
      gridView1: any[] | null;
      gridView2: any[] | null;
      gridView3: any[] | null;
    }>({
      gridView1: null,
      gridView2: null,
      gridView3: null,
    });

    const tryMergeGridData = () => {
      if (pendingGridData.gridView1 && erFormHelper.getGrid("gridView1")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView1, "gridView1");
        pendingGridData.gridView1 = null;
      }
      if (pendingGridData.gridView2 && erFormHelper.getGrid("gridView2")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView2, "gridView2");
        pendingGridData.gridView2 = null;
      }
      if (pendingGridData.gridView3 && erFormHelper.getGrid("gridView3")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView3, "gridView3");
        pendingGridData.gridView3 = null;
      }
    };

    // xr-ef-form提供了ready事件, 在这里获取画面配置信息
    const efFormReady = (e: any) => {
      efFormInfo.value = e.formInfo;
      efFormIsReady.value = true;
      form_name.value = efFormInfo.value.formName;
      formPartition.value = efFormInfo.value.formPartition;
      base_code.value = efFormInfo.value.formParams.base_code || ""; //EPESPARA配置-基地
      factory_div.value = efFormInfo.value.formParams.factory_div || ""; //EPESPARA配置-产线
      Initialize();
    };

    //审核
    // const F5_DO = async (e: any) => {
    //     console.log('F5_DO');
    //     const inInfo = new EI.EIInfo();
    //     inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'), "LD");
    //     console.log(inInfo);
    //     const outInfo = await erFormHelper.callService('fbsm15_sh_upd', inInfo);
    //     if (outInfo.sys.status < 0) {
    //         erFormHelper.messageError(outInfo.sys.msg);
    //         return false;
    //     }
    //     erFormHelper.messageInfo('审核成功!!!');
    // };

    const erGrid1Ready = () => {
      gridView1 = erFormHelper.getGrid("gridView1");
      tryMergeGridData();
    };
    const erGridMainReady = () => {
      gridviewMain = erFormHelper.getGrid("gridviewMain");
    };
    const erGrid2Ready = () => {
      gridView2 = erFormHelper.getGrid("gridView2");
      tryMergeGridData();
    };
    const erGrid3Ready = () => {
      gridView3 = erFormHelper.getGrid("gridView3");
      tryMergeGridData();
    };

    // 画面相关数据初始化
    const Initialize = async () => {
      const initialResult = await erFormHelper.Initialize(
        formPartition.value,
        formName,
        "",
        initializeService,
      );
      if (initialResult.flag > 0) {
        initializeFlag.value = 1;
        // 回调函数获取控件信息及设置定义事件等操作
        nextTick(() => {
          nextTick(() => {
            console.log("props", props.parentInfo.ST_NO);
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "COMPOSE_LIST_NO",
              props.parentInfo.COMPOSE_LIST_NO,
            );
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "ST_NO",
              props.parentInfo.ST_NO,
            );
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "BACKLOG_EA",
              props.parentInfo.BACKLOG_EA,
            );
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "DATE_C",
              props.parentInfo.DATE_TIME,
            );
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "SEQ_NO",
              props.parentInfo.SEQ_NO,
            );
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "MB_MARK",
              props.parentInfo.MB_MARK,
            );
            if (props.parentInfo.COMM_FMLY_CODE != null && props.parentInfo.COMM_FMLY_CODE !== '') {
              erFormHelper.setControlValue(
                LayoutGroupFilter.value,
                "COMM_FMLY_CODE",
                props.parentInfo.COMM_FMLY_CODE,
              );
            }
            if (props.parentInfo.MATERIAL_CODE != null && props.parentInfo.MATERIAL_CODE !== '') {
              erFormHelper.setControlValue(
                LayoutGroupFilter.value,
                "MATERIAL_CODE",
                props.parentInfo.MATERIAL_CODE,
              );
            }
            // erFormHelper.setControlValue(LayoutGroupFilter.value, 'REPAIR_REMARK', props.parentInfo.REPAIR_REMARK);
            // erFormHelper.setControlReadOnly(LayoutGroupFilter.value, true, 'HEAT_NO');
            // erFormHelper.setControlReadOnly(LayoutGroupFilter.value, true, 'ST_NO');
            query_Info();
          });
        });
      } else {
        erFormHelper.messageError(
          "ErFormHelper initialize faild, error msg is [" +
            initialResult.msg +
            "]!",
        );
      }
    };

    //查询信息
    const query_Info = async () => {
      const inBlock = erFormHelper.getAllControlValueAsEiBlock(
        LayoutGroupFilter.value,
      );
      const inInfo = new EI.EIInfo();
      inInfo.addBlock(inBlock);
      const outInfo = await erFormHelper.callService(
        "fbsm15m_inq",
        inInfo,
        true,
        undefined,
        undefined,
      );
      console.log("outInfo", outInfo);
      //if (outInfo.sys.status < 0) erFormHelper.messageError(outInfo.sys.msg);
      erFormHelper.mergeDataToGrid(outInfo.getBlock(0), "gridviewMain");
    };

    onMounted(() => {});

    // 焦点行改变事件
    const gridviewMainFocusChanged = async (e: any) => {
      p_query_fbsm14(e.data);
    };

    //焦点行查询
    const p_query_fbsm14 = async (e: any) => {
      const eiInfo = new EI.EIInfo();
      eiInfo.addBlock(erFormHelper.getGridCurrentRowAsBlock("gridviewMain"));
      const outInfo = await erFormHelper.callService(
        "fbsm15_elm_inq",
        eiInfo,
        false,
        undefined,
        false,
        formPartition.value,
      );
      if (outInfo.sys.status < 0) {
        erFormHelper.messageInfo(outInfo.sys.msg);
        return;
      }
      const hasBlock0 = outInfo.getBlock(0).data.length > 0;
      const hasBlock1 = outInfo.getBlock(1).data.length > 0;
      const hasBlock2 = outInfo.getBlock(2).data.length > 0;

      showGrid1.value = hasBlock0;
      showGrid2.value = hasBlock1;
      showGrid3.value = hasBlock2;

      if (!hasBlock2) {
        s_id.value[2] = " ";
      }
      if (!hasBlock1) {
        s_id.value[1] = " ";
      }

      if (hasBlock0 || hasBlock1 || hasBlock2) {
        pendingGridData.gridView1 = outInfo.getBlock(0).data;
        pendingGridData.gridView2 = outInfo.getBlock(1).data;
        pendingGridData.gridView3 = outInfo.getBlock(2).data;
        nextTick(() => {
          tryMergeGridData();
        });
        if (hasBlock0) {
          const stationId0 = outInfo.getBlock(0).data[0]["STATION_ID"];
          if (stationId0 == "Z") {
            s_id.value[0] = "合 金 熔 化 炉 ";
          } else if (stationId0 == "E") {
            s_id.value[0] = "电 炉";
          } else if (stationId0 == "A" || stationId0 == "Y") {
            s_id.value[0] = "A O D";
          } else if (stationId0 == "B") {
            s_id.value[0] = "转 炉";
          } else if (stationId0 == "D") {
            s_id.value[0] = "三 脱";
          } else {
            s_id.value[0] = " ";
          }
        }
        if (hasBlock1) {
          const stationId1 = outInfo.getBlock(1).data[0]["STATION_ID"];
          if (stationId1 == "Z") {
            s_id.value[1] = "合 金 熔 化 炉 ";
          } else if (stationId1 == "E") {
            s_id.value[1] = "电 炉";
          } else if (stationId1 == "A" || stationId1 == "Y") {
            s_id.value[1] = "A O D";
          } else if (stationId1 == "B") {
            s_id.value[1] = "转 炉";
          } else if (stationId1 == "D") {
            s_id.value[1] = "三 脱";
          } else {
            s_id.value[1] = " ";
          }
        }
        if (hasBlock2) {
          const stationId2 = outInfo.getBlock(2).data[0]["STATION_ID"];
          if (stationId2 == "Z") {
            s_id.value[2] = "合 金 熔 化 炉 ";
          } else if (stationId2 == "E") {
            s_id.value[2] = "电 炉";
          } else if (stationId2 == "A" || stationId2 == "Y") {
            s_id.value[2] = "A O D";
          } else if (stationId2 == "B") {
            s_id.value[2] = "转 炉";
          } else if (stationId2 == "D") {
            s_id.value[2] = "三 脱";
          } else {
            s_id.value[2] = " ";
          }
        }
      } else {
        erFormHelper.clearGridData("gridView1");
        erFormHelper.clearGridData("gridView2");
        erFormHelper.clearGridData("gridView3");
        s_id.value[0] = " ";
        s_id.value[1] = " ";
        s_id.value[2] = " ";
        showGrid1.value = true;
        showGrid2.value = true;
        showGrid3.value = true;
        return;
      }
    };

    //查询
    const F2_DO = async (e: any) => {
      query_Info();
    };

    const closeEfDialog = () => {
      //关闭事件
      const back = erFormHelper.getGridCurrentRowAsBlock("gridviewMain");
      const data = {
        ST_NO: <string>back.data[0]["ST_NO"],
        COMPOSE_LIST_NO: <string>back.data[0]["COMPOSE_LIST_NO"],
        DATE_TIME: <string>back.data[0]["DATE_TIME"],
        closeEfDialog: true,
      };
      emit("getChildInfo", data);
    };

    const efFormInitialized = (formInfo: any) => {
      console.log("PMOG01BW-efFormInitialized", formInfo);
    };

    return {
      erFormHelper,
      initializeFlag,
      closeEfDialog,
      efFormInitialized,
      F2_DO,
      //F5_DO,
      efFormReady,
      erGrid1Ready,
      erGrid2Ready,
      erGrid3Ready,
      erGridMainReady,
      LayoutGroupFilter,
      gridView_mat_name,
      s_id,
      showGrid1,
      showGrid2,
      showGrid3,
      splitterKey,
      gridviewMainFocusChanged,
    };
  },
});
