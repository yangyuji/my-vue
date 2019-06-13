
export class Watcher {
    /**
     *
     * @param {*} vm 当前的vue实例
     * @param {*} expr data中数据的名字
     * @param {*} callback  一旦数据改变,则需要调用callback
     */
    constructor(vm, expr, callback){
        this.vm = vm
        this.expr = expr
        this.callback = callback

        Dep.target = this

        this.oldValue = this.getVMData(vm, expr)

        Dep.target = null
    }

    update() {
        // 对比expr是否发生改变,如果改变则调用callback
        let oldValue = this.oldValue
        let newValue = this.getVMData(this.vm, this.expr)

        // 变化的时候调用callback
        if(oldValue !== newValue) {
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

export class Dep {
    constructor(){
        this.subs = []
    }

    // 添加订阅者
    addSub(watcher){
        this.subs.push(watcher)
    }

    // 通知
    notify() {
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}
