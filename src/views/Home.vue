<template>
  <Banner />
  <Map />
</template>

<script>
import Banner from '../components/Navbar.vue';
import Map from '../components/Map.vue';

export default {
  name: 'Home',
  components: {
    Banner,
    Map,
  },
};
</script>
