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
        <a
            :href="`https://skins.mcstats.com/skull/${player.uuid}?scale=1&fallbackTexture=steve&overlay=true&cropMeasurement=pixels&expandMeasurement=pixels&cropLeft=0&cropRight=0&cropTop=0&cropBottom=0&expandLeft=0&expandRight=0&expandTop=0&expandBottom=0&alwaysSquare=true&grayscale=false`"
            download
        >
          <img
              class="head"
              :src="`https://skins.mcstats.com/skull/${player.uuid}?scale=1&fallbackTexture=steve&overlay=true&cropMeasurement=pixels&expandMeasurement=pixels&cropLeft=0&cropRight=0&cropTop=0&cropBottom=0&expandLeft=0&expandRight=0&expandTop=0&expandBottom=0&alwaysSquare=true&grayscale=false`"
              alt="Player Head"
          />
        </a>
        <h2>{{ player.name }}</h2>
        <p><strong>UUID:</strong> {{ player.uuid }}</p>
        <p><strong>Slim Model:</strong> {{ player.texture.slim ? 'Yes' : 'No' }}</p>

        <h3>Username History <span class="note">(May not be accurate)</span></h3>
        <ul>
          <li v-for="(name, index) in sortedNameHistory" :key="index">
            {{ name.name }}
            <span v-if="name.changedAt">
              (Changed {{ timeAgo(name.changedAt) }})
            </span>
            <span v-else>
              (No change date available)
            </span>
          </li>
        </ul>

        <h3>Skin</h3>
        <a :href="player.texture.image" download>
          <img class="skin-preview" :src="player.texture.image" alt="Skin" />
        </a>
      </div>

      <div class="right">
        <h3>3D Render</h3>
        <a
            :href="`https://skins.mcstats.com/body/front/${player.uuid}?scale=1&fov=50&shadow=true&disableCosmeticType=all&fallbackTexture=steve&overlay=true&cropMeasurement=pixels&expandMeasurement=pixels&cropLeft=0&cropRight=0&cropTop=0&cropBottom=0&expandLeft=0&expandRight=0&expandTop=0&expandBottom=0&alwaysSquare=true&grayscale=false`"
            download
        >
          <img
              class="render"
              :src="`https://skins.mcstats.com/body/front/${player.uuid}?scale=1&fov=50&shadow=true&disableCosmeticType=all&fallbackTexture=steve&overlay=true&cropMeasurement=pixels&expandMeasurement=pixels&cropLeft=0&cropRight=0&cropTop=0&cropBottom=0&expandLeft=0&expandRight=0&expandTop=0&expandBottom=0&alwaysSquare=true&grayscale=false`"
              alt="3D Render"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const username = ref('')
const player = ref(null)
const nameHistory = ref([])

async function fetchPlayer() {
  try {
    const playerRes = await fetch(`https://api.dev.night.design/v2/players/${username.value}`)
    if (!playerRes.ok) throw new Error('Player not found')
    const playerData = await playerRes.json()

    player.value = playerData.data.player

    const nameHistoryRes = await fetch(`https://api.dev.night.design/v2/players/${player.value.uuid}/names`)
    if (!nameHistoryRes.ok) throw new Error('Could not fetch name history')
    const nameHistoryData = await nameHistoryRes.json()

    nameHistory.value = nameHistoryData.data.names

    toast.success("Player data loaded!")
  } catch (err) {
    toast.error(err.message)
  }
}

const sortedNameHistory = computed(() => {
  return nameHistory.value
      .sort((a, b) => {
        const dateA = a.changedAt ? new Date(a.changedAt).getTime() : 0
        const dateB = b.changedAt ? new Date(b.changedAt).getTime() : 0
        return dateB - dateA
      })
})

const timeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}
</script>
