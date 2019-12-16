import Storage from '@/lib/Storage'
import file from '@/lib/file'

const blankEntity = () => ({
  id: file.toUri(null),
  title: '未打开文件',
  name: 'blank.md',
  path: '/blank.md',
  repo: '__system__',
  content: null,
  hash: null,
  prevContent: null,
  prevHash: null,
  passwordHash: null,
  savedAt: null,
  openTime: null,
})

const getLastOpenFile = repo => {
  const recentOpenTime = Storage.get('recentOpenTime', {})

  if (!repo) {
    return null
  }

  const item = Object.entries(recentOpenTime)
    .filter(x => x[0].startsWith(repo.name + '|'))
    .sort((a, b) => b[1] - a[1])[0]

  if (!item) {
    return null
  }

  const path = item[0].split('|', 2)[1]
  if (!path) {
    return null
  }

  return { repo: repo.name, name: file.basename(path), path }
}

const lastFile = getLastOpenFile(Storage.get('currentRepo'))
const initFileId = file.toUri(lastFile)
const initOpenedFiles = { [initFileId]: lastFile }

export default {
  namespaced: true,
  state: {
    repositories: {},
    markedFiles: [],
    tree: null,
    tabs: Storage.get('tabs', []),
    showSide: Storage.get('showSide', true),
    showView: Storage.get('showView', true),
    showXterm: false,
    currentRepo: Storage.get('currentRepo'),
    documentInfo: {
      textLength: 0,
      selectedLength: 0,
      lineCount: 0,
      line: 0,
      column: 0
    },
    openedFiles: initOpenedFiles,
    currentFileId: initFileId,
    recentOpenTime: Storage.get('recentOpenTime', {})
  },
  mutations: {
    setMarkedFiles (state, files) {
      state.markedFiles = files
    },
    setRepositories (state, data) {
      state.repositories = data
    },
    setTree (state, data) {
      state.tree = data
    },
    setCurrentRepo (state, data) {
      state.currentRepo = data
      Storage.set('currentRepo', data)
    },
    setShowView (state, data) {
      state.showView = data
      Storage.set('showView', data)
    },
    setShowSide (state, data) {
      state.showSide = data
      Storage.set('showSide', data)
    },
    setTabs (state, data) {
      state.tabs = data
      Storage.set('tabs', data)
    },
    setShowXterm (state, data) {
      state.showXterm = data
    },
    setDocumentInfo (state, data) {
      state.documentInfo = data
    },
    mergeFile (state, { id, data }) {
      const entity = state.openedFiles[id]

      if (entity) {
        state.openedFiles = { ...state.openedFiles, [id]: { ...entity, ...data } }
      }
    },
    setCurrentFile (state, data) {
      const id = file.toUri(data)
      const entity = state.openedFiles[id] || blankEntity()

      if (data) {
        entity.id = id
        entity.name = data.name
        entity.path = data.path
        entity.repo = data.repo
        entity.title = data.title
        entity.content = data.content
      }

      entity.openTime = new Date().valueOf()

      state.openedFiles = { ...state.openedFiles, [id]: entity }

      state.currentFileId = id
      Storage.set('currentFileId', id)

      state.recentOpenTime = { ...(state.recentOpenTime || {}), [`${entity.repo}|${entity.path}`]: new Date().valueOf() }
      Storage.set('recentOpenTime', state.recentOpenTime)
    },
  },
  getters: {
    currentFile ({ openedFiles, currentFileId }) {
      return openedFiles[currentFileId] || blankEntity()
    },
    openedFile: ({ openedFiles }) => id => openedFiles[id] || blankEntity()
  },
  actions: {
    switchCurrentFile ({ commit }, data) {
      commit('setCurrentFile', data)
    },
    switchCurrentRepo ({ commit, dispatch }, data) {
      commit('setTree', null)
      commit('setCurrentRepo', data)
      dispatch('switchCurrentFile', getLastOpenFile(data))
    },
    async fetchMarkedFiles ({ commit }) {
      const files = (await file.markedFiles()).map(x => ({ ...x, name: file.basename(x.path) }))
      commit('setMarkedFiles', files)
    },
    async fetchRepositories ({ commit }) {
      const data = await file.fetchRepositories()
      commit('setRepositories', data)
    },
    async fetchTree ({ commit }, repo) {
      if (!repo) {
        console.warn('未选择仓库')
        return
      }

      const tree = await file.fetchTree(repo.name)
      commit('setTree', tree)
    },
    async showHelp ({ dispatch }, doc) {
      const content = await file.fetchHelpContent(doc)
      dispatch('switchCurrentFile', {
        repo: '__help__',
        title: doc,
        name: doc,
        path: '/' + doc,
        content
      })
    },
  }
}
