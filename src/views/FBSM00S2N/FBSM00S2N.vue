<template>
  <div class="container" style="height: 100%">
    <xr-ef-form @ready="efFormReady" :f2-do="f2Do" :f7-do="F7_DO" :f6-do="F6_DO" :f6-pre-do="F6_PRE_DO" :f6-cancel="F6_CANCEL">
      <template v-if="initializeFlag === 1">
        <!-- 整个画面分为左右两部分 -->
        <div class="main-layout">
          <v-splitter style="height: 100%;" class="default-theme">
            <v-splitter-pane size="17">
              <!-- 左侧按钮区域 -->
              <div class="left-panel">
                <div class="panel-header">
                  <h3>静态数据表</h3>
                </div>
                <div class="button-group">
                  <div v-for="table in staticTables" :key="table.id" class="button-item"
                    :class="{ 'active': activeTableId === table.id }" @click="switchTable(table.id)">
                    <el-button class="table-button">
                      <span class="button-text">{{ table.name }}</span>
                      <span v-if="activeTableId === table.id" class="active-indicator">▶</span>
                    </el-button>
                  </div>
                </div>
              </div>
            </v-splitter-pane>
            <v-splitter-pane size="83">
              <template v-if="initializeFlag">
                <!-- 右侧信息区域 -->
                <div class="right-panel">
                  <v-splitter style="height: auto;" class="default-theme">
                    <v-splitter-pane size="70">
                      <er-layout :er-form-helper-prop="erFormHelper" :config-id="layoutKey"></er-layout>
                    </v-splitter-pane>
                    <v-splitter-pane size="30">
                      <er-layout :er-form-helper-prop="erFormHelper" :config-id="layoutKey2"></er-layout>
                    </v-splitter-pane>
                  </v-splitter>
                  <xr-ef-panel title="查询结果 蓝色:大类代表 绿色:中类代表" style="height: 100%" padding="5px">
                    <template #customButtonSlot> </template>
                    <template #contentSlot>
                      <er-grid :er-form-helper-prop="erFormHelper" :config-id="gridKey" 
                        :toolbarOptions="toolbarOptions"
                        :options="{ enableCellTooltip: false, enableHeaderTooltip: false }">
                      </er-grid>
                    </template>
                  </xr-ef-panel>
                </div>
              </template>
            </v-splitter-pane>
          </v-splitter>
        </div>
      </template>
    </xr-ef-form>
    <!-- 批量复制弹窗 -->
    <xr-ef-dialog ref="fbsmplDialogRef" title="批量复制" v-model:visible="fbsmplDialogVisible" width=70% height=70%
    :actions="['maximize']">
      <FBSMPLS2N :openInDialog="true" :parentInfo="fbsmplParentInfo" @getChildInfo="handleFbsmplChildInfo"
        :dialogFormName="'FBSMPLS2N'">
      </FBSMPLS2N>
    </xr-ef-dialog>
  </div>
</template>

<script lang="ts" src="./FBSM00S2N.ts"></script>

<style lang="scss">
@import "./FBSM00S2N.scss";
</style>