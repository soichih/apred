<template>
<div>
    <a :href="'https://www.naics.com/naics-code-description/?code='+id" :target="'naics_'+id">
        <span v-if="id == '11'">Agriculture, Forestry, Fishing and Hunting</span>
        <span v-if="id == '21'">Mining</span>
        <span v-if="id == '22'">Utilities</span>
        <span v-if="id == '23'">Construction</span>
        <span v-if="id == '31-33'">Manufacturing</span>
        <span v-if="id == '42'">Wholesale Trade</span>
        <span v-if="id == '44-45'">Retail Trade</span>
        <span v-if="id == '48-49'">Transportation and Warehousing</span>
        <span v-if="id == '51'">Information</span>
        <span v-if="id == '52'">Finance and Insurance</span>
        <span v-if="id == '53'">Real Estate Rental and Leasing</span>
        <span v-if="id == '54'">Professional, Scientific, and Technical Services</span>
        <span v-if="id == '55'">Management of Companies and Enterprises</span>
        <span v-if="id == '56'">Administrative and Support and Waste Management and Remediation Services</span>
        <span v-if="id == '61'">Educational Services</span>
        <span v-if="id == '62'">Health Care and Social Assistance</span>
        <span v-if="id == '71'">Arts, Entertainment, and Recreation</span>
        <span v-if="id == '72'">Accommodation and Food Services</span>
        <span v-if="id == '81'">Other Services (except Public Administration) </span>
        <span v-if="id == '99'">Public Administration</span>
    </a>
</div>
</template>

<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class IndicatorInfo extends Vue {
    @Prop({default: null, type: String}) id;
}
</script>
<style scoped>
</style>
