<template>
<footer :class="{fixed: fixed}">
    <div :class="{page: !fixed}">
        <div v-if="!fixed">
            <p>
                This platform brings data science to decision-makers dealing with the economics of 
                disaster mitigation, analysis, and recovery activities. 
            </p>
            <p>
                <i>This publication was prepared by the CTIL and IBRC at Indiana University using federal funds awarded to the Trustees of Indiana University and as a sub-component under award number ED17HDQ3120040 from the U.S. Economic Development Administration, U.S. Department of Commerce. The statements, findings, conclusions, and recommendations are those of the author(s) and do not necessarily reflect the views of the Economic Development Administration or the U.S. Department of Commerce.</i>
            </p>
        </div>
        <div style="float: right;">
            <a href="mailto:ctil@iu.edu">ctil@iu.edu</a> | <a href="mailto:ctil@iu.edu">Contact Us</a>
        </div>
        <h3><a href="https://ctil.iu.edu/">CTIL</a> <small class="titleDetail">Crisis Technologies Innovation Lab</small></h3>
        <br>
        <br>
    </div>
</footer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {
    @Prop({default: false, type: Boolean}) fixed;
}
</script>

<style scoped lang="scss">
footer {
    background-color: #333; 
    color: #999; 
    padding-top: 20px;
    box-shadow: inset 0 2px 3px #0003;
}
footer.fixed {
    position: fixed;
    bottom: 0;
    height: 50px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
h3 {
    margin: 15px 0;
}
p {
line-height: 200%;
}
@media only screen and (max-width: 600px) {
    .titleDetail {
        display: none;
    }
}
</style>
