<template>
  <div class="container">
    <h1>Minecraft Player Dashboard</h1>
    <input
        v-model="username"
        placeholder="Enter Minecraft username"
        @keyup.enter="fetchPlayer"
        class="input"
    />

    <div v-if="player" class="player-info">
      <div class="left">
        <img
            class="head"
            :src="`https://skins.mcstats.com/skull/${player.uuid}?scale=2`"
            alt="Player Head"
        />
        <h2>{{ player.name }}</h2>
        <p><strong>UUID:</strong> {{ player.uuid }}</p>
        <p><strong>Slim Model:</strong> {{ player.texture.slim ? 'Yes' : 'No' }}</p>

        <h3>Username History <span class="note">(May not be accurate)</span></h3>
        <ul>
          <li v-for="(name, index) in sortedNameHistory" :key="index">
            {{ name.name }}
            <span v-if="name.changedAt">(Changed {{ timeAgo(name.changedAt) }})</span>
          </li>
        </ul>
      </div>

      <div class="right">
        <div class="right-container">
          <h3>3D Viewer</h3>
          <div ref="viewerContainer" class="render-3d">
            <canvas id="skinCanvas" class="canvas"></canvas>
          </div>

          <h3>Skin</h3>
          <a :href="player.texture.image" download>
            <img class="skin-preview" :src="player.texture.image" alt="Skin" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { SkinViewer, WalkingAnimation } from 'skinview3d'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const toast = useToast()
const username = ref('')
const player = ref(null)
const nameHistory = ref([])

let viewerInstance = null
let controlsInstance = null

async function fetchPlayer() {
  try {
    const res = await fetch(`https://api.dev.night.design/v2/players/${username.value}`)
    if (!res.ok) throw new Error('Player not found')
    const data = await res.json()
    player.value = data.data.player

    const historyRes = await fetch(`https://api.dev.night.design/v2/players/${player.value.uuid}/names`)
    if (!historyRes.ok) throw new Error('Could not fetch name history')
    const historyData = await historyRes.json()
    nameHistory.value = historyData.data.names

    toast.success('Player data loaded!')
  } catch (err) {
    toast.error(err.message)
  }
}

const sortedNameHistory = computed(() => {
  return nameHistory.value.sort((a, b) => {
    const dateA = a.changedAt ? new Date(a.changedAt).getTime() : 0
    const dateB = b.changedAt ? new Date(b.changedAt).getTime() : 0
    return dateB - dateA
  })
})

const timeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return `${diff}s ago`
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

watch(player, async () => {
  if (!player.value) return

  if (viewerInstance) {
    viewerInstance.dispose()
    viewerInstance = null
  }

  await nextTick()

  const canvas = document.getElementById('skinCanvas')
  if (!canvas) {
    console.warn('Canvas not found!')
    return
  }

  viewerInstance = new SkinViewer({
    canvas,
    width: 300,
    height: 400,
    skin: player.value.texture.image
  })

  viewerInstance.background = 0x2c3e50
  viewerInstance.zoom = 1

  viewerInstance.animation = new WalkingAnimation()
  viewerInstance.animation.speed = 1

  controlsInstance = new OrbitControls(viewerInstance.camera, canvas)
  controlsInstance.enableDamping = true
  controlsInstance.dampingFactor = 0.1
  controlsInstance.zoomSpeed = 0.5

  const animate = () => {
    requestAnimationFrame(animate)
    controlsInstance.update()
  }
  animate()
})
</script>
