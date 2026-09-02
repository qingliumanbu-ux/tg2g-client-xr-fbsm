<template>
    <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" :f3-do="F3_DO" @ready="efFormReady" @closeDialog="closeEfDialog"
        :in-dialog-form-name="'FBSMPLTS2N'">
        <template v-if="initializeFlag === 1">
            <er-layout :er-form-helper-prop="erFormHelper" :config-id="'FBSMPLTS2N_QUERY'"></er-layout>
            <er-grid :er-form-helper-prop="erFormHelper" :config-id="'FBSMPLTS2N_INQ1'" @erGridReady="erGrid1Ready">
            </er-grid>
        </template>
    </xr-ef-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, nextTick } from "vue";
import xrEfForm from "EFX/xrEfForm";
import xrEfPanel from "EFX/xrEfPanel";
import xrEfSearchBox from "EFX/xrEfSearchBox";
import xrEfDialog from "EFX/xrEfDialog";
import EFUtility from "EFX/EFUtility";
import erLayout from 'ERX/ErLayout';
import erGrid from 'ERX/ErGrid';
import { ER } from 'ERX/Er';
import { EI, EP } from "EIX/ei";
import { SiUtils } from 'ERX/SiUtils';
import { FiUtils } from 'ERX/FiUtils';
import { PopFreeReturnInfo, PopQueryReturnInfo } from 'ERX/er-type';
import ErPopFree from 'ERX/ErPopFree';
import ErPopQuery from 'ERX/ErPopQuery';

export default {
    name: 'FBSMPLTS2N'
};
</script>

<script lang="ts" setup>
// 1. 注册emit事件
const emit = defineEmits(['getChildInfo']);

// 2. Props定义（弹窗模式）
const props = defineProps({
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
});

// 变量定义
const formPartition = ref('');
const efFormInfo = ref<{ [key: string]: any }>({});
const efFormIsReady = ref(false);
let gridView1: any;

// xr-ef-form提供了ready事件, 在这里获取画面配置信息
const efFormReady = (e: any) => {
    efFormInfo.value = e.formInfo;
    efFormIsReady.value = true;
    formPartition.value = efFormInfo.value.formPartition;
    // 初始化低代码工具类
    initializePage();
};

const formName = 'FBSMPLTS2N';
const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
const initializeFlag = ref(0);
const initializeService = 'fbsm_form_get';

// 画面相关数据初始化
const initializePage = async () => {
    const initialResult = await erFormHelper.Initialize(formPartition.value, formName, '', initializeService);
    if (initialResult.flag >= 0) {
        // 画面工具类初始化成功后将画面渲染条件设置为1
        initializeFlag.value = 1;

        // 回调函数获取控件信息及设置定义事件等操作
        nextTick(() => {
            nextTick(() => {
                // 将父画面传入的查询条件写入当前layout
                if (props.parentInfo.ST_NO != null && props.parentInfo.ST_NO !== '') {
                    erFormHelper.setControlValue('FBSMPLTS2N_QUERY', 'ST_NO', props.parentInfo.ST_NO);
                }
                query();
            });
        });
    } else {
        erFormHelper.messageError('ErFormHelper initialize faild, error msg is [' + initialResult.msg + ']!');
    }
};

const erGrid1Ready = (e: any) => {
    gridView1 = erFormHelper.getGrid('FBSMPLTS2N_INQ1');
};

// 查询
const query = async () => {
    const inInfo = new EI.EIInfo();
    const eiBlock = erFormHelper.getAllControlValueAsEiBlock('FBSMPLTS2N_QUERY');
    inInfo.addBlock(eiBlock);

    // Table: 目标表名（由父画面传入）
    const table = new EI.EiBlock();
    table.addColumns('TABLE_ID');
    table.addRow({ TABLE_ID: props.parentInfo?.TABLE_ID || '' });
    inInfo.addBlock(table, 'Table');

    const outInfo = await erFormHelper.callService('fbsmplt_inq', inInfo);
    if (outInfo.sys.status < 0) {
        erFormHelper.messageError("查询错误:" + outInfo.sys.msg);
        return;
    }
    erFormHelper.mergeDataToGrid(outInfo, 'FBSMPLTS2N_INQ1');
};

// F2 查询
const F2_DO = async (e: any) => {
    query();
};

// F3 保存
const F3_DO = async (e: any) => {
    // 1. 获取FBSMPLTS2N自身勾选行
    const selectedBlock = erFormHelper.getGridSelectRowsAsBlock('FBSMPLTS2N_INQ1');
    if (!selectedBlock || !selectedBlock.data || selectedBlock.data.length === 0) {
        erFormHelper.messageWarning('请先勾选至少一行数据！');
        return;
    }

    // 2. 获取父画面传入的勾选行完整数据
    const parentSelectedRows: any[] = props.parentInfo?.SELECTED_ROWS || [];
    if (parentSelectedRows.length === 0) {
        erFormHelper.messageWarning('未接收到来源数据，无法保存！');
        return;
    }

    // 3. 组装EIInfo
    const inInfo = new EI.EIInfo();

    // Table1: 父画面传过来的勾选行（原样保留所有列）
    const table1 = new EI.EiBlock();
    const columns1 = Object.keys(parentSelectedRows[0]);
    table1.addColumns(...columns1);
    parentSelectedRows.forEach(row => {
        // 显式创建普通对象，逐列复制以剥离 Vue Proxy 包装
        const plainRow: Record<string, any> = {};
        columns1.forEach(col => { plainRow[col] = row[col]; });
        // 再做一次深拷贝确保彻底去除 Proxy（plainRow 只含基础类型，不会出错）
        table1.addRow(JSON.parse(JSON.stringify(plainRow)));
    });

    inInfo.addBlock(table1, 'Table1');

    // Table2: FBSMPLTS2N画面勾选的行数据
    inInfo.addBlock(selectedBlock, 'Table2');

    // Table3: 目标表名（由父画面传入）
    const table3 = new EI.EiBlock();
    table3.addColumns('TABLE_ID');
    table3.addRow({ TABLE_ID: props.parentInfo?.TABLE_ID || '' });
    inInfo.addBlock(table3, 'Table3');

    // 4. 调用后台保存
    const outInfo = await erFormHelper.callService('fbsma10_copy', inInfo);
    if (outInfo.sys.status < 0) {
        erFormHelper.messageError('保存失败：' + outInfo.sys.msg);
        return false;
    }
    erFormHelper.messageSuccess('保存成功！');
    await query();
};

// 关闭弹窗
const closeEfDialog = () => {
    const data = {
        closeEfDialog: true,
    };
    emit("getChildInfo", data);
};

onMounted(() => { });
</script>

<style lang="scss" scoped></style>
