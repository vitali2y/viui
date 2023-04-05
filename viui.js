//
// viui.js
// Very sImple UI <3 Spectre.css & Simulacra.js
// https://github.com/vitali2y/viui
//
// v0.12.0
//


let appList = []
let featureList = {}
let appActive


function initFeatures(featureArr) {
  featureList = featureArr
}


function reload() {
  window.location.href = "/"
}


function registerApp(app) {
  appList.push(app)
}


// alias
function byId(id, ptr = document) {
  return ptr.getElementById(id)
}


// alias
function byName(id, ptr = document) {
  return ptr.getElementsByName(id)
}


// alias
function byCls(id, ptr = document) {
  return ptr.getElementsByClassName(id)
}


// alias
function byQuery(query, ptr = document) {
  return ptr.querySelectorAll(query)
}


function isUndef(v) {
  return (typeof v === 'undefined')
}


function _callBackend(app, method, params, isSecureCall, cb) {
  let hd = new Headers()
  let p = { method: method }
  if (!isUndef(params)) {
    p["body"] = JSON.stringify(params)
    // p["body"] = params
    hd.append('Content-Type', 'application/json')
  }
  if (isSecureCall) {
    hd.append('Authorization', localStorage.getItem('ccs-token'))
    app = `${window.API_VER}/${app}`
  }
  p.headers = hd
  featureList["spin-on"] && featureList["spin-on"]()
  fetch(app, p)
    .then(resp => {
      if (resp.status != 200)
        cb && cb([], resp.status)
      return resp.json()
    })
    .then(fetched => {
      featureList["spin-on"] && featureList["spin-off"]()
      cb && cb(fetched, 0)
    })
    .catch(err => console.log("oops, error:", err))
}


function callGet(app, cb) {
  _callBackend(app, "GET", undefined, true, cb)
}


function callPost(app, params, cb) {
  _callBackend(app, "POST", params, true, cb)
}


function callPostUnsecure(app, params, cb) {
  _callBackend(app, "POST", params, false, cb)
}


function callPut(app, params, cb) {
  _callBackend(app, "PUT", params, true, cb)
}


function callDelete(app, params, cb) {
  _callBackend(app, "DELETE", params, true, cb)
}


const widgetSettings = {}
function initOnPopupOpen(id, initFn) {
  var i = `el-${id}`
  widgetSettings[i] = initFn
  initFn
}


function openPopup(id, status = 'active') {
  var i = `el-${id}`
  byId(i).classList.add(status)
  // TODO: redo (https://gist.github.com/amysimmons/3d228a9a57e30ec13ab1 )
  if (widgetSettings[i])
    widgetSettings[i]()
}


function closePopup(id, status = 'active') {
  doElemActive(byId(`el-${id}`), status)
  // TODO: redo (https://gist.github.com/amysimmons/3d228a9a57e30ec13ab1 )
  // TODO: do we use such callback when popup closed?
  // if (widgetSettings[i])
  //   widgetSettings[i]()
}


// hiding attribute on all pages, if any
function doAppAttrHidden(app, attr) {
  if ((app !== null) && ((attr !== null))) {
    var l = byCls(`${app}-${attr}`)
    for (var p = 0; p < l.length; p++)
      l[p].classList.add("d-none")
  }
}


// activating attribute on all pages, if any
function doAppAttrActive(app, attr) {
  if ((app !== null) && ((attr !== null))) {
    var l = byCls(`${app}-${attr}`)
    for (var p = 0; p < l.length; p++)
      l[p].classList.remove("d-none")
  }
}


function doElemHidden(el, attr = "d-none") {
  el.classList.add(attr)
}


function doElemHiddenById(id, attr) {
  doElemHidden(byId(id), attr)
}


// function doElemHiddenByCls(id, attr) {
//     doElemHidden(byCls(id), attr)
// }


function doAppHidden(app) {
  if (app !== null)
    doElemHiddenById("app-" + app)
}


function doElemActive(el, attr = "d-none") {
  el.classList.remove(attr)
}


function doElemActiveById(id, attr) {
  doElemActive(byId(id), attr)
}


function doAppActive(app = null, cb) {
  for (var a = 0; a < appList.length; a++) {
    doAppHidden(appList[a])
  }
  if (app != null) {
    appActive = app
    doElemActiveById("app-" + app)
  }

  if (featureList["app-active"])
    featureList["app-active"]()

  // applying callback if present
  cb && cb()
}


function getCurrentApp() {
  return appActive
}


function cleanChilds(id) {
  var p = byId(id)
  while (p.lastElementChild)
    p.removeChild(p.lastElementChild)
}


function getFormattedDate(ts) {
  var date = new Date(ts * 1000)
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var min = date.getMinutes()
  var sec = date.getSeconds()
  month = (month < 10 ? '0' : '') + month
  day = (day < 10 ? '0' : '') + day
  hour = (hour < 10 ? '0' : '') + hour
  min = (min < 10 ? '0' : '') + min
  sec = (sec < 10 ? '0' : '') + sec
  return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + min
}


function toastMsg(msg, typeMsg = "success", timeOut) {
  if (featureList["toast"])
    featureList["toast"](msg, typeMsg, timeOut)
}


function toastMandatoryField(reqField) {
  toastMsg("Please fill/select all mandatory field(s)!", "error")
  if (reqField.type == "select-one")
    reqField.style.setProperty("background-color", "#e85600")
  else
    doElemHidden(reqField, "alert-field")

  function toastOff() {
    {
      if (reqField.type == "select-one")
        reqField.style.setProperty("background-color", "#ededff")  // set default
      else
        doElemActive(reqField, "alert-field")
    }
  }

  setTimeout(toastOff, 4000)
}


function verifyMandatoryFields(app, contentName) {
  // TODO: to do better ".req-label + .req-field" functionality
  // TODO: chk all ".contactemail" (e. g. ".content_tab_followup", etc) when manually cleared
  var isVerified = true
  var fieldsToCheck = byQuery(`#el-${app} ${contentName} .req-field`)
  for (var i = 0; i < fieldsToCheck.length; i += 1) {
    // TODO:
    if ((fieldsToCheck[i].value == "") || (fieldsToCheck[i].value == "0")
      //  || (fieldsToCheck[i].innerText == "") || (fieldsToCheck[i].innerText == "0")
    ) {
      toastMandatoryField(fieldsToCheck[i])
      isVerified = false
    }
  }
  return isVerified
}


// function fullScreen(id) {
//   var elem = byId(id)
//   if (elem.requestFullscreen) {
//     elem.requestFullscreen()
//   } else if (elem.mozRequestFullScreen) {
//     elem.mozRequestFullScreen()
//   } else if (elem.webkitRequestFullscreen) {
//     elem.webkitRequestFullscreen()
//   } else if (elem.msRequestFullscreen) {
//     elem.msRequestFullscreen()
//   }
// }


function setActiveTab(nameTab, tabsList) {
  tabsList.forEach(name => {
    doElemActiveById(`${name}-tab`, "active")
  })

  // setting the proper tab's header active
  doElemHiddenById(`${nameTab}-tab`, "active")

  // setting the proper tab's body visible
  tabsList.forEach(name => { doElemHiddenById(`${name}-tab-body`) })
  doElemActiveById(`${nameTab}-tab-body`)
}


// finds the offset of el from the body or html element
function getPosition(el) {
  var _x = 0
  var _y = 0
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft + el.clientLeft
    _y += el.offsetTop - el.scrollTop + el.clientTop
    el = el.offsetParent
  }
  return { y: _y, x: _x }
}


// // NOTE: https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
// function getTop(el) {
//   return el.offsetTop + (el.offsetParent && getTop(el.offsetParent))
// }


// // NOTE: https://stackoverflow.com/a/40814766/12950546
// function getTop2(el) {
//   var rect = el.getBoundingClientRect()
//   return rect.top
// }


function getStackTrace() {
  var obj = {}
  Error.captureStackTrace(obj, getStackTrace)
  return obj.stack
}


function notImpl(msg = "Not implemented yet!") {
  toastMsg(msg, "error")
}


function uploadFile(files, apiUri, cb) {
  var formData = new FormData()
  for (var i = 0; i < files.length; i++)
    formData.append('file', files[i])
  toastMsg("Uploading doc(s)...")
  callPost(apiUri, formData, (state) => {
    if (state.message === "success") {
      cb && cb(state.data)
      toastMsg(`Successfully uploaded "${state.data[0].name}" file!`)
    }
    else toastMsg("Upload failed: " + state.message + "!", "error")
  })
}


function load(key) {
  return localStorage.getItem(key)
}


function saveDefault(key, val) {
  if (load(key) == null)
    save(key, val)
}


function save(key, val) {
  localStorage.setItem(key, val)
}


function remove(key) {
  localStorage.removeItem(key)
}


function isObjEmpty(obj) {
  return JSON.stringify(obj) === '{}'
}


function setTabActive(app, tabs, tab) {
  Object.keys(tabs).forEach(function (i) { byQuery(`#el-${app} .${tabs[i]}`)[0].parentNode.classList.remove("active") })
  doElemHidden(byQuery(`#el-${app} .${tab}`)[0].parentNode, "active")
  doElemActive(byQuery(`#el-${app} .${tab}`)[0].parentNode)

  Object.keys(tabs).forEach(function (i) { byQuery(`#el-${app} .content_${tabs[i]}`)[0].classList.add("d-none") })
  doElemActive(byQuery(`#el-${app} .content_${tab}`)[0])
}


function getTs(d) {
  const pad = (n, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s)
  return `${pad(d.getFullYear(), 4)}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}


function getTs2(d) {
  return d.getFullYear() +
    "/" + (d.getMonth() + 1) +
    "/" + d.getDate() +
    " " + d.getHours() +
    ":" + d.getMinutes() +
    ":" + d.getSeconds()
}


var delay = (function () {
  var timer = 0;
  return function (cb, ms) {
    clearTimeout(timer)
    timer = setTimeout(cb, ms)
  }
})()


// setting title tooltips for potentially long columns
function postinitTitles(elName, tabName) {
  byQuery(`#el-${elName} .content_${tabName} .title-tooltip`)
    .forEach(function (el) { el.title = el.innerText })
}


// post init for picture columns
function postinitPictures(elName, tabName) {
  byQuery(`#el-${elName} .content_${tabName} .picture-tooltip`)
    .forEach(function (el) {
      if (el.innerText === "N") {
        el.innerHTML = "&#xe31b;"
        el.title = "Absent"
      }
      else {
        el.innerHTML = "&#xea8e;"
        el.title = "Present"
      }
    })
}


// post init for status columns
function postinitStatuses(elName, tabName) {
  // TODO: to preliminary pass innerHTML and title sets via init()
  byQuery(`#app-${elName} .content_${tabName} .status-tooltip`)
    .forEach(function (el) {
      switch (el.innerText) {
        // NOTE: innerHTML codes @ MaterialIcons.css
        case "1":
          el.innerHTML = "&#xe03e;"
          el.title = "Active"
          break
        case "2":
          el.innerHTML = "&#xe03f;"
          el.title = "Disabled"
          break
        case "3":
          el.innerHTML = "&#xe01f;"
          el.title = "Pending"
          break
        case "Y":
          el.innerHTML = "&#xe303;" // .md-highlight_off
          el.title = "Disabled"
          break
        case "N":
          el.innerHTML = "&#xe8e7;" // .md-task_alt
          el.title = "Enabled"
          break
        case "yes":
          el.innerHTML = "&#xe8e7;" // .md-task_alt
          el.title = "Yes"
          break
        case "no":
          el.innerHTML = "&#xe303;" // .md-highlight_off
          el.title = "No"
          break
      }
    })
}


function onDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.childNodes[0].innerText)
  event.currentTarget.style.backgroundColor = featureList["bg-color-dnd"] || "#d6d6ff"
}


function onDragOver(event) {
  event.preventDefault()
}


function onDrop(elId, event) {
  const id = event.dataTransfer.getData('text')
  byQuery(`#${elId} .src .dnd`).forEach(function (el) {
    if (el.innerHTML.indexOf(id) !== -1) {
      const dndElement = el
      const dropzone = event.target
      dropzone.appendChild(dndElement)
    }
  })
  event.preventDefault()
}


function onDragEnd(event) {
  event.currentTarget.style.backgroundColor = featureList["bg-color"] || "#ededff"
}


function cleanupStates(states, arrExc = [], initVal = "") {
  for (var k in states) {
    var found = arrExc.find(el => el == k)
    if (isUndef(found))
      states[k] = initVal
    else
      states[k] = 0
  }
}


function initStates(states, inits, arrExc = []) {
  for (var k in inits) {
    var found = arrExc.find(el => el == k)
    if (isUndef(found)) {
      if ((inits[k] == window.EMPTY) || (inits[k] == null))
        states[k] = ""
      else
        states[k] = inits[k]
    }
    else
      states[k] = 0
  }
}


function trimStates(states, arrExc = []) {
  for (var k in states) {
    var found = arrExc.find(el => el == k)
    if (isUndef(found)) {
      if (states[k].length > 0)
        states[k] = states[k].trim()
    }
  }
}


function setFieldDisabled(el) {
  el.setAttribute("disabled", "disabled")
}


function setFieldEnabled(el) {
  el.removeAttribute("disabled")
}


function setFieldsReadOnly(queryId) {
  // TODO: spectre.css:969 for select
  byQuery(`#${queryId} input, #${queryId} select, #${queryId} textarea`).forEach(el => setFieldDisabled(el))
  byQuery(`#${queryId} textarea`).forEach(el => el.style.removeProperty("background-color"))
}


function setFieldsEditable(queryId) {
  byQuery(`#${queryId} input, #${queryId} select, #${queryId} textarea`).forEach(el => setFieldEnabled(el))
  byQuery(`#${queryId} textarea`).forEach(el => el.style.backgroundColor = "#ededff")
}


function setEditable(el) {
  setFieldsEditable(el._anchor)
  // TODO: as param or cb
  el.state.popup.saveOrEdit = "Save"
}


function setReadOnly(el) {
  setFieldsReadOnly(el._anchor)
  // TODO: as param or cb
  el.state.popup.saveOrEdit = "Edit"
}


function fetchPulldownData(name, cb, fn = function (i) { return i.name }) {
  callGet(name + "?short=1&ordby=name&orddir=ASC&limit=999&isdisabled=N", (stateJson) => {
    let idArr = [0]
    let nameArr = [""]
    stateJson.data.forEach(i => { idArr.push(i.id); nameArr.push(fn(i)) })
    cb({ id: idArr, name: nameArr })
  })
}


function enableButton(el, btnName) {
  doElemActive(byQuery(`#el-${el} button.${btnName}`)[0], "disabled")
}


function disableButton(el, btnName) {
  doElemHidden(byQuery(`#el-${el} button.${btnName}`)[0], "disabled")
}


function unhideButton(el, btnName) {
  doElemActive(byQuery(`#el-${el} button.${btnName}`)[0])
}


function hideButton(el, btnName) {
  doElemHidden(byQuery(`#el-${el} button.${btnName}`)[0])
}


// TODO: "tab_" prefix is passed in activeTab, when it's not in activeTabs in initStaticTabs()
function changeTab(app, statePopups, activeTab) {
  var q = Object.keys(statePopups)
  var tabsAll = []
  Object.keys(q).forEach(function (i) { if (q[i].startsWith("tab_")) tabsAll.push(q[i]) })
  setTabActive(app, tabsAll, activeTab)
  return activeTab
}


function initStaticTabs(app, statePopups, activeTabs) {
  // hide all tabs, and ...
  var q = Object.keys(statePopups)
  var tabs = []
  Object.keys(q).forEach(function (i) { if (q[i].startsWith("tab_")) tabs.push(q[i]) })
  Object.keys(tabs).forEach(function (i) {
    byQuery(`#el-${app} .${tabs[i]}`)[0]
      .parentNode.classList.add("d-none")
  })

  // ... open required tabs only
  tabs = activeTabs.map(i => 'tab_' + i)
  Object.keys(tabs).forEach(function (i) {
    byQuery(`#el-${app} .${tabs[i]}`)[0]
      .parentNode.classList.remove("d-none")
  })
}


// function renderAvatar(el, val) {
//   el.append(hashicon(val, 30))
//   el.append(" " + val)
// }


function initSorting(app, cb) {
  // gathering the columns list for sorting
  app.sorting.cols = []
  for (const n of byQuery(`#el-${app._name} .sort-anchor`)[0].children) {
    app.sorting.cols.push(n.classList[0])
  }

  app.state.list = []

  // setting temp columns' indexes
  let colIdx = 0
  // TODO: to remove these temp indexes later
  byQuery(`#app-${app._name} th`).forEach(c => {
    if (!isUndef(c.childNodes[1]) && c.childNodes[1].classList[0] == "sorting")
      doElemHidden(c.childNodes[1], colIdx)
    colIdx += 1
  })

  // setting columns' handlers
  byQuery(`#app-${app._name} th`).forEach(c => {
    if (!isUndef(c.childNodes[1]) && c.childNodes[1].classList[0] == "sorting")
      c.addEventListener('click', function (evtEl, _evtPath) {
        let idx = evtEl.target.parentElement.classList[1]
        if (!isUndef(idx)) {
          app.offset = 0
          // TODO: app._anchor_state?
          app.state.list = []
          app.sorting.ordby = app.sorting.cols[idx]
          app.sorting.orddir = !app.sorting.orddir

          // sorting icons management
          byQuery(`#app-${app._name} thead i`).forEach(c => { c.classList.remove(c.classList[1]) })
          let cnt = 0
          byQuery(`#app-${app._name} thead i`).forEach(c => {
            if (cnt == idx) {
              if (app.sorting.orddir)
                byQuery(`#app-${app._name} thead i`)[idx].classList.add("md-arrow_upward")
              else
                byQuery(`#app-${app._name} thead i`)[idx].classList.add("md-arrow_downward")
            }
            else
              c.classList.add("md-swap_vert")
            cnt += 1
          })

          // fetching data according to sorting preference
          fetchData(app, cb)
        }
        evtEl.stopPropagation()
        return
      })
  })

  // fetching data according to sorting preference
  app.limit = featureList["limit"]
  fetchData(app, cb)
}


function fetchData(app, cb) {
  var url
  if (isUndef(app._url))
    url = app._name + "?"
  else
    url = app._url
  callGet(`${url}limit=${app.limit}&offset=${app.offset}&ordby=${app.sorting.ordby}&orddir=${app.sorting.orddir ? "ASC" : "DESC"}`, (stateJson) => {
    // TODO: to chk stateJson.code
    if (isUndef(app._url)) {
      app.state.list = app.state.list.concat(stateJson.data)
      cb && cb()
    }
    else
      cb && cb(stateJson.data)
  })
}


function scrollData(app, cb) {
  let scroll = byQuery(`#${app._anchor} .scroll-infinite`)[0]
  scroll
    .addEventListener('scroll', function () {
      if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight) {
        app.offset += featureList["offset"]
        cb && cb()
      }
    })
}


function getIcon(name, title, body) {
  let icn = document.createElement("i")
  icn.classList.add("material-icons")
  icn.classList.add(name)
  icn.title = title
  icn.innerHTML = body
  return icn
}


// Presets some predefined value in dropdown list by "value" param
function setDropdownSelectedByValue(here, val) {
  try {
    here.querySelectorAll(`[value="${val}"]`)[0].selected = true
  } catch {
    console.log("setDropdownSelectedByValue: oops:", here)
  }
}


// Presets some predefined value in dropdown list by tag's content
function setDropdownSelectedByContent(here, val) {
  selected = false
  here.querySelectorAll('[class="name"]').forEach(i => {
    if (i.value == val) {
      i.selected = true
      selected = true
    }
  })
}


function getDropdownSelectedByValue(query, val) {
  return byQuery(query)[0].querySelectorAll(`[value="${val}"]`)[0].innerText
}


// Clears dropdown's selected option
function clearDropdownSelected(query) {
  if (byQuery(query).length > 0) {
    let q = byQuery(query)[0].childNodes[0]
    if (q && q.selectedIndex > 0)
      q.selectedIndex = 0
  }
}

function supportDropdownSelected(here, prevVal, val) {
  if (!isUndef(here)) {
    if (prevVal === null)
      here.addEventListener('change', function (evtEl, _evtPath) {
        evtEl.stopPropagation()
        dropdownId = +evtEl.target.options[evtEl.target.selectedIndex].value
      })
    try {
      setDropdownSelectedByContent(here, val)
    } catch (err) {
      console.log("oops, supportDropdownSelected:", err, here, val)
    }
  }
}


function applyPermissionGroup(group, file = 2) {
  window.document.styleSheets[file].insertRule(`.perm${group} { display: none; }`)
}


function renderDataList(here, dataJson) {
  let dataList = document.createElement('datalist')
  dataList.id = `auto-${here.classList[0]}`
  here.setAttribute('list', dataList.id)
  let fragment = document.createDocumentFragment()
  if (here.nextSibling.id == dataList.id) {
    let exist = here.nextSibling
    exist.parentNode.removeChild(exist)
  }

  for (let o of dataJson) {
    let option = document.createElement('option')
    option.id = o.id
    option.textContent = o.name
    fragment.append(option)
  }
  dataList.append(fragment)
  here.after(dataList)
}


function lightAutoField(here, isExist) {
  try {
    if (isExist) {
      doElemHidden(here.nextElementSibling, "auto-ok")
      doElemActive(here.nextElementSibling, "auto-ng")
    }
    else {
      doElemHidden(here.nextElementSibling, "auto-ng")
      doElemActive(here.nextElementSibling, "auto-ok")
    }
  } catch (err) {
  }
}


function setAutoField(el, query) {
  let child = el.target.nextSibling.childNodes
  var isPresent = false
  for (var i = 0; i < child.length; i++) {
    if (child[i].innerText == el.target.value) {
      isPresent = true
      break
    }
  }
  if (isPresent) {
    if ((el.target.value.length > 0) && (child.length > 0))
      return child[0].id
    else {
      toastMsg(`Nothing found by "${el.target.value}" pattern!`, "error")
      lightAutoField(query, false)
    }
  }
  else
    toastMsg("Item is not selected from the list yet - please try again!", "error")
  return 0
}


// // overwriting system console.log for sending browser logs to the server
// var orgLog = window.console.log
// window.console.log = function () {
//   if (!window.REMOTE_LOG)
//     orgLog.apply(this, arguments)
//   else {
//     orgLog.apply(this, arguments)
//     var c = ""
//     for (var i = 0; i < Object.keys(arguments).length; i++) {
//       if (typeof arguments[i] === 'object')
//         c += JSON.stringify(arguments[i]) + " "
//       else
//         c += arguments[i]
//     }
//     callPost("log", JSON.stringify(load('ccs-id') + " => " + c), (_data) => {
//       // orgLog(data)
//     })
//   }
// }


window.viui = {
  initFeatures, reload, registerApp,
  byId, byName, byCls, byQuery, isUndef, callGet, callPost, callPut, callPostUnsecure, callDelete,
  initOnPopupOpen, openPopup, closePopup, doAppAttrHidden, doAppAttrActive, doElemHidden,
  doElemHiddenById, doAppHidden, doElemActive, doElemActiveById, doAppActive, getCurrentApp,
  cleanChilds, getFormattedDate, toastMsg, toastMandatoryField,
  verifyMandatoryFields, setActiveTab, getPosition, notImpl, getStackTrace, uploadFile, load, saveDefault,
  save, remove, isObjEmpty, setTabActive, getTs, getTs2, delay,
  postinitTitles, postinitPictures, postinitStatuses,
  onDragStart, onDragOver, onDrop, onDragEnd, cleanupStates,
  initStates, trimStates, setFieldDisabled, setFieldEnabled, setFieldsReadOnly, setFieldsEditable,
  setEditable, setReadOnly, fetchPulldownData, enableButton, disableButton, unhideButton, hideButton,
  changeTab, initStaticTabs, initSorting, fetchData, scrollData, getIcon, setDropdownSelectedByValue,
  setDropdownSelectedByContent, getDropdownSelectedByValue, clearDropdownSelected, supportDropdownSelected,
  applyPermissionGroup, renderDataList, lightAutoField, setAutoField
}
