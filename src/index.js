 
// 导入封装的组件
import Calendar from './components/DDCalendar'
 
const components = {
  // 通过install来安装组件
  install(Vue) {
    Vue.component(
      'Calendar', Calendar
    )
  }
}
 
// 注意这里的判断，很重要
if(typeof windwo !== 'undefined' && window.Vue) {
  window.Vue.use(comment)
}
 
// 导出组件库
export default components