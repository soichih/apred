<template>
<footer>
    <div class="page">
        <p>
            This platform brings data science to decision-makers dealing with the economics of 
            disaster mitigation, analysis, and recovery activities. 
        </p>
        <p>
            <i>This publication was prepared by the CTIL and IBRC at Indiana University using Federal funds awarded to the Trustees of Indiana University and as a sub-component under award number ED17HDQ3120040 from the U.S. Economic Development Administration, U.S. Department of Commerce. The statements, findings, conclusions, and recommendations are those of the author(s) and do not necessarily reflect the views of the Economic Development Administration or the U.S. Department of Commerce.</i>
        </p>
        <div style="float: right">
            <a href="mailto:ctil@iu.edu">ctil@iu.edu</a> | <a href="mailto:ctil@iu.edu">Contact Us</a>
        </div>
        <h3><a href="https://ctil.iu.edu/">CTIL</a> <small>Crisis Technologies Innovation Lab</small></h3>
    </div>
    <br>
    <br>
</footer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {
}
</script>

<style scoped lang="scss">
footer {
background-color: #333; 
color: #999; 
padding: 30px 0;
}
p {
line-height: 200%;
}
</style>
