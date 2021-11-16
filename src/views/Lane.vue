<template>
  <Banner/>
  <Map/>
</template>

<script>
import Banner from '../components/Navbar.vue';
import Map from '../components/Map.vue';

export default {
  name: 'Lane',
  components: {
    Banner,
    Map,
  },
};
</script>
