<template>
  <Tabs :list="tabs" :value="current" @remove="removeTabs" @switch="switchTab" @change-list="setTabs"></Tabs>
</template>

<script>
import { mapState } from 'vuex'
import Tabs from './Tabs'
import File from '@/lib/file'

const blankUri = File.toUri(null)

export default {
  name: 'file-tabs',
  components: { Tabs },
  data () {
    return {
      list: [],
      current: blankUri
    }
  },
  methods: {
    setTabs (list) {
      this.$store.commit('app/setTabs', list)
    },
    switchTab (item) {
      this.switchFile(item.payload.file)
    },
    removeTabs (items) {
      const keys = items.map(x => x.key)
      const tabs = this.tabs.filter(x => keys.indexOf(x.key) === -1)
      this.setTabs(tabs)
    },
    addTab (item) {
      const tab = this.tabs.find(x => item.key === x.key)

      // 没有打开此 Tab，新建一个
      if (!tab) {
        this.setTabs(this.tabs.concat([item]))
      }

      this.current = item.key
    },
    switchFile (file) {
      this.$store.commit('app/setCurrentFile', file)
    }
  },
  computed: {
    ...mapState('app', ['currentFile', 'tabs'])
  },
  watch: {
    currentFile: {
      immediate: true,
      handler (file) {
        const uri = File.toUri(file)
        const item = {
          key: uri,
          label: file ? file.name : '空白页',
          description: file ? file.path : '空白页',
          payload: { file },
        }

        this.addTab(item)
      }
    },
    tabs (list) {
      if (list.length < 1) {
        this.addTab({
          key: blankUri,
          label: '空白页',
          description: '空白页',
          payload: { file: null }
        })
      }

      const tab = list.find(x => x.key === this.current)
      if (!tab) {
        const currentFile = list.length > 0 ? list[list.length - 1].payload.file : null
        this.switchFile(currentFile)
      }
    }
  }
}
</script>
