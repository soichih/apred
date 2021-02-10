<template>
<el-select 
    class="region-selecter"
    v-model="myid" 
    filterable 
    clearable 
    remote
    :remote-method="searchRegion"
    :loading="loading"
    :placeholder="placeholder"
    @change="change" style="width: 100%;" size="large">
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        <span style="float: left">{{ item.label }}</span> <small style="margin-left: 10px;">({{item.fips.length}} counties)</small>
        <!--
        <small v-for="fip in item.fips" :key="fip">{{ fip }}</small>
        -->
    </el-option>
</el-select>
</template>

<script>
export default {
    props: {
        id: String,
        placeholder: {type: String, default: "Search EDD Region"},
    },
    data() {
        return {
            regionList: null,
            options: [],
            myid: null, //selected 
            loading: false,
        }
    },

    watch: {
        id(v) {
            this.myid = v; 
        }
    },

    mounted() {
        fetch(this.$root.dataUrl+"/regionlist.json").then(res=>{ 
            return res.json()
        }).then(data=>{
            this.regionList = data;
            this.myid = this.id;
        });
    },

    methods: {
        searchRegion(q) {
            this.options = [];
            if(q.length < 3) {
                return;
            }

            this.loading = true;
            const lq = q.toLowerCase();
            this.options = [];
            for(const eid in this.regionList) {
                const r = this.regionList[eid];
                if(r.name.toLowerCase().includes(lq)) this.options.push({
                    value: eid,
                    label: r.name,
                    fips: r.fips,
                })
            }
            this.loading = false;
        },

        change() {
            if(!this.myid) {
                this.$emit('select', {id: null, fips: []});
            } else {
                this.$emit('select', {id: this.myid, fips: this.regionList[this.myid].fips});
            }
        }
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
