<template>
  <el-select
    v-model="county"
    filterable
    remote
    reserve-keyword
    placeholder="Search County"
    :remote-method="remoteMethod"
    :loading="loading"
    @change="change">
    <el-option-group v-for="group in Object.values(optionGroups)" :key="group.label" :label="group.label">
        <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"/>
    </el-option-group>
  </el-select>
</template>

<script>
/*
export default class CountySelecter extends Vue {
  options: 
}
*/

  export default {
    data() {
      return {
        optionGroups: {},
        county: null,
        loading: false,
      }
    },
    mounted() {
      /*
      this.list = this.states.map(item => {
        return { value: `value:${item}`, label: `label:${item}` };
      });
      */
    },
    methods: {

      remoteMethod(query) {
        if (query !== '') {
          this.loading = true;
          //console.log("searching", query);
          this.axios.get("https://dev1.soichi.us/api/apred/search_fips?q="+query).then(res=>{
            this.loading = false;
            this.optionGroups = {};
            res.data.forEach(rec=>{
                if(!this.optionGroups[rec.state]) this.optionGroups[rec.state] = {label: rec.state, options: []};
                this.optionGroups[rec.state].options.push({ value: rec.statefips+"."+rec.countyfips, label: rec.county });
            });
            /*
            this.options = this.list.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
            */
          });
        } else {
          this.optionGroups = {};
        }
      },

      change(v) {
        this.$emit("input", v);
      }
    }
  }
</script>
