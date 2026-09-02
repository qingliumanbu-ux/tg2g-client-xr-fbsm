<template>
  <xr-ef-form
    ref="xrEfformRef"
    :f2-do="F2_DO"
    @ready="efFormReady"
    @closeDialog="closeEfDialog"
    :in-dialog-form-name="openInDialog ? 'FBSM41MS2N' : null"
    close-button-text="应用模板"
  >
    <template v-if="initializeFlag === 1">
      <er-layout
        id="ErLayout_FBSM41MS2N_QUERY"
        :er-form-helper-prop="erFormHelper"
        :config-id="'FBSM41MS2N_QUERY'"
        :allow-collapse="true"
      ></er-layout>

      <v-splitter id="splitter_FBSM41MS2N" class="default-theme" style="height: 100%">
        <v-splitter-pane size="20">
          <er-grid
            id="ErGrid_FBSM41MS2N_MAIN"
            :er-form-helper-prop="erFormHelper"
            :config-id="'FBSM41MS2N_MAIN'"
            @erGridReady="erGridMainReady"
            @focus-changed="gridviewMainFocusChanged"
          >
          </er-grid>
        </v-splitter-pane>

        <v-splitter-pane size="80">
          <v-splitter
            id="splitter_FBSM41MS2N_right"
            class="default-theme"
            style="height: 100%; padding: 5px"
            :horizontal="true"
            :key="splitterKey"
          >
            <v-splitter-pane :size="paneSize" v-if="showGrid1" key="grid1">
              <div style="display: flex; height: 100%">
                <div class="basket-label">
                  <b>{{ basketLabels[0] }}</b>
                </div>
                <div style="flex: 1">
                  <er-grid
                    id="ErGrid_FBSM41MS2N_INQ1"
                    :er-form-helper-prop="erFormHelper"
                    :config-id="'FBSM41MS2N_INQ1'"
                    :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                    @erGridReady="erGrid1Ready"
                  >
                  </er-grid>
                </div>
              </div>
            </v-splitter-pane>

            <v-splitter-pane :size="paneSize" v-if="showGrid2" key="grid2">
              <div style="display: flex; height: 100%">
                <div class="basket-label">
                  <b>{{ basketLabels[1] }}</b>
                </div>
                <div style="flex: 1">
                  <er-grid
                    id="ErGrid_FBSM41MS2N_INQ2"
                    :er-form-helper-prop="erFormHelper"
                    :config-id="'FBSM41MS2N_INQ2'"
                    :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                    @erGridReady="erGrid2Ready"
                  >
                  </er-grid>
                </div>
              </div>
            </v-splitter-pane>

            <v-splitter-pane :size="paneSize" v-if="showGrid3" key="grid3">
              <div style="display: flex; height: 100%">
                <div class="basket-label">
                  <b>{{ basketLabels[2] }}</b>
                </div>
                <div style="flex: 1">
                  <er-grid
                    id="ErGrid_FBSM41MS2N_INQ3"
                    :er-form-helper-prop="erFormHelper"
                    :config-id="'FBSM41MS2N_INQ3'"
                    :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                    @erGridReady="erGrid3Ready"
                  >
                  </er-grid>
                </div>
              </div>
            </v-splitter-pane>

            <v-splitter-pane :size="paneSize" v-if="showGrid4" key="grid4">
              <div style="display: flex; height: 100%">
                <div class="basket-label">
                  <b>{{ basketLabels[3] }}</b>
                </div>
                <div style="flex: 1">
                  <er-grid
                    id="ErGrid_FBSM41MS2N_INQ4"
                    :er-form-helper-prop="erFormHelper"
                    :config-id="'FBSM41MS2N_INQ4'"
                    :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                    @erGridReady="erGrid4Ready"
                  >
                  </er-grid>
                </div>
              </div>
            </v-splitter-pane>

            <v-splitter-pane :size="paneSize" v-if="showGrid5" key="grid5">
              <div style="display: flex; height: 100%">
                <div class="basket-label">
                  <b>{{ basketLabels[4] }}</b>
                </div>
                <div style="flex: 1">
                  <er-grid
                    id="ErGrid_FBSM41MS2N_INQ5"
                    :er-form-helper-prop="erFormHelper"
                    :config-id="'FBSM41MS2N_INQ5'"
                    :toolbarOptions="{ showToolbar: true, showIco: true, showText: true }"
                    @erGridReady="erGrid5Ready"
                  >
                  </er-grid>
                </div>
              </div>
            </v-splitter-pane>
          </v-splitter>
        </v-splitter-pane>
      </v-splitter>
    </template>
  </xr-ef-form>
</template>

<script lang="ts" src="./FBSM41MS2N.ts"></script>

<style lang="scss" scoped>
.basket-label {
  writing-mode: vertical-rl;
  text-align: center;
  padding: 1px;
  background: #e8f4fd;
  color: #004085;
  border-right: 1px solid #ddd;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
