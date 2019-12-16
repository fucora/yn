<template>
  <div>
    <Layout>
      <TitleBar slot="header"></TitleBar>
      <StatusBar slot="footer"></StatusBar>
      <Tree slot="left"></Tree>
      <Xterm slot="terminal"></Xterm>
      <template slot="editor">
        <FileTabs />
        <Editor ref="editor" @scroll-line="line => $refs.preview.revealLine(line)" />
      </template>
      <Preview
        ref="preview"
        slot="preview"
        @sync-scroll="line => $refs.editor.revealLineInCenter(line)"
        @switch-todo="(line, checked) => $refs.editor.switchTodo(line, checked)" />
    </Layout>
    <XFilter />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Layout from '@/components/Layout'
import TitleBar from '@/components/TitleBar'
import FileTabs from '@/components/FileTabs'
import StatusBar from '@/components/StatusBar'
import Tree from '@/components/Tree'
import Editor from '@/components/Editor'
import Preview from '@/components/Preview'
import XFilter from '@/components/Filter'
import Xterm from '@/components/Xterm'
import RunPlugin from '@/plugins/RunPlugin'
import File from '@/lib/file'

export default {
  name: 'x-main',
  components: { Layout, TitleBar, StatusBar, Tree, Editor, Preview, XFilter, Xterm, FileTabs },
  mounted () {
    RunPlugin.clearCache()
    this.$bus.on('editor-ready', this.init)
  },
  beforeDestroy () {
    this.$bus.off('editor-ready', this.init)
  },
  methods: {
    init () {
      if (!this.currentFile || this.currentFile.id === File.toUri(null)) {
        // this.$store.dispatch('app/showHelp', 'README.md')
      }
    }
  },
  computed: {
    ...mapGetters('app', ['currentFile'])
  }
}
</script>
