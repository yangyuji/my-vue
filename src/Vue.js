import { Observer } from './Observer.js'
import { Compile } from './Compile.js'
/**
 * vue.js (入口文件)
 * 1\. 将data,methods里面的属性挂载根实例中
 * 2\. 监听 data 属性的变化
 * 3\. 编译挂载点内的所有指令和插值表达式
 */
export class Vue {
    constructor(options={}){
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods

        // debugger

        // 将data,methods里面的属性挂载根实例中
        this.proxy(this.$data)
        this.proxy(this.$methods)

        // 监听数据
        new Observer(this.$data)

        if(this.$el) {
            new Compile(this.$el, this)
        }
    }
    proxy(data={}) {
        Object.keys(data).forEach(key => {
            // 这里的this 指向vue实例
            Object.defineProperty(this,key,{
                enumerable: true,
                configurable: true,
                set(value){
                    if(data[key] === value) return
                    return value
                },
                get(){
                    return data[key]
                }
            })
        })
    }
}

window.Vue = Vue
