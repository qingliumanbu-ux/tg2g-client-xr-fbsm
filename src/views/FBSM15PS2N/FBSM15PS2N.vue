<template>
  <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" :f4-do="F4_DO" :f5-do="F5_DO" :f8-do="F8_DO" :f9-do="F9_DO" @ready="efFormReady"
    @closeDialog="closeEfDialog" :in-dialog-form-name="openInDialog ? 'FBSM15PS2N' : null">
    <template v-if="initializeFlag === 1">
      <template v-if="initializeFlag === 1">
        <er-layout id="ErLayout_8sjftLeW" :er-form-helper-prop="erFormHelper"
            :config-id="'LayoutGroupFilter'"></er-layout>
        <v-splitter id="splitter_hSBurdc2" class="default-theme" style=" height: 100%; padding: 5px;"
          :horizontal="true">
          <v-splitter-pane size="30">
            <div style="display: flex; height: 100%;">
              <!-- 左边固定标题 -->
              <div
                style="writing-mode: vertical-rl; text-align: center; padding: 1px; background: #e8f4fd; color: #004085;border-right: 1px solid #ddd; font-weight: bold;">
                <b>{{ s_id[0] }}</b>
              </div>
              <!-- 右边 Grid -->
              <div style="flex: 1;">
                <er-grid id="ErGrid_BHScL6Q5" :er-form-helper-prop="erFormHelper" :config-id="'gridView1'"
                  :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }" @erGridReady="erGrid1Ready">
                </er-grid>
              </div>
            </div>
          </v-splitter-pane>
          <v-splitter-pane size="30">
            <div style="display: flex; height: 100%;">
              <div
                style="writing-mode: vertical-rl; text-align: center; padding: 1px; background: #e8f4fd; color: #004085;border-right: 1px solid #ddd; font-weight: bold;">
                <b>{{ s_id[1] }}</b>
              </div>
              <!-- 右边 Grid -->
              <div style="flex: 1; ">
                <er-grid id="ErGrid_25uMrZ46" :er-form-helper-prop="erFormHelper" :config-id="'gridView2'"
                  :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }" @erGridReady="erGrid2Ready">
                </er-grid>
              </div>
            </div>
          </v-splitter-pane>
          <v-splitter-pane size="40">
            <div style="display: flex; height: 100%;">
              <!-- 左边固定标题 -->
              <div
                style="writing-mode: vertical-rl; text-align: center; padding: 1px; background: #e8f4fd; color: #004085;border-right: 1px solid #ddd; font-weight: bold;">
                <b>{{ s_id[2] }}</b>
              </div>
              <div style="flex: 1;">
                <er-grid id="ErGrid_nVOxMOyj" :er-form-helper-prop="erFormHelper" :config-id="'gridView3'"
                  :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }" @erGridReady="erGrid3Ready">
                </er-grid>
              </div>
            </div>
          </v-splitter-pane>

        </v-splitter>

      </template>
    </template>
  </xr-ef-form>
</template>
<script lang="ts" src="./FBSM15PS2N.ts">
</script>

<style lang="scss">
@import './FBSM15PS2N.scss';
</style>