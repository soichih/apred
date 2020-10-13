<template>
<el-select 
    v-model="myfips" 
    filterable 
    clearable 
    remote
    :remote-method="searchCounty"
    :loading="loading"
    placeholder="Search county to show detail" 
    @change="change" style="width: 100%;" size="large">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
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
            options: [],
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
        searchCounty(q) {
            this.options = [];
            if(q.length < 3) {
                return;
            }

            this.loading = true;
            const lq = q.toLowerCase();
            this.options = this.countyList.filter(o=>{
                if(o.label.toLowerCase().includes(lq)) return true;
                if(o.value.toString().includes(lq)) return true;
                return false;
            });
            //if(this.options.length > 30) this.options = this.options.slice(0, 30);
            this.loading = false;
        },

        change() {
            this.$emit('select', this.myfips);
            this.myfips = null;
        }
    }
}
</script>

<style scoped>
.county-selecter {
padding: 20px;
}
</style>
