<template>
  <div class="card card-orange">
    <div class="card-header">
      <img class="avatar" :src="avatar" alt="avatar" />
      <div>
        <div class="name">{{ name }} <span v-if="online" class="status-dot"></span></div>
        <div class="address">{{ address }}</div>
      </div>
      <div class="rate" v-if="rate">{{ rate }}</div>
    </div>
    <div class="card-body">
      <p>
        {{ description }} <span v-if="showMore" class="more">...afficher plus</span>
      </p>
    </div>
    <div class="card-footer">
      <span class="icon">🧡 {{ likes }}</span>
      <span class="icon">👁️ {{ views }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostCard',
  props: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    avatar: { type: String, required: true },
    rate: { type: String, default: '' },
    description: { type: String, required: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    showMore: { type: Boolean, default: false },
    online: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.card {
  background: #fff3e6;
  border-radius: 16px;
  padding: 22px 28px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  width: 700px;
  max-width: 100%;
}
.card-orange {
  background: #fff3e6;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #f59c1a;
}
.name {
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #4cd964;
  border-radius: 50%;
  margin-left: 4px;
}
.address {
  font-size: 0.92rem;
  color: #888;
}
.rate {
  background: #f59c1a;
  color: #fff;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.95rem;
  font-weight: bold;
  margin-left: auto;
}
.card-body p {
  margin: 0;
  color: #444;
  font-size: 1rem;
}
.more {
  color: #d48a2f;
  cursor: pointer;
  font-weight: 500;
}
.card-footer {
  display: flex;
  gap: 18px;
  margin-top: 6px;
}
.icon {
  font-size: 1rem;
  color: #d48a2f;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
