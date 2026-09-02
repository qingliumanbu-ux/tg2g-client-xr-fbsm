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
  name: "FBSM31GS2N",
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
    const formName = "FBSM31GS2N";
    const form_name = ref("");
    const base_code = ref(""); //基地
    const function_id = ref(0);
    const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
    const initializeFlag = ref(0);
    const efFormInfo = ref<{ [key: string]: any }>({});
    const efFormIsReady = ref(false);
    const factory_div = ref(""); //产线
    const LayoutGroupFilter = ref("LayoutGroupFilter");

    let gridView1: any;
    let gridView2: any;
    let gridView3: any;
    const tabStrip = ref("AntTabPane_xGWay564"); // Tab1当前选中的标签页的键值
    const call_id = ref(0);

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

    const erGrid1Ready = () => {
      gridView1 = erFormHelper.getGrid("gridView1");
    };
    const erGrid2Ready = () => {
      gridView2 = erFormHelper.getGrid("gridView2");
    };
    const erGrid3Ready = () => {
      gridView3 = erFormHelper.getGrid("gridView3");
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
              "DATE_TIME",
              props.parentInfo.DATE_TIME,
            );
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
        "fbsm31g_inq",
        inInfo,
        true,
        undefined,
        undefined,
      );
      console.log("outInfo", outInfo);
      erFormHelper.mergeDataToGrid(outInfo.getBlock(0), "gridView1");
      erFormHelper.mergeDataToGrid(outInfo.getBlock(1), "gridView2");
      erFormHelper.mergeDataToGrid(outInfo.getBlock(2), "gridView3");
    };

    onMounted(() => {});

    // tab1 页切换事件
    const handleTab1Change = (activeKey: string) => {
      if (activeKey === "AntTabPane_xGWay564") {
        tabStrip.value = "AntTabPane_xGWay564";
      } else if (activeKey === "AntTabPane_8rJPIIpz") {
        tabStrip.value = "AntTabPane_8rJPIIpz";
      } else if (activeKey === "AntTabPane_ZqhNaB8Q") {
        tabStrip.value = "AntTabPane_ZqhNaB8Q";
      }
      query_Info();
    };

    //查询
    const F2_DO = async (e: any) => {
      query_Info();
    };
    const closeEfDialog = () => {
      //关闭事件
      const data = {
        ST_NO: "",
        closeEfDialog: true,
      };
      emit("getChildInfo", data);
    };

    const efFormInitialized = (formInfo: any) => {
      console.log("FBSM31GS2N-efFormInitialized", formInfo);
    };

    return {
      erFormHelper,
      initializeFlag,
      closeEfDialog,
      efFormInitialized,
      F2_DO,
      efFormReady,
      erGrid1Ready,
      erGrid2Ready,
      erGrid3Ready,
      handleTab1Change,
      LayoutGroupFilter,
    };
  },
});
