//
// viui.js
// v0.1
//

var appList = []


function reload() {
  window.location.href = "/"
}


function registerApp(app) {
  appList.push(app)
  console.log("appList:", appList)
}


// alias
function byId(id) {
  return document.getElementById(id)
}


// alias
function byName(id) {
  return document.getElementsByName(id)
}


// alias
function byCls(id) {
  return document.getElementsByClassName(id)
}


// alias
function byQuery(query, ptr = document) {
  return ptr.querySelectorAll(query)
}


function isUndef(v) {
  return (typeof v === 'undefined')
}


function _callBackend(app, method, params, cb) {
  let hd = new Headers()
  let p = { method: method }
  if (!isUndef(params))
    p["body"] = params
  p.headers = hd
  fetch("/" + app, p)
    .then(resp => resp.json()).then(fetched => { cb && cb(fetched) })
}


function callGet(app, cb) {
  _callBackend(app, "GET", undefined, cb)
}


function callPost(app, params, cb) {
  _callBackend(app, "POST", params, cb)
}


function callDelete(app, params, cb) {
  _callBackend(app, "DELETE", params, cb)
}


const widgetSettings = {}

function initWidget(id, initFn) {
  widgetSettings[id] = initFn
  console.log("widgetSettings=", widgetSettings)
  initFn
}


function openPopup(id, status = 'active') {
  byId(id).classList.add(status)
  // TODO: redo (https://gist.github.com/amysimmons/3d228a9a57e30ec13ab1 )
  // console.log("widgetSettings.hasOwnProperty(", id, ")=", widgetSettings.hasOwnProperty(id))
  // if (widgetSettings.hasOwnProperty(id))
  //   console.log("widgetSettings[", id, "]:", widgetSettings[id])
  if (widgetSettings[id]) widgetSettings[id]()
}


function closePopup(id, status = 'active') {
  byId(id).classList.remove(status)
  // TODO: redo (https://gist.github.com/amysimmons/3d228a9a57e30ec13ab1 )
  // console.log("widgetSettings.hasOwnProperty(", id, ")=", widgetSettings.hasOwnProperty(id))
  // if (widgetSettings.hasOwnProperty(id))
  //   console.log("widgetSettings[", id, "]:", widgetSettings[id])
  if (widgetSettings[id]) widgetSettings[id]()
}


function doAppAttrHidden(app, attr) {
  if ((app !== null) && ((attr !== null))) {
    byCls(`${app}-${attr}`)[0].classList.add("d-none")
  }
}


function doAppAttrActive(app, attr) {
  if ((app !== null) && ((attr !== null))) {
    byCls(`${app}-${attr}`)[0].classList.remove("d-none")
  }
}


function doElemHidden(el, attr) {
  if (attr == null)
    attr = "d-none"
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


function doElemActive(el, attr) {
  if (attr == null)
    attr = "d-none"
  el.classList.remove(attr)
}


function doElemActiveById(id, attr) {
  doElemActive(byId(id), attr)
}


function doAppActive(app, cb) {
  for (var a = 0; a < appList.length; a++) {
    doAppHidden(appList[a])
  }
  appActive = app
  doElemActiveById("app-" + app)

  // applying callback if present
  cb && cb()
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


function toastMsg(msg, type) {
  let t = byId("toast")
  t.innerHTML = msg
  let typeMsg = "success"
  if (!isUndef(type))
    typeMsg = type
  t.classList.add('toast-' + typeMsg)
  t.classList.remove('d-none')
  function toastOff() {
    t.classList.add('d-none')
    t.classList.remove('toast-' + typeMsg)
  }
  setTimeout(toastOff, 3000)
}


// // TODO:
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
    console.log("state:", state)
    if (state.message === "success") {
      cb && cb(state.data)
      toastMsg(`Successfully uploaded ${state.data[0].name} file!`)
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


function isEmptyObj(obj) {
  return JSON.stringify(obj) === '{}'
}


module.exports = {
  reload, registerApp,
  byId, byName, byCls, byQuery, isUndef, callGet, callPost, callDelete, initWidget,
  openPopup, closePopup, doAppAttrHidden, doAppAttrActive, doElemHidden,
  doElemHiddenById, doAppHidden, doElemActive, doElemActiveById, doAppActive,
  cleanChilds, getFormattedDate, toastMsg, setActiveTab, getPosition, notImpl,
  getStackTrace, uploadFile, load, saveDefault, save, remove, isEmptyObj
}
