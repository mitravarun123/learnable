import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const getLesson = (childInput, childProfile) =>
  axios.post(`${API}/api/learn`, {
    child_input: childInput,
    child_profile: childProfile
  }).then(r => r.data)

export const saveVideo = (childId, topic, videoUrl) =>
  axios.post(`${API}/api/save-video`, {
    child_id: childId, topic, video_url: videoUrl
  }).then(r => r.data)

export const deleteVideo = (videoId) =>
  axios.delete(`${API}/api/save-video/${videoId}`)

export const getSavedVideos = (childId) =>
  axios.get(`${API}/api/saved-videos/${childId}`).then(r => r.data.videos)
