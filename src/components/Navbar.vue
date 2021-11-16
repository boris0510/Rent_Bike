<template>
  <Loading :active="isLoading" style="z-index: 9999;"/>
  <div class="navbar">
    <a href="#" class="navbar-menu"><i class="bi bi-list"></i></a>
    <div class="navbar-logo">
      <h1>RentBike</h1>
      <a href="#" class="navbar-lg-logo"><img src="../assets/img/logo.png" alt="logo" /></a>
      <a href="#" class="navbar-md-logo"><img src="../assets/img/logo-md.png" alt="logo" /></a>
    </div>
    <div class="navbar-page">
      <ul>
        <li><router-link to="/">我要租車 / 還車</router-link></li>
        <li><router-link to="/lane">車道查詢</router-link></li>
        <li v-if="this.$router.currentRoute.value.path === '/'">
          <select v-model="currentCategory" @change="getBikeData">
            <option value="">請選擇縣市</option>
            <option :value="item.City" v-for="item in city" :key="item">
              {{ item.CityName }}
            </option>
          </select>
          <span>{{ errMsg }}</span>
        </li>
      </ul>
    </div>
    <div class="navbar-md-page">
      <a href="/"><img src="../assets/img/logo-md-menu.png" alt="logo-md-menu" /></a>
      <ul>
        <li><router-link to="/">我要租車 / 還車</router-link></li>
        <li><router-link to="/lane">車道查詢</router-link></li>
        <li v-if="this.$router.currentRoute.value.path === '/'">
          <select v-model="currentCategory" @change="getBikeData">
            <option value="">請選擇縣市</option>
            <option :value="item.City" v-for="item in city" :key="item">
              {{ item.CityName }}
            </option>
          </select>
          <br />
          <span>{{ errMsg }}</span>
        </li>
      </ul>
      <a href="#" class="navbar-menu-close"><i class="bi bi-x"></i></a>
    </div>
  </div>
</template>

<script>
import getAuthorizationHeader from '../tools/AuthorizationHeader';

export default {
  name: 'Navbar',
  data() {
    return {
      city: [],
      currentCategory: '',
      bikeSite: [],
      bikeParking: [],
      isLoading: false,
      errMsg: '',
    };
  },
  methods: {
    getData(url, dataName, bool = false) {
      this.isLoading = true;
      this.axios
        .get(url, {
          headers: getAuthorizationHeader(),
        })
        .then((response) => {
          this[dataName] = response.data;
          if (bool === true) {
            this.emitter.emit('bikeSite', this.bikeSite);
            this.emitter.emit('bikeParking', this.bikeParking);
          }
          this.errMsg = '';
          this.isLoading = false;
        })
        .catch(() => {
          this.errMsg = '此城市尚未有 YouBike !';
          this.isLoading = false;
        });
    },
    getBikeData() {
      if (this.currentCategory !== '') {
        this.getData(
          `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/${this.currentCategory}?$format=JSON`,
          'bikeSite',
          true,
        );
        this.getData(
          `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/${this.currentCategory}?$format=JSON`,
          'bikeParking',
          true,
        );
      }
    },
  },
  mounted() {
    this.getData('https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON', 'city');

    document.querySelector('.navbar-menu').addEventListener('click', () => {
      document.querySelector('.navbar-md-page').classList.toggle('show');
    });
    document.querySelector('.navbar-menu-close').addEventListener('click', () => {
      document.querySelector('.navbar-md-page').classList.remove('show');
    });
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 80px;
  background: #ffffff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.16);
  display: flex;
  .navbar-logo {
    display: flex;
    align-items: center;
    padding-left: 55px;
    h1 {
      text-indent: 101%;
      overflow: hidden;
      white-space: nowrap;
      font-size: 0;
    }
    .navbar-md-logo {
      display: none;
    }
  }
  .navbar-page {
    display: flex;
    align-items: center;
    ul {
      list-style: none;
      padding: 0;
      display: flex;
      li {
        margin-left: 40px;
        span {
          margin-left: 10px;
          color: red;
          font-size: 10px;
        }
      }
      a {
        text-decoration: none;
        color: #022020;
        padding: 12px 20px;
        border-radius: 4px;
      }
      .active {
        background-color: #022020;
        color: #ffffff;
      }
    }
  }
  .navbar-menu {
    display: none;
    i {
      font-size: 40px;
    }
  }
  .navbar-md-page {
    width: 240px;
    overflow: hidden;
    transform: translateX(-1500px);
    transition: all 0.3s;
  }
}
@media (max-width: 768px) {
  .navbar {
    position: relative;
    justify-content: center;
    .navbar-logo {
      padding: 0px;
      .navbar-lg-logo {
        display: none;
      }
      .navbar-md-logo {
        display: block;
      }
    }
    .navbar-page {
      display: none;
    }
    .navbar-menu {
      display: block;
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
    }
    .navbar-md-page {
      position: absolute;
      left: 0;
      z-index: 9999;
      height: 100vh;
      background-color: #ffffff;
      border-right: 1px solid rgb(100, 100, 100);
      .navbar-menu-close {
        position: absolute;
        top: 0;
        right: 5px;
        font-size: 30px;
        color: #ffffff;
      }
      ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        margin: 0;
        li {
          padding-top: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgb(100, 100, 100);
          span {
            margin-left: 24px;
            color: red;
            font-size: 10px;
          }
        }
        a {
          text-decoration: none;
          color: #022020;
          margin-left: 24px;
          border-radius: 4px;
        }
        select {
          margin-left: 24px;
        }
        .active {
          color: #07b041;
        }
      }
      &.show {
        transform: translateX(0);
      }
    }
  }
}
</style>
