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
  name: "FBSM15PS2N",
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
    const formName = "FBSM15PS2N";
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
    const gridviewMain = ref("gridviewMain");
    // const LayoutGroupFilterdeal = ref('LayoutGroupNotion');

    let gridView1: any;
    let gridView2: any;
    let gridView3: any;
    const tabStrip = ref("AntTabPane_xGWay564"); // Tab1当前选中的标签页的键值
    const tabStrip_process = ref("Iron"); // Tab2当前选中的标签页的键值
    const call_id = ref(0);
    const s_id = ref<string[]>([]); // 定义为响应式数组

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
      erFormHelper.setGridToolbarVisible("gridView1", {
        addrow: true,
        copyrow: true,
        delete: true,
      });
    };
    const erGrid2Ready = () => {
      gridView2 = erFormHelper.getGrid("gridView2");
      erFormHelper.setGridToolbarVisible("gridView2", {
        addrow: true,
        copyrow: true,
        delete: true,
      });
    };
    const erGrid3Ready = () => {
      gridView3 = erFormHelper.getGrid("gridView3");
      erFormHelper.setGridToolbarVisible("gridView3", {
        addrow: true,
        copyrow: true,
        delete: true,
      });
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
            // console.log('props', props.parentInfo.ST_NO);
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
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "SEQ_NO",
              props.parentInfo.SEQ_NO,
            );
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "DATE_C",
              props.parentInfo.DATE_C,
            );
            erFormHelper.setControlValue(
              LayoutGroupFilter.value,
              "MATERIAL_CODE",
              props.parentInfo.MATERIAL_CODE,
            );
            //默认gridmain
            erFormHelper.setControlValue(
              gridviewMain.value,
              "COMPOSE_LIST_NO",
              props.parentInfo.COMPOSE_LIST_NO,
            );
            erFormHelper.setControlValue(
              gridviewMain.value,
              "ST_NO",
              props.parentInfo.ST_NO,
            );
            erFormHelper.setControlValue(
              gridviewMain.value,
              "BACKLOG_EA",
              props.parentInfo.BACKLOG_EA,
            );
            erFormHelper.setControlValue(
              gridviewMain.value,
              "DATE_TIME",
              props.parentInfo.DATE_TIME,
            );
            erFormHelper.setControlValue(
              gridviewMain.value,
              "SEQ_NO",
              props.parentInfo.SEQ_NO,
            );
            erFormHelper.setControlValue(
              gridviewMain.value,
              "DATE_C",
              props.parentInfo.DATE_C,
            );
            erFormHelper.setControlValue(
              gridviewMain.value,
              "MATERIAL_CODE",
              props.parentInfo.MATERIAL_CODE,
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
      console.log("ST_NO", props.parentInfo.ST_NO);
      const allversionNo = await erFormHelper.queryDataByDataSource("FBSM50A", {
        customFilter: `   ( base.ST_NO ='${props.parentInfo.ST_NO}' OR (base.ST_NO !='${props.parentInfo.ST_NO}' AND base.MAT_FAMILY_CODE = '1' AND base.MATERIAL_CODE ='${props.parentInfo.MATERIAL_CODE}') OR (base.ST_NO !='${props.parentInfo.ST_NO}' AND base.MAT_FAMILY_CODE = '2' AND base.MATERIAL_CODE !='${props.parentInfo.MATERIAL_CODE}') OR (base.ST_NO !='${props.parentInfo.ST_NO}' AND base.MAT_FAMILY_CODE = '3' AND base.COMM_FMLY_CODE !='${props.parentInfo.COMM_FMLY_CODE}' AND base.MATERIAL_CODE !='${props.parentInfo.MATERIAL_CODE}') )  `,
      });
      await erFormHelper.reloadDropDownDataSource(
        "gridView1",
        "SEQ_NO",
        allversionNo.getBlock(0).data,
      );
      await erFormHelper.reloadDropDownDataSource(
        "gridView2",
        "SEQ_NO",
        allversionNo.getBlock(0).data,
      );
      await erFormHelper.reloadDropDownDataSource(
        "gridView3",
        "SEQ_NO",
        allversionNo.getBlock(0).data,
      );
      const eiInfo = new EI.EIInfo();
      //props.parentInfo.data

      eiInfo.addBlock(
        erFormHelper.getAllControlValueAsEiBlock("LayoutGroupFilter"),
      );
      console.log(eiInfo, "eiInfo");
      const outInfo = await erFormHelper.callService("fbsm15_elm_inq", eiInfo);
      if (outInfo.sys.status < 0) {
        erFormHelper.messageInfo(outInfo.sys.msg);
        return;
      }
      if (outInfo.getBlock(2).data.length <= 0) {
        s_id.value[2] = " ";
      } else {
        if (outInfo.getBlock(2).data[0]["STATION_ID"] == "Z") {
          s_id.value[2] = "合 金 熔 化 炉 ";
        } else if (outInfo.getBlock(2).data[0]["STATION_ID"] == "E") {
          s_id.value[2] = "电 炉";
        } else if (
          outInfo.getBlock(2).data[0]["STATION_ID"] == "A" ||
          outInfo.getBlock(2).data[0]["STATION_ID"] == "Y"
        ) {
          s_id.value[2] = "A O D";
        } else if (outInfo.getBlock(2).data[0]["STATION_ID"] == "B") {
          s_id.value[2] = "转 炉";
        } else if (outInfo.getBlock(2).data[0]["STATION_ID"] == "D") {
          s_id.value[2] = "三 脱";
        } else {
          s_id.value[2] = " ";
        }
      }
      if (outInfo.getBlock(1).data.length <= 0) {
        s_id.value[1] = " ";
      } else {
        if (outInfo.getBlock(1).data[0]["STATION_ID"] == "Z") {
          s_id.value[1] = "合 金 熔 化 炉 ";
        } else if (outInfo.getBlock(1).data[0]["STATION_ID"] == "E") {
          s_id.value[1] = "电 炉";
        } else if (
          outInfo.getBlock(1).data[0]["STATION_ID"] == "A" ||
          outInfo.getBlock(1).data[0]["STATION_ID"] == "Y"
        ) {
          s_id.value[1] = "A O D";
        } else if (outInfo.getBlock(1).data[0]["STATION_ID"] == "B") {
          s_id.value[1] = "转 炉";
        } else if (outInfo.getBlock(1).data[0]["STATION_ID"] == "D") {
          s_id.value[1] = "三 脱";
        } else {
          s_id.value[1] = " ";
        }
      }
      if (
        outInfo.getBlock(0).data.length > 0 ||
        outInfo.getBlock(1).data.length > 0 ||
        outInfo.getBlock(2).data.length > 0
      ) {
        erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, "gridView1");
        // erFormHelper.setGridColumnEditable('gridView1', false);
        erFormHelper.mergeDataToGrid(outInfo.getBlock(1).data, "gridView2");
        // erFormHelper.setGridColumnEditable('gridView2', false);
        erFormHelper.mergeDataToGrid(outInfo.getBlock(2).data, "gridView3");
        // erFormHelper.setGridColumnEditable('gridView3', false);
        console.log("1", outInfo.getBlock(0).data[0]["STATION_ID"]);
        if (outInfo.getBlock(0).data[0]["STATION_ID"] == "Z") {
          s_id.value[0] = "合 金 熔 化 炉 ";
        } else if (outInfo.getBlock(0).data[0]["STATION_ID"] == "E") {
          s_id.value[0] = "电 炉";
        } else if (
          outInfo.getBlock(0).data[0]["STATION_ID"] == "A" ||
          outInfo.getBlock(0).data[0]["STATION_ID"] == "Y"
        ) {
          s_id.value[0] = "A O D";
        } else if (outInfo.getBlock(0).data[0]["STATION_ID"] == "B") {
          s_id.value[0] = "转 炉";
        } else if (outInfo.getBlock(0).data[0]["STATION_ID"] == "D") {
          s_id.value[0] = "三 脱";
        } else {
          s_id.value[0] = " ";
        }
      } else {
        erFormHelper.clearGridData("gridView1");
        erFormHelper.clearGridData("gridView2");
        erFormHelper.clearGridData("gridView3");
        s_id.value[0] = " ";
        s_id.value[1] = " ";
        s_id.value[2] = " ";
        return;
      }
    };

    onMounted(() => {});

    //查询
    const F2_DO = async (e: any) => {
      query_Info();
    };
    //保存
    const F4_DO = async (e: any) => {
      console.log("F4_DO");
      const inInfo = new EI.EIInfo();
      inInfo.addBlock(erFormHelper.getGridAllRowsAsBlock("gridView1"), "X1");
      inInfo.addBlock(erFormHelper.getGridAllRowsAsBlock("gridView2"), "X2");
      inInfo.addBlock(erFormHelper.getGridAllRowsAsBlock("gridView3"), "X3");
      inInfo.addBlock(
        erFormHelper.getAllControlValueAsEiBlock("LayoutGroupFilter"),
        "LD",
      );
      console.log(inInfo);
      const outInfo = await erFormHelper.callService("fbsm15_save", inInfo);
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError(outInfo.sys.msg);
        return false;
      }
      erFormHelper.setControlValue(
        LayoutGroupFilter.value,
        "COMPOSE_LIST_NO",
        outInfo.getBlock(0).data[0]["COMPOSE_LIST_NO"],
      );
      console.log("F4_DO", outInfo.getBlock(0).data[0]["COMPOSE_LIST_NO"]);
      query_Info();
      // erFormHelper.setGridToolbarVisible('gridView1',
      //   {
      //     addrow: false,
      //     copyrow: false,
      //     delete: false
      //   }
      // );
      // erFormHelper.setGridToolbarVisible('gridView2',
      //   {
      //     addrow: false,
      //     copyrow: false,
      //     delete: false
      //   }
      // );
      // erFormHelper.setGridToolbarVisible('gridView3',
      //   {
      //     addrow: false,
      //     copyrow: false,
      //     delete: false
      //   }
      // );
      erFormHelper.messageInfo("成功。");
    };
    //F9_DO 手工保存
    const F9_DO = async (e: any) => {
      console.log("F9_DO");
      const inInfo = new EI.EIInfo();
      inInfo.addBlock(erFormHelper.getGridAllRowsAsBlock("gridView1"), "X1");
      inInfo.addBlock(erFormHelper.getGridAllRowsAsBlock("gridView2"), "X2");
      inInfo.addBlock(erFormHelper.getGridAllRowsAsBlock("gridView3"), "X3");
      inInfo.addBlock(
        erFormHelper.getAllControlValueAsEiBlock("LayoutGroupFilter"),
        "LD",
      );
      console.log(inInfo);
      const outInfo = await erFormHelper.callService("fbsm15_sg_save", inInfo);
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError(outInfo.sys.msg);
        return false;
      }
      erFormHelper.setControlValue(
        LayoutGroupFilter.value,
        "COMPOSE_LIST_NO",
        outInfo.getBlock(0).data[0]["COMPOSE_LIST_NO"],
      );
      console.log("F9_DO", outInfo.getBlock(0).data[0]["COMPOSE_LIST_NO"]);
      query_Info();
      erFormHelper.messageInfo("成功。");
    };
    //审核
    const F5_DO = async (e: any) => {
      console.log("F5_DO");
      const inInfo = new EI.EIInfo();
      inInfo.addBlock(
        erFormHelper.getAllControlValueAsEiBlock("LayoutGroupFilter"),
        "LD",
      );
      console.log(inInfo);
      const outInfo = await erFormHelper.callService("fbsm15_sh_upd", inInfo);
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError(outInfo.sys.msg);
        return false;
      }
      erFormHelper.messageInfo("审核成功!!!");
    };
    //审核取消
    const F8_DO = async (e: any) => {
      console.log("F8_DO");
      const inInfo = new EI.EIInfo();
      inInfo.addBlock(
        erFormHelper.getAllControlValueAsEiBlock("LayoutGroupFilter"),
        "LD",
      );
      console.log(inInfo);
      const outInfo = await erFormHelper.callService("fbsm15_sh_del", inInfo);
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError(outInfo.sys.msg);
        return false;
      }
      erFormHelper.messageInfo("审核取消!!!");
    };
    //手工配料单 fbsm15_sg_save
    const closeEfDialog = () => {
      //关闭事件
      const data = {
        ST_NO: "",
        closeEfDialog: true,
      };
      emit("getChildInfo", data);
      //returnparent();
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
      F4_DO,
      F5_DO,
      F8_DO,
      efFormReady,
      erGrid1Ready,
      erGrid2Ready,
      erGrid3Ready,
      LayoutGroupFilter,
      gridView_mat_name,
      s_id,
      F9_DO,
    };
  },
});
