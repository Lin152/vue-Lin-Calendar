<template>
  <div id="app" @touchmove.prevent>
    <DDCalendar
        ref="picker"
        model="dialog"
        week-start="sunday"
        picker-type="datetime"
        format="YY/MM/DD"
        :default-datetime="defaultDatetime"
        :markDate="markDate"
        @click="dateClick"
        @change="dateChange"
    />
    <!-- <p>选择时间：{{ checkedDate }}</p>
    <button @click="today">回到今天</button> -->
  </div>
</template>

<script>
import DDCalendar from "./components/DDCalendar";

export default {
  name: "App",
  components: {
    DDCalendar
  },
  data() {
    return {
      defaultDatetime: new Date(),
      checkedDate: "",
      markDate: ["2022/8/25", "2022/8/20", "2022/8/22", "2022/8/24"]
    };
  },
  methods: {
    dateChange(date) {
      // 日期改变触发
      console.log(date, "change");
      this.checkedDate = date;
    },
    dateClick(date) {
      // 点击日期时按钮触发
      console.log(date, "click");
      this.checkedDate = date;
      //  在这里携带具体参数调用后台获取这一天的数据
    },
    today() {
      this.$refs.picker.today();
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  background: #ddd;
  overflow: hidden;
}
</style>
