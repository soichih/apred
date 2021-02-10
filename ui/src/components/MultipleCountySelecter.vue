<template>
<div>
    <el-select v-if="countyList" class="county-selecter" v-model="myfips" 
        multiple
        filterable 
        clearable 
        remote
        :remote-method="searchCounty"
        :loading="loading"
        placeholder="Search county" 
        @change="change" style="width: 100%;" size="large">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            <span style="float: left">{{ item.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
        </el-option>
    </el-select>
</div>
</template>

<script>
export default {
    props: {
        value: Array,
    },
    data() {
        return {
            countyList: null,
            options: [],
            myfips: [],
            loading: false,
        }
    },

    watch: {
        value(v) {
            this.preselect(v);
        },
    },

    mounted() {
        fetch(this.$root.dataUrl+"/countylist.json").then(res=>{ 
            return res.json()
        }).then(data=>{
            this.countyList = data;
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

        preselect(fips) {

            //delay if countyList is not loaded yet
            if(!this.countyList) return setTimeout(()=>{
                this.preselect(fips);
            }, 1000)

            this.myfips = fips;
            this.options = this.countyList.filter(o=>this.myfips.includes(o.value));
        },

        change() {
            this.$emit('input', this.myfips);
        },
    }
}
</script>

<style>
.county-selecter .el-input__inner {
border: none;
border-radius: 0;
border-bottom: 1px solid #ddd;
background: white;
}
</style>
