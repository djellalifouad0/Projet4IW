<template>
  <div>
    <!-- Post Card -->
    <div :class="['card', paid ? 'card-paid' : 'card-orange']" @click="openModal">
      <div class="card-header" @click.stop>
        <img class="avatar" :src="avatar" alt="avatar" @click.stop />
        <div>
          <div class="name" @click.stop>
            {{ name }}
            <span v-if="online" class="status-dot"></span>
          </div>
          <div class="address" @click.stop>{{ address }}</div>
        </div>
        <div
          class="rate"
          :class="paid ? 'rate-paid' : ''"
          v-if="rate"
          @click.stop
        >{{ rate }}</div>
      </div>
      <div class="card-body">
        <p>
          {{ truncatedDescription }}
          <span v-if="isTruncated" class="more">...afficher plus</span>
        </p>
      </div>
      <div class="card-footer" @click.stop>
        <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']">
          <img src="@/assets/icons/coeur.svg" alt="likes" class="icon-svg" />
          <span class="icon-number">{{ likes }}</span>
        </span>
        <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']">
          <img src="@/assets/icons/comment.svg" alt="views" class="icon-svg" />
          <span class="icon-number">{{ views }}</span>
        </span>
      </div>
    </div>

    <!-- MODALE -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div :class="['modal-card', paid ? 'card-paid' : 'card-orange']" @click.stop>
        <div class="card-header">
          <img class="avatar" :src="avatar" alt="avatar" />
          <div>
            <div class="name">
              {{ name }}
              <span v-if="online" class="status-dot"></span>
            </div>
            <div class="address">{{ address }}</div>
          </div>
          <div class="rate" :class="paid ? 'rate-paid' : ''" v-if="rate">{{ rate }}</div>
        </div>
        <div class="card-body">
          <p>{{ description }}</p>
        </div>
        <div class="card-footer">
          <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']">
            <img src="@/assets/icons/coeur.svg" alt="likes" class="icon-svg" />
            <span class="icon-number">{{ likes }}</span>
          </span>
          <span :class="['icon', 'pastille', paid ? 'pastille-paid' : '']">
            <img src="@/assets/icons/comment.svg" alt="views" class="icon-svg" />
            <span class="icon-number">{{ views }}</span>
          </span>
        </div>
      </div>
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
    paid: { type: Boolean, default: false },
    online: { type: Boolean, default: false }
  },
  data() {
    return {
      showModal: false,
      charLimit: 270
    }
  },
  computed: {
    isTruncated() {
      return this.description.length > this.charLimit;
    },
    truncatedDescription() {
      if (this.isTruncated) {
        return this.description.substring(0, this.charLimit);
      }
      return this.description;
    }
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    }
  }
}
</script>

<style scoped>
.card {
  background: #FFF4E3;
  border-radius: 16px;
  padding: 22px 28px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  width: 700px;
  max-width: 100%;
  cursor: pointer;
  transition: box-shadow 0.18s;
}
.card-orange {
  background: #FFF4E3;
}
.card-paid {
  background: #ECBC76;
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
  transition: background 0.16s;
}
.rate-paid {
  background: #28303F !important;
  color: #fff !important;
}
.card-body p {
  margin: 0;
  color: #444;
  font-size: 1rem;
}
.more {
  color: #763D03;
  font-weight: 500;
  margin-left: 2px;
  user-select: none;
}
.card-footer {
  display: flex;
  gap: 18px;
  margin-top: 6px;
}
.icon {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pastille {
  background: #ECBC76;
  border-radius: 22px;
  padding: 6px 14px 6px 8px;
  display: flex;
  align-items: center;
  min-width: 36px;
  transition: background 0.15s, box-shadow 0.15s;
  cursor: pointer;
}
.pastille-paid {
  background: #FFF4E3 !important;
}
.pastille-paid .icon-number {
  color: #28303F !important;
}
.pastille:hover {
  background: #e4a94f;
  box-shadow: 0 2px 8px #ecbc7640;
}
.pastille:hover .icon-number {
  color: #181b26;
}
.icon-svg {
  width: 30px;
  height: 23px;
  display: block;
}
.icon-number {
  color: #28303F;
  font-weight: 600;
  font-size: 1rem;
  margin-left: 4px;
}
/* MODALE */
.modal-overlay {
  position: fixed;
  z-index: 99;
  inset: 0;
  background: rgba(0,0,0,0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInModal 0.22s;
}
@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-card {
  background: #FFF4E3;
  border-radius: 18px;
  padding: 22px 28px;
  width: 700px;
  max-width: 100%;
  box-shadow: 0 4px 28px #0002;
  position: relative;
  height: auto;
  overflow-y: visible;
}
/* Espaces verticaux dans la modale */
.modal-card .card-header {
  margin-bottom: 18px;
}
.modal-card .card-body {
  margin-bottom: 22px;
}
.modal-card .card-body p {
  font-size: 1.09rem;
  line-height: 1.65;
}
.modal-card .card-footer {
  gap: 24px;
  margin-top: 0;
}
@media (max-width: 900px) {
  .card,
  .modal-card {
    width: 95vw;
    padding: 18px 6vw;
    min-width: 0;
  }
}
@media (max-width: 600px) {
  .card,
  .modal-card {
    width: 100%;
    max-width: 100%;
    padding: 18px 12px 18px 12px;
    border-radius: 16px;
    box-shadow: 0 1px 10px #0001;
    box-sizing: border-box;
    margin-bottom: 10px;
  }
  .card-header,
  .modal-card .card-header {
    flex-direction: row !important;    /* Toujours en row */
    align-items: center;
    gap: 10px;
  }
  .avatar {
    width: 56px;        /* Plus grosse photo */
    height: 56px;
  }
  .name {
    font-size: 1.08rem;
  }
  .address,
  .rate,
  .rate-paid {
    font-size: 0.95rem !important;
  }
  .rate,
  .rate-paid {
    padding: 4px 10px;
    border-radius: 6px;
    margin-left: auto;        /* Toujours aligné à droite */
    margin-top: 0;
    font-size: 1rem !important;
  }
  .card-footer,
  .modal-card .card-footer {
    gap: 12px;
    margin-top: 8px;
  }
  .pastille, .pastille-paid {
    padding: 6px 10px 6px 6px;
    min-width: 28px;
    font-size: 0.95rem;
  }
  .icon-svg {
    width: 22px;
    height: 16px;
  }
  .icon-number {
    font-size: 0.97rem;
    margin-left: 3px;
  }
  .modal-card .card-header {
    margin-bottom: 12px;
  }
  .modal-card .card-body {
    margin-bottom: 16px;
  }
  .modal-card .card-body p {
    font-size: 1rem;
  }
}
@media (max-width: 420px) {
  .card,
  .modal-card {
    padding: 10px 10px 10px 10px;
    border-radius: 12px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .name, .address {
    font-size: 0.97rem;
  }
}


</style>
