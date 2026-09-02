import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  nextTick,
} from "vue";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";
import { ER } from "ERX/Er";
import { EI } from "EIX/ei";

export default defineComponent({
  name: "FBSM41MS2N",
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
      default: () => ({}),
    },
  },
  emits: ["getChildInfo"],
  setup: (props, { emit }) => {
    const formPartition = ref("");
    const initializeService = "fbsm_form_get";

    const formName = "FBSM41MS2N";
    const form_name = ref("");
    const base_code = ref("");
    const function_id = ref(0);
    const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
    const initializeFlag = ref(0);
    const efFormInfo = ref<{ [key: string]: any }>({});
    const efFormIsReady = ref(false);
    const factory_div = ref("");
    const LayoutGroupFilter = ref("FBSM41MS2N_QUERY");

    let gridviewMain: any;
    let gridView1: any;
    let gridView2: any;
    let gridView3: any;
    let gridView4: any;
    let gridView5: any;

    const showGrid1 = ref(true);
    const showGrid2 = ref(true);
    const showGrid3 = ref(true);
    const showGrid4 = ref(false);
    const showGrid5 = ref(false);

    const basketLabels = ref<string[]>(["第一篮", "第二篮", "第三篮", "第四篮", "第五篮"]);

    const splitterKey = computed(
      () => `${showGrid1.value}-${showGrid2.value}-${showGrid3.value}-${showGrid4.value}-${showGrid5.value}`
    );

    const paneSize = computed(() => {
      let count = 0;
      if (showGrid1.value) count++;
      if (showGrid2.value) count++;
      if (showGrid3.value) count++;
      if (showGrid4.value) count++;
      if (showGrid5.value) count++;
      return count > 0 ? Math.floor(100 / count) : 20;
    });

    const pendingGridData = reactive<{
      gridView1: any[] | null;
      gridView2: any[] | null;
      gridView3: any[] | null;
      gridView4: any[] | null;
      gridView5: any[] | null;
    }>({
      gridView1: null,
      gridView2: null,
      gridView3: null,
      gridView4: null,
      gridView5: null,
    });

    const tryMergeGridData = () => {
      if (pendingGridData.gridView1 && erFormHelper.getGrid("FBSM41MS2N_INQ1")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView1, "FBSM41MS2N_INQ1");
        pendingGridData.gridView1 = null;
      }
      if (pendingGridData.gridView2 && erFormHelper.getGrid("FBSM41MS2N_INQ2")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView2, "FBSM41MS2N_INQ2");
        pendingGridData.gridView2 = null;
      }
      if (pendingGridData.gridView3 && erFormHelper.getGrid("FBSM41MS2N_INQ3")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView3, "FBSM41MS2N_INQ3");
        pendingGridData.gridView3 = null;
      }
      if (pendingGridData.gridView4 && erFormHelper.getGrid("FBSM41MS2N_INQ4")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView4, "FBSM41MS2N_INQ4");
        pendingGridData.gridView4 = null;
      }
      if (pendingGridData.gridView5 && erFormHelper.getGrid("FBSM41MS2N_INQ5")) {
        erFormHelper.mergeDataToGrid(pendingGridData.gridView5, "FBSM41MS2N_INQ5");
        pendingGridData.gridView5 = null;
      }
    };

    const efFormReady = (e: any) => {
      efFormInfo.value = e.formInfo;
      efFormIsReady.value = true;
      form_name.value = efFormInfo.value.formName;
      formPartition.value = efFormInfo.value.formPartition;
      base_code.value = efFormInfo.value.formParams.base_code || "";
      factory_div.value = efFormInfo.value.formParams.factory_div || "";
      Initialize();
    };

    const erGridMainReady = () => {
      gridviewMain = erFormHelper.getGrid("FBSM41MS2N_MAIN");
    };
    const erGrid1Ready = () => {
      gridView1 = erFormHelper.getGrid("FBSM41MS2N_INQ1");
      tryMergeGridData();
    };
    const erGrid2Ready = () => {
      gridView2 = erFormHelper.getGrid("FBSM41MS2N_INQ2");
      tryMergeGridData();
    };
    const erGrid3Ready = () => {
      gridView3 = erFormHelper.getGrid("FBSM41MS2N_INQ3");
      tryMergeGridData();
    };
    const erGrid4Ready = () => {
      gridView4 = erFormHelper.getGrid("FBSM41MS2N_INQ4");
      tryMergeGridData();
    };
    const erGrid5Ready = () => {
      gridView5 = erFormHelper.getGrid("FBSM41MS2N_INQ5");
      tryMergeGridData();
    };

    const Initialize = async () => {
      const initialResult = await erFormHelper.Initialize(
        formPartition.value,
        formName,
        "",
        initializeService
      );
      if (initialResult.flag > 0) {
        initializeFlag.value = 1;
        nextTick(() => {
          nextTick(() => {
            // 从父画面传入 ST_NO 并赋值到查询条件
            if (props.parentInfo && props.parentInfo.ST_NO) {
              erFormHelper.setControlValue(
                LayoutGroupFilter.value,
                "ST_NO",
                props.parentInfo.ST_NO
              );
            }
            query_Info();
          });
        });
      } else {
        erFormHelper.messageError(
          "ErFormHelper initialize failed, error msg is [" + initialResult.msg + "]!"
        );
      }
    };

    const query_Info = async () => {
      const inBlock = erFormHelper.getAllControlValueAsEiBlock(LayoutGroupFilter.value);
      const inInfo = new EI.EIInfo();
      inInfo.addBlock(inBlock);
      const outInfo = await erFormHelper.callService(
        "fbsm41m_inq",
        inInfo,
        true,
        undefined,
        undefined
      );
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError("查询模板配料单失败：" + outInfo.sys.msg);
        return;
      }
      erFormHelper.mergeDataToGrid(outInfo.getBlock(0)?.data || [], "FBSM41MS2N_MAIN");
    };

    onMounted(() => { });

    const gridviewMainFocusChanged = async (e: any) => {
      p_query_fbsm41m_dtl(e.data);
    };

    const p_query_fbsm41m_dtl = async (e: any) => {
      const currentRow = erFormHelper.getGridCurrentRowAsBlock("FBSM41MS2N_MAIN");
      if (!currentRow || !currentRow.data || currentRow.data.length === 0) {
        clearAllBasketGrids();
        return;
      }

      const rowData = currentRow.data[0];
      const composeListNo = rowData["COMPOSE_LIST_NO"] || "";
      const composeListNoEaf = rowData["COMPOSE_LIST_NO_EAF"] || "";

      if (!composeListNo || !composeListNoEaf) {
        clearAllBasketGrids();
        return;
      }

      const eiInfo = new EI.EIInfo();
      const block = eiInfo.addBlock(new EI.EiBlock("Table0"));
      block.addColumns("COMPOSE_LIST_NO", "COMPOSE_LIST_NO_EAF");
      block.addRow({
        COMPOSE_LIST_NO: composeListNo,
        COMPOSE_LIST_NO_EAF: composeListNoEaf,
      });

      const outInfo = await erFormHelper.callService(
        "fbsm41m_dtl_inq",
        eiInfo,
        false,
        undefined,
        false,
        formPartition.value
      );
      if (outInfo.sys.status < 0) {
        erFormHelper.messageInfo(outInfo.sys.msg);
        clearAllBasketGrids();
        return;
      }

      // 按 BUNKER_SEQ 分组，最多 5 篮，大于 5 的静默忽略
      const basketData: { [key: string]: any[] } = {
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "5": [],
      };

      const blockData = outInfo.getBlock(0)?.data || [];
      blockData.forEach((row: any) => {
        const seq = String(row["BUNKER_SEQ"] || "1");
        if (basketData[seq]) {
          basketData[seq].push(row);
        }
      });

      showGrid1.value = basketData["1"].length > 0;
      showGrid2.value = basketData["2"].length > 0;
      showGrid3.value = basketData["3"].length > 0;
      showGrid4.value = basketData["4"].length > 0;
      showGrid5.value = basketData["5"].length > 0;

      pendingGridData.gridView1 = basketData["1"].length > 0 ? basketData["1"] : null;
      pendingGridData.gridView2 = basketData["2"].length > 0 ? basketData["2"] : null;
      pendingGridData.gridView3 = basketData["3"].length > 0 ? basketData["3"] : null;
      pendingGridData.gridView4 = basketData["4"].length > 0 ? basketData["4"] : null;
      pendingGridData.gridView5 = basketData["5"].length > 0 ? basketData["5"] : null;

      nextTick(() => {
        tryMergeGridData();
      });
    };

    const clearAllBasketGrids = () => {
      erFormHelper.clearGridData("FBSM41MS2N_INQ1");
      erFormHelper.clearGridData("FBSM41MS2N_INQ2");
      erFormHelper.clearGridData("FBSM41MS2N_INQ3");
      erFormHelper.clearGridData("FBSM41MS2N_INQ4");
      erFormHelper.clearGridData("FBSM41MS2N_INQ5");
      showGrid1.value = true;
      showGrid2.value = true;
      showGrid3.value = true;
      showGrid4.value = false;
      showGrid5.value = false;
    };

    const F2_DO = async (e: any) => {
      query_Info();
    };

    const closeEfDialog = () => {
      const back = erFormHelper.getGridCurrentRowAsBlock("FBSM41MS2N_MAIN");
      const data: any = {
        closeEfDialog: true,
      };
      if (back && back.data && back.data.length > 0) {
        data.ST_NO = back.data[0]["ST_NO"];
        data.COMPOSE_LIST_NO = back.data[0]["COMPOSE_LIST_NO"];
        data.COMPOSE_LIST_NO_EAF = back.data[0]["COMPOSE_LIST_NO_EAF"];
        // DATE_C 为主键（用于匹配），DATE_TIME 用于展示
        data.DATE_C = back.data[0]["DATE_C"] || back.data[0]["DATE_TIME"];
        data.DATE_TIME = back.data[0]["DATE_TIME"] || back.data[0]["DATE_C"];
      }
      emit("getChildInfo", data);
    };

    return {
      erFormHelper,
      initializeFlag,
      closeEfDialog,
      F2_DO,
      efFormReady,
      erGridMainReady,
      erGrid1Ready,
      erGrid2Ready,
      erGrid3Ready,
      erGrid4Ready,
      erGrid5Ready,
      gridviewMainFocusChanged,
      LayoutGroupFilter,
      basketLabels,
      showGrid1,
      showGrid2,
      showGrid3,
      showGrid4,
      showGrid5,
      splitterKey,
      paneSize,
    };
  },
});
