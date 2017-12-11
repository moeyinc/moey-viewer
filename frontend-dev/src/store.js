/* =================================================
 state
================================================== */
const state = {
  size: {
    appWidth: 0,
    appHeight: 0
  }
}

/* =================================================
 mutations
================================================== */
const mutations = {
  updateSize (state, payload) {
    // console.log('updating size: ', payload)
    state.size.appWidth  = payload.appWidth
    state.size.appHeight = payload.appHeight
  }
}

/* =================================================
 actions
================================================== */
const actions = {
}

/* =================================================
 getters
================================================== */
const getters = {
}

/* =================================================
 export
================================================== */
export default {
  state,
  mutations,
  actions,
  getters
}
