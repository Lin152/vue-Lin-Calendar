<template>
  <div
      class="calendar_body"
      :style="{
      height: `${calendarBodyHeight}px`
    }"
  >
    <div class="calendar_week" ref="weekTitle">
      <div class="calendar_item" v-for="item in calendarWeek" :key="item">
        <p class="calendar_weekday">
          <slot name="week" :week="item">{{ item }}</slot>
        </p>
      </div>
    </div>
    <div
        class="calendar_group"
        :style="{ height: `${calendarGroupHeight}px` }"
        ref="calendar"
        @touchstart="touchStart"
        @touchmove.stop.prevent="touchMove"
        @touchend="touchEnd"
    >
      <div
          class="calendar_week_preview"
          :style="{ height: `${calendarItemHeight}px` }"
          v-show="weekPreviewShow"
      >
        <ul
            :style="{
            transform: `translate3d(${-translateIndex * 100}%, 0, 0)`,
            height: `${calendarItemHeight}px`
          }"
        >
          <li
              class="calendar_week_item"
              v-for="(item, index) in threeWeek"
              :key="index"
              :style="{
              transform: `translate3d(${(index - 1 + translateIndex + touch.x) *
                100}%, 0, 0)`,
              transitionDuration: `${isTouching ? 0 : transitionDuration}s`
            }"
          >
            +{{ item }}
          </li>
        </ul>
      </div>
      <ul
          v-show="!weekPreviewShow"
          :style="{
          transform: `translate3d(${-translateIndex * 100}%, 0, 0)`,
          height: isShowWeek
            ? isTouching === 'y'
              ? `${calendarItemHeight * 6}px`
              : `${calendarItemHeight}px`
            : `${calendarItemHeight * 6}px`
        }"
      >
        <li
            class="calendar_group_li "
            v-for="(item, i) in calendarOfMonthShow"
            :key="i"
            :style="{
            transform: `translate3d(${(i -
              1 +
              translateIndex +
              (isTouching ? touch.x : 0)) *
              100}%, ${
              isShowWeek && isTouching !== 'y'
                ? calendarY
                : isTouching
                ? touch.y > calendarY
                  ? touch.y
                  : calendarY
                : 0
            }px, 0)`,
            transitionDuration: `${isTouching ? 0 : transitionDuration}s`
          }"
        >
          <div
              class="calendar_month"
              :style="{ opacity: isShowWeek ? 0 : 0.2 }"
          >
            {{ constant.MONTH[item[20].month] }}
          </div>
          <div
              class="calendar_item"
              ref="calendarItem"
              v-for="(date, j) in item"
              :class="[
              formatDisabledDate(date) &&
                (disabledClassName || 'calendar_item_disable')
            ]"
              :key="i + j"
              @click="clickCalendarDay(date)"
          >

            <div
                class="calendar_day"
                :style="{ 'border-color': markDateColor(date, 'circle') }"
                :class="[
                isToday(date) && (todayClassName || 'calendar_day_today'),
                isCheckedDay(date) &&
                  (checkedDayClassName || 'calendar_day_checked'),
                isNotCurrentMonthDay(date, i) &&
                  (notCurrentMonthDayClassName || 'calendar_day_not'),
                markDateColor(date, 'circle') && 'calendar_mark_circle'
              ]"
            >
              <!--   date:{
                         year:'',
                         month:'',index+1
                         day:'',
                         -->
              <!--              <span>{{date.month}}</span>-->
              <!--              <span>{{date.year}}</span>-->
              <!--              <span>{{date.day}}</span>-->
              <div class="calendar_solarday">
                {{ isToday(date) ? "???" : date.day }}
              </div>
              <!--   ????????????    -->
              <!--              <div class="calendar_lunarday">{{ getLunar(date) }}</div>-->
              <!--              <div-->
              <!--                  :style="{-->
              <!--                  background:-->
              <!--                    markDateColor(date, 'dot') && isCheckedDay(date)-->
              <!--                      ? '#fff'-->
              <!--                      : markDateColor(date, 'dot')-->
              <!--                }"-->
              <!--                  class="calendar_dot"-->
              <!--              ></div>-->
            </div>
            
          <div v-if="isSelect(date)" class="smallDot1"></div>
          <!-- <div v-if="!isSelect(date)" class="smallDot1"></div> -->
          

           
          </div>
          <!--  ????????????-->
                     <!-- <div class="smallDot"></div>
                      <div class="smallDot1"></div> -->
        </li>
      </ul>
    </div>
    <div
        class="calendar_arrow"
        ref="arrow"
        @touchstart="touchStart"
        @touchmove.stop.prevent="touchMove"
        @touchend="touchEnd"
        @click.stop.prevent="toggle"
    >
      <img
          :class="{ calendar_arrow_down: isShowWeek }"
          src="./img/arrow-up.svg"
      />
    </div>
  </div>
</template>

<script>
import {formatDate, lunar} from "./utils";
import constant from "./constant";

export default {
  name: "Calendar",
  props: {
    // ?????????????????? className
    firstDayOfMonthClassName: {
      type: String,
      default: ""
    },
    // ??????????????? className
    todayClassName: {
      type: String,
      default: ""
    },
    // ????????????????????? className
    checkedDayClassName: {
      type: String,
      default: ""
    },
    // ????????????????????????????????? className(???????????????????????????????????????????????????)
    notCurrentMonthDayClassName: {
      type: String,
      default: ""
    },
    // ????????????????????? className
    disabledClassName: {
      type: String,
      default: ""
    },
    // ??????????????????????????????????????????
    scrollChangeDate: {
      type: Boolean,
      default: true
    },
    // ???????????????
    disabledWeekView: {
      type: Boolean,
      default: false
    },
    defaultDate: {
      type: Date,
      default() {
        return new Date();
      }
    },
    show: {
      type: Boolean,
      default: false
    },
    weekStart: {
      type: String,
      default: "Sunday"
    },
    // ?????????????????????
    markDate: {
      type: Array,
      default: () => []
    },
    // ??????????????????
    markType: {
      type: String,
      default: "dot"
    },
    // ???????????????
    disabledDate: {
      type: Function,
      default: () => {
        return false;
      }
    }
  },
  computed: {
    constant() {
      return constant;
    },
    lunar() {
      return lunar;
    }
  },
  data() {
    return {
      signData: [
        {year: 2022, month: 0, day: 0, ex: false},
        {year: 2022, month: 0, day: 1, ex: false},
        {year: 2022, month: 0, day: 2, ex: false},
        {year: 2022, month: 0, day: 3, ex: false},
        {year: 2022, month: 0, day: 4, ex: false},
        {year: 2022, month: 0, day: 5, ex: false},
        {year: 2022, month: 0, day: 6, ex: false},
        {year: 2022, month: 0, day: 7, ex: false},
        {year: 2022, month: 0, day: 8, ex: false},
        {year: 2022, month: 0, day: 9, ex: false},
        {year: 2022, month: 0, day: 10, ex: false},
        {year: 2022, month: 0, day: 11, ex: true},
        {year: 2022, month: 0, day: 12, ex: true},
        {year: 2022, month: 0, day: 13, ex: true},
        {year: 2022, month: 0, day: 14, ex: true},
        {year: 2022, month: 0, day: 15, ex: true},
        {year: 2022, month: 0, day: 16, ex: true},
        {year: 2022, month: 0, day: 17, ex: true},
        {year: 2022, month: 0, day: 18, ex: true},
        {year: 2022, month: 0, day: 19, ex: true},
        {year: 2022, month: 0, day: 20, ex: true},
        {year: 2022, month: 0, day: 21, ex: true},
        {year: 2022, month: 0, day: 22, ex: true},
        {year: 2022, month: 0, day: 23, ex: true},
        {year: 2022, month: 0, day: 24, ex: true},
        {year: 2022, month: 0, day: 25, ex: true},
        {year: 2022, month: 0, day: 26, ex: true},
        {year: 2022, month: 0, day: 27, ex: true},
        {year: 2022, month: 0, day: 28, ex: true},
        {year: 2022, month: 0, day: 29, ex: true},
        {year: 2022, month: 0, day: 30, ex: true},
        {year: 2022, month: 0, day: 31, ex: true}
      ],
      currentChangeIsScroll: false, // ????????????????????????????????????????????????
      yearOfCurrentShow: new Date().getFullYear(), // ???????????????????????????
      monthOfCurrentShow: new Date().getMonth(), // ???????????????????????????
      yearOfToday: new Date().getFullYear(), // ?????????????????????
      monthOfToday: new Date().getMonth(), // ?????????????????????
      dayOfToday: new Date().getDate(), // ?????????????????????
      weekArray: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ], // ????????????
      calendarWeek: ["???", "???", "???", "???", "???", "???", "???"], // ?????????????????????
      calendarOfMonth: [], // ????????????????????????
      calendarOfMonthShow: [], // ????????????????????????
      calendarDaysTotalLength: 42, // ???????????????????????????  6???7???
      lastMonthYear: null, // ??????????????????
      lastMonth: null, // ??????????????????
      nextMonthYear: null, // ??????????????????
      nextMonth: null, // ??????????????????
      checkedDate: {}, // ??????????????????
      weekStartIndex: 0, // ??????????????????????????????index
      translateIndex: 0, // ?????????????????????????????????
      transitionDuration: 0.2, // ??????????????????
      touch: {
        x: 0,
        y: 0
      }, // ??????touch???????????????????????????????????????
      deltaY: 0, //touchY ?????????
      isTouching: false, // ??????????????????
      calendarGroupHeight: 0,
      calendarWeekTitleHeight: 0,
      calendarItemHeight: 0,
      calendarArrowHeight: 0,
      calendarBodyHeight: 0,
      maxBodyHeight: 0,
      minBodyHeight: 0,
      touchStartPositionX: null, // ????????????x?????????
      touchStartPositionY: null, // ???????????????y?????????
      isShowWeek: false, // ???????????????????????????????????????
      calendarY: 0, // ???????????????Y????????????
      selectedDayIndex: 0, // ????????????????????????????????????????????????
      lastWeek: [], // ??????????????????
      nextWeek: [], // ??????????????????
      isLastWeekInCurrentMonth: false, // ?????????????????????????????????
      isNextWeekInCurrentMonth: false, // ?????????????????????????????????
      markDateColorObj: [], // ??????????????????????????????????????????
      weekPreviewShow: false, // ?????????????????????????????????
      threeWeek: ["", "", ""], // ???????????????????????????
      currentWeek: [] //?????????
    };
  },
  mounted() {
    this.yearOfCurrentShow = new Date().getFullYear(); // ???????????????????????????
    this.monthOfCurrentShow = new Date().getMonth(); // ???????????????????????????

    console.log("???????????????????????????", this.yearOfCurrentShow)
    console.log("???????????????????????????", this.monthOfCurrentShow)

    // console.log("calendarOfMonthShow", this.calendarOfMonthShow)
    this.calendarWeek = constant.WEEK;
    this.weekStartIndex = this.weekArray.indexOf(this.weekStart.toLowerCase());
    this.calendarWeek = [
      ...this.calendarWeek.slice(this.weekStartIndex, this.calendarWeek.length),
      ...this.calendarWeek.slice(0, this.weekStartIndex)
    ];
  },
  watch: {
    // markDate: {
    //   handler(val) {
    //     val.forEach((item, index) => {
    //       if (item.color === undefined) {
    //         let obj = {};
    //         obj.color = "#1c71fb";
    //         if (typeof item === "string" || typeof item === "number") {
    //           item = [item];
    //         }
    //         obj.date = item || [];
    //         val[index] = obj;
    //       }

    //       /* val[index].forEach(dateObj => {
    //         this.$set(this.markDateColorObj, this.formatDate(dateObj.date), dateObj.color)
    //       }) ????????? */

    //       val[index].date = this.dateFormat(val[index].date);
    //     });
    //     this.markDateColorObj = [];
    //     val.forEach(item => {
    //       item.date.forEach(date => {
    //         this.$set(this.markDateColorObj, date, item.color);
    //       });
    //     });
    //   },
    //   deep: true,
    //   immediate: true
    // },
    weekStartIndex() {
      this.calculateCalendarOfThreeMonth(
          this.checkedDate.year,
          this.checkedDate.month
      );
    },
    defaultDate: {
      handler(val) {
        if (!(val instanceof Date)) {
          throw new Error(
              "The calendar component's defaultDate must be date type!"
          );
        }

        this.$set(this.checkedDate, "day", val.getDate());
        this.calculateCalendarOfThreeMonth(val.getFullYear(), val.getMonth());
      },
      immediate: true
    },
    checkedDate: {
      handler(val) {
        this.$emit("change", val);
        this.setCurrentWeek(val);
      },
      deep: true,
      immediate: true
    },
    show: {
      handler(val) {
        if (val) {
          this.calculateCalendarOfThreeMonth(
              this.checkedDate.year,
              this.checkedDate.month
          );
          this.initDom();
        }
      },
      immediate: true
    },
    calendarGroupHeight(val) {
      this.$emit("height", val + this.calendarWeekTitleHeight);
    }
  },
  methods: {
    // ???????????????dom
    initDom() {
      this.$nextTick(() => {
        this.calendarItemHeight =
            this.$refs.calendarItem && this.$refs.calendarItem[0].offsetHeight;
        this.calendarWeekTitleHeight = this.$refs.weekTitle.offsetHeight;
        this.calendarArrowHeight = this.$refs.arrow.offsetHeight;
        let calendarItemGroup = this.$refs.calendarItem;
        calendarItemGroup.forEach(item => {
          item.style.height = `${this.calendarItemHeight}px`;
        });
        this.calendarGroupHeight = this.calendarItemHeight * 6;
        this.maxBodyHeight =
            this.calendarGroupHeight +
            this.calendarWeekTitleHeight +
            this.calendarArrowHeight;
        this.minBodyHeight =
            this.calendarItemHeight +
            this.calendarWeekTitleHeight +
            this.calendarArrowHeight;
        this.calendarBodyHeight = this.maxBodyHeight;
        this.setCurrentWeek();
        this.showMonth();
      });
    },
    // ??????
    today() {
      this.$set(this.checkedDate, "day", new Date().getDate());

      this.yearOfCurrentShow = new Date().getFullYear(); // ???????????????????????????
      this.monthOfCurrentShow = new Date().getMonth(); // ???????????????????????????

      console.log("???????????????????????????", this.yearOfCurrentShow)
      console.log("???????????????????????????", this.monthOfCurrentShow)

      this.calculateCalendarOfThreeMonth();

      if (this.isShowWeek) {
        setTimeout(() => {
          this.isTouching = true;
          this.showWeek();
        }, this.transitionDuration * 1000);
      }
    },
    // ????????????
    getLunar(date) {
      const {year, month, day} = date;
      const {festival, lunarFestival, Term, IDayCn} = lunar.solar2lunar(
          year,
          month + 1,
          day
      );
      return festival || lunarFestival || Term || IDayCn;
    },
    getThreeWeek() {
      function renderWeek(week) {
        return week.length > 0
            ? `${week[0].month + 1}???${week[0].day}??? - ${week[6].month + 1}???${
                week[6].day
            }???`
            : "";
      }

      this.threeWeek = [
        renderWeek(this.lastWeek),
        renderWeek(this.currentWeek),
        renderWeek(this.nextWeek)
      ];
    },
    // ??????????????????????????????
    isFirstDayOfMonth(date, i) {
      return date.day === 1 && !this.isNotCurrentMonthDay(date, i);
    },
    // ??????????????????????????????????????????????????? flag  -1:???????????????????????????   0:??????????????????????????????????????????  1:???????????????????????????
    calculateCalendarOfThreeMonth(
        year = new Date().getFullYear(),
        month = new Date().getMonth()
    ) {
      this.lastMonthYear = month === 0 ? year - 1 : year; // ??????????????????
      this.lastMonth = month === 0 ? 11 : month - 1; // ??????????????????
      this.nextMonthYear = month === 11 ? year + 1 : year; // ??????????????????
      this.nextMonth = month === 11 ? 0 : month + 1; // ??????????????????

      let firstMonth = this.calculateCalendarOfMonth(
          this.lastMonthYear,
          this.lastMonth
      );
      let secondMonth = this.calculateCalendarOfMonth(year, month);
      let thirdMonth = this.calculateCalendarOfMonth(
          this.nextMonthYear,
          this.nextMonth
      );

      this.calendarOfMonth = [];
      this.calendarOfMonth.push(firstMonth, secondMonth, thirdMonth);
      this.calendarOfMonthShow = JSON.parse(
          JSON.stringify(this.calendarOfMonth)
      );

      if (!this.scrollChangeDate && this.currentChangeIsScroll) {
        this.currentChangeIsScroll = false;
        return;
      }

      // ???????????????????????????
      let tempDate = {};
      let day = this.checkedDate.day;
      if (day > 30 || (day > 28 && month === 1)) {
        day = this.daysOfMonth(year)[month];
      }
      tempDate = {day: day, year: year, month: month};

      if (this.formatDisabledDate(tempDate)) return;

      this.$set(this.checkedDate, "day", tempDate.day);
      this.$set(this.checkedDate, "year", year);
      this.$set(this.checkedDate, "month", month);
    },
    // ????????????????????????
    calculateCalendarOfMonth(
        year = new Date().getFullYear(),
        month = new Date().getMonth()
    ) {
      let calendarOfCurrentMonth = [];

      let lastMonthYear = month === 0 ? year - 1 : year; // ??????????????????
      let lastMonth = month === 0 ? 11 : month - 1; // ??????????????????
      let nextMonthYear = month === 11 ? year + 1 : year; // ??????????????????
      let nextMonth = month === 11 ? 0 : month + 1; // ??????????????????

      // ?????????????????????????????????????????????????????????????????????????????????????????????
      let dayOfWeek = this.getDayOfWeek(year, month);
      let lastMonthDays = this.daysOfMonth(year)[lastMonth]; // ?????????????????????
      if (dayOfWeek < this.weekStartIndex) {
        dayOfWeek = 7 - this.weekStartIndex + dayOfWeek;
      } else {
        dayOfWeek -= this.weekStartIndex;
      }
      for (let i = 0; i < dayOfWeek; i++) {
        calendarOfCurrentMonth.push({
          year: lastMonthYear,
          month: lastMonth,
          day: lastMonthDays - (dayOfWeek - 1 - i)
        });
      }

      // ????????????
      for (let i = 0; i < this.daysOfMonth(year)[month]; i++) {
        calendarOfCurrentMonth.push({
          year: year,
          month: month,
          day: i + 1
        });
      }

      // ????????????????????????????????????????????????6???7???
      let fillDays =
          this.calendarDaysTotalLength - calendarOfCurrentMonth.length;
      for (let i = 0; i < fillDays; i++) {
        calendarOfCurrentMonth.push({
          year: nextMonthYear,
          month: nextMonth,
          day: i + 1
        });
      }

      return calendarOfCurrentMonth;
    },
    daysOfMonth(year) {
      return [
        31,
        28 + this.isLeap(year),
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
      ];
    },
    // ?????????????????????
    isLeap(year) {
      return year % 4 === 0
          ? year % 100 !== 0
              ? 1
              : year % 400 === 0
                  ? 1
                  : 0
          : 0;
    },
    // ?????????????????????????????????
    getDayOfWeek(
        year = new Date().getFullYear(),
        month = new Date().getMonth(),
        day = 1
    ) {
      let dayOfMonth = new Date(year, month, day); // ??????????????????day???
      let dayOfWeek = dayOfMonth.getDay(); // ?????????day???????????????(??????[0-6]???????????????0??????????????????1???????????????)
      return dayOfWeek;
    },
    // ????????????????????????
    clickCalendarDay(date) {
      if (!date) return;

      if (this.formatDisabledDate(date)) return;

      this.$set(this.checkedDate, "year", date.year);
      this.$set(this.checkedDate, "month", date.month);
      this.$set(this.checkedDate, "day", date.day);

      if (date.month === this.lastMonth && date.year === this.lastMonthYear) {
        this.getLastMonth();
      }
      if (date.month === this.nextMonth && date.year === this.nextMonthYear) {
        this.getNextMonth();
      }

      if (this.isShowWeek) {
        this.showWeek();
      }

      this.$emit("click", this.checkedDate);
    },
    // ???????????????
    setCurrentWeek(checkedDate = this.checkedDate) {
      let daysArr = [];
      this.calendarOfMonth[1].forEach(item => {
        daysArr.push(item.day);
      });
      let dayIndexOfMonth = daysArr.indexOf(checkedDate.day);
      // ???day????????????????????????????????????daysArr???????????????????????????????????????????????????????????????lastIndexOf
      if (checkedDate.day > 15) {
        dayIndexOfMonth = daysArr.lastIndexOf(checkedDate.day);
      }

      // ??????????????????????????????
      let indexOfLine = Math.ceil((dayIndexOfMonth + 1) / 7);
      let lastLine = indexOfLine - 1;
      this.calendarY = -(this.calendarItemHeight * lastLine);
      let sliceStart = lastLine * 7;
      let sliceEnd = sliceStart + 7;
      this.currentWeek = this.calendarOfMonth[1].slice(sliceStart, sliceEnd);
    },
    // ????????????????????????
    isToday(date) {
      return (
          this.yearOfToday === date.year &&
          this.monthOfToday === date.month &&
          this.dayOfToday === date.day
      );
    },
    isSelect(date){   
      return this.markDate.lastIndexOf(date.year+'/'+(date.month+1)+'/'+date.day)>-1;
    },
    // ?????????????????????????????????
    isCheckedDay(date) {
      if (this.formatDisabledDate(date)) return false;

      return (
          this.checkedDate.year === date.year &&
          this.checkedDate.month === date.month &&
          this.checkedDate.day === date.day
      );
    },
    // ???????????????
    isNotCurrentMonthDay(date, index) {
      let dateOfCurrentShow = this.calendarOfMonth[index][15]; // ????????????????????????????????????
      return (
          date.year !== dateOfCurrentShow.year ||
          date.month !== dateOfCurrentShow.month
      );
    },
    // ??????????????????????????????
    touchStart(event) {
      this.$emit("touchstart", event);
      this.touchStartPositionX = event.touches[0].clientX;
      this.touchStartPositionY = event.touches[0].clientY;
      this.touch = {
        x: 0,
        y: this.isShowWeek ? this.calendarY : 0
      };
      this.deltaY = 0;
      this.isTouching = true;
    },
    // ????????????????????????
    touchMove(event) {
      this.$emit("touchmove", event);
      let moveX = event.touches[0].clientX - this.touchStartPositionX;
      let moveY = event.touches[0].clientY - this.touchStartPositionY;
      // ??????????????????
      if (typeof this.isTouching !== "string") {
        if (Math.abs(moveX) > Math.abs(moveY)) {
          this.isTouching = "x";
          if (this.isShowWeek) {
            this.getThreeWeek();
            this.weekPreviewShow = true;
          }
        } else {
          // ???????????????????????????????????????
          if (this.disabledWeekView) return;
          this.isTouching = "y";
        }
      } else {
        if (this.isTouching === "x") {
          this.touch = {
            x: moveX / this.$refs.calendar.offsetWidth,
            y: 0
          };
        } else {
          let calendarBodyHeight =
              (this.isShowWeek ? this.minBodyHeight : this.maxBodyHeight) + moveY;
          if (calendarBodyHeight > this.maxBodyHeight) {
            calendarBodyHeight = this.maxBodyHeight;
          }
          if (calendarBodyHeight < this.minBodyHeight) {
            calendarBodyHeight = this.minBodyHeight;
          }
          this.calendarBodyHeight = calendarBodyHeight;
          this.calendarGroupHeight = this.calendarItemHeight * 6;
          let y = moveY;
          if (this.isShowWeek) {
            let leftLine = 5 + this.calendarY / this.calendarItemHeight;
            y =
                y > leftLine * this.calendarItemHeight
                    ? this.calendarY + y - leftLine * this.calendarItemHeight
                    : this.calendarY;
          } else {
            y = y < 0 ? y : 0;
          }
          this.touch = {
            x: 0,
            y
          };
          this.deltaY = moveY;
        }
      }
    },
    // ??????touch????????????
    touchEnd(e) {
      this.$emit("touchend", e);
      this.isTouching = false;
      if (this.isShowWeek) {
        setTimeout(() => {
          this.weekPreviewShow = false;
        }, 800);
      }
      if (
          Math.abs(this.touch.x / this.$refs.calendar.offsetWidth) >
          Math.abs(this.touch.y) &&
          Math.abs(this.touch.x) > 0.2
      ) {
        this.currentChangeIsScroll = true;
        if (this.touch.x > 0) {
          this.$emit("slidechange", "right");

          this.getLastMonth();
          if (this.isShowWeek) {
            setTimeout(() => {
              this.isTouching = true;
              this.currentChangeIsScroll = true;
              this.getLastWeek();
            }, this.transitionDuration * 1000);
          }
        } else if (this.touch.x < 0) {
          this.$emit("slidechange", "left");

          this.getNextMonth();
          if (this.isShowWeek) {
            setTimeout(() => {
              this.isTouching = true;
              this.currentChangeIsScroll = true;
              this.getNextWeek();
            }, this.transitionDuration * 1000);
          }
        }
      }

      if (
          Math.abs(this.deltaY) >
          Math.abs(this.touch.x / this.$refs.calendar.offsetWidth) &&
          Math.abs(this.deltaY) > 20
      ) {
        if (this.deltaY > 0 && this.isShowWeek) {
          this.showMonth();
        } else if (this.deltaY < 0 && !this.isShowWeek) {
          this.showWeek();
        }
      } else {
        this.touch = {
          x: 0,
          y: 0
        };
      }
    },
    // ???????????????????????????
    showMonth() {
      this.$emit("slidechange", "down");
      this.calendarBodyHeight = this.maxBodyHeight;
      this.calendarGroupHeight = this.calendarItemHeight * 6;
      this.isShowWeek = false;
      this.isLastWeekInCurrentMonth = false;
      this.isNextWeekInCurrentMonth = false;

      this.calculateCalendarOfThreeMonth(
          this.checkedDate.year,
          this.checkedDate.month
      );
    },
    // ???????????????????????????
    showWeek(checkedDate = this.checkedDate) {
      this.$emit("slidechange", "up");
      this.calendarBodyHeight = this.minBodyHeight;
      let daysArr = [];
      this.calendarOfMonth[1].forEach(item => {
        daysArr.push(item.day);
      });
      let dayIndexOfMonth = daysArr.indexOf(checkedDate.day);
      // ???day????????????????????????????????????daysArr???????????????????????????????????????????????????????????????lastIndexOf
      if (checkedDate.day > 15) {
        dayIndexOfMonth = daysArr.lastIndexOf(checkedDate.day);
      }

      // ??????????????????????????????
      let indexOfLine = Math.ceil((dayIndexOfMonth + 1) / 7);
      let lastLine = indexOfLine - 1;
      this.calendarY = -(this.calendarItemHeight * lastLine);

      this.isShowWeek = true;
      this.calendarGroupHeight = this.calendarItemHeight;

      let currentWeek = [];
      let sliceStart = lastLine * 7;
      let sliceEnd = sliceStart + 7;
      this.isLastWeekInCurrentMonth = false;
      currentWeek = this.calendarOfMonth[1].slice(sliceStart, sliceEnd);
      for (let i in currentWeek) {
        if (currentWeek[i].day === checkedDate.day) {
          this.selectedDayIndex = i;
        }
      }

      let firstDayOfCurrentWeek = currentWeek[0];
      let lastDayOfCurrentWeek = currentWeek[6];
      if (
          lastDayOfCurrentWeek.day < firstDayOfCurrentWeek.day &&
          lastDayOfCurrentWeek.month === checkedDate.month
      ) {
        this.lastWeek = this.calendarOfMonth[0].slice(21, 28);
      } else {
        if (firstDayOfCurrentWeek.day === 1) {
          this.lastWeek = this.calendarOfMonth[0].slice(28, 35);
        } else {
          this.lastWeek = this.calendarOfMonth[1].slice(
              sliceStart - 7,
              sliceEnd - 7
          );
          if (
              this.lastWeek[this.selectedDayIndex].month === checkedDate.month
          ) {
            this.isLastWeekInCurrentMonth = true;
          }
        }
      }

      this.isNextWeekInCurrentMonth = false;
      if (
          lastDayOfCurrentWeek.day < firstDayOfCurrentWeek.day &&
          lastDayOfCurrentWeek.month !== checkedDate.month
      ) {
        this.nextWeek = this.calendarOfMonth[2].slice(7, 14);
      } else {
        if (
            lastDayOfCurrentWeek.day ===
            this.daysOfMonth(lastDayOfCurrentWeek.year)[
                lastDayOfCurrentWeek.month
                ]
        ) {
          this.nextWeek = this.calendarOfMonth[2].slice(0, 7);
        } else {
          this.nextWeek = this.calendarOfMonth[1].slice(
              sliceStart + 7,
              sliceEnd + 7
          );
          if (
              this.nextWeek[this.selectedDayIndex].month === checkedDate.month
          ) {
            this.isNextWeekInCurrentMonth = true;
          }
        }
      }
      this.calendarOfMonthShow[0].splice(sliceStart, 7, ...this.lastWeek);
      this.calendarOfMonthShow[2].splice(sliceStart, 7, ...this.nextWeek);
    },
    toggle() {
      if (this.isShowWeek) {
        this.showMonth();
      } else {
        this.showWeek();
      }
    },
    // ???????????????
    getLastWeek() {
      let checkedDate = this.lastWeek[this.selectedDayIndex];
      this.showWeek(checkedDate);

      if (this.formatDisabledDate(checkedDate)) return;

      if (!this.scrollChangeDate && this.currentChangeIsScroll) {
        this.currentChangeIsScroll = false;
        return;
      }

      this.checkedDate = checkedDate;
    },
    // ???????????????
    getNextWeek() {
      let checkedDate = this.nextWeek[this.selectedDayIndex];
      this.showWeek(checkedDate);

      if (this.formatDisabledDate(checkedDate)) return;

      if (!this.scrollChangeDate && this.currentChangeIsScroll) {
        this.currentChangeIsScroll = false;
        return;
      }

      this.checkedDate = checkedDate;
    },
    // ?????????????????????
    getLastMonth() {
      this.translateIndex += 1;

      if (!this.isLastWeekInCurrentMonth) {
        this.yearOfCurrentShow = this.lastMonthYear;
        this.monthOfCurrentShow = this.lastMonth;
      }
      this.calculateCalendarOfThreeMonth(
          this.yearOfCurrentShow,
          this.monthOfCurrentShow
      );
    },
    // ?????????????????????
    getNextMonth() {
      this.translateIndex -= 1;

      if (!this.isNextWeekInCurrentMonth) {
        this.yearOfCurrentShow = this.nextMonthYear;
        this.monthOfCurrentShow = this.nextMonth;
      }
      this.calculateCalendarOfThreeMonth(
          this.yearOfCurrentShow,
          this.monthOfCurrentShow
      );
    },
    // ??????????????????????????????
    markDateColor(date, type) {
      if (this.markType.indexOf(type) === -1) return;

      let dateString = `${date.year}/${this.fillNumber(
          date.month + 1
      )}/${this.fillNumber(date.day)}`;
      return this.markDateColorObj[dateString];
    },
    formatDisabledDate(date) {
      let fDate = new Date(`${date.year}/${date.month + 1}/${date.day}`);

      return this.disabledDate(fDate);
    },
    // ??????10???????????????0
    fillNumber(val) {
      return val > 9 ? val : "0" + val;
    },
    // ??????????????????
    dateFormat(dateArr) {
      dateArr.forEach((date, index) => {
        dateArr[index] = formatDate(date, "YY/MM/DD");
      });

      return dateArr;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./calendar.scss";

.smallDot {
  background-color: #f99341;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-left: -5px;
}

.smallDot1 {
  background-color: #1989fa;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-left: -5px;
}
</style>
