import axios from 'axios'

const HOST_NAME = 'http://localhost:8080'

function getArtists(params) {
  return axios.get(HOST_NAME + '/artists', { params: params })
}

function addArtist(params) {
  return axios.post(HOST_NAME + '/artist/add', params)
}

function updateArtist(params) {
  return axios.post(HOST_NAME + '/artist/update', params)
}

function delArtist(id) {
  return axios.get(HOST_NAME + '/artist/del/' + id)
}

function delArtists(params) {
  return axios.post(HOST_NAME + '/artist/del', params)
}

function getAlbums(params) {
  return axios.get(HOST_NAME + '/albums', { params: params })
}

function addAlbum(params) {
  return axios.post(HOST_NAME + '/album/add', params)
}

function updateAlbum(params) {
  return axios.post(HOST_NAME + '/album/update', params)
}

function delAlbum(id) {
  return axios.get(HOST_NAME + '/album/del/' + id)
}

function delAlbums(params) {
  return axios.post(HOST_NAME + '/album/del', params)
}

function getSongs(params) {
  return axios.get(HOST_NAME + '/songs', { params: params })
}

function addSong(params) {
  return axios.post(HOST_NAME + '/song/add', params)
}

function updateSong(params) {
  return axios.post(HOST_NAME + '/song/update', params)
}

function delSong(id) {
  return axios.get(HOST_NAME + '/song/del/' + id)
}

function delSongs(params) {
  return axios.post(HOST_NAME + '/song/del', params)
}

export default {
  getArtists,
  addArtist,
  updateArtist,
  delArtist,
  delArtists,
  getAlbums,
  addAlbum,
  updateAlbum,
  delAlbum,
  delAlbums,
  getSongs,
  addSong,
  updateSong,
  delSong,
  delSongs,
}