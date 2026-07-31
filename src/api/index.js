// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";
const isTemperature = (value) =>
  (isNonEmptyString(value) && Number.isFinite(Number(value))) || Number.isFinite(value);

// 获取地理位置信息
export const getAdcode = async () => {
  const res = await fetch(`https://api.songzixian.com/api/ip?dataSource=GLOBAL_IP`);
  if (!res.ok) {
    throw new Error("地区请求失败");
  }

  return await res.json();
};

export const getWeather = async () => {
  const res = await fetch("https://api.mfawa.top/v1/weather/realtime");
  if (!res.ok) {
    throw new Error("MIFENG 天气请求失败");
  }

  const data = await res.json();
  const realtime = data?.data?.realtime;
  if (
    data?.success !== true ||
    !isRecord(realtime) ||
    !isNonEmptyString(realtime.city) ||
    !isNonEmptyString(realtime.weather) ||
    !isTemperature(realtime.temperature) ||
    !isNonEmptyString(realtime.wind) ||
    !isNonEmptyString(realtime.windSpeed)
  ) {
    throw new Error("MIFENG 天气数据无效");
  }

  return data;
};

// 获取高德地理天气信息
export const getOtherWeather = async (key, city) => {
  if (!isNonEmptyString(key) || !isNonEmptyString(city)) {
    throw new Error("高德天气请求参数无效");
  }

  const encodedKey = encodeURIComponent(key.trim());
  const encodedCity = encodeURIComponent(city.trim());
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${encodedKey}&city=${encodedCity}`,
  );
  if (!res.ok) {
    throw new Error("高德天气请求失败");
  }

  const data = await res.json();
  const realtime = data?.lives?.[0];
  if (
    data?.status !== "1" ||
    !Array.isArray(data?.lives) ||
    !isRecord(realtime) ||
    !isNonEmptyString(realtime.weather) ||
    !isTemperature(realtime.temperature) ||
    !isNonEmptyString(realtime.winddirection) ||
    !isNonEmptyString(realtime.windpower)
  ) {
    throw new Error("高德天气数据无效");
  }

  return data;
};
