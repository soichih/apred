<template>
  <div class="page">
    <br>
    <router-link to="/disasters">Disaster Declarations</router-link>
    <br>
    <br>
    <router-link to="/covid19">COVID19</router-link>
    <br>
    <br>
    <a href="https://dev1.soichi.us/bvi/">BVI</a>
  </div>
</template>

<script>

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
