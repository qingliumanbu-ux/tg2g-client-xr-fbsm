import {
  defineComponent,
  ref,
  reactive,
  nextTick,
} from "vue";
import xrEfForm from "EFX/xrEfForm";
import erLayout from "ERX/ErLayout";
import erGrid from "ERX/ErGrid";
import { ER } from "ERX/Er";
import { EI } from "EIX/ei";

export default defineComponent({
  name: "FBSM23S2N",
  components: {
    xrEfForm,
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
    const formName = "FBSM23S2N";
    const erFormHelper: ER.FormHelper = new ER.FormHelper() as any;
    const initializeFlag = ref(0);
    const efFormInfo = ref<{ [key: string]: any }>({});
    const efFormIsReady = ref(false);
    const LayoutGroupFilter = ref("LayoutGroupFilter");

    // 子行勾选状态管理
    const childSelectionState = reactive<Record<string, boolean>>({}); // key=ST_NO, 记录子行勾选状态
    let lastRawList: any[] = [];
    let lastDoubleClickedRow: any = null; // 记录最近一次双击查询的行，用于 F6 取消刷新
    let gridMainApi: any = null;
    let isUpdatingSelection = false;
    let checkboxAdded = false;

    const setToolbarVisible = (configId: string, visible: boolean) => {
      erFormHelper.setGridToolbarVisible(configId, {
        addrow: visible,
        delete: visible,
        copyrow: visible,
      });
    };

    // xr-ef-form提供了ready事件, 在这里获取画面配置信息
    const efFormReady = (e: any) => {
      efFormInfo.value = e.formInfo;
      efFormIsReady.value = true;
      formPartition.value = efFormInfo.value.formPartition;
      Initialize();
    };

    const erGrid1Ready = () => {
      // 右侧 Grid 设为可编辑（支持 F6 保存）
      erFormHelper.setGridEditable('gridView1', true);
      // 初始隐藏右侧工具栏按钮
      setToolbarVisible('gridView1', false);
    };
    const erGridMainReady = (e: any) => {
      gridMainApi = e?.api;
      if (!gridMainApi) return;

      // 多选及点击行行为由低代码平台配置统一管理，此处不再重复设置
      // 避免 setGridOption 与低代码平台初始化配置冲突导致下拉框异常

      // 勾选变化时联动子行并刷新右侧
      gridMainApi.addEventListener('selectionChanged', onSelectionChanged);

      // 双击非分组行查询右侧明细
      gridMainApi.addEventListener('rowDoubleClicked', (params: any) => {
        const row = params?.data;
        if (row && !isGroupRow(row)) {
          queryRightByRow(row);
        }
      });

      // 在首次数据渲染后安全添加 checkbox 列（避免覆盖低代码平台异步加载的列配置）
      gridMainApi.addEventListener('firstDataRendered', () => {
        if (!checkboxAdded) {
          checkboxAdded = true;
          ensureCheckboxColumn(gridMainApi);
        }
      });
    };

    // 若列定义无 checkbox，在第一列前插入 checkbox 列
    const ensureCheckboxColumn = (api: any) => {
      const columnDefs = api.getColumnDefs() || [];
      const hasCheckbox = columnDefs.some((col: any) => col.checkboxSelection || col.headerCheckboxSelection);
      if (!hasCheckbox) {
        const checkboxCol = {
          headerName: '',
          field: '',
          checkboxSelection: true,
          headerCheckboxSelection: true,
          width: 50,
          pinned: 'left',
          suppressMenu: true,
          suppressSorting: true,
          resizable: false,
          editable: false,
        };
        api.setColumnDefs([checkboxCol, ...columnDefs]);
      }
    };

    // 判断是否为分组行（通过 ST_NO 内容识别，不依赖自定义字段）
    const isGroupRow = (data: any) => data && typeof data.ST_NO === 'string' && data.ST_NO.includes('【折叠展开】');

    // 勾选变化处理：仅记录子行勾选状态，用于 F6 保存
    const onSelectionChanged = (params: any) => {
      if (isUpdatingSelection) return;
      const api = params.api;

      isUpdatingSelection = true;
      try {
        // 记录所有子行勾选状态
        api.forEachNode((node: any) => {
          const data = node.data;
          if (data?.ST_NO && !isGroupRow(data)) {
            childSelectionState[data.ST_NO] = node.isSelected();
          }
        });
      } finally {
        isUpdatingSelection = false;
      }
    };

    // 双击指定行查询右侧明细
    const queryRightByRow = async (row: any) => {
      if (!row?.ST_NO) return;
      // 记录最近一次双击查询的行
      lastDoubleClickedRow = JSON.parse(JSON.stringify(row));
      try {
        const eiInfo = new EI.EIInfo();
        const block = new EI.EiBlock('MAIN');
        const rowData = JSON.parse(JSON.stringify(row));
        block.pushData(rowData, true);
        eiInfo.addBlock(block);
        const outInfo = await erFormHelper.callService(
          'fbsm23_elm_inq',
          eiInfo,
          true,
          true,
          true,
          formPartition.value,
        );
        if (outInfo.sys.status < 0) {
          erFormHelper.messageInfo(outInfo.sys.msg);
          erFormHelper.clearGridData('gridView1');
          return;
        }
        erFormHelper.mergeDataToGrid(outInfo.getBlock(0), 'gridView1');
      } catch (ex: any) {
        erFormHelper.messageError('查询失败: ' + (ex?.message ?? '未知错误'));
      }
    };

    // 根据最近一次双击行刷新右侧明细
    const refreshRightByLastRow = async () => {
      if (!lastDoubleClickedRow) {
        erFormHelper.clearGridData('gridView1');
        return;
      }
      await queryRightByRow(lastDoubleClickedRow);
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
            // 仅当传入值非空时才覆盖查询条件，保留 layout 默认值
            if (props.parentInfo.DATE_TIME != null && props.parentInfo.DATE_TIME !== '') {
              erFormHelper.setControlValue(
                LayoutGroupFilter.value,
                "DATE_C",
                props.parentInfo.DATE_TIME,
              );
            }
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
        "fbsm23_inq",
        inInfo,
        true,
        undefined,
        undefined,
      );
      console.log("outInfo", outInfo);
      //if (outInfo.sys.status < 0) erFormHelper.messageError(outInfo.sys.msg);
      const rawList = outInfo.getBlock(0).data || [];
      lastRawList = rawList;
      erFormHelper.mergeDataToGrid(rawList, "gridviewMain");

      // 新数据加载后重置勾选状态记录
      Object.keys(childSelectionState).forEach(k => delete childSelectionState[k]);
    };

    // 焦点行改变事件（右侧查询已通过双击触发，此处不再使用）
    const gridviewMainFocusChanged = async () => {
      // 保留空函数，避免模板绑定报错
    };

    //查询
    const F2_DO = async (e: any) => {
      query_Info();
    };

    //F6 按钮：将右侧当前数据覆盖到左侧所有勾选行（先删除再新增）
    const F6_DO = async (e: any) => {
      // 保存完成后隐藏右侧工具栏
      setToolbarVisible('gridView1', false);

      // 1. 获取左侧所有勾选行
      const selectedStNos = Object.keys(childSelectionState).filter(
        (stNo) => childSelectionState[stNo],
      );
      if (selectedStNos.length === 0) {
        erFormHelper.messageWarning('请先勾选左侧数据行');
        return;
      }
      const leftRows = selectedStNos
        .map((stNo) => lastRawList.find((row: any) => row.ST_NO === stNo))
        .filter(Boolean);
      if (leftRows.length === 0) {
        erFormHelper.messageWarning('未找到左侧勾选行数据');
        return;
      }

      // 2. 获取右侧 Grid 当前所有数据（不是变更数据）
      const allRowsBlock = erFormHelper.getGridAllRowsAsBlock('gridView1');
      const rightRows = (allRowsBlock?.data || [])
        .filter((row: any) => !isGroupRow(row))
        .map((row: any) => JSON.parse(JSON.stringify(row)));

      if (rightRows.length === 0) {
        erFormHelper.messageWarning('右侧无数据可保存');
        return;
      }

      const inInfo = new EI.EIInfo();

      // 3. 先查询左侧勾选行在数据库中的现有 TFBSM23 记录（用于彻底删除）
      const stNoList = leftRows.map((r: any) => `'${r.ST_NO}'`).join(',');
      const querySql = `SELECT ST_NO, BACK_C2 FROM TFBSM23 WHERE ST_NO IN (${stNoList})`;
      let existingRows: any[] = [];
      try {
        const queryRes = await erFormHelper.querySql('', querySql);
        if (queryRes.sys.status < 0) {
          console.warn('查询现有记录失败:', queryRes.sys.msg);
        } else {
          existingRows = queryRes.getBlock(0)?.data || [];
        }
      } catch (ex: any) {
        console.warn('查询现有记录异常:', ex?.message ?? '未知错误');
      }

      // 4. 构建 DELETE block：删除左侧勾选行的所有现有记录（包括右侧没有的 BACK_C2，如 3-C）
      if (existingRows.length > 0) {
        const deleteRows = existingRows.map((row: any) => ({
          ST_NO: row.ST_NO,
          BACK_C2: row.BACK_C2,
        }));
        inInfo.addBlock(EI.EiBlock.build('TFBSM23_DELETE', deleteRows));
      }

      // 5. 构建 ADD block：左侧勾选行 × 右侧数据 笛卡尔积
      const addRows: any[] = [];
      leftRows.forEach((leftRow: any) => {
        rightRows.forEach((rightRow: any) => {
          const newRow = JSON.parse(JSON.stringify(rightRow));
          newRow.ST_NO = leftRow.ST_NO;
          newRow.MATERIAL_CODE = leftRow.MATERIAL_CODE;
          addRows.push(newRow);
        });
      });
      if (addRows.length > 0) {
        inInfo.addBlock(EI.EiBlock.build('TFBSM23_ADD', addRows));
      }

      // 6. 调用保存服务
      const outInfo = await erFormHelper.callService(
        'fbsm23_save',
        inInfo,
        true,
        true,
        true,
      );
      if (outInfo.sys.status < 0) {
        erFormHelper.messageError(outInfo.sys.msg);
        return;
      }
      erFormHelper.messageSuccess('保存成功！');

      // 7. 刷新右侧数据（基于最近双击行）
      await refreshRightByLastRow();

    };

    // F6 进入编辑前：显示右侧工具栏按钮
    const F6_PRE_DO = async (e: any) => {
      setToolbarVisible('gridView1', true);
    };

    // F6 取消：隐藏右侧工具栏按钮并根据最近双击行刷新右侧数据
    const F6_CANCEL = async (e: any) => {
      setToolbarVisible('gridView1', false);
      // 取消编辑后刷新右侧，避免显示未保存的临时数据
      await refreshRightByLastRow();
    };

    const closeEfDialog = () => {
      //关闭事件
      const data = {
        ST_NO: "",
        closeEfDialog: true,
      };
      emit("getChildInfo", data);
    };

    return {
      erFormHelper,
      initializeFlag,
      closeEfDialog,
      F2_DO,
      F6_DO,
      F6_PRE_DO,
      F6_CANCEL,
      efFormReady,
      erGrid1Ready,
      erGridMainReady,
      LayoutGroupFilter,
      gridviewMainFocusChanged,
    };
  },
});
