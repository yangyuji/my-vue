import {Dep} from "./Watcher";

export class Observer {
  constructor(data) {
    this.data = data
    this.walk(data)
  }

  // 遍历walk中所有的数据，劫持 setter 和 getter
  walk(data) {

    if (!data || typeof data !== 'object') return

    Object.keys(data).forEach(key => {

      // 给 data 添加 getter 和 setter
      this.defineReactive(data, key, data[key])

      // 递归进行深度劫持
      this.walk(data[key])
    })
  }

  // 定义响应式数据
  defineReactive(obj, key, value) {
    let that = this
    let dep = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 如果 Dep.target 中有 watcher 对象，则存储到订阅者数组中
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(aValue) {
        if (value === aValue) return
        value = aValue

        // 外层递归，如果设置的值是一个对象，那么这个对象也应该是响应式的
        that.walk(aValue)

        // 发布通知，让所有订阅者更新内容， watcher.update
        dep.notify()
      }
    })
  }
}
