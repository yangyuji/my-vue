/**
 *
 * @param {*} vm 当前的vue实例
 * @param {*} expr data中数据的名字
 * @param {*} callback  一旦数据改变,则需要调用callback
 */

export class Watcher {

  constructor(vm, expr, callback) {
    this.vm = vm
    this.expr = expr
    this.callback = callback

    Dep.target = this

    this.oldValue = this.getVMData(vm, expr)
    // 防止给 data 对象重复添加 Watcher
    Dep.target = null
  }

  update() {
    // 获取新老值
    let oldValue = this.oldValue
    let newValue = this.getVMData(this.vm, this.expr)

    if (oldValue !== newValue) {
      this.callback(newValue, oldValue)
    }
  }

  // 取最深属性的值
  getVMData(vm, expr) {
    let data = vm.$data
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  }
}

// 订阅者模型
export class Dep {
  constructor() {
    this.subs = []
  }

  // 添加订阅者
  addSub(watcher) {
    this.subs.push(watcher)
  }

  // 通知
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
