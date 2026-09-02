<template>
  <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" @ready="efFormReady">
    <template v-if="initializeFlag === 1">
      <xr-ef-form-base>
        <template v-if="initializeFlag === 1">
          <er-layout id="ErLayout_8sjftLeW" :er-form-helper-prop="erFormHelper"
            :config-id="'LayoutGroupFilter'"></er-layout>
          <v-splitter id="splitter_yeafk78e" class="default-theme" style=" height: 100%; padding: 5px;"
            :horizontal="true">
            <v-splitter-pane size="100">
              <er-grid id="ErGrid_GXRwKGAd" :er-form-helper-prop="erFormHelper" :config-id="'gridviewMain'"
                @erGridReady="erGridmainReady" @row-double-clicked="GridViewMainDoubleClick"
                :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }">
              </er-grid>
            </v-splitter-pane>
          </v-splitter>
        </template>
      </xr-ef-form-base>
    </template>
    <xr-ef-dialog ref="dialogRef" title="配料单导出" v-model:visible="dialogVisible" width=100% height=100%>
      <FBSM15YS2N :openInDialog="true" :parentInfo="parentInfo" @getChildInfo="getChildInfo"
        :dialogFormName="dialogFormName" :openFormName="'FBSM15YS2N'">
      </FBSM15YS2N>
    </xr-ef-dialog>
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
  Ref
}
  from "vue";
import {
  EI,
  EIManager
}
  from "EIX/ei";
import EFUtility from "EFX/EFUtility";
import useI18n from 'EFX/useI18n';
import {
  getAgLocaleText
}
  from "EFX/locale";
import dayjs from "dayjs";
import type {
  Dayjs
}
  from "dayjs";
import {
  ER
}
  from 'ERX/Er';
import {
  SiUtils
}
  from 'ERX/SiUtils';
import {
  FiUtils
}
  from 'ERX/FiUtils';
import xrEfForm from "EFX/xrEfForm";
import xrEfFormBase from "EFX/xrEfFormBase";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from 'ERX/ErLayout';
import erGrid from 'ERX/ErGrid';
import FBSM15YS2N from "@/views/FBSM15YS2N/FBSM15YS2N.vue";

// AGGrid本地化语言
const agLocaleText = getAgLocaleText();
const {
  $t
} = useI18n();

// 变量定义
const formPartition = ref('');
const efFormInfo = ref<{
  [key: string]: any
}>({});
const efFormIsReady = ref(false);

// xr-ef-form提供了ready事件, 在这里获取画面配置信息
const efFormReady = (e: any) => {
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  formName.value = 'FBSM15CS2N';
  initializePage(); // 初始化低代码工具类
};

onMounted(() => { });

const formName = ref('');
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";
const s_id = ref<string[]>([]); // 定义为响应式数组
let gridviewMain = '';
let dt_key = new EI.EiBlock();
//弹窗相关数据初始化
const dialogFormName = ref(''); // 弹出画面的画面名
const parentInfo = ref({});
const dialogVisible = ref(false);

//获取主键列
function GetKey(tableKey: string) {
  const dt = new EI.EiBlock();
  dt.addColumns('COLNAME');
  if (tableKey && tableKey !== '') {
    const colNames = tableKey.split(',');
    for (const colName in colNames) {
      dt.addRow({
        COLNAME: colNames[colName]
      });
    }
  }
  dt.name = 'DT_KEY';
  return dt;
}
const setToolbarVisible = (configId: string, visible: boolean) => {
  erFormHelper.setGridToolbarVisible(configId, {
    import: true,
    excel: true
  });
};

// 画面相关数据初始化
const initializePage = async () => {
  const initialResult = await erFormHelper.Initialize(formPartition.value, formName.value, '',
    initializeService);
  if (initialResult.flag >= 0) {
    // 画面工具类初始化成功后将画面渲染条件设置为1
    initializeFlag.value = 1;
    nextTick(() => {
      // 获取画面上的主要控件信息
      dt_key = GetKey(efFormInfo.value.formParams['table_key']);
      setToolbarVisible("gridviewMain", true);
      nextTick(() => {
        p_query();
      });

    });
  }
  else {
    erFormHelper.messageError('ErFormHelper initialize faild, error msg is [' + initialResult.msg +
      ']!');
  }
};

//弹出画面关闭事件处理
const getChildInfo = (info: any) => {
  console.log('21p返回数据', info);
  if (info.closeEfDialog === true) {
    dialogVisible.value = false;   // 关闭弹框
  }
  p_query();
}

const xrEfformRef = ref();
const p_query = async () => {
  console.log('进入查数据函数');

  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'));
  const outInfo = await erFormHelper.callService('fbsm15c_inq', inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError('查询错误:' + outInfo.sys.msg);
    return;
  }
  if (outInfo.sys.status >= 0) {
    console.log(outInfo, '查数据outInfo');
    erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, 'gridviewMain');
  }
}
const F2_DO = async (e: any) => {
  p_query();
  // erFormHelper.setGridEditable('gridviewMain', false);     
};


const ErGrid_GXRwKGAd_ErGridReady = (e: any) => {
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
  //p_query();
};

// 主表行双击事件-弹出修改框
const GridViewMainDoubleClick = async (e: any) => {
  if (e && e.data) {
    const inInfo = new EI.EIInfo();
    const gridewmain = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');
    console.log('gridewmain', gridewmain);
    console.log('gridewmain.MATERIAL_CODE', gridewmain.data[0]["MATERIAL_CODE"]);
    parentInfo.value = {
      COMM_FMLY_CODE: gridewmain.data[0]["COMM_FMLY_CODE"],
      MATERIAL_CODE: gridewmain.data[0]["MATERIAL_CODE"],
      DATE_C: gridewmain.data[0]["DATE_C"],
      SEQ_NO: gridewmain.data[0]["SEQ_NO"],
      DATE_TIME: gridewmain.data[0]["DATE_TIME"],
      ST_NO: gridewmain.data[0]["ST_NO"],
      COMPOSE_LIST_NO: gridewmain.data[0]["COMPOSE_LIST_NO"],
      FURNACE_COUNT: gridewmain.data[0]["FURNACE_COUNT"],
      BACKLOG_EA: gridewmain.data[0]["BACKLOG_EA"],
      PARENT: 'FBSM15YS2N'
    };
    console.log('双击传参parentInfo', parentInfo);
    //parentInfo.value = { PARENT: 'FBSM15PS2N'};
    dialogFormName.value = 'FBSM15YS2N';
    dialogVisible.value = true;    //弹出画面
  }
};

</script>

<style lang="scss" scoped></style>
