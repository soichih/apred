<template>
  <el-select v-model="county" filterable placeholder="Search County" @change="change">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        <span style="float: left">{{ item.label }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
    </el-option>
  </el-select>
</template>

<script>
export default {
    props: [ "options"],
    data() {
        return {
            county: null,
            loading: false,
        }
    },
    methods: {
        /*
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
              });
            } else {
              this.optionGroups = {};
            }
        },
        */

        change(v) {
            this.$emit("selected", v);
            this.county = null; //reset back to null
        }
    }
}
</script>
