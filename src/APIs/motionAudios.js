import getAxios from "./axios";

const apiVersion = import.meta.env.VITE_API_VERSION;

export const MOTION_AUDIO_ENDPOINT = "motion-audios";

export const fetchMotionAudios = async () => {
  const axios = getAxios({}, apiVersion);

  const response = await axios.get(MOTION_AUDIO_ENDPOINT);
  return response.data?.data ?? [];
};

export default fetchMotionAudios;
