<template>
  <div style="height: 100%;">
    <xr-ef-form @ready="efFormReady" :f2-do="F2_DO" :f3-do="F3_DO" :f3-pre-do="F3_PreDo" :f3-cancel="F3_Cancel">
      <er-layout v-if="initializeFlag === 1" :er-form-helper-prop="erFormHelper"
        :config-id="'LayoutGroupFilter'"></er-layout>
      <xr-ef-panel title="数据" padding="5px">
        <template #customButtonSlot>

        </template>
        <template #contentSlot>
          <er-grid v-if="initializeFlag === 1" :er-form-helper-prop="erFormHelper" :config-id="'gridView1'"
            :page-options="{ pagination: 'server', pageSize: 500, pageSizes: [500, 1000, 2000, 5000, 10000], }"
            @erGridReady="erGrid1Ready" :toolbarOptions="{ showIco: true, showText: true }">
          </er-grid>
        </template>
      </xr-ef-panel>
    </xr-ef-form>
  </div>
</template>

<script lang="ts" src="./FBSMMB1S2N.ts">
</script>
