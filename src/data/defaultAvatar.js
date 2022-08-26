const {
  DEFAULT_AVTAR_1_ID,
  DEFAULT_AVTAR_1_URL,
  DEFAULT_AVTAR_2_ID,
  DEFAULT_AVTAR_2_URL,
  DEFAULT_AVTAR_3_ID,
  DEFAULT_AVTAR_3_URL,
  DEFAULT_AVTAR_4_ID,
  DEFAULT_AVTAR_4_URL,
} = process.env

module.exports = [
  { public_id: DEFAULT_AVTAR_1_ID, secure_url: DEFAULT_AVTAR_1_URL },
  { public_id: DEFAULT_AVTAR_2_ID, secure_url: DEFAULT_AVTAR_2_URL },
  { public_id: DEFAULT_AVTAR_3_ID, secure_url: DEFAULT_AVTAR_3_URL },
  { public_id: DEFAULT_AVTAR_4_ID, secure_url: DEFAULT_AVTAR_4_URL },
]
