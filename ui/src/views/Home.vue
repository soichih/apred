<template>
  <div class="page">
    <br>
    <router-link to="/disasters">Disaster Declarations</router-link>
    <br>
    <br>
    <router-link to="/covid19">COVID19</router-link>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'

export default {
    name: 'Home',
    components: {},

}
</script>

<style scoped>
.home {
  padding: 20px;
}
a {
  color: gray;
}
</style>
