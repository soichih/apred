<template>
<el-select v-model="myfips" filterable clearable placeholder="Search county to show detail" @change="$emit('select', myfips)" style="width: 100%;" size="large">
    <el-option v-for="item in countyList" :key="item.value" :label="item.label" :value="item.value">
        <span style="float: left">{{ item.label }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
    </el-option>
</el-select>
</template>

<script>
export default {
    props: {
        fips: String,
    },
    data() {
        return {
            countyList: null,
            myfips: null,
            loading: false,
        }
    },

    watch: {
        fips(v) {
            this.myfips = v; 
        }
    },

    mounted() {
        fetch(this.$root.dataUrl+"/countylist.json").then(res=>{ 
            return res.json()
        }).then(data=>{
            this.countyList = data;
            this.myfips = this.fips;
        });
    },

    methods: {
    }
}
</script>

<style scoped>
.county-selecter {
padding: 20px;
}
</style>
