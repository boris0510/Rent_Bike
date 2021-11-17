<template>
  <Banner />
  <MapLane />
</template>

<script>
import Banner from '../components/Navbar.vue';
import MapLane from '../components/MapLane.vue';

export default {
  name: 'Lane',
  components: {
    Banner,
    MapLane,
  },
};
</script>
