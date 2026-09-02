<template>
  <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" @ready="efFormReady">
    <template v-if="initializeFlag === 1">
      <xr-ef-form-base>
        <template v-if="initializeFlag === 1">
          <er-layout
            id="ErLayout_8sjftLeW"
            :er-form-helper-prop="erFormHelper"
            :config-id="'LayoutGroupFilter'"
          ></er-layout>
          <v-splitter
            id="splitter_yeafk78e"
            class="default-theme"
            style="height: 100%; padding: 5px"
          >
            <v-splitter-pane size="20">
              <er-grid
                id="ErGrid_GXRwKGAd"
                :er-form-helper-prop="erFormHelper"
                :config-id="'gridviewMain'"
                @focus-changed="gridviewMainFocusChanged"
                @erGridReady="erGridmainReady"
                :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
              >
              </er-grid>
            </v-splitter-pane>
            <v-splitter-pane size="80">
              <er-grid
                id="ErGrid_BHScL6Q5"
                :er-form-helper-prop="erFormHelper"
                :config-id="'gridView1'"
                :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                :options="{ viewType: 'BandView' }"
                @erGridReady="erGrid1Ready"
              >
              </er-grid>
            </v-splitter-pane>
          </v-splitter>
        </template>
      </xr-ef-form-base>
    </template>
  </xr-ef-form>
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
import xrEfFormBase from "EFX/xrEfFormBase";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";

// AGGrid本地化语言
const agLocaleText = getAgLocaleText();
const { $t } = useI18n();

// 变量定义
const formPartition = ref("");
const efFormInfo = ref<{
  [key: string]: any;
}>({});
const efFormIsReady = ref(false);

// xr-ef-form提供了ready事件, 在这里获取画面配置信息
const efFormReady = (e: any) => {
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  formName.value = "FBSM15DS2N";
  initializePage(); // 初始化低代码工具类
};

onMounted(() => {});

const formName = ref("FBSM15DS2N");
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "";
let gridviewMain = "";
let dt_key = new EI.EiBlock();

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
    nextTick(() => {
      // 获取画面上的主要控件信息
      dt_key = GetKey(efFormInfo.value.formParams["table_key"]);
      setToolbarVisible("gridviewMain", true);
    });
  } else {
    erFormHelper.messageError(
      "ErFormHelper initialize faild, error msg is [" + initialResult.msg + "]!"
    );
  }
};

const xrEfformRef = ref();
const p_query = async () => {
  console.log("进入查数据函数");

  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock("LayoutGroupFilter"));
  const outInfo = await erFormHelper.callService("fbsm15d_inq", inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError("查询错误:" + outInfo.sys.msg);
    return;
  }
  if (outInfo.sys.status >= 0) {
    console.log(outInfo, "查数据outInfo");
    erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, "gridviewMain");
  }
};
const F2_DO = async (e: any) => {
  p_query();
  // erFormHelper.setGridEditable('gridviewMain', false);
};
//焦点行查询
const p_query_fbsm14 = async (e: any) => {
  const eiInfo = new EI.EIInfo();
  eiInfo.addBlock(erFormHelper.getGridCurrentRowAsBlock("gridviewMain"));
  const outInfo = await erFormHelper.callService(
    "fbsm15d_elm_inq",
    eiInfo,
    false,
    undefined,
    false,
    formPartition.value
  );
  if (outInfo.sys.status < 0) {
    erFormHelper.messageInfo(outInfo.sys.msg);
    return;
  }
  erFormHelper.clearGridData("gridView1");
  const block0 = outInfo.getBlock(0);
  if (block0 && block0.data.length > 0) {
    erFormHelper.mergeDataToGrid(block0.data, "gridView1");
  }
};
// 焦点行改变事件
const gridviewMainFocusChanged = async (e: any) => {
  p_query_fbsm14(e.data);
  if (e.rowChanged) {
    erFormHelper.unCheckAllGridRow("gridviewMain");
    erFormHelper.checkGridCurrentRow("gridviewMain");
  }
  //   console.log("ST_NO", e.data.get('ST_NO'));
  //   const allversionNo = await erFormHelper.queryDataByDataSource('FBSM50A', {
  //     customFilter: `   ( base.ST_NO ='${e.data.get('ST_NO')}' OR (base.ST_NO !='${e.data.get('ST_NO')}' AND base.MAT_FAMILY_CODE = '1' AND base.MATERIAL_CODE ='${e.data.get('MATERIAL_CODE')}') OR (base.ST_NO !='${e.data.get('ST_NO')}' AND base.MAT_FAMILY_CODE = '2' AND base.MATERIAL_CODE !='${e.data.get('MATERIAL_CODE')}') OR (base.ST_NO !='${e.data.get('ST_NO')}' AND base.MAT_FAMILY_CODE = '3' AND base.COMM_FMLY_CODE !='${e.data.get('COMM_FMLY_CODE')}' AND base.MATERIAL_CODE !='${e.data.get('MATERIAL_CODE')}') )  `
  //   });
  //   await erFormHelper.reloadDropDownDataSource('gridView1', 'SEQ_NO', allversionNo.getBlock(0).data);
  //   await erFormHelper.reloadDropDownDataSource('gridView2', 'SEQ_NO', allversionNo.getBlock(0).data);
  //   await erFormHelper.reloadDropDownDataSource('gridView3', 'SEQ_NO', allversionNo.getBlock(0).data);
};

const ErGrid_GXRwKGAd_ErGridReady = (e: any) => {};
const erGrid1Ready = (e: any) => {
  erFormHelper.setGridColumnEditable("gridView1", false);
};
const erGridmainReady = (e: any) => {
  // 获取 grid 实例对象
  gridviewMain = erFormHelper.getGrid("gridviewMain");
  // 设置grid工具栏自定义事件
  //   erFormHelper.initialGridToolbar("gridviewMain", {
  //     save: {
  //       visible: true,
  //       action: async () => {
  //         console.log("save");
  //         if (!erFormHelper.hasDataChange('gridviewMain')) {
  //           erFormHelper.messageWarning('无数据更改,不需要保存');
  //           return;
  //         }
  //         const inInfo = erFormHelper.getGridChangedRowsAsEiInfo('gridviewMain');
  //         inInfo.addBlock(dt_key);
  //         console.log("inInfo",inInfo);
  //         const outInfo = await erFormHelper.callService('fbsma12_save', inInfo);
  //         if (outInfo.sys.status < 0) {
  //           erFormHelper.messageError(outInfo.msg);
  //           return false;
  //         }
  //         await p_query();
  //       },
  //       // 是否阻止默认事件触发
  //       preventDefault: false,
  //     },
  //   });
  p_query();
};
</script>

<style lang="scss" scoped></style>
