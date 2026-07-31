<template>
  <div class="weather" v-if="weatherData.city && weatherData.data.type">
    <span>{{ weatherData.city }}&nbsp;</span>
    <span>{{ weatherData.data.type }}&nbsp;</span>
    <span>{{ weatherData.data.low }}°C</span>
    <span class="sm-hidden">
      &nbsp;{{ weatherData.data.fengxiang }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.data.fengli }}</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { h } from "vue";
import { Error as ErrorIcon } from "@icon-park/vue-next";
import { ElMessage } from "element-plus";
import { getAdcode, getWeather, getOtherWeather } from "@/api";

// 高德开发者 Key
const mainKey = import.meta.env.VITE_WEATHER_KEY?.trim();

// 天气数据
const weatherData = reactive({
  city: null, // 城市
  data: {
    type: null, // 天气现象
    low: null, // 最低气温
    high: null, // 最高气温
    fengxiang: null, // 风向描述
    fengli: null, // 风力级别
  },
});

const formatMifengWeather = (realtime) => ({
  city: realtime.city,
  data: {
    type: realtime.weather,
    low: realtime.temperature,
    high: realtime.temperature,
    fengxiang: realtime.wind,
    fengli: realtime.windSpeed,
  },
});

const getAmapWeatherData = async () => {
  const locationData = await getAdcode();
  const city = locationData?.data?.city;
  if (locationData?.code !== 200 || typeof city !== "string" || city.trim() === "") {
    throw new Error("地区查询失败");
  }

  const normalizedCity = city.trim();
  const result = await getOtherWeather(mainKey, normalizedCity);
  const weather = result.lives[0];
  return {
    city: normalizedCity,
    data: {
      type: weather.weather,
      low: weather.temperature,
      high: weather.temperature,
      fengxiang: weather.winddirection,
      fengli: weather.windpower,
    },
  };
};

const updateWeatherData = (result) => {
  weatherData.city = result.city;
  weatherData.data = result.data;
};

const clearWeatherData = () => {
  weatherData.city = null;
  weatherData.data = {
    type: null,
    low: null,
    high: null,
    fengxiang: null,
    fengli: null,
  };
};

// 获取天气数据
const getWeatherData = async () => {
  try {
    const result = await getWeather();
    updateWeatherData(formatMifengWeather(result.data.realtime));
  } catch {
    const weatherRequests = [
      getWeather().then((result) => formatMifengWeather(result.data.realtime)),
    ];

    if (mainKey) {
      weatherRequests.push(getAmapWeatherData());
    }

    try {
      const result = await Promise.any(weatherRequests);
      updateWeatherData(result);
    } catch {
      clearWeatherData();
      onError("天气信息获取失败");
    }
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(ErrorIcon, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>
