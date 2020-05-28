<template>
<footer>
    <div class="page">
        <p>
            This platform brings data science to decision-makers dealing with the economics of 
            disaster mitigation, analysis, and recovery activities.
        </p>
        <h3>CTIL Crisis Technologies Innovation Lab</h3>
        <a href="mailto:ctil@iu.edu">ctil@iu.edu</a> | <a href="mailto:ctil@iu.edu">Contact Us</a>
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
