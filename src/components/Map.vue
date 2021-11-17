<template>
  <div id="mapid" class="map"></div>
  <div class="card" :class="{ show: cardShow }">
    <div class="card-title">{{ tempBike.title }}</div>
    <div class="card-status">{{ tempBike.status }}</div>
    <div class="card-content">
      <p>
        可租借車數<br /><span>{{ tempBike.rentBikes }}</span>
      </p>
      <p>
        可歸還車數<br /><span>{{ tempBike.returnBikes }}</span>
      </p>
    </div>
    <div class="card-addr">地址 : {{ tempBike.addr }}</div>
    <div class="card-time">更新時間 : {{ tempBike.time }}</div>
    <div class="crad-close" @click="closeCard"><i class="bi bi-x"></i></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import userIconUrl from '../assets/img/userLocation.png';
import siteIconUrl from '../assets/img/bikeSite.png';

let map = {};
const markers = new L.MarkerClusterGroup();
const userIcon = new L.Icon({
  iconUrl: userIconUrl,
  iconSize: [46, 46],
  iconAnchor: [25, 0],
});
const siteIcon = new L.Icon({
  iconUrl: siteIconUrl,
  iconSize: [46, 46],
  iconAnchor: [25, 0],
});

export default {
  name: 'Map',
  data() {
    return {
      userLocation: {
        longitude: 0,
        latitude: 0,
      },
      bikeSite: [],
      bikeParking: [],
      cardShow: false,
      tempBike: {
        title: '',
        status: '',
        rentBikes: 0,
        returnBikes: 0,
        addr: '',
        time: '',
      },
    };
  },
  methods: {
    getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation.longitude = position.coords.longitude;
            this.userLocation.latitude = position.coords.latitude;
            map.setView([this.userLocation.latitude, this.userLocation.longitude]);
            map.panTo([this.userLocation.latitude, this.userLocation.longitude]);
            L.marker([this.userLocation.latitude, this.userLocation.longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup('您的位置')
              .openPopup();
          },
          (e) => {
            const msg = e.message;
            console.error(msg);
          },
        );
      }
    },
    renderMarker() {
      this.removeMarker();
      this.bikeSite.forEach((item) => {
        markers.addLayer(
          L.marker([item.StationPosition.PositionLat, item.StationPosition.PositionLon], {
            icon: siteIcon,
          }).on('click', () => {
            this.getMarkerDetail(item);
          }),
        );
      });
      map.addLayer(markers);
      map.setView([
        this.bikeSite[0].StationPosition.PositionLat,
        this.bikeSite[0].StationPosition.PositionLon,
      ]);
    },
    removeMarker() {
      markers.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          markers.removeLayer(layer);
        }
      });
    },
    getMarkerDetail(data) {
      console.log(data);
      this.bikeParking.forEach((item) => {
        if (data.StationUID === item.StationUID) {
          this.tempBike.title = data.StationName.Zh_tw;
          if (item.ServiceStatus === 0) {
            this.tempBike.status = '停止營運';
          } else if (item.ServiceStatus === 1) {
            this.tempBike.status = '正常營運';
          } else {
            this.tempBike.status = '暫停營運';
          }
          this.tempBike.rentBikes = item.AvailableRentBikes;
          this.tempBike.returnBikes = item.AvailableReturnBikes;
          this.tempBike.addr = data.StationAddress.Zh_tw;
          this.tempBike.time = data.UpdateTime.replace('T', ' ').replace('+08:00', '');
        }
      });
      this.cardShow = true;
    },
    closeCard() {
      this.cardShow = !this.cardShow;
    },
  },
  mounted() {
    this.getUserLocation();
    this.removeMarker();

    map = L.map('mapid').setView([0, 0], 14);
    L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: process.env.VUE_APP_MAPKEY,
      },
    ).addTo(map);

    this.emitter.on('bikeSite', (data) => {
      this.bikeSite = data;
    });
    this.emitter.on('bikeParking', (data) => {
      this.bikeParking = data;
      this.renderMarker();
    });
  },
};
</script>

<style lang="scss" scoped>
.map {
  position: relative;
  width: 100%;
  height: calc(100vh - 80px);
}
.marker-cluster-small {
  background-color: rgba(181, 226, 140, 0.6);
}
.marker-cluster-small div {
  background-color: rgba(110, 204, 57, 0.6);
}

.marker-cluster-medium {
  background-color: rgba(241, 211, 87, 0.6);
}
.marker-cluster-medium div {
  background-color: rgba(240, 194, 12, 0.6);
}

.marker-cluster-large {
  background-color: rgba(253, 156, 115, 0.6);
}
.marker-cluster-large div {
  background-color: rgba(241, 128, 23, 0.6);
}

.marker-cluster {
  background-clip: padding-box;
  border-radius: 20px;
}
.marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;

  text-align: center;
  border-radius: 15px;
  font: 12px 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
.marker-cluster span {
  line-height: 30px;
}
.card {
  width: 320px;
  height: 190px;
  position: absolute;
  z-index: 9999;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  transition: all 0.4s;
  opacity: 0;
  .card-title {
    text-align: center;
    font-size: 14px;
    color: #ffffff;
    background: #022020;
    border-radius: 8px 8px 0px 0px;
    padding: 6px;
  }
  .card-status {
    display: flex;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    color: #07b041;
    margin-top: 12px;
  }
  .card-content {
    display: flex;
    justify-content: space-around;
    text-align: center;
    p {
      font-size: 14px;
      color: #6d6d6d;
      padding-top: 5px;
      padding-bottom: 10px;
      margin: 0;
    }
    span {
      font-weight: bold;
      font-size: 24px;
      color: #022020;
    }
  }
  .card-addr {
    text-align: center;
    font-size: 14px;
    color: #6d6d6d;
  }
  .card-time {
    text-align: center;
    font-size: 14px;
    color: #6d6d6d;
  }
  .crad-close {
    position: absolute;
    top: 5px;
    right: 5px;
    i {
      font-size: 20px;
      color: #ffffff;
      cursor: pointer;
      &:hover {
        color: #07b041;
      }
    }
  }
}
.card.show {
  opacity: 1;
}
</style>
