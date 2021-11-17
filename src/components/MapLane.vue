<template>
  <Loading :active="isLoading" style="z-index: 9999" />
  <div id="mapid" class="map"></div>
  <div class="search" :class="{ active: active }">
    <div class="search-select">
      <div class="search-select-area">
        <span>查詢地區 :</span>
        <select v-model="currentCategory">
          <option value="">請選擇縣市</option>
          <option :value="item.City" v-for="item in city" :key="item">
            {{ item.CityName }}
          </option>
        </select>
        <span class="err">{{ errMsg }}</span>
      </div>
      <div class="search-select-direction">
        <span>方向 :</span>
        <select v-model="currentDirection" @change="getMapsLine">
          <option value="不拘">不拘</option>
          <option value="雙向">雙向</option>
          <option value="單向">單向</option>
        </select>
      </div>
    </div>
    <div class="search-content">
      <span v-if="MapsLine.length === 0">請選擇地區</span>
      <span v-else>地區內的自行車道 :</span>
      <div
        class="search-content-item"
        v-for="item in MapsLine"
        :key="item.RouteName"
        @click="polyLine(item.Geometry)"
      >
        <div class="title">
          <p>{{ item.RouteName }}</p>
          <span v-if="'Direction' in item">{{ item.Direction }}</span>
        </div>
        <div class="length">{{ item.CyclingLength }} M</div>
        <div class="start">
          <span>起點</span>
          <p>{{ item.RoadSectionStart }}</p>
        </div>
        <div class="end">
          <span>迄點</span>
          <p>{{ item.RoadSectionEnd }}</p>
        </div>
      </div>
    </div>
    <div class="search-close" @click="clickActive"><i class="bi bi-chevron-right"></i></div>
  </div>
</template>

<script>
import L from 'leaflet';
import Wkt from 'wicket';

import getAuthorizationHeader from '../tools/AuthorizationHeader';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import userIconUrl from '../assets/img/userLocation.png';
import startIconUrl from '../assets/img/start.png';
import endIconUrl from '../assets/img/end.png';

let map = {};
let myLayer = {};
const userIcon = new L.Icon({
  iconUrl: userIconUrl,
  iconSize: [46, 46],
  iconAnchor: [25, 0],
});
const startIcon = new L.Icon({
  iconUrl: startIconUrl,
  iconSize: [46, 46],
  iconAnchor: [25, 0],
});
const endIcon = new L.Icon({
  iconUrl: endIconUrl,
  iconSize: [46, 46],
  iconAnchor: [25, 0],
});

export default {
  name: 'MapLane',
  data() {
    return {
      city: [],
      MapsLine: [],
      userLocation: {
        longitude: 0,
        latitude: 0,
      },
      currentCategory: '',
      currentDirection: '',
      errMsg: '',
      isLoading: false,
      active: false,
    };
  },
  methods: {
    getData(url, dataName) {
      this.isLoading = true;
      this.axios
        .get(url, {
          headers: getAuthorizationHeader(),
        })
        .then((response) => {
          this[dataName] = response.data;
          this.errMsg = '';
          this.isLoading = false;
        })
        .catch((err) => {
          console.log(err);
          this.errMsg = '此城市尚未有自行車道路網圖 !';
          this.isLoading = false;
        });
    },
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
    getMapsLine() {
      if (this.currentDirection !== '不拘') {
        this.getData(
          `https://ptx.transportdata.tw/MOTC/v2/Cycling/Shape/${this.currentCategory}?$filter=Direction%20eq%20'${this.currentDirection}'&$format=JSON`,
          'MapsLine',
        );
      } else {
        this.getData(
          `https://ptx.transportdata.tw/MOTC/v2/Cycling/Shape/${this.currentCategory}?$format=JSON`,
          'MapsLine',
        );
      }
    },
    polyLine(geo) {
      this.removePolyLine();
      const wicket = new Wkt.Wkt();
      const geoTojson = wicket.read(geo).toJson();
      console.log(
        geoTojson.coordinates[0][0][0],
        geoTojson.coordinates[0][geoTojson.coordinates[0].length - 1],
      );
      L.marker([geoTojson.coordinates[0][0][1], geoTojson.coordinates[0][0][0]], {
        icon: startIcon,
      }).addTo(map);
      L.marker(
        [
          geoTojson.coordinates[0][geoTojson.coordinates[0].length - 1][1],
          geoTojson.coordinates[0][geoTojson.coordinates[0].length - 1][0],
        ],
        {
          icon: endIcon,
        },
      ).addTo(map);
      const styleLine = {
        color: '#07B041',
        weight: 5,
        opacity: 0.5,
      };
      myLayer = L.geoJSON(geoTojson, {
        style: styleLine,
      }).addTo(map);
      myLayer.addData(geoTojson);
      map.fitBounds(myLayer.getBounds());
    },
    removePolyLine() {
      map.removeLayer(myLayer);
    },
    clickActive() {
      this.active = !this.active;
    },
  },
  mounted() {
    this.getUserLocation();
    this.getData('https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON', 'city');

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
        accessToken:
          'pk.eyJ1Ijoic2Nwczg4MDUxMCIsImEiOiJja3Y0dXI5bzc3YzU2MzBwaDhpYTlqaXpnIn0.Ge79DPU7Xnz2-BXEnwXwbQ',
      },
    ).addTo(map);
  },
};
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: calc(100vh - 80px);
}
.search {
  height: calc(100vh - 80px);
  width: 460px;
  z-index: 8999;
  background-color: #ffffff;
  position: absolute;
  top: 80px;
  transform: translateX(-100%);
  transition: 0.3s;
  .search-select {
    display: flex;
    margin-top: 30px;
    margin-left: 30px;
    .search-select-area {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-right: 50px;
      span {
        font-size: 14px;
        color: #7d7d7d;
      }
      select {
        width: 120px;
        background: #e5e5e5;
        border-radius: 8px;
        color: #07b041;
        margin-top: 10px;
        padding: 8px 16px;
        border: none;
      }
      .err {
        color: red;
        font-size: 10px;
        margin-top: 10px;
      }
    }
    .search-select-direction {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      span {
        font-size: 14px;
        color: #7d7d7d;
      }
      select {
        width: 81px;
        background: #e5e5e5;
        border-radius: 8px;
        color: #07b041;
        margin-top: 10px;
        padding: 8px 16px;
        border: none;
      }
    }
  }
  .search-content {
    margin-top: 25px;
    height: calc(100% - 127px);
    overflow-y: scroll;
    > span {
      color: #7d7d7d;
      font-size: 14px;
      padding-left: 30px;
    }
    .search-content-item {
      margin-top: 15px;
      padding: 15px 0;
      &:hover {
        background-color: #e4e4e4;
        cursor: pointer;
      }
      &.active {
        background-color: #e4e4e4;
      }
      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 30px;
        padding-right: 30px;
        p {
          max-width: 320px;
          font-weight: bold;
          font-size: 16px;
          color: #022020;
          margin: 0;
          margin-bottom: 15px;
        }
        span {
          color: #07b041;
          font-size: 14px;
          background: #e5e5e5;
          border-radius: 8px;
          padding: 4px 8px;
        }
      }
      .length {
        padding-left: 30px;
        font-weight: bold;
        font-size: 14px;
        color: #07b041;
      }
      .start {
        display: flex;
        align-items: center;
        margin-top: 15px;
        padding-left: 30px;
        span {
          color: #07b041;
          font-size: 14px;
          margin-right: 8px;
        }
        p {
          margin: 0;
          font-size: 14px;
          color: #7d7d7d;
        }
      }
      .end {
        display: flex;
        align-items: center;
        margin-top: 15px;
        padding-left: 30px;
        span {
          color: #07b041;
          font-size: 14px;
          margin-right: 8px;
        }
        p {
          margin: 0;
          font-size: 14px;
          color: #7d7d7d;
        }
      }
    }
  }
  .search-close {
    font-size: 30px;
    color: #ffffff;
    background-color: #07b041;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 0px 12px 12px 0px;
    width: 44px;
    height: 60px;
    position: absolute;
    top: 80px;
    right: -44px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      color: #022020;
    }
  }
  &.active {
    transform: translateX(0);
    .search-close i {
      transform: scale(-1);
    }
  }
}
@media (max-width: 768px) {
  .search {
    width: 285px;
    .search-select {
      padding-left: 15px;
      padding-right: 15px;
      margin-left: 0;
    }
    .search-content {
      > span {
        padding-left: 15px;
      }
      .search-content-item {
        .title,
        .length,
        .start,
        .end {
          padding: 0 15px;
        }
      }
    }
  }
}
</style>
