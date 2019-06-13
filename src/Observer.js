import { Dep } from "./Watcher";

export class Observer {
    constructor(data){
        this.data = data
        this.walk(data)
    }

    // 遍历walk中所有的数据,劫持 set 和 get方法
    walk(data) {

        if(!data || typeof data !=='object') return

        // 拿到data中所有的属性
        Object.keys(data).forEach(key => {
            // 给data中的属性添加 getter和 setter方法
            this.defineReactive(data, key, data[key])

            // 如果data[key]是对象,深度劫持
            this.walk(data[key])
        })
    }

    // 定义响应式数据
    defineReactive(obj, key, value) {
        let that = this
        // Dep消息容器在Watcher.js文件中声明，将Observer.js与Dep容器有关的代码注释掉并不影响相关逻辑。
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 如果Dep.target 中有watcher 对象,则存储到订阅者数组中
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(aValue) {
                if(value === aValue) return
                value = aValue
                // 如果设置的值是一个对象,那么这个对象也应该是响应式的
                that.walk(aValue)

                // watcher.update
                // 发布通知,让所有订阅者更新内容
                dep.notify()
            }
        })
    }
}
