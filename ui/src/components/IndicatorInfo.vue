<template>
<div>
    <!--top level indicator description-->
    <p v-if="id == 'SOC'">
        Social resilience deals with attributes of the individual members of communities.
    </p>

    <p v-else-if="id == 'ECON'">
        Economic resilience deals with the financial and economic factors that contribute to the resilience of communities. 
    </p>

    <p v-else-if="id == 'INST'">
        TODO - describe this index
    </p>

    <p v-else-if="id == 'IHFR'">
        Infrastructure resilience deals with physical structures (housing, shelter, medical capacity, etc.) that exist within communities.
    </p>

    <p v-else-if="id == 'COMM'">
        Community Capital deals with the relationships between the individual and the community as a whole. 
    </p>

    <p v-else-if="id == 'FLOR'">
        TODO - describe this index
    </p>
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
p {
    margin: 0px;
}
</style>
