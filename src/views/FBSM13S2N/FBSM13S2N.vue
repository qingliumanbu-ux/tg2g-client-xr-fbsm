<template>
  <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" @ready="efFormReady" :in-dialog-form-name="'FBSM13S2N'"
    @closeDialog="closeEfDialog">
    <template v-if="initializeFlag === 1">
      <xr-ef-form-base>
        <template v-if="initializeFlag === 1">
          <er-layout id="LayoutGroupFilter" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'"
            @loaded="LayoutGroupFilter"></er-layout>
          <xr-ef-panel title="原料成分查询" padding="5px">
            <template #contentSlot>
              <er-grid id="gridView1"
                :er-form-helper-prop="erFormHelper"
                :config-id="'gridView1'"
                :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                @erGridReady="erGrid1Ready">
              </er-grid>
            </template>
          </xr-ef-panel>
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
  Ref
} from "vue";
import {
  EI,
  EIManager
} from "EIX/ei";
import EFUtility from "EFX/EFUtility";
import { ER } from 'ERX/Er';
import { SiUtils } from 'ERX/SiUtils';
import { FiUtils } from 'ERX/FiUtils';
import xrEfForm from "EFX/xrEfForm";
import xrEfFormBase from "EFX/xrEfFormBase";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfDialog from "EFX/xrEfDialog";
import erLayout from 'ERX/ErLayout';
import erGrid from 'ERX/ErGrid';

// 变量定义
const formPartition = ref('');
const efFormInfo = ref<{ [key: string]: any }>({});
const efFormIsReady = ref(false);
const formName = ref('');
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = "fbsm_form_get";
const xrEfformRef = ref();

// 分组折叠开关状态
const groupExpandMap = reactive<Record<string, boolean>>({});

// 缓存最后一次查询的原始数据，展开/折叠时不重新查询后端
let lastRawList: any[] = [];

// 缓存 grid api，用于展开/折叠后恢复滚动位置
let gridApi: any = null;

// xr-ef-form 初始化
const efFormReady = (e: any) => {
  efFormInfo.value = e.formInfo;
  efFormIsReady.value = true;
  formPartition.value = efFormInfo.value.formPartition;
  formName.value = 'FBSM13S2N';
  initializePage();
};

onMounted(() => { });

// 画面初始化
const initializePage = async () => {
  const initialResult = await erFormHelper.Initialize(formPartition.value, formName.value, '', initializeService);
  if (initialResult.flag >= 0) {
    initializeFlag.value = 1;
  } else {
    erFormHelper.messageError('初始化失败：' + initialResult.msg + ']!');
  }
};

// 查询逻辑
const p_query = async () => {
  const inInfo = new EI.EIInfo();
  inInfo.addBlock(erFormHelper.getAllControlValueAsEiBlock('LayoutGroupFilter'));
  const outInfo = await erFormHelper.callService('fbsm13_inq', inInfo);

  if (outInfo.sys.status < 0) {
    erFormHelper.messageError('查询错误：' + outInfo.sys.msg);
    return;
  }

  const rawList = outInfo.getBlock(0).data || [];
  lastRawList = rawList;
  const finalList = buildGroupTreeData(rawList);
  erFormHelper.mergeDataToGrid(finalList, 'gridView1');
};

const F2_DO = async (e: any) => {
  await p_query();
  erFormHelper.setGridEditable('gridView1', false);
};

const LayoutGroupFilter = (e: any) => { };

// 表格就绪：注册原生单击事件
const erGrid1Ready = (e: any) => {
  gridApi = e?.api;
  if (gridApi && typeof gridApi.addEventListener === 'function') {
    gridApi.addEventListener('rowClicked', (params: any) => {
      const row = params?.data;
      // mergeDataToGrid 会丢弃自定义字段，只能用 LOT_NO 判断分组行
      if (row && typeof row.LOT_NO === 'string' && row.LOT_NO.includes('【折叠展开】')) {
        toggleGroupExpand(row);
      }
    });
  }
  erFormHelper.setGridEditable('gridView1', false);
};

const emit = defineEmits(['update:visible'])
const closeEfDialog = () => {
  emit('update:visible', false);
};

// 构建分组数据
const buildGroupTreeData = (list: any[]) => {
  if (!list || list.length === 0) return [];

  const groupMap: Record<string, any[]> = {};
  list.forEach(row => {
    const key = row.STOCK_NAME || '';
    if (!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(row);
  });

  const result: any[] = [];

  Object.keys(groupMap).forEach(stockName => {
    const items = groupMap[stockName];
    const isNormalGroup = ['1', '2', '3', '4', '5'].includes(stockName);

    if (isNormalGroup) {
      result.push(...items);
    } else {
      const totalWt = items.reduce((sum, cur) => sum + (Number(cur.STOCK_WT) || 0), 0);
      let maxRow = items[0];
      items.forEach(it => {
        if (Number(it.STOCK_WT) > Number(maxRow.STOCK_WT)) maxRow = it;
      });

      const groupRow = { ...maxRow };
      groupRow.STOCK_WT = totalWt;
      groupRow.IS_GROUP_ROW = true;
      groupRow.GROUP_KEY = stockName;
      groupRow.EXPANDED = groupExpandMap[stockName] || false;

      if (groupRow.EXPANDED) {
        groupRow.LOT_NO = "▼ 【折叠展开】";
      } else {
        groupRow.LOT_NO = "▶ 【折叠展开】";
      }

      result.push(groupRow);

      if (groupRow.EXPANDED) {
        items.forEach(it => {
          result.push({ ...it, IS_CHILD_ROW: true });
        });
      }
    }
  });

  return result;
};

// 切换展开/折叠：不查询后端，直接基于缓存数据重建，并恢复滚动位置
const toggleGroupExpand = (row: any) => {
  const key = row.STOCK_NAME;
  if (!key) return;
  groupExpandMap[key] = !groupExpandMap[key];

  const finalList = buildGroupTreeData(lastRawList);
  erFormHelper.mergeDataToGrid(finalList, 'gridView1');

  nextTick(() => {
    if (gridApi) {
      gridApi.forEachNode((node: any) => {
        if (node.data?.STOCK_NAME === key && node.data?.LOT_NO?.includes('【折叠展开】')) {
          gridApi.ensureIndexVisible(node.rowIndex, 'top');
        }
      });
    }
  });
};
</script>

<style lang="scss" scoped></style>