<template>
    <xr-ef-form ref="xrEfformRef" :f2-do="F2_DO" :f6-do="F6_DO" :f6-pre-do="F6_PRE_DO"
        :f6-cancel="F6_CANCEL" @ready="efFormReady" @closeDialog="closeEfDialog"
        :in-dialog-form-name="openInDialog ? 'FBSM23S2N' : null">
        <template v-if="initializeFlag === 1">
            <template v-if="initializeFlag === 1">
                <er-layout id="ErLayout_0Q3vcC6m" :er-form-helper-prop="erFormHelper" :config-id="'LayoutGroupFilter'"
                    :allow-collapse="true"></er-layout>
                <v-splitter id="splitter_UhJLVdvB" class="default-theme" style=" height: 100%;">
                    <v-splitter-pane size="28">
                        <er-grid id="ErGrid_FBw2Y3Un" :er-form-helper-prop="erFormHelper" :config-id="'gridviewMain'"
                            @erGridReady="erGridMainReady" @focus-changed="gridviewMainFocusChanged"
                            :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                            :options="{ groupDisplayType: 'groupRows', showRowNo: false }">
                        </er-grid>
                    </v-splitter-pane>
                    <v-splitter-pane size="72">
                        <v-splitter id="splitter_hSBurdc2" class="default-theme" style=" height: 100%; padding: 5px;"
                            :horizontal="true">
                            <v-splitter-pane size="33">
                                <er-grid id="ErGrid_BHScL6Q5" :er-form-helper-prop="erFormHelper"
                                    :config-id="'gridView1'"
                                    :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                                    @erGridReady="erGrid1Ready">
                                </er-grid>
                            </v-splitter-pane>

                        </v-splitter>
                    </v-splitter-pane>

                </v-splitter>
            </template>
        </template>
    </xr-ef-form>
</template>
<script lang="ts" src="./FBSM23S2N.ts">
</script>

<style lang="scss">
@import './FBSM23S2N.scss';
</style>