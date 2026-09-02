<template>
  <xr-ef-form
    ref="xrEfformRef"
    :f2-do="F2_DO"
    :f6-do="F6_DO"
    :f6-pre-do="F6_PRE_DO"
    :f6-cancel="F6_CANCEL"
    :f7-do="F7_DO"
    @ready="efFormReady"
  >
    <template v-if="initializeFlag === 1">
      <er-layout
        id="ErLayout_TBI1sJxs"
        :er-form-helper-prop="erFormHelper"
        :config-id="'LayoutGroupFilter'"
      ></er-layout>
      <er-grid
        id="ErGrid_Z9ss8x4G"
        :er-form-helper-prop="erFormHelper"
        :config-id="'gridviewMain'"
        :options="{ viewType: 'BandView' }"
        :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
        @erGridReady="ErGrid_Z9ss8x4G_ErGridReady"
      >
      </er-grid>
    </template>
  </xr-ef-form>
  <!-- 碳钢批量复制弹窗 -->
  <xr-ef-dialog
    ref="fbsmplDialogRef"
    title="碳钢批量复制"
    v-model:visible="fbsmplDialogVisible"
    width="70%"
    height="70%"
    :actions="['maximize']"
  >
    <FBSMPLTS2N
      :openInDialog="true"
      :parentInfo="fbsmplParentInfo"
      @getChildInfo="handleFbsmplChildInfo"
      :dialogFormName="'FBSMPLTS2N'"
    >
    </FBSMPLTS2N>
  </xr-ef-dialog>
</template>

<script setup lang="ts">
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
import EFUtility from "EFX/EFUtility";
import useI18n from "EFX/useI18n";
import { getAgLocaleText } from "EFX/locale";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { ER } from "ERX/Er";
import { SiUtils } from "ERX/SiUtils";
import { FiUtils } from "ERX/FiUtils";
import xrEfForm from "EFX/xrEfForm";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";
import FBSMPLTS2N from "../FBSMPLTS2N/FBSMPLTS2N.vue";

// AGGrid本地化语言
const agLocaleText = getAgLocaleText();
const { $t } = useI18n();

// 变量定义
const formPartition = ref("");
const efFormInfo = ref<{
  [key: string]: any;
}>({});
const formName = ref(" ");
const efFormIsReady = ref(false);
let dt_key = new EI.EiBlock();

// xr-ef-form提供了ready事件, 在这里获取画面配置信息
const efFormReady = (e: any) => {
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  formName.value = efFormInfo.value.formName;
  initializePage(); // 初始化低代码工具类
};
//查询
const query = async () => {
  const inInfo = new EI.EIInfo();
  const eiBlock = erFormHelper.getAllControlValueAsEiBlock("LayoutGroupFilter");
  inInfo.addBlock(eiBlock);
  const pageBlock = inInfo.addBlock(new EI.EiBlock(), "page");
  pageBlock.addColumns("tableName", "colName", "ORDER_BY", "PAGE_NUM", "PAGE_SIZE");
  pageBlock.addRow({
    tableName: "T" + efFormInfo.value.formParams["table_name"],
    colName: "*",
    ORDER_BY: efFormInfo.value.formParams["order_by"],
  });
  //service_inq
  const outInfo = await erFormHelper.callService(
    efFormInfo.value.formParams["service_inq"],
    inInfo
  );
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("查询错误:" + outInfo.sys.msg);
    return;
  } else {
    console.log(outInfo);
    erFormHelper.mergeDataToGrid(outInfo, "gridviewMain");
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
    addrow: visible,
    delete: visible,
    copyrow: visible,
    import: visible,
    excel: visible,
  });
};

onMounted(() => {});

const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";

// 画面相关数据初始化
const initializePage = async () => {
  const initialResult = await erFormHelper.Initialize(
    formPartition.value,
    formName.value,
    "",
    initializeService
  );
  if (initialResult.flag >= 0) {
    // 画面工具类初始化成功后将画面渲染条件设置为1
    initializeFlag.value = 1;

    // 回调函数获取控件信息及设置定义事件等操作
    nextTick(() => {
      dt_key = GetKey(efFormInfo.value.formParams["table_key"]);
      
        setToolbarVisible("gridviewMain", false);
      
      // 获取画面上的主要控件信息
      query();
    });
  } else {
    erFormHelper.messageError(
      "ErFormHelper initialize faild, error msg is [" + initialResult.msg + "]!"
    );
  }
};

const xrEfformRef = ref();
const F2_DO = async (e: any) => {
  await query();
};
const F6_DO = async (e: any) => {
  
    setToolbarVisible("gridviewMain", false);
  

  if (!erFormHelper.hasDataChange("gridviewMain")) {
    erFormHelper.messageWarning("无数据更改,不需要保存");
    return;
  }
  const inInfo = erFormHelper.getGridChangedRowsAsEiInfo("gridviewMain");
  inInfo.addBlock(dt_key);
  console.log(inInfo);
  console.log(efFormInfo.value.formParams["service"]);
  const outInfo = await erFormHelper.callService(
    efFormInfo.value.formParams["service"],
    inInfo
  );
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError(outInfo.msg);
    return false;
  }
  await query();
};
const F6_PRE_DO = async (e: any) => {
  
    setToolbarVisible("gridviewMain", true);
  
};
const F6_CANCEL = async (e: any) => {
  
    setToolbarVisible("gridviewMain", false);
    await query();
  
};

// F7 碳钢批量复制
const fbsmplDialogVisible = ref(false);
const fbsmplParentInfo = ref<any>({});

const F7_DO = async (e: any) => {
  // 仅碳钢废钢大类与品名维护（FBSM10）可用
  if (efFormInfo.value.formParams["table_name"] !== "FBSM10") {
    erFormHelper.messageWarning("批量复制功能仅适用于碳钢废钢大类与品名维护！");
    return;
  }
  const selectedBlock = erFormHelper.getGridSelectRowsAsBlock("gridviewMain");
  if (!selectedBlock || !selectedBlock.data || selectedBlock.data.length === 0) {
    erFormHelper.messageWarning("请先勾选至少一行数据！");
    return;
  }
  fbsmplParentInfo.value = {
    PARENT: "FBSMAS2N",
    SELECTED_ROWS: selectedBlock.data,
    TABLE_ID: "tfbsm10",
    ST_NO: erFormHelper.getControlValue("LayoutGroupFilter", "ST_NO"),
  };
  fbsmplDialogVisible.value = true;
};

const handleFbsmplChildInfo = (info: any) => {
  if (info.closeEfDialog === true) {
    fbsmplDialogVisible.value = false;
    query();
  }
};

const ErGrid_Z9ss8x4G_ErGridReady = (e: any) => {};
</script>

<style lang="scss" scoped></style>
