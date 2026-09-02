<template>
  <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" @ready="efFormReady">
    <template v-if="initializeFlag === 1">
      <xr-ef-form-base>
        <template v-if="initializeFlag === 1">
          <er-layout id="LayoutGroupFilter" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'"
            @loaded="LayoutGroupFilter"></er-layout>
          <xr-ef-panel title="铁水温度及成分预测" padding="5px">
            <template #customButtonSlot>
            </template>
            <template #contentSlot>
              <er-grid id="gridView1" :er-form-helper-prop="erFormHelper" :config-id="'gridView1'"
                :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }" @erGridReady="erGrid1Ready">
              </er-grid>
            </template>
          </xr-ef-panel>
        </template>
      </xr-ef-form-base>
    </template>
  </xr-ef-form>
  <xr-ef-dialog id="xrEfDialog_nc2Q13Yg" v-model:visible="xrEfDialog_nc2Q13Yg_Visible">

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
  formName.value = 'FBSM12S2N';
  initializePage(); // 初始化低代码工具类
};

onMounted(() => { });

const formName = ref('');
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";

// 画面相关数据初始化
const initializePage = async () => {
  const initialResult = await erFormHelper.Initialize(formPartition.value, formName.value, '',
    initializeService);
  if (initialResult.flag >= 0) {
    // 画面工具类初始化成功后将画面渲染条件设置为1
    initializeFlag.value = 1;

  }
  else {
    erFormHelper.messageError('ErFormHelper initialize faild, error msg is [' + initialResult.msg +
      ']!');
  }
};

const xrEfformRef = ref();
const p_query = async () => {
  console.log('进入查数据函数');

  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'));
  const outInfo = await erFormHelper.callService('fbsm12_inq', inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError('查询错误:' + outInfo.sys.msg);
    return;
  }
  if (outInfo.sys.status >= 0) {
    console.log(outInfo, '查数据outInfo');
    erFormHelper.mergeDataToGrid(outInfo.getBlock(0).data, 'gridView1');
  }
}
const F2_DO = async (e: any) => {
  p_query();
  erFormHelper.setGridEditable('gridView1', false);
};
const LayoutGroupFilter = (e: any) => { };
const erGrid1Ready = (e: any) => { };
const xrEfDialog_nc2Q13Yg_Visible = ref();

</script>

<style lang="scss" scoped></style>
