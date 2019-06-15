import {Watcher} from './Watcher.js'

export class Compile {

  constructor(el, vm) {
    this.el = typeof el === "string" ? document.querySelector(el) : el
    this.vm = vm
    // 解析模板内容
    if (this.el) {
      const fragment = this.node2fragment(this.el)
      this.compile(fragment)
      this.el.appendChild(fragment)
    }
  }

  node2fragment(node) {
    console.log(node.childNodes)
    let fragment = document.createDocumentFragment()
    let childNodes = node.childNodes

    Array.from(childNodes).forEach(node => {
      fragment.appendChild(node)
    })

    return fragment
  }

  // 解析fragment里面的节点
  compile(fragment) {
    let childNodes = fragment.childNodes
    Array.from(childNodes).forEach(node => {

      // 元素节点，解析指令
      if (this.isElementNode(node)) {
        this.compileElementNode(node)
      }

      // 文本节点，解析差值表达式
      if (this.isTextNode(node)) {
        this.compileTextNode(node)
      }

      // 递归解析元素
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node)
      }
    })
  }

  compileTextNode(node) {
    let expr = node.textContent
    let reg = /\{\{([^}]+)\}\}/g
    if (reg.test(expr)) {
      CompileUtils['mustache'](node, this.vm, expr)
    }
  }

  compileElementNode(node) {
    let attrs = node.attributes
    Array.from(attrs).forEach(attr => {
      let attrName = attr.name
      // 事件指令
      if (this.isEventDirective(attrName)) {
        let expr = attr.value
        let [, type] = attrName.split('@')
        CompileUtils.eventHandler(node, this.vm, type, expr)
      }
      if (this.isDirective(attrName)) {
        let expr = attr.value
        let [, type] = attrName.split('-')
        CompileUtils[type](node, this.vm, expr)
      }
    })
  }

  isTextNode(node) {
    return node.nodeType === 3
  }

  isElementNode(node) {
    return node.nodeType === 1
  }

  isEventDirective(name) {
    return name.includes('@')
  }

  isDirective(name) {
    return name.includes('v-')
  }
}

let CompileUtils = {
  // 取最深属性的值
  getVMData(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data || ''
  },
  // 赋最深属性的值
  setVMData(vm, expr, value) {
    let data = vm.$data
    let arr = expr.split('.')
    arr.forEach((key, index) => {
      if (index < arr.length - 1) {
        data = data[key]
      } else {
        data[key] = value || ''
      }
    })
  },
  // 解析插值表达式
  mustache(node, vm) {
    let txt = node.textContent
    let reg = /\{\{(.+)\}\}/
    if (reg.test(txt)) {
      let expr = RegExp.$1.trim()
      node.textContent = txt.replace(reg, this.getVMData(vm, expr))
      new Watcher(vm, expr, newValue => {
        node.textContent = txt.replace(reg, newValue)
      })
    }
  },
  // 解析v-text
  text(node, vm, expr) {
    node.textContent = this.getVMData(vm, expr)
    new Watcher(vm, expr, newValue => {
      node.textContent = newValue
    })
  },
  // 解析v-html
  html(node, vm, expr) {
    node.innerHTML = this.getVMData(vm, expr)
    new Watcher(vm, expr, newValue => {
      node.innerHTML = newValue
    })
  },
  // 解析v-model
  model(node, vm, expr) {
    // 赋初始值
    node.value = this.getVMData(vm, expr)

    // 订阅并处理
    new Watcher(vm, expr, newValue => {
      node.value = newValue
    })

    node.addEventListener('input', (e) => {
      // 深度改变数据
      this.setVMData(vm, expr, e.target.value)
    })
  },
  // 解析事件绑定@
  eventHandler(node, vm, eventType, expr) {

    let fn = vm.$methods && vm.$methods[expr]

    try {
      node.addEventListener(eventType, fn.bind(vm))
    } catch (error) {
      console.error('methods里面没有找到该方法：' + expr)
    }
  }
}

