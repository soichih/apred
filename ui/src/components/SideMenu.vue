<template>
    <el-menu 
      :default-active="active" :default-openeds="['primary']"
      class="sidemenu" 
      @open="handleOpen" @close="handleClose" @select="select">

      <el-submenu index="primary">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span slot="title">Contents</span>
        </template>

        <router-link to="/"><el-menu-item index="home"> Home</el-menu-item></router-link>
        <router-link to="/disasters"><el-menu-item index="disasters"> Disasters</el-menu-item></router-link>

        <el-menu-item-group title="Experiment">
          <router-link to="/county"><el-menu-item index="county">Counties</el-menu-item></router-link>
          <router-link to="/states"><el-menu-item index="states">States</el-menu-item></router-link>
        </el-menu-item-group>
        <el-menu-item-group>
          <span slot="title">APRED</span>
          <router-link to="/about"><el-menu-item index="about">About</el-menu-item></router-link>
          <router-link to="/playground"><el-menu-item index="playground">Playground</el-menu-item></router-link>
        </el-menu-item-group>
        <el-submenu index="sub-primary">
          <span slot="title">Sub Menu</span>
          <el-menu-item index="4-1">item one</el-menu-item>
        </el-submenu>
      </el-submenu>

      <el-menu-item index="secondary">
        <i class="el-icon-menu"></i>
        <span slot="title">Sitemap</span>
      </el-menu-item>

      <el-menu-item index="coming" disabled>
        <i class="el-icon-document"></i>
        <span slot="title">Export</span>
      </el-menu-item>

      <el-menu-item index="settings">
        <i class="el-icon-setting"></i>
        <span slot="title">Settings</span>
      </el-menu-item>

    </el-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class SideMenu extends Vue {
  //@Prop() private msg!: string;
  //@Prop() isCollapsed = false;
  @Prop(String) active  = '';

  handleOpen(key: string, keyPath: string[]) {
    //console.log(key, keyPath);
  }

  handleClose(key: string, keyPath: string[]) {
    //console.log(key, keyPath);
  }
  select(key: string, keyPath: string[]) {
    //console.log(key, keyPath);
  }
}
</script>

<style scoped lang="scss">
.sidemenu {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 50px;
  bottom: 0;
  box-shadow: 0 0 5px #0003;
  border: none;
}
.sidemenu:not(.el-menu--collapse) {
  width: 210px;
}
.el-menu-item {
  border-left: 3px solid #0000;
}
.el-menu-item.is-active {
    border-left: 3px solid #409EFF;
    box-shadow: inset 0 1px 2px #0002;
    background-color: #ecf5ff;
}
</style>
