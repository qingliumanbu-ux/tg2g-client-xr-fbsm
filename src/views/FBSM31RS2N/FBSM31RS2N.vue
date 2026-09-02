<template>
  <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" :f3-do="F3_DO" :f4-do="F4_DO" :f5-do="F5_DO" @ready="efFormReady">
    <template v-if="initializeFlag === 1">
      <xr-ef-form-base>
        <template v-if="initializeFlag === 1">
          <div style="display: flex; width: 100%;">
            <er-layout id="ErLayout_8sjftLeW" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'"
              style="flex: 0 0 70%;"></er-layout>
            <er-layout id="ErLayout_8" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter1'"
              style="flex: 0 0 30%;"></er-layout>
          </div>
          <xr-ef-panel id="xrEfPanel_d8Ck2QX5" title="日计划信息" padding="5px">
            <template #customButtonSlot>
            </template>
            <template #contentSlot>
              <er-grid id="ErGrid_GXRwKGAd" :er-form-helper-prop="erFormHelper" :config-id="'gridviewMain'"
                @erGridReady="erGridmainReady" @row-double-clicked="GridViewMainDoubleClick"
                :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }">
              </er-grid>
            </template>
          </xr-ef-panel>
        </template>
      </xr-ef-form-base>
    </template>
  </xr-ef-form>

  <!--历史配料单查看-->
  <xr-ef-dialog ref="f5DialogRef" title="配料单查看" v-model:visible="f5DialogVisible" width=100% height=100%>
    <FBSM15HS2N :openInDialog="true" :parentInfo="f5ParentInfo" @getChildInfo="handleF5ChildInfo"
      :dialogFormName="f5DialogFormName">
    </FBSM15HS2N>
  </xr-ef-dialog>
  <xr-ef-dialog ref="dblDialogRef" title="配料单查看" v-model:visible="dblDialogVisible" width=60% height=60%>
    <FBSM31YS2N :openInDialog="true" :parentInfo="dblParentInfo" @getChildInfo="handleDblChildInfo"
      :dialogFormName="dblDialogFormName" :openFormName="'FBSM31YS2N'">
    </FBSM31YS2N>
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
import { PopQueryReturnInfo, PopFreeReturnInfo } from 'ERX/er-type';
import ErPopFree from 'ERX/ErPopFree';
import erLayout from 'ERX/ErLayout';
import erGrid from 'ERX/ErGrid';

import FBSM15HS2N from "@/views/FBSM15HS2N/FBSM15HS2N.vue";
import FBSM31YS2N from "@/views/FBSM31YS2N/FBSM31YS2N.vue";
import EFCallForm from 'EFX/EFCallForm';


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
  formName.value = 'FBSM31RS2N';
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

// ========== 新增：双击跳转弹窗变量 ==========
const dblDialogFormName = ref('');
const dblParentInfo = ref({});
const dblDialogVisible = ref(false);
const dblDialogRef = ref();

//弹出画面关闭事件处理
const getChildInfo = (info: any) => {
  console.log('21p返回数据', info);
  if (info.closeEfDialog === true) {
    dialogVisible.value = false;   // 关闭弹框
  }
}
// ========== 新增：F4弹窗相关变量 ==========
const f4DialogFormName = ref(''); // F4弹窗画面名
const f4ParentInfo = ref({});     // F4弹窗传递的参数
const f4DialogVisible = ref(false); // F4弹窗显隐状态
// ========== 新增：F5弹窗相关变量 ==========
const f5DialogFormName = ref(''); // F5弹窗画面名
const f5ParentInfo = ref({});     // F5弹窗传递的参数
const f5DialogVisible = ref(false); // F5弹窗显隐状态

let cs_OkClick = '';
// 修改1：初始化为null，并添加类型定义
let popFreeEdit: ER.PopFreeHelper | null = null;

// 新增：F5弹窗的子组件信息接收方法
const handleF5ChildInfo = (info: any) => {
  console.log('FBSM15hS2N返回数据', info);
  if (info.closeEfDialog === true) {
    f5DialogVisible.value = false; // 关闭F5弹窗
  }

}

//获取主键列
function GetKey(tableKey: string) {
  const dt = new EI.EiBlock();
  dt.addColumns('COLNAME');
  if (tableKey !== '') {
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

// 修改2：将方法改为async，并返回实例，增加异常处理
const popFreeEdit_pars = async (cs_OkClick: string) => {
  try {
    if (cs_OkClick == 'F3') {
      console.log('cs_OkClick2222', cs_OkClick);
      // 先销毁已存在的实例
      if (popFreeEdit) {
        popFreeEdit = null;
      }
      // 创建新实例
      popFreeEdit = new ER.PopFreeHelper(
        formPartition.value,
        'FBSM15R_F3',
        'FBSM15R_LAYOUT_DIALOG'
      );
      // 等待实例初始化
      await nextTick();
      return popFreeEdit;
    }
  } catch (error) {
    erFormHelper.messageError('初始化弹窗失败：' + (error as Error).message);
    return null;
  }
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
    });
  }
  else {
    erFormHelper.messageError('ErFormHelper initialize faild, error msg is [' + initialResult.msg +
      ']!');
  }
};

const xrEfformRef = ref();
//弹出界面OK按钮点击事件
const popFreeEditOkClick = async (e: PopFreeReturnInfo) => {
  const inInfo = new EI.EIInfo();
  console.log('inInfoqqq', inInfo);
  inInfo.addBlock(
    erFormHelper.convertModelAsBlock(e.dataModel, {
    }), 'Main'
  );

  const outInfo = await erFormHelper.callService('fbsm15_mx_ins', inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError(outInfo.sys.msg);
    return false;
  }
  p_query();
  erFormHelper.messageInfo('模型计算完成');
};
const p_query = async () => {
  console.log('进入查数据函数');

  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'));
  const outInfo = await erFormHelper.callService('fbsm31r_inq', inInfo);
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

// 修改3：重构F3_DO方法，增加await和null校验
const F3_DO = async (e: any) => {
  console.log('F3_DO');
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getGridSelectRowsAsBlock('gridviewMain'), 'Main');
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter1'), 'TAPPING_WT');
  console.log(inInfo);
  const mainGridCheckedRow = erFormHelper.getGridSelectRowsAsBlock('gridviewMain');
  if (mainGridCheckedRow.data.length < 1) {
    erFormHelper.messageWarning('请勾选计划信息');
    return false;
  }
  const outInfo = await erFormHelper.callService('fbsm15tg_mx_ins', inInfo);
  if (outInfo.sys.status < 0) {
    erFormHelper.messageError(outInfo.sys.msg);
    return false;
  }
  p_query();
  erFormHelper.messageInfo('模型计算完成');
};


const F4_DO = async (e: any) => {
  // 1. 可选：校验（比如是否选中主表行，根据业务需求调整）
  const currentRow = erFormHelper.getGridCurrentRow('gridviewMain');
  if (!currentRow) {
    erFormHelper.messageWarning('请先选择一条配料信息！');
    return;
  }
  console.log('F12 跳转画面，选中行数据:', currentRow);
  console.log('F12 跳转画面，跳转传出数据COMM_FMLY_CODE:', currentRow.get('COMM_FMLY_CODE'));
  console.log('F12 跳转画面，跳转传出数据MATERIAL_CODE:', currentRow.get('MATERIAL_CODE'));
  console.log('F12 跳转画面，跳转传出数据BACKLOG_EA:', currentRow.get('BACKLOG_EA'));
  console.log('F12 跳转画面，跳转传出数据ST_NO:', currentRow.get('ST_NO'));

  EFCallForm("FBSM00S2N", {
    PARENT: 'FBSM31RS2N', // 标识父画面
    COMM_FMLY_CODE: currentRow.get('COMM_FMLY_CODE'), // 传递主表选中行的ST_NO
    MATERIAL_CODE: currentRow.get('MATERIAL_CODE'), // 传递物料编码
    BACKLOG_EA: currentRow.get('BACKLOG_EA'),
    ST_NO: currentRow.get('ST_NO'),
    TABLE_ID: 'tfbsm01',
    // MAT_CODE: currentRow.get('MAT_CODE'),
    // 可添加其他需要传递的参数
  });
};

// 新增：F4弹窗的子组件信息接收方法
const handleF4ChildInfo = (info: any) => {
  console.log('FBSM00S2N返回数据', info);
  if (info.closeEfDialog === true) {
    f4DialogVisible.value = false; // 关闭F3弹窗
  }
};

const F5_DO = async (e: any) => {
  console.log('F5_DO');
  try {
    // 1. 可选：校验（比如是否选中主表行，根据业务需求调整）
    const currentRow = erFormHelper.getGridCurrentRow('gridviewMain');
    if (!currentRow) {
      erFormHelper.messageWarning('请先选择一条配料信息！');
      return;
    }

    // 2. 组装传递给FBSM15GS2N的参数（根据实际业务需求调整）
    f5ParentInfo.value = {
      PARENT: 'FBSM31RS2N', // 标识父画面
      ST_NO: currentRow.get('ST_NO'), // 传递主表选中行的ST_NO
      COMPOSE_LIST_NO: currentRow.get('COMPOSE_LIST_NO'), // 传递物料编码
      BACKLOG_EA: currentRow.get('BACKLOG_EA'),
      DATE_TIME: currentRow.get('DATE_C'),
      SEQ_NO: currentRow.get('SEQ_NO'),
      // 可添加其他需要传递的参数
    };

    // 3. 设置弹窗画面名
    f5DialogFormName.value = 'FBSM15HS2N';

    // 4. 显示F3弹窗
    f5DialogVisible.value = true;
  } catch (error) {
    erFormHelper.messageError('打开FBSM15HS2N画面失败：' + (error as Error).message);
  }
};
const F5_PRE_DO = async (e: any) => {

  erFormHelper.messageInfo('确认修改信息无误，方可点击修改键。若需取消操作请点击取消键。');
};
const F5_CANCEL = async (e: any) => {
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
  //p_query_fbsm14(e.data);
  erFormHelper.messageInfo('修改操作取消');
};

// 双击弹窗关闭处理
const handleDblChildInfo = (info: any) => {
  console.log('15YS2N返回数据', info);
  if (info.closeEfDialog === true) {
    dblDialogVisible.value = false;
  }
  p_query(); // 刷新数据
};

// 主表行双击事件（完全复制15C的，只改parentInfo变量名）
const GridViewMainDoubleClick = async (e: any) => {
  if (e && e.data) {
    const gridewmain = erFormHelper.getGridCurrentRowAsBlock('gridviewMain');
    dblParentInfo.value = {
      COMM_FMLY_CODE: gridewmain.data[0]["COMM_FMLY_CODE"],
      MATERIAL_CODE: gridewmain.data[0]["MATERIAL_CODE"],
      DATE_C: gridewmain.data[0]["DATE_C"],
      SEQ_NO: gridewmain.data[0]["SEQ_NO"],
      DATE_TIME: gridewmain.data[0]["DATE_TIME"],
      ST_NO: gridewmain.data[0]["ST_NO"],
      COMPOSE_LIST_NO: gridewmain.data[0]["COMPOSE_LIST_NO"],
      FURNACE_COUNT: gridewmain.data[0]["FURNACE_COUNT"],
      BACKLOG_EA: gridewmain.data[0]["BACKLOG_EA"],
      PARENT: 'FBSM31YS2N'
    };
    dblDialogFormName.value = 'FBSM31YS2N';
    dblDialogVisible.value = true;
  }
};


const erGridmainReady = (e: any) => {
  // 获取 grid 实例对象
  gridviewMain = erFormHelper.getGrid("gridviewMain");
  // 设置grid工具栏自定义事件
  erFormHelper.initialGridToolbar("gridviewMain", {
    save: {
      visible: true,
      action: async () => {
        console.log("save");
        if (!erFormHelper.hasDataChange('gridviewMain')) {
          erFormHelper.messageWarning('无数据更改,不需要保存');
          return;
        }
        const inInfo = erFormHelper.getGridChangedRowsAsEiInfo('gridviewMain');
        inInfo.addBlock(dt_key);
        console.log("inInfo", inInfo);
        const outInfo = await erFormHelper.callService('fbsma12_save', inInfo);
        if (outInfo.sys.status < 0) {
          erFormHelper.messageError(outInfo.msg);
          return false;
        }
        await p_query();
      },
      // 是否阻止默认事件触发
      preventDefault: false,
    },
  });
  p_query();
};
</script>

<style lang="scss" scoped></style>