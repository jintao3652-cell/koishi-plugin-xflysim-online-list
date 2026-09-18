import fs from 'fs'
import path from 'path'
import {} from '@shangxueink/koishi-plugin-puppeteer-without-canvas'
import { Context, Schema, h } from 'koishi'

// 固定使用本地 XFS Logo，嵌入 base64 避免 Puppeteer 跨源问题
const LOGO_DATA_URI = (() => {
  try {
    const buf = fs.readFileSync(path.resolve(__dirname, '../../xfs-act-countdown/static/logoXflysim/xfslogo.png'))
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return ''
  }
})()

const XFS_AIRLINE_LOGO_DATA_URI = (() => {
  try {
    const buf = fs.readFileSync(path.resolve(__dirname, '../static/logoXflysim/logo.png'))
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return ''
  }
})()

function loadAssetDataUri(filename: string) {
  try {
    const buf = fs.readFileSync(path.resolve(__dirname, `../assest/${filename}`))
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch { return '' }
}

const MAP_DEPARTURE_ICON = loadAssetDataUri('departure.png')
const MAP_ARRIVAL_ICON = loadAssetDataUri('arrival.png')
const MAP_VOR_ICON = loadAssetDataUri('vor.png')
const MAP_WAYPOINT_ICON = loadAssetDataUri('waypoint.png')
const MAP_AIRCRAFT_ICON = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#009FE8" d="M910.219025 565.631245l-42.176741 42.176741-13.16165-72.739134 57.601799-57.598601a22.378321 22.378321 0 1 0-31.642946-31.646143l-35.658256 35.655059-24.459505-135.171453 125.197115-125.200312c19.056739-19.545865 29.363554-45.344872 29.011895-72.64003-0.345266-27.295158-11.301052-52.822428-30.846917-71.87597-19.194206-18.71467-44.529662-29.018289-71.332497-29.018288-27.790678 0-53.784696 10.958983-72.985295 30.655102l-132.086442 132.086442-125.420898-22.698012 40.185071-40.18507a22.378321 22.378321 0 1 0-31.642946-31.646143l-62.135007 62.13181-72.739134-13.16165 46.70995-46.70995a22.378321 22.378321 0 1 0-31.642946-31.646143l-65.881777 65.881778a22.41029 22.41029 0 0 0-2.381693 2.84844l-132.223908-23.928819a22.365533 22.365533 0 0 0-19.808011 6.195598L157.95578 190.126215a22.384715 22.384715 0 0 0 5.684094 35.773345l323.833486 164.611732L299.028716 578.959133 125.638288 606.970397a22.375124 22.375124 0 0 0-12.004371 6.022966l-57.400393 55.626112a22.375124 22.375124 0 0 0 6.796616 36.65569l180.800849 77.06774 75.734632 179.426181a22.381518 22.381518 0 0 0 36.441497 7.1227l56.511654-56.514851a22.371927 22.371927 0 0 0 6.333065-12.698099l24.868709-176.373138 192.277731-192.277731L808.899579 871.156068a22.36873 22.36873 0 0 0 19.951871 12.237744 22.394306 22.394306 0 0 0 15.82467-6.553651l52.729718-52.732915a22.381518 22.381518 0 0 0 6.195598-19.808011l-25.859748-142.891973 64.126677-64.129874a22.378321 22.378321 0 0 0-0.003197-31.646143 22.371927 22.371927 0 0 0-31.646143 0zM831.613574 109.669757a56.987993 56.987993 0 0 1 41.134551-17.343198c15.063807 0 29.302813 5.792788 40.089164 16.310599a57.064719 57.064719 0 0 1 17.343199 40.399263c0.195011 15.341937-5.597777 29.839893-16.109195 40.626243L410.581449 693.149312l-116.165864 37.745833 35.172327-119.196528L831.613574 109.669757z"/></svg>').toString('base64')}`

function loadRankIcon(folder: string, rank: unknown) {
  const name = String(rank ?? '').trim()
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) return ''
  try {
    const file = path.resolve(__dirname, `../static/${folder}/${name}.png`)
    return fs.existsSync(file) ? `data:image/png;base64,${fs.readFileSync(file).toString('base64')}` : ''
  } catch { return '' }
}

interface FlightPlan {
  aircraft?: string
  tascruise?: number
  depAirport?: string
  destAirport?: string
  hrsEnroute?: number
  minEnroute?: number
  route?: string
}

function renderHeaderLogo() {
  return `<img class="logo" src="${LOGO_DATA_URI}" alt="XFLYSIM" />`
}

interface Pilot {
  cid: string
  name?: string
  callsign?: string
  logonTime?: string
  lastUpdated?: string
  rating?: number
  altitude?: number
  groundSpeed?: number
  transponder?: string | number
  flightPlan?: FlightPlan
  aircraft?: {
    airline?: string
    equipment?: string
    livery?: string
    flapsPct?: number
    gearDown?: boolean
    onGround?: boolean
    spoilersOut?: boolean
    engines?: Record<string, { on?: boolean }>
    lights?: {
      beaconOn?: boolean
      landingOn?: boolean
      logoOn?: boolean
      navOn?: boolean
      strobeOn?: boolean
      taxiOn?: boolean
    }
  }
  controller?: string | null
  latitude?: number
  longitude?: number
  pbh?: number
  progressPercent?: number
  userAirlineIcao?: string
  userAirlineCnName?: string
  depAirportInfo?: AirportInfo | null
  destAirportInfo?: AirportInfo | null
  routeDistanceNm?: number | null
  routePoints?: RoutePoint[]
  heading?: number
}

interface RoutePoint {
  name: string
  lat: number
  lon: number
  isVor: boolean
}

interface Controller {
  cid?: string
  name?: string
  callsign?: string
  frequency?: string
  rating?: number
  atis?: unknown
  text_atis?: unknown
  logonTime?: string
  lastUpdated?: string
}

interface OnlineListResponse {
  code: number
  message?: string
  data?: {
    pilots?: Pilot[]
    controllers?: Controller[]
  }
}

interface UserInfoResponse {
  code: number
  message?: string
  data?: {
    list?: Array<{
      airlineICAO?: string
      airline?: string
      airlineCnName?: string
    }>
    records?: Array<Record<string, any>>
  }
}

export interface Config {
  command: string
  alias: string
  flightCommand: string
  enableFlight: boolean
  apiUrl: string
  enableLog: boolean
  timeout: number
  viewportWidth: number
  viewportHeight: number
  enableResume: boolean
  satoken: string
  mapboxAccessToken: string
}

export const name = 'xflysim-online-list'
export const inject = ['puppeteer', 'canvas']

export const Config: Schema<Config> = Schema.object({
  command: Schema.string().default('xflysim在线').description('指令名称'),
  alias: Schema.string().default('在线列表').description('指令别名'),
  flightCommand: Schema.string().default('航班').description('航班信息指令名称'),
  enableFlight: Schema.boolean().default(true).description('启用”航班”命令'),
  apiUrl: Schema.string().default('https://api.xflysim.com/pilot/api/fsd/list/allOnlineUser').description('在线列表 API'),
  enableLog: Schema.boolean().default(false).description('输出调试日志'),
  timeout: Schema.number().default(30000).min(5000).description('请求超时（毫秒）'),
  viewportWidth: Schema.number().default(1680).description('截图宽度'),
  viewportHeight: Schema.number().default(1200).description('截图高度'),
  enableResume: Schema.boolean().default(false).description('启用”简历 CID”命令'),
  satoken: Schema.string().role('secret').default('').description('用户信息接口 satoken'),
  mapboxAccessToken: Schema.string().role('secret').default('').description('Mapbox access token（用于执飞航图）'),
}).description('基础设置')

const airlineCache = new Map<string, Promise<{ icao: string, cnName: string, error: string }>>()
interface AirportInfo {
  latitude: number
  longitude: number
  ident: string
  iataCode: string
  cnName: string
  enName: string
  cityCn: string
  city: string
  elevationFt: number | null
}

const airportCache = new Map<string, Promise<AirportInfo | null>>()
const routePointsCache = new Map<string, Promise<RoutePoint[]>>()
let routeCyclePromise: Promise<string[]> | null = null

function haversineDistance(latitude1: number, longitude1: number, latitude2: number, longitude2: number) {
  const earthRadius = 3440.07
  const lat1 = latitude1 * Math.PI / 180
  const lon1 = longitude1 * Math.PI / 180
  const lat2 = latitude2 * Math.PI / 180
  const lon2 = longitude2 * Math.PI / 180
  const deltaLat = lat2 - lat1
  const deltaLon = lon2 - lon1
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getAirportUrl(icao: string) {
  return `https://api.xflysim.com/pilot/api/efb/airports/${encodeURIComponent(icao)}`
}

async function fetchAirport(icao: string, timeout: number) {
  const key = icao.trim().toUpperCase()
  if (!key) return null
  const cached = airportCache.get(key)
  if (cached) return cached
  const task = (async (): Promise<AirportInfo | null> => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch(getAirportUrl(key), { signal: controller.signal })
      if (!response.ok) return null
      const json = await response.json() as any
      const raw = json.data ?? json
      const data = Array.isArray(raw) ? raw[0] : raw
      if (!data || typeof data !== 'object') return null
      const latitude = Number(data.latitudeDeg ?? data.latitude ?? data.lat)
      const longitude = Number(data.longitudeDeg ?? data.longitude ?? data.lng ?? data.lon)
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
      if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
      const elevation = Number(data.elevationFt)
      return {
        latitude,
        longitude,
        ident: toText(data.ident ?? data.gpsCode ?? key).trim().toUpperCase(),
        iataCode: toText(data.iataCode).trim().toUpperCase(),
        cnName: toText(data.cnName).trim(),
        enName: toText(data.enName).trim(),
        cityCn: toText(data.municipalityCn).trim(),
        city: toText(data.municipality).trim(),
        elevationFt: Number.isFinite(elevation) ? elevation : null,
      }
    } catch { return null } finally { clearTimeout(timer) }
  })()
  airportCache.set(key, task); return task
}

async function fetchRouteCycles(timeout: number) {
  if (routeCyclePromise) return routeCyclePromise
  routeCyclePromise = (async () => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch('https://api.xflysim.com/pilot/api/efb/getRouteCycle', { signal: controller.signal })
      if (!response.ok) return []
      const json = await response.json() as { code?: number, data?: unknown }
      return Array.isArray(json.data) ? json.data.map(item => toText(item).trim()).filter(Boolean) : []
    } catch { return [] } finally { clearTimeout(timer) }
  })()
  return routeCyclePromise
}

function isVorWaypoint(item: Record<string, unknown>) {
  if (item.isVor === true) return true
  const kind = [item.type, item.navType, item.navaidType, item.facilityType, item.typeName]
    .map(value => toText(value).toUpperCase())
    .join(' ')
  return /\bVOR\b|VORTAC|VOR\/DME/.test(kind)
}

function calculateRouteDistance(points: RoutePoint[]) {
  let distance = 0
  for (let index = 1; index < points.length; index += 1) {
    distance += haversineDistance(points[index - 1].lat, points[index - 1].lon, points[index].lat, points[index].lon)
  }
  return distance > 0 ? distance : null
}

function getEstimatedRemainingMinutes(pilot: Pilot) {
  const destination = pilot.destAirportInfo
  const latitude = Number(pilot.latitude)
  const longitude = Number(pilot.longitude)
  if (!destination || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  const directRemaining = haversineDistance(latitude, longitude, destination.latitude, destination.longitude)
  if (!Number.isFinite(directRemaining)) return null
  // 按航路总长相对于起终点大圆距离的比例修正余程，避免直接按直线距离低估。
  const departure = pilot.depAirportInfo
  const directTotal = departure
    ? haversineDistance(departure.latitude, departure.longitude, destination.latitude, destination.longitude)
    : 0
  const routeDistance = Number(pilot.routeDistanceNm)
  const routeFactor = directTotal > 0 && Number.isFinite(routeDistance) ? Math.max(1, routeDistance / directTotal) : 1
  const remainingDistance = directRemaining * routeFactor

  // 空中优先使用实时地速；滑行/停机时的低速不适合推算到达时间，改用申报巡航速度。
  const groundSpeed = Number(pilot.groundSpeed)
  const filedTas = Number(pilot.flightPlan?.tascruise)
  const speed = Number.isFinite(groundSpeed) && groundSpeed >= 60
    ? groundSpeed
    : Number.isFinite(filedTas) && filedTas >= 200 ? filedTas : 450
  return { minutes: Math.max(1, Math.round(remainingDistance / speed * 60)), distance: remainingDistance }
}

function getPilotAttitude(pilot: Pilot) {
  const rawHeading = Number((pilot as any).heading ?? (pilot as any).headingDeg ?? (pilot as any).track ?? (pilot as any).course)
  const pbh = Number((pilot as any).pbh)
  // FSD PBH：最低 12 位为航向；其后的两个有符号 10 位分别为横滚和俯仰。
  const packed = Number.isFinite(pbh) ? pbh >>> 0 : 0
  const signed10 = (value: number) => value & 0x200 ? value - 0x400 : value
  const pbhHeading = Number.isFinite(pbh) ? (packed & 0xfff) * 360 / 4096 : undefined
  const heading = Number.isFinite(rawHeading) ? ((rawHeading % 360) + 360) % 360 : pbhHeading
  if (heading == null) return undefined
  return {
    heading,
    bank: Number.isFinite(pbh) ? signed10((packed >>> 12) & 0x3ff) * 360 / 1024 : 0,
    pitch: Number.isFinite(pbh) ? signed10((packed >>> 22) & 0x3ff) * 360 / 1024 : 0,
  }
}

function getPilotHeading(pilot: Pilot) {
  return getPilotAttitude(pilot)?.heading
}

async function parseRoutePoints(route: string, timeout: number): Promise<RoutePoint[]> {
  const cleaned = route.trim()
  if (!cleaned) return []
  const cached = routePointsCache.get(cleaned)
  if (cached) return cached

  const task = (async () => {
    const cycles = await fetchRouteCycles(timeout)
    // 服务端并非所有公布周期都有航路数据，需逐个回退直到解析成功。
    for (const cycle of cycles) {
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeout)
      try {
        const response = await fetch('https://api.xflysim.com/pilot/api/efb/parseRoute', {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json, text/plain, */*',
            origin: 'https://map.xflysim.com',
            referer: 'https://map.xflysim.com/',
          },
          body: new URLSearchParams({ cycle, route: cleaned }),
          signal: controller.signal,
        })
        if (!response.ok) continue
        const json = await response.json() as {
          code?: number
          data?: { waypoints?: Array<Record<string, unknown>> } | Array<Array<Record<string, unknown>>>
        }
        if (json.code !== 20000 || !json.data) continue
        // EFB 接口的标准响应是 data.waypoints；保留旧数组格式的兼容处理。
        const groups = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data.waypoints) ? [json.data.waypoints] : []
        const points: RoutePoint[] = []
        for (const group of groups) {
          if (!Array.isArray(group)) continue
          for (const item of group) {
            const lat = Number(item?.lat)
            const lon = Number(item?.lon)
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
            const name = toText(item?.name).trim()
            const previous = points[points.length - 1]
            // 相邻航段可能共享衔接点；只按坐标去重，避免同名但不同位置的点被丢弃。
            if (previous && previous.lat === lat && previous.lon === lon) continue
            points.push({ name, lat, lon, isVor: isVorWaypoint(item) })
          }
        }
        // 即使只能解析到一个点，也应显示该航路点；两点以上才会形成航线。
        if (!points.length) continue
        return points
      } catch { continue } finally { clearTimeout(timer) }
    }
    return []
  })()

  routePointsCache.set(cleaned, task)
  return task
}

function toText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
  if (Array.isArray(value)) return value.map(item => toText(item)).filter(Boolean).join(' | ')
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function escapeHtml(value: unknown) {
  return toText(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch] as string))
}

// XFLYSIM 返回的 logonTime 通常没有时区后缀，例如
// "2026-09-12T20:59:32.942"。该值为北京时间，必须显式标记为 +08:00；
// 不能交给运行机器的本地时区猜测，否则在线时长会产生固定偏差。
function parseXfsBeijingTimestamp(value: unknown): number | null {
  const raw = toText(value).trim()
  if (!raw) return null

  if (/^-?\d+(?:\.\d+)?$/.test(raw)) {
    const numeric = Number(raw)
    if (!Number.isFinite(numeric)) return null
    return numeric < 1e12 ? numeric * 1000 : numeric
  }

  const normalized = raw.replace(' ', 'T')
  const zoned = /(?:Z|[+-]\d\d:?\d\d)$/.test(normalized)
    ? normalized
    : `${normalized}+08:00`
  const timestamp = Date.parse(zoned)
  return Number.isFinite(timestamp) ? timestamp : null
}

function formatServiceDuration(logonTime?: string) {
  const startedAt = parseXfsBeijingTimestamp(logonTime)
  if (startedAt == null) return '--'
  // Date.now() 是 UTC 时间戳；与明确为 +08:00 的登录时间相减，即为
  // 登录北京时间到当前北京时间的真实间隔，与主机时区无关。
  const diff = Math.max(0, Date.now() - startedAt)
  const totalMinutes = Math.floor(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

function formatControllerFrequency(value?: string | number) {
  const text = toText(value).trim()
  if (!text) return '--'

  // API 可能返回带小数点的频率（如 199.998），也可能返回纯数字编码
  // （如 99998 或 199998）。统一格式为 xxx.xxx。
  const decimal = Number(text.replace(/[^0-9.+-]/g, ''))
  if (Number.isFinite(decimal) && text.includes('.')) return decimal.toFixed(3)

  const digits = text.replace(/\D/g, '')
  if (!digits) return '--'
  if (digits.length === 6 && digits.startsWith('1')) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  const prefixed = `1${digits}`
  if (prefixed.length <= 3) return prefixed
  return `${prefixed.slice(0, 3)}.${prefixed.slice(3)}`
}

function formatControllerAtis(value: unknown) {
  const lines = Array.isArray(value)
    ? value.flatMap(item => toText(item).split(/\r?\n/))
    : toText(value).split(/\r?\n/)
  const filtered = lines.map(line => line.trim()).filter(Boolean)
  return filtered.length ? filtered.map(line => escapeHtml(line)).join('<br />') : '--'
}

function formatAltitude(value?: number) {
  if (value == null || Number.isNaN(value)) return '--'
  if (value < 0) return 'GND'
  if (value >= 1000) return `${Math.round(value).toLocaleString('en-US')}`
  return String(Math.round(value))
}

function formatSpeed(value?: number) {
  if (value == null || Number.isNaN(value)) return '--'
  return `${Math.round(value)}`
}

function formatRating(value?: number) {
  if (value == null) return '--'
  const map: Record<number, string> = {
    1: 'OBS',
    2: 'S1',
    3: 'S2',
    4: 'S3',
    5: 'C1',
    6: 'C2',
    7: 'C3',
    8: 'I1',
    9: 'I2',
    10: 'I3',
    11: 'SUP',
    12: 'ADM',
  }
  return map[value] || String(value)
}

function getProgressPercent(pilot: Pilot) {
  if (pilot.progressPercent != null) return pilot.progressPercent
  const hours = Number(pilot.flightPlan?.hrsEnroute || 0)
  const minutes = Number(pilot.flightPlan?.minEnroute || 0)
  const planned = Math.max(0, hours * 60 + minutes)
  // 没有航路预计时间时仍显示进度条，从 0% 开始，而不是显示 --。
  if (!planned) return undefined
  const start = pilot.logonTime
  if (!start) return 0
  // API 时间可能是 ISO 字符串，也可能是 Unix 秒/毫秒时间戳。
  const timestamp = parseXfsBeijingTimestamp(start)
  if (timestamp == null) return 0
  const elapsed = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
  const percent = Math.max(0, Math.min(100, Math.round((elapsed / planned) * 100)))
  // 登录时长不等于航路飞行时长；仍在空中时不允许被提前标记为完成。
  if (percent >= 100 && ((pilot.altitude || 0) > 0 || (pilot.groundSpeed || 0) > 0)) return 99
  return percent
}

function getClockParts() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date()).split('')
}

function getAirlineInfoUrl() {
  return 'https://api.xflysim.com/pilot/api/user/info'
}

// user/info 需要登录态：缺少 satoken 时接口返回 code 40001，航司信息将全部为空。
async function fetchAirlineInfo(cid: string, timeout: number, satoken: string) {
  if (!cid) return { icao: '', cnName: '', error: '' }
  const cached = airlineCache.get(cid)
  if (cached) return cached

  const task = (async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const body = new URLSearchParams({
        pageNum: '1',
        pageSize: '12',
        cid,
      })
      const response = await fetch(getAirlineInfoUrl(), {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          accept: 'application/json, text/plain, */*',
          origin: 'https://www.xflysim.com',
          referer: 'https://www.xflysim.com/',
          ...(satoken ? { cookie: `satoken=${satoken}` } : {}),
        },
        body,
        signal: controller.signal,
      })
      if (!response.ok) return { icao: '', cnName: '', error: `HTTP ${response.status}` }
      const json = await response.json() as UserInfoResponse
      if (json.code !== 20000) return { icao: '', cnName: '', error: `${json.code} ${json.message || ''}`.trim() }
      const item = json.data?.records?.[0] || json.data?.list?.[0]
      return {
        icao: toText(item?.airlineICAO || item?.airline).trim().toUpperCase(),
        cnName: toText(item?.airlineCnName).trim(),
        error: '',
      }
    } catch (error) {
      return { icao: '', cnName: '', error: error instanceof Error ? error.message : String(error) }
    } finally {
      clearTimeout(timer)
    }
  })()

  airlineCache.set(cid, task)
  return task
}

async function fetchResume(cid: string, config: Config) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), config.timeout)
  try {
    const body = new URLSearchParams({ pageNum: '1', pageSize: '12', cid })
    const response = await fetch('https://api.xflysim.com/pilot/api/user/info', { method: 'POST', headers: {
      'content-type': 'application/x-www-form-urlencoded', accept: 'application/json, text/plain, */*',
      origin: 'https://www.xflysim.com', referer: 'https://www.xflysim.com/',
      ...(config.satoken ? { cookie: `satoken=${config.satoken}` } : {}),
    }, body, signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json() as UserInfoResponse
    return json.data?.records?.[0] || json.data?.list?.[0]
  } finally { clearTimeout(timer) }
}

function buildResumeHtml(record: Record<string, any>) {
  const val = (key: string) => escapeHtml(record[key] == null ? '--' : record[key])
  const pilotIcon = loadRankIcon('pilotrank', record.pilotRank)
  const pilot = pilotIcon ? `<span class="badge-premium"><img src="${escapeHtml(pilotIcon)}" alt="">${val('pilotRank')}</span>` : ''
  const controllerIcon = loadRankIcon('rank', record.controllerRank)
  const controller = controllerIcon ? `<span class="badge-premium"><img src="${escapeHtml(controllerIcon)}" alt="">${val('controllerRoom')} | ${val('controllerRank')}</span>` : ''
  const qqNumber = record.qqNumber
  const avatar = qqNumber ? `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(String(qqNumber))}&s=640` : ''
  const reputationWidth = Math.min(100, Math.max(0, Number(record.credit) || 0))
  const qualificationController = record.controllerRoom || '无管制权限'
  return `<html><meta charset="UTF-8"><style>body{margin:0;background:#f4f3ef;font-family:"Microsoft YaHei",sans-serif;color:#182b49}.wrap{padding:18px 28px;background:#fff;border-radius:24px}.head{display:flex;align-items:center;border-bottom:1px solid #eee;padding-bottom:14px}.avatar{width:72px;height:72px;border-radius:50%;object-fit:cover;background:#eee}.name{font-size:34px;font-weight:800;margin-left:18px}.sub{font-size:12px;color:#b28a16;letter-spacing:2px}.badges{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px}.badges>span{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px}.badge-premium{background:linear-gradient(135deg,#c99717,#e0b948);color:#fff;box-shadow:0 10px 24px #c9971733;font-size:12px}.badge-premium img{height:22px;width:22px;object-fit:contain;margin-right:6px}.stats{margin-left:auto;display:flex;gap:38px}.stat b{display:block;font-size:11px;color:#777}.stat span{font-size:18px;font-weight:700}.bento-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;margin-top:16px}.bento-item{grid-column:span 4;background:#fff;border-radius:16px;padding:16px;box-shadow:0 2px 10px #ddd;position:relative}.bento-item label{color:#777;font-size:12px}.bento-item .val{font-size:20px;font-weight:700;margin-top:8px}.mini-chart{height:5px;background:#eee;margin-top:12px;border-radius:4px}.mini-chart .bar{height:100%;border-radius:4px;background:#8b55ee}.green .mini-chart .bar{background:#16b981}.blue .mini-icon{color:#4d8df7;position:absolute;right:16px;bottom:14px}.purple .mini-chart .bar{width:70%}</style><div class="wrap"><div class="head"><img class="avatar" src="${escapeHtml(avatar)}" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'"><div><div class="sub">MEMBER COMMAND CENTER</div><div class="name">${val('name')}</div><div class="badges"><span>CID: ${val('cid')}</span>${pilot}${controller}</div></div><div class="stats"><div class="stat"><b>注册时间</b><span>${val('registerTime')}</span></div><div class="stat"><b>飞行时长</b><span>${val('pilotTime')} 小时</span></div><div class="stat"><b>管制时长</b><span>${val('controllerTime')} 小时</span></div><div class="stat"><b>信誉分</b><span>${val('credit')} 分</span></div></div></div><section class="bento-grid"><div class="bento-item purple"><label>工资</label><div class="val">${val('money')}</div><div class="mini-chart"><div class="bar"></div></div></div><div class="bento-item green"><label>REPUTATION</label><div class="val">${val('credit')}%</div><div class="mini-chart"><div class="bar" style="width:${reputationWidth}%"></div></div></div><div class="bento-item blue"><label>QUALIFICATIONS</label><div class="val">${val('pilotRank')} / ${escapeHtml(qualificationController)}</div><div class="mini-icon">◆</div></div></section></div></html>`
}

function formatResumeDuration(value: unknown) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return '--'
  const totalMinutes = Math.floor(seconds / 60)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  return days ? `${days}天 ${hours}小时 ${minutes}分` : `${hours}小时 ${minutes}分`
}

function buildResumeRecord(record: Record<string, any>) {
  return {
    ...record,
    pilotTime: formatResumeDuration(record.pilotTime),
    controllerTime: formatResumeDuration(record.controllerTime),
    registerTime: record.registerTime ? new Date(Number(record.registerTime)).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '--',
    money: record.money == null ? '--' : `¥${Number(record.money).toFixed(2)}`,
    fsdTime: record.fsdTime ? new Date(Number(record.fsdTime) * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '--',
  }
}

function extractImageUrl(value: unknown) {
  const text = toText(value).trim()
  if (!text) return ''
  const markdown = text.match(/\]\((https?:\/\/[^)]+)\)/)
  return markdown?.[1] || (text.startsWith('http://') || text.startsWith('https://') ? text : '')
}

function renderSection(title: string, headers: string[], rows: string[], emptyText: string) {
  const body = rows.length
    ? rows.join('')
    : `<tr class="empty-row"><td colspan="${headers.length}">${escapeHtml(emptyText)}</td></tr>`

  return `
    <section class="section">
      <div class="section-title">${escapeHtml(title)}</div>
      <table>
        <thead>
          <tr>${headers.map(item => `<th>${escapeHtml(item)}</th>`).join('')}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </section>
  `
}

function renderProgress(percent: number | null | undefined) {
  if (percent == null) return '<span class="progress-empty">--</span>'
  return `
    <div class="progress-wrap">
      <div class="progress-bar"><span style="width:${percent}%"></span></div>
      <div class="progress-text">${percent}%</div>
    </div>
  `
}

function buildHtml(data: NonNullable<OnlineListResponse['data']>, _config: Config) {
  const pilots = [...(data.pilots || [])].sort((a, b) => (a.callsign || '').localeCompare(b.callsign || ''))
  const allControllers = [...(data.controllers || [])].sort((a, b) => (a.callsign || '').localeCompare(b.callsign || ''))

  // callsign 以 _ATIS 结尾 → 自动情报广播；频率 199.998 且非 _ATIS → 观察员；其余 → 普通管制员
  const isAtis = (c: Controller) => (c.callsign || '').toUpperCase().endsWith('_ATIS')
  const isObserver = (c: Controller) => !isAtis(c) && formatControllerFrequency(c.frequency) === '199.998'

  const atisControllers = allControllers.filter(isAtis)
  const observerControllers = allControllers.filter(isObserver)
  const controllers = allControllers.filter(c => !isAtis(c) && !isObserver(c))

  const onlineCounts = {
    pilots: pilots.length,
    controllers: controllers.length,
    atis: atisControllers.length,
    observers: observerControllers.length,
  }

  const pilotRows = pilots.map((pilot) => {
    const type = pilot.aircraft?.equipment || pilot.flightPlan?.aircraft || '--'
    const departure = pilot.flightPlan?.depAirport || '--'
    const arrival = pilot.flightPlan?.destAirport || '--'
    const progress = renderProgress(getProgressPercent(pilot))
    return `
      <tr>
        <td>${escapeHtml(pilot.cid || '--')}</td>
        <td>${escapeHtml(pilot.name || '--')}</td>
        <td>${escapeHtml(pilot.callsign || '--')}</td>
        <td>${escapeHtml(pilot.transponder == null || String(pilot.transponder).trim() === '' ? '--' : String(pilot.transponder))}</td>
        <td>${escapeHtml(type)}</td>
        <td>${escapeHtml(departure)}</td>
        <td>${escapeHtml(arrival)}</td>
        <td>${escapeHtml(formatSpeed(pilot.groundSpeed))}</td>
        <td>${escapeHtml(formatAltitude(pilot.altitude))}</td>
        <td>${escapeHtml(formatServiceDuration(pilot.logonTime))}</td>
        <td>${progress}</td>
      </tr>
    `
  })

  const controllerRows = controllers.map((controller) => `
    <tr>
      <td>${escapeHtml(controller.cid || '--')}</td>
      <td>${escapeHtml(controller.name || '--')}</td>
      <td>${escapeHtml(controller.callsign || '--')}</td>
      <td>${escapeHtml(formatRating(controller.rating))}</td>
      <td>${escapeHtml(formatControllerFrequency(controller.frequency))}</td>
      <td>${formatControllerAtis(controller.atis ?? controller.text_atis)}</td>
      <td>${escapeHtml(formatServiceDuration(controller.logonTime))}</td>
    </tr>
  `)

  const atisRows = atisControllers.map((controller) => `
    <tr>
      <td>${escapeHtml(controller.cid || '--')}</td>
      <td>${escapeHtml(controller.callsign || '--')}</td>
      <td>${escapeHtml(formatControllerFrequency(controller.frequency))}</td>
      <td>${formatControllerAtis(controller.atis ?? controller.text_atis)}</td>
      <td>${escapeHtml(formatServiceDuration(controller.logonTime))}</td>
    </tr>
  `)

  const observerRows = observerControllers.map((controller) => `
    <tr>
      <td>${escapeHtml(controller.cid || '--')}</td>
      <td>${escapeHtml(controller.callsign || '--')}</td>
      <td>${escapeHtml(formatControllerFrequency(controller.frequency))}</td>
      <td>${formatControllerAtis(controller.atis ?? controller.text_atis)}</td>
      <td>${escapeHtml(formatServiceDuration(controller.logonTime))}</td>
    </tr>
  `)

  const clock = getClockParts()
    .map(char => (char === ':' ? '<span class="clock-sep">:</span>' : `<span class="clock-digit">${char}</span>`))
    .join('')

  return `
  <html>
    <head>
      <meta charset="UTF-8" />
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css" rel="stylesheet" />
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #121316;
          color: #d8d8d8;
          font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
        }
        .page {
          width: 100%;
          min-height: 0;
          padding: 14px 18px 20px;
          background: #121316;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          min-height: 68px;
        }
        .logo { height: 58px; width: auto; object-fit: contain; }
        .clock {
          display: flex;
          gap: 4px;
          align-items: center;
          font-family: "Consolas", monospace;
        }
        .clock-digit, .clock-sep {
          width: 28px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #f3f3f3;
          color: #1b1b1b;
          font-size: 22px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(0,0,0,.35);
        }
        .clock-sep {
          width: 10px;
          background: transparent;
          color: #f3f3f3;
          box-shadow: none;
        }
        .panel {
          background: #191b20;
          border: 1px solid #23262d;
          border-radius: 12px;
          padding: 14px 16px 10px;
        }
        .titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          margin-bottom: 12px;
        }
        .brand {
          font-size: 22px;
          font-weight: 800;
          color: #f0f0f0;
        }
        .brand span {
          color: #4d87d9;
          margin-left: 8px;
        }
        .counts {
          color: #9ea3ab;
          font-size: 15px;
          letter-spacing: 0;
        }
        .section {
          padding: 14px 14px 18px;
          border-top: 1px solid #2a2d35;
        }
        .section:first-of-type {
          border-top: none;
          padding-top: 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 800;
          color: #f1f1f1;
          margin: 2px 0 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th, td {
          padding: 12px 10px;
          text-align: center;
          border-bottom: 1px solid #2a2d35;
          word-break: break-word;
        }
        th {
          color: #b7b7b7;
          font-size: 15px;
          font-weight: 700;
        }
        td {
          color: #d5d5d5;
          font-size: 14px;
        }
        .empty-row td {
          color: #8c8f96;
          padding: 18px 10px 24px;
          font-size: 15px;
        }
        .progress-wrap {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
        }
        .progress-bar {
          width: 100%;
          height: 10px;
          background: #2a2d35;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-bar span {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, #3f74c8, #5da0ff);
          border-radius: inherit;
        }
        .progress-text, .progress-empty {
          color: #a6abb3;
          font-size: 12px;
        }
        .footer-space { height: 4px; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="topbar">
          ${renderHeaderLogo()}
          <div class="clock">${clock}</div>
        </div>

        <div class="panel">
          <div class="titlebar">
            <div class="brand">XFLYSIM <span>在线列表</span></div>
            <div class="counts">
              飞行员: ${onlineCounts.pilots} | 管制员: ${onlineCounts.controllers} | 自动情报广播: ${onlineCounts.atis} | 观察员: ${onlineCounts.observers}
            </div>
          </div>

          ${renderSection(
            '飞行员',
            ['CID', '机长', '呼号', '应答机', '机型', '起飞机场', '到达机场', '地速', '高度', '飞行时长', '进度'],
            pilotRows,
            '没有在线的机组',
          )}

          ${renderSection(
            '管制员',
            ['管制员', '昵称', '呼号', '管制等级', '频率', '管制信息', '服务时长'],
            controllerRows,
            '没有在线的管制员',
          )}

          ${renderSection('自动情报广播', ['管制员', '呼号', '频率', '信息', '服务时长'], atisRows, '没有在线的自动情报广播')}
          ${renderSection('观察员', ['观察员', '呼号', '频率', '信息', '服务时长'], observerRows, '没有在线的观察员')}

          <div class="footer-space"></div>
        </div>
      </div>
    </body>
  </html>
  `
}

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

async function fetchOnlineList(config: Config) {
  // XFLYSIM 的网关偶发返回 504 或直接断开连接；短暂重试比立刻将
  // AbortError 暴露给用户更可靠。
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), config.timeout)
    try {
      const response = await fetch(config.apiUrl, { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = await response.json() as OnlineListResponse
      if (json.code !== 20000) throw new Error(json.message || 'API returned an error')
      return json.data || { pilots: [], controllers: [] }
    } catch (error) {
      lastError = error
      if (attempt < 2) await wait(1000 * (attempt + 1))
    } finally {
      clearTimeout(timer)
    }
  }

  if (lastError instanceof Error && lastError.name === 'AbortError') {
    throw new Error(`XFLYSIM 在线接口在 ${Math.round(config.timeout / 1000)} 秒内未响应，请稍后重试`)
  }
  const message = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`XFLYSIM 在线接口暂时不可用（${message}），请稍后重试`)
}

async function enrichPilots(pilots: Pilot[], timeout: number, satoken: string) {
  const unique = [...new Set(pilots.map(pilot => pilot.cid).filter(Boolean))]
  const airlineByCid = new Map<string, { icao: string, cnName: string, error: string }>()
  await Promise.all(unique.map(async (cid) => {
    airlineByCid.set(cid, await fetchAirlineInfo(cid, timeout, satoken))
  }))
  const airportCodes = [...new Set(pilots.flatMap(p => [p.flightPlan?.depAirport, p.flightPlan?.destAirport].filter(Boolean) as string[]))]
  const airports = new Map<string, AirportInfo | null>()
  await Promise.all(airportCodes.map(async code => airports.set(code.toUpperCase(), await fetchAirport(code, timeout))))
  const routes = [...new Set(pilots.map(p => toText(p.flightPlan?.route).trim()).filter(Boolean))]
  const routePointsByRoute = new Map<string, RoutePoint[]>()
  await Promise.all(routes.map(async route => routePointsByRoute.set(route, await parseRoutePoints(route, timeout))))
  return pilots.map(pilot => {
    const dep = airports.get((pilot.flightPlan?.depAirport || '').toUpperCase())
    const dest = airports.get((pilot.flightPlan?.destAirport || '').toUpperCase())
    const latitude = Number((pilot as any).latitude ?? (pilot as any).lat)
    const longitude = Number((pilot as any).longitude ?? (pilot as any).lng ?? (pilot as any).lon)
    const heading = getPilotHeading(pilot)
    let progressPercent: number | undefined
    if (dep && dest && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const total = haversineDistance(dep.latitude, dep.longitude, dest.latitude, dest.longitude)
      const remaining = haversineDistance(latitude, longitude, dest.latitude, dest.longitude)
      if (total > 0) progressPercent = Math.max(0, Math.min(100, Math.round((1 - remaining / total) * 100)))
    }
    const routePoints = routePointsByRoute.get(toText(pilot.flightPlan?.route).trim()) ?? []
    const parsedDistance = calculateRouteDistance(routePoints)
    // parseRoute 只覆盖已解析的航路点，缺少起降机场与未识别航段；
    // 明显短于大圆距离时改用大圆距离，避免显示偏小的里程。
    const directDistance = dep && dest ? haversineDistance(dep.latitude, dep.longitude, dest.latitude, dest.longitude) : null
    const routeDistanceNm = parsedDistance != null && directDistance != null
      ? Math.max(parsedDistance, directDistance)
      : parsedDistance ?? directDistance
    return {
    ...pilot,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    heading,
    progressPercent,
    userAirlineIcao: airlineByCid.get(pilot.cid)?.icao || '',
    userAirlineCnName: airlineByCid.get(pilot.cid)?.cnName || '',
    depAirportInfo: dep ?? null,
    destAirportInfo: dest ?? null,
    routeDistanceNm,
    routePoints,
    }
  })
}

function buildFlightHtml(pilot: Pilot, config: Config) {
  const callsign = pilot.callsign || '--'
  const flightNumber = callsign.replace(/^[A-Z]{3}/, '')
  const equipment = pilot.aircraft?.equipment || pilot.flightPlan?.aircraft || '--'

  const depInfo = pilot.depAirportInfo
  const destInfo = pilot.destAirportInfo
  const depIdent = depInfo?.ident || toText(pilot.flightPlan?.depAirport).trim().toUpperCase() || '--'
  const destIdent = destInfo?.ident || toText(pilot.flightPlan?.destAirport).trim().toUpperCase() || '--'
  // 版面为 "IATA/ICAO"，缺少 IATA 时只显示 ICAO，避免出现空的斜杠。
  const depAirport = depInfo?.iataCode ? `${depInfo.iataCode}/${depIdent}` : depIdent
  const destAirport = destInfo?.iataCode ? `${destInfo.iataCode}/${destIdent}` : destIdent

  const depName = depInfo?.cnName || depInfo?.enName || '--'
  const destName = destInfo?.cnName || destInfo?.enName || '--'

  const latitude = Number(pilot.latitude)
  const longitude = Number(pilot.longitude)
  const latDisplay = Number.isFinite(latitude) ? latitude.toFixed(2) : '--'
  const lonDisplay = Number.isFinite(longitude) ? longitude.toFixed(2) : '--'

  const groundSpeed = formatSpeed(pilot.groundSpeed)
  const altitudeFeet = pilot.altitude != null && !Number.isNaN(pilot.altitude) && pilot.altitude >= 0 ? `${Math.round(pilot.altitude)} ft` : '--'
  const attitude = getPilotAttitude(pilot)
  const pitch = attitude ? Math.max(-30, Math.min(30, attitude.pitch)) : 0
  const bank = attitude ? Math.max(-60, Math.min(60, attitude.bank)) : 0
  const ndPitchMarks = [-30, -20, -10, -5, 5, 10, 20, 30].map(value => `
    <div class="nd-pitch-mark ${Math.abs(value) % 10 ? 'is-minor' : ''}" style="top:calc(50% - ${value * 4.6}px)">
      <span>${Math.abs(value) % 10 ? '' : Math.abs(value)}</span><i></i><span>${Math.abs(value) % 10 ? '' : Math.abs(value)}</span>
    </div>
  `).join('')
  const aircraft = pilot.aircraft
  const systemStates: Array<[string, boolean]> = [
    ['导航灯', Boolean(aircraft?.lights?.navOn)],
    ['频闪灯', Boolean(aircraft?.lights?.strobeOn)],
    ['信标灯', Boolean(aircraft?.lights?.beaconOn)],
    ['着陆灯', Boolean(aircraft?.lights?.landingOn)],
    ['滑行灯', Boolean(aircraft?.lights?.taxiOn)],
    ['标识灯', Boolean(aircraft?.lights?.logoOn)],
    ['起落架', Boolean(aircraft?.gearDown)],
    ['扰流板', Boolean(aircraft?.spoilersOut)],
    ['地面', Boolean(aircraft?.onGround)],
    [`襟翼 ${Math.round(Number(aircraft?.flapsPct) || 0)}%`, Number(aircraft?.flapsPct) > 0],
    ...Object.entries(aircraft?.engines || {}).sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
      .map(([engine, value]) => [`引擎${engine}`, Boolean(value?.on)] as [string, boolean]),
  ]
  const aircraftStateHtml = systemStates.map(([label, active]) =>
    `<span class="aircraft-state-item ${active ? 'is-active' : 'is-inactive'}"><i></i>${escapeHtml(label)}</span>`
  ).join('')
  const controller = toText(pilot.controller).trim()
  const controllerStateHtml = `<span class="controller-state ${controller ? 'is-active' : 'is-inactive'}"><i></i>${controller ? `管制指挥 ${escapeHtml(controller)}` : '未受管制指挥'}</span>`

  const depElevation = depInfo?.elevationFt != null ? `${depInfo.elevationFt} ft` : '--'
  const destElevation = destInfo?.elevationFt != null ? `${destInfo.elevationFt} ft` : '--'
  const depCoords = depInfo ? `${depInfo.latitude.toFixed(2)} / ${depInfo.longitude.toFixed(2)}` : '--'
  const destCoords = destInfo ? `${destInfo.latitude.toFixed(2)} / ${destInfo.longitude.toFixed(2)}` : '--'
  const depCity = depInfo?.cityCn || depInfo?.city || '--'
  const destCity = destInfo?.cityCn || destInfo?.city || '--'
  const mapRoute = [
    depInfo && { lon: depInfo.longitude, lat: depInfo.latitude },
    ...(pilot.routePoints || []).map(point => ({ lon: point.lon, lat: point.lat })),
    destInfo && { lon: destInfo.longitude, lat: destInfo.latitude },
  ].filter((point): point is { lon: number, lat: number } => Boolean(point))
    .filter((point, index, points) => index === 0 || point.lon !== points[index - 1].lon || point.lat !== points[index - 1].lat)
  const mapData = JSON.stringify({
    route: mapRoute,
    waypoints: pilot.routePoints || [],
    departure: depInfo && { lon: depInfo.longitude, lat: depInfo.latitude, name: depName },
    arrival: destInfo && { lon: destInfo.longitude, lat: destInfo.latitude, name: destName },
    aircraft: Number.isFinite(latitude) && Number.isFinite(longitude) ? { lon: longitude, lat: latitude, heading: pilot.heading || 0, name: callsign } : null,
  }).replace(/</g, '\\u003c')
  const mapToken = JSON.stringify(config.mapboxAccessToken || '')

  const routeLine = toText(pilot.flightPlan?.route).trim()
  const transponder = toText(pilot.transponder).trim() || '--'
  const progressPercent = getProgressPercent(pilot)
  const progressValue = progressPercent == null ? null : Math.max(0, Math.min(100, progressPercent))
  const enroute = getEstimatedRemainingMinutes(pilot)
  const enrouteText = enroute
    ? `预计剩余约 ${Math.floor(enroute.minutes / 60)}小时${enroute.minutes % 60}分钟`
    : '剩余时间未知'
  const distanceText = pilot.routeDistanceNm != null ? `${Math.round(pilot.routeDistanceNm)}海里` : '里程未知'

  const clock = getClockParts()
    .map(char => (char === ':' ? '<span class="clock-sep">:</span>' : `<span class="clock-digit">${char}</span>`))
    .join('')

  return `
  <html>
    <head>
      <meta charset="UTF-8" />
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css" rel="stylesheet" />
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0A0D12;
          color: #e8e8e8;
          font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
          padding: 20px;
        }
        .page {
          max-width: 1280px;
          margin: 0 auto;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding: 0 8px 18px;
          border-bottom: 1px solid #fff;
        }
        .logo { height: 56px; width: auto; object-fit: contain; }
        .clock {
          display: flex;
          gap: 4px;
          font-family: Consolas, monospace;
        }
        .clock-digit, .clock-sep {
          width: 36px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: linear-gradient(180deg, #fbfbfb 0%, #ededed 49.5%, #d9d9d9 50.5%, #c4c4c4 100%);
          color: #1a1a1a;
          font-size: 26px;
          font-weight: 700;
          box-shadow: 0 3px 8px rgba(0,0,0,.5);
          position: relative;
          overflow: hidden;
        }
        .clock-digit::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(0,0,0,.28);
          box-shadow: 0 1px 0 rgba(255,255,255,.5);
        }
        .clock-sep {
          width: 12px;
          background: transparent;
          color: #f3f3f3;
          box-shadow: none;
        }
        .airline-logo {
          height: 26px;
          width: auto;
          object-fit: contain;
          vertical-align: middle;
          margin-right: 10px;
        }
        .flight-header {
          background: linear-gradient(135deg, #0F131C, #161D2B);
          border: 1px solid #23262d;
          border-radius: 16px;
          padding: 24px 28px;
          margin-bottom: 14px;
        }
        .flight-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }
        .flight-meta {
          flex: 1;
        }
        .flight-callsign {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 1px;
        }
        .flight-equipment {
          font-size: 14px;
          color: #9ea3ab;
          margin-top: 4px;
        }
        .coordinate-icon {
          width: 14px;
          height: 14px;
          margin-left: 4px;
          vertical-align: -2px;
          fill: currentColor;
        }
        .airport-coordinate-icon {
          width: 16px;
          height: 16px;
          margin-right: 4px;
          vertical-align: -3px;
        }
        .city-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
          vertical-align: -2px;
          fill: currentColor;
        }
        .section-flight-icon {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        .flight-route {
          display: grid;
          grid-template-columns: minmax(180px, 1fr) minmax(0, 2fr) minmax(180px, 1fr);
          gap: 16px;
          align-items: center;
        }
        .airport-block {
          text-align: center;
          min-width: 0;
        }
        .airport-code {
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
        }
        .airport-name {
          font-size: 13px;
          color: #9ea3ab;
          margin-top: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .route-middle {
          min-width: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .route-badges {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .route-badge {
          background: rgba(134, 239, 172, .3);
          color: #86efac;
          border-radius: 4px;
          padding: 3px 10px;
          font-size: 12px;
          white-space: nowrap;
        }
        .progress-track {
          width: 100%;
          height: 14px;
          background: #4b5563;
          border-radius: 999px;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ade80, #86efac);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-width: 34px;
        }
        .progress-fill span {
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding-right: 6px;
        }
        .route-text {
          grid-column: 1 / -1;
          justify-self: center;
          max-width: 100%;
          background: #9ca3af;
          color: #111827;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12px;
          line-height: 1.45;
          text-align: center;
          white-space: normal;
          overflow-wrap: anywhere;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 14px;
        }
        .info-card {
          background: linear-gradient(135deg, #0F131C, #161D2B);
          border: 1px solid #23262d;
          border-radius: 12px;
          padding: 20px 24px;
        }
        .info-grid .info-card {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .info-grid .section-header {
          grid-column: 1 / -1;
        }
        .info-grid .data-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 0 12px;
          border-bottom: none;
          border-right: 1px solid #1a1d24;
        }
        .info-grid .data-row:last-child {
          border-right: none;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid #2a2d35;
        }
        .airport-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .airport-header-code {
          color: #86efac;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }
        .section-icon {
          font-size: 18px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #f1f1f1;
        }
        .data-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #1a1d24;
        }
        .data-row:last-child {
          border-bottom: none;
        }
        .data-label {
          font-size: 13px;
          color: #9ea3ab;
        }
        .data-value {
          font-size: 15px;
          font-weight: 700;
          color: #e8e8e8;
        }
        .map-placeholder {
          background: linear-gradient(135deg, #0A0D12, #0F131C);
          border: 1px solid #23262d;
          border-radius: 12px;
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          font-size: 14px;
          position: relative;
          overflow: hidden;
        }
        .flight-details {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        .nd-placeholder {
          height: 310px;
          min-height: 0;
          border: 1px solid #334155;
          border-radius: 10px;
          overflow: hidden;
          background: #0b1019;
          padding: 10px;
        }
        .nd-column { min-width: 0; }
        .nd-display { height: 100%; min-height: 0; color: #f8fafc; font-family: Consolas, monospace; }
        .nd-window { height: 100%; position: relative; overflow: hidden; border-radius: 9px; border: 1px solid #334155; background: #05090d; }
        .nd-attitude-mask { position: absolute; width: 100%; height: 100%; left: 0; top: 0; overflow: hidden; background: #247ac0; box-shadow: inset 0 0 0 1px #1e293b; }
        .nd-attitude { position: absolute; width: 160%; height: 160%; left: -30%; top: -30%; transform-origin: center; }
        .nd-sky, .nd-ground { position: absolute; left: 0; width: 100%; height: 50%; }
        .nd-sky { top: 0; background: linear-gradient(#2f91dc, #257abe); }
        .nd-ground { bottom: 0; background: linear-gradient(#693716, #3d1d0c); }
        .nd-horizon { position: absolute; top: 50%; left: 0; width: 100%; height: 3px; background: #edf3f8; box-shadow: 0 0 0 1px rgba(0,0,0,.45); }
        .nd-pitch-mark { position: absolute; left: 50%; display: flex; align-items: center; justify-content: center; gap: 5px; width: 112px; margin-left: -56px; color: #eef5fb; font: 12px/1 Consolas, monospace; }
        .nd-pitch-mark span { width: 18px; text-align: center; }
        .nd-pitch-mark i { display: block; width: 44px; height: 2px; background: #eef5fb; }
        .nd-pitch-mark.is-minor i { width: 26px; }
        .nd-aircraft { position: absolute; top: 50%; left: 50%; z-index: 3; width: 114px; height: 34px; margin: -17px 0 0 -57px; }
        .nd-aircraft::before, .nd-aircraft::after { content: ''; position: absolute; top: 15px; width: 43px; height: 8px; border: 3px solid #f6be21; filter: drop-shadow(0 1px 1px #000); }
        .nd-aircraft::before { left: 0; border-right: 0; border-bottom: 0; }
        .nd-aircraft::after { right: 0; border-left: 0; border-bottom: 0; }
        .nd-aircraft i { position: absolute; left: 53px; top: 8px; width: 8px; height: 18px; border: 3px solid #f6be21; border-radius: 2px; filter: drop-shadow(0 1px 1px #000); }
        .nd-roll-scale { position: absolute; z-index: 4; top: 8px; left: 50%; width: 154px; height: 44px; margin-left: -77px; border-top: 2px solid #d9e2e9; border-radius: 50% 50% 0 0; pointer-events: none; }
        .nd-roll-scale::before { content: ''; position: absolute; left: 50%; top: -4px; width: 0; height: 0; margin-left: -7px; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 11px solid #f6be21; }
        .nd-roll-scale span { position: absolute; top: -5px; width: 2px; height: 10px; background: #d9e2e9; transform-origin: 1px 50px; left: 76px; }
        .nd-roll-scale span:nth-child(1) { transform: rotate(-45deg); } .nd-roll-scale span:nth-child(2) { transform: rotate(-30deg); } .nd-roll-scale span:nth-child(3) { transform: rotate(-15deg); } .nd-roll-scale span:nth-child(4) { transform: rotate(15deg); } .nd-roll-scale span:nth-child(5) { transform: rotate(30deg); } .nd-roll-scale span:nth-child(6) { transform: rotate(45deg); }
        .aircraft-state-panel { margin-top: 10px; padding: 12px; border: 1px solid #334155; border-radius: 8px; background: #0b1019; }
        .aircraft-state-title { color: #cbd5e1; font-size: 15px; font-weight: 800; margin-bottom: 9px; letter-spacing: .5px; }
        .aircraft-state-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
        .aircraft-state-item { display: inline-flex; align-items: center; min-width: 0; gap: 7px; padding: 6px 8px; border: 1px solid #263244; border-radius: 5px; background: #121a27; color: #a8b3c2; font-size: 16px; font-weight: 700; line-height: 20px; white-space: nowrap; }
        .aircraft-state-item i { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 50%; background: #64748b; box-shadow: 0 0 0 1px #475569; }
        .aircraft-state-item.is-active { color: #dcfce7; border-color: rgba(74, 222, 128, .58); background: rgba(22, 101, 52, .24); }
        .aircraft-state-item.is-active i { background: #4ade80; box-shadow: 0 0 8px rgba(74, 222, 128, .9); }
        .aircraft-state-item.is-inactive { opacity: .9; }
        .controller-state { display: flex; align-items: center; gap: 7px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #334155; color: #a8b3c2; font-size: 15px; font-weight: 700; line-height: 20px; }
        .controller-state i { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 50%; background: #64748b; }
        .controller-state.is-active { color: #93c5fd; font-weight: 700; }
        .controller-state.is-active i { background: #60a5fa; box-shadow: 0 0 6px rgba(96, 165, 250, .9); }
        .controller-state.is-inactive { color: #64748b; }
        .flight-details-content { min-width: 0; }
        .flight-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 18px;
        }
        .flight-stats > div { min-width: 0; }
        .flight-details-content .map-placeholder { height: 510px; }
        #flight-map { width: 100%; height: 100%; }
        #map-status {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: #9ea3ab;
          font-size: 14px;
          text-align: center;
          pointer-events: none;
        }
        /* 即使外部样式表加载较慢，标记也须正确悬浮在 Mapbox 画布上。 */
        .mapboxgl-marker { position: absolute; top: 0; left: 0; will-change: transform; }
        .map-marker { width: 28px; height: 28px; display: block; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .7)); }
        .map-waypoint-marker { width: 18px; height: 18px; }
        .map-waypoint-label {
          color: #f8fafc;
          background: rgba(10, 13, 18, .82);
          border: 1px solid rgba(255, 105, 180, .55);
          border-radius: 3px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, .8);
          font: 600 11px/1.25 "Microsoft YaHei", "Segoe UI", sans-serif;
          padding: 2px 4px;
          white-space: nowrap;
          pointer-events: none;
        }
        .map-aircraft-marker { width: 42px; height: 42px; position: relative; z-index: 3; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, .85)); }
        .map-aircraft-image { width: 42px; height: 42px; display: block; transform-origin: 50% 50%; }
        .map-text {
          position: relative;
          z-index: 2;
        }
        .attitude-indicator {
          width: 180px;
          height: 180px;
          border-radius: 12px;
          background: linear-gradient(180deg, #38BDF8 50%, #8B5E3C 50%);
          position: relative;
          margin: 0 auto;
          border: 3px solid #23262d;
          overflow: hidden;
        }
        .attitude-horizon {
          position: absolute;
          width: 100%;
          height: 2px;
          background: #fff;
          top: 50%;
          left: 0;
          transform: translateY(-1px);
        }
        .attitude-marks {
          position: absolute;
          width: 120%;
          left: -10%;
          top: 50%;
          transform: translateY(-50%);
        }
        .attitude-line {
          height: 1px;
          background: #fff;
          margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="topbar">
          ${renderHeaderLogo()}
          <div class="clock">${clock}</div>
        </div>

        <div class="flight-header">
          <div class="flight-title">
            <div class="flight-meta">
              <div class="flight-callsign">
                <span>${escapeHtml(callsign)}</span>
              </div>
            </div>
          </div>

          <div class="flight-route">
            <div class="airport-block">
              <div class="airport-code">${escapeHtml(depAirport)}</div>
              <div class="airport-name">${escapeHtml(depName)}</div>
            </div>

            <div class="route-middle">
              <div class="route-badges">
                <span class="route-badge">${escapeHtml(enrouteText)}</span>
                <span class="route-badge">${escapeHtml(distanceText)}</span>
                <span class="route-badge">应答机 ${escapeHtml(transponder)}</span>
              </div>
              <div class="progress-track">
                ${progressValue == null ? '' : `<div class="progress-fill" style="width:${progressValue}%"><span>${progressValue}%</span></div>`}
              </div>
            </div>

            <div class="airport-block">
              <div class="airport-code">${escapeHtml(destAirport)}</div>
              <div class="airport-name">${escapeHtml(destName)}</div>
            </div>
            ${routeLine ? `<div class="route-text">${escapeHtml(routeLine)}</div>` : ''}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="section-header">
              <div class="airport-header-title">
                <span class="section-title">${escapeHtml(depName)}</span>
              </div>
              <span class="airport-header-code">${escapeHtml(depAirport)}</span>
            </div>
            <div class="data-row">
              <span class="data-label"><svg class="airport-coordinate-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#7F8C8D" d="M256 394.257c81.64 0 148.25 19.38 148.25 43.17 0 23.78-66.61 43.17-148.25 43.17s-148.25-19.39-148.25-43.17c0-23.79 66.61-43.17 148.25-43.17z"/><path fill="#BDC3C7" d="M256 31.417c45.86 0 83.25 37.39 83.25 83.25 0 45.84-37.39 83.26-83.25 83.26-45.84 0-83.25-37.42-83.25-83.26 0-45.86 37.41-83.25 83.25-83.25z"/><path d="M256 207.905c-51.406 0-93.228-41.826-93.228-93.238 0-51.406 41.822-93.228 93.228-93.228s93.228 41.822 93.228 93.228c0 51.412-41.822 93.238-93.228 93.238zM256 41.395c-40.402 0-73.272 32.87-73.272 73.272 0 40.408 32.87 73.282 73.272 73.282s73.272-32.874 73.272-73.282c0-40.402-32.87-73.272-73.272-73.272zM256 437.395c-5.511 0-9.978-4.467-9.978-9.978v-229.49c0-5.511 4.467-9.978 9.978-9.978s9.978 4.467 9.978 9.978v229.49c0 5.511-4.467 9.978-9.978 9.978zM256 490.561c-40.404 0-78.59-4.64-107.525-13.064-33.634-9.793-50.688-23.274-50.688-40.069 0-16.799 17.054-30.281 50.689-40.073 28.931-8.422 67.118-13.061 107.525-13.061s78.594 4.639 107.525 13.061c33.635 9.792 50.689 23.274 50.689 40.073 0 16.795-17.054 30.276-50.688 40.069C334.59 485.921 296.404 490.561 256 490.561zm0-86.34c-38.575 0-74.783 4.356-101.955 12.267-26.656 7.76-36.331 16.773-36.331 20.939 0 4.163 9.676 13.175 36.332 20.937 27.175 7.912 63.383 12.27 101.955 12.27s74.779-4.357 101.955-12.27c26.656-7.762 36.332-16.773 36.332-20.937 0-4.166-9.675-13.18-36.331-20.939-27.174-7.911-63.382-12.267-101.956-12.267z"/></svg>经纬度</span>
              <span class="data-value">${escapeHtml(depCoords)}</span>
            </div>
            <div class="data-row">
              <span class="data-label"><svg class="city-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M972.8 902.4h-768v-153.6c0-25.6-19.2-51.2-51.2-51.2-25.6 0-51.2 19.2-51.2 51.2v192c0 6.4 0 12.8 6.4 19.2 6.4 25.6 25.6 44.8 44.8 44.8h819.2c25.6 0 51.2-19.2 51.2-51.2s-19.2-51.2-51.2-51.2zM294.4 748.8c6.4 12.8 12.8 25.6 25.6 32 6.4 6.4 12.8 6.4 25.6 6.4 19.2 0 32-12.8 44.8-25.6l192-377.6 89.6 352c6.4 19.2 19.2 32 44.8 38.4 19.2 0 38.4-12.8 44.8-25.6l64-128 76.8 147.2c6.4 19.2 25.6 25.6 44.8 25.6 6.4 0 19.2 0 25.6-6.4 12.8-6.4 19.2-19.2 25.6-32 6.4-12.8 0-25.6-6.4-38.4l-121.6-230.4c-6.4-19.2-25.6-25.6-44.8-25.6-19.2 0-32 12.8-44.8 25.6l-51.2 96-83.2-345.6c-6.4-19.2-25.6-38.4-51.2-38.4-19.2 0-32 12.8-44.8 25.6l-256 486.4c-6.4 12.8-6.4 25.6 0 38.4zM102.4 211.2c0 25.6 25.6 44.8 51.2 44.8s51.2-19.2 51.2-51.2V192l25.6 25.6c6.4 6.4 19.2 12.8 32 12.8s25.6-6.4 32-12.8c12.8-12.8 19.2-25.6 19.2-38.4 0-12.8-6.4-25.6-12.8-32L192 38.4C185.6 32 172.8 25.6 160 25.6s-25.6 6.4-32 12.8L12.8 147.2c-6.4 6.4-12.8 19.2-12.8 32s6.4 25.6 12.8 38.4c6.4 6.4 19.2 12.8 32 12.8s25.6-6.4 32-12.8l19.2-19.2v12.8zM204.8 345.6c0-25.6-19.2-51.2-51.2-51.2-25.6 0-51.2 25.6-51.2 51.2v64c0 25.6 19.2 51.2 51.2 51.2 25.6 0 51.2-19.2 51.2-51.2v-64zM153.6 499.2c-25.6 0-51.2 19.2-51.2 44.8v64c0 25.6 19.2 51.2 51.2 51.2 25.6 0 51.2-19.2 51.2-51.2v-64c0-25.6-25.6-44.8-51.2-44.8z"/></svg>海拔高度</span>
              <span class="data-value">${escapeHtml(depElevation)}</span>
            </div>
            <div class="data-row">
              <span class="data-label"><svg class="city-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M914 864.7h-34.2V526.2c0-11.6-9.4-21-21-21h-49.9v-11.3c0-4.4-3.6-8-8-8h-57.1c-4.4 0-8 3.6-8 8v11.3H690v-246c0-11.6-9.4-21-21-21h-80.1v-35.4c0-11.6-9.4-21-21-21H525v-35.5c0-7.2-5.8-13-13-13s-13 5.8-13 13v35.5h-42.9c-11.6 0-21 9.4-21 21v35.4H355c-11.6 0-21 9.4-21 21v246h-45.8v-11.3c0-4.4-3.6-8-8-8h-57.1c-4.4 0-8 3.6-8 8v11.3h-49.9c-11.6 0-21 9.4-21 21v338.5H110c-7.2 0-13 5.8-13 13s5.8 13 13 13h804c7.2 0 13-5.8 13-13s-5.8-13-13-13zM461.1 207.8h101.7v28.7H461.1v-28.7zm229.7 323.4h163v332h-163v-332zM360 264.2h304v599H360v-599zm-189.8 267h163v332h-163v-332z"/><path d="M470.1 354h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 354h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM470.1 481h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 481h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13 5.8 13 13s-5.8 13-13 13zM470.1 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM470.1 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM794.3 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM794.3 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM273.7 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM273.7 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13z"/></svg>所处城市</span>
              <span class="data-value">${escapeHtml(depCity)}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="section-header">
              <div class="airport-header-title">
                <span class="section-title">${escapeHtml(destName)}</span>
              </div>
              <span class="airport-header-code">${escapeHtml(destAirport)}</span>
            </div>
            <div class="data-row">
              <span class="data-label"><svg class="airport-coordinate-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#7F8C8D" d="M256 394.257c81.64 0 148.25 19.38 148.25 43.17 0 23.78-66.61 43.17-148.25 43.17s-148.25-19.39-148.25-43.17c0-23.79 66.61-43.17 148.25-43.17z"/><path fill="#BDC3C7" d="M256 31.417c45.86 0 83.25 37.39 83.25 83.25 0 45.84-37.39 83.26-83.25 83.26-45.84 0-83.25-37.42-83.25-83.26 0-45.86 37.41-83.25 83.25-83.25z"/><path d="M256 207.905c-51.406 0-93.228-41.826-93.228-93.238 0-51.406 41.822-93.228 93.228-93.228s93.228 41.822 93.228 93.228c0 51.412-41.822 93.238-93.228 93.238zM256 41.395c-40.402 0-73.272 32.87-73.272 73.272 0 40.408 32.87 73.282 73.272 73.282s73.272-32.874 73.272-73.282c0-40.402-32.87-73.272-73.272-73.272zM256 437.395c-5.511 0-9.978-4.467-9.978-9.978v-229.49c0-5.511 4.467-9.978 9.978-9.978s9.978 4.467 9.978 9.978v229.49c0 5.511-4.467 9.978-9.978 9.978zM256 490.561c-40.404 0-78.59-4.64-107.525-13.064-33.634-9.793-50.688-23.274-50.688-40.069 0-16.799 17.054-30.281 50.689-40.073 28.931-8.422 67.118-13.061 107.525-13.061s78.594 4.639 107.525 13.061c33.635 9.792 50.689 23.274 50.689 40.073 0 16.795-17.054 30.276-50.688 40.069C334.59 485.921 296.404 490.561 256 490.561zm0-86.34c-38.575 0-74.783 4.356-101.955 12.267-26.656 7.76-36.331 16.773-36.331 20.939 0 4.163 9.676 13.175 36.332 20.937 27.175 7.912 63.383 12.27 101.955 12.27s74.779-4.357 101.955-12.27c26.656-7.762 36.332-16.773 36.332-20.937 0-4.166-9.675-13.18-36.331-20.939-27.174-7.911-63.382-12.267-101.956-12.267z"/></svg>经纬度</span>
              <span class="data-value">${escapeHtml(destCoords)}</span>
            </div>
            <div class="data-row">
              <span class="data-label"><svg class="city-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M972.8 902.4h-768v-153.6c0-25.6-19.2-51.2-51.2-51.2-25.6 0-51.2 19.2-51.2 51.2v192c0 6.4 0 12.8 6.4 19.2 6.4 25.6 25.6 44.8 44.8 44.8h819.2c25.6 0 51.2-19.2 51.2-51.2s-19.2-51.2-51.2-51.2zM294.4 748.8c6.4 12.8 12.8 25.6 25.6 32 6.4 6.4 12.8 6.4 25.6 6.4 19.2 0 32-12.8 44.8-25.6l192-377.6 89.6 352c6.4 19.2 19.2 32 44.8 38.4 19.2 0 38.4-12.8 44.8-25.6l64-128 76.8 147.2c6.4 19.2 25.6 25.6 44.8 25.6 6.4 0 19.2 0 25.6-6.4 12.8-6.4 19.2-19.2 25.6-32 6.4-12.8 0-25.6-6.4-38.4l-121.6-230.4c-6.4-19.2-25.6-25.6-44.8-25.6-19.2 0-32 12.8-44.8 25.6l-51.2 96-83.2-345.6c-6.4-19.2-25.6-38.4-51.2-38.4-19.2 0-32 12.8-44.8 25.6l-256 486.4c-6.4 12.8-6.4 25.6 0 38.4zM102.4 211.2c0 25.6 25.6 44.8 51.2 44.8s51.2-19.2 51.2-51.2V192l25.6 25.6c6.4 6.4 19.2 12.8 32 12.8s25.6-6.4 32-12.8c12.8-12.8 19.2-25.6 19.2-38.4 0-12.8-6.4-25.6-12.8-32L192 38.4C185.6 32 172.8 25.6 160 25.6s-25.6 6.4-32 12.8L12.8 147.2c-6.4 6.4-12.8 19.2-12.8 32s6.4 25.6 12.8 38.4c6.4 6.4 19.2 12.8 32 12.8s25.6-6.4 32-12.8l19.2-19.2v12.8zM204.8 345.6c0-25.6-19.2-51.2-51.2-51.2-25.6 0-51.2 25.6-51.2 51.2v64c0 25.6 19.2 51.2 51.2 51.2 25.6 0 51.2-19.2 51.2-51.2v-64zM153.6 499.2c-25.6 0-51.2 19.2-51.2 44.8v64c0 25.6 19.2 51.2 51.2 51.2 25.6 0 51.2-19.2 51.2-51.2v-64c0-25.6-25.6-44.8-51.2-44.8z"/></svg>海拔高度</span>
              <span class="data-value">${escapeHtml(destElevation)}</span>
            </div>
            <div class="data-row">
              <span class="data-label"><svg class="city-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M914 864.7h-34.2V526.2c0-11.6-9.4-21-21-21h-49.9v-11.3c0-4.4-3.6-8-8-8h-57.1c-4.4 0-8 3.6-8 8v11.3H690v-246c0-11.6-9.4-21-21-21h-80.1v-35.4c0-11.6-9.4-21-21-21H525v-35.5c0-7.2-5.8-13-13-13s-13 5.8-13 13v35.5h-42.9c-11.6 0-21 9.4-21 21v35.4H355c-11.6 0-21 9.4-21 21v246h-45.8v-11.3c0-4.4-3.6-8-8-8h-57.1c-4.4 0-8 3.6-8 8v11.3h-49.9c-11.6 0-21 9.4-21 21v338.5H110c-7.2 0-13 5.8-13 13s5.8 13 13 13h804c7.2 0 13-5.8 13-13s-5.8-13-13-13zM461.1 207.8h101.7v28.7H461.1v-28.7zm229.7 323.4h163v332h-163v-332zM360 264.2h304v599H360v-599zm-189.8 267h163v332h-163v-332z"/><path d="M470.1 354h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 354h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM470.1 481h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 481h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13 5.8 13 13s-5.8 13-13 13zM470.1 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM470.1 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM598.1 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM794.3 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM794.3 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM273.7 610h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13zM273.7 737h-44c-7.2 0-13 5.8-13 13s5.8 13 13 13h44c7.2 0 13-5.8 13-13s-5.8-13-13-13z"/></svg>所处城市</span>
              <span class="data-value">${escapeHtml(destCity)}</span>
            </div>
          </div>
        </div>

          <div class="info-card" style="margin-bottom: 14px;">
            <div class="section-header">
              <div class="airport-header-title">
                <svg class="section-flight-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M778.6 436.8l-47.9-3.4-279.5-327.3C429.2 78 407.9 64 387.4 64h-38.7l177 378.3-245.6 18.2-96-107.4h-74.4l98.4 150.5-98.2 165.3h74.3l95.9-107.4 245.6 18.2-177 380.3h38.7c20.5 0 41.8-14.1 63.8-42.1l279.4-327.1 47.9-3.4c11.4-1.5 21.9-2.9 31.4-3.9 9.5-1.2 21.9-3.6 37-7.5 15.2-3.7 30.2-11.7 45-23.9s22.3-25.5 22.3-39.9c0.1-42.8-45.2-67.8-135.6-75.4z"></path></svg>
                <span class="section-title">执飞信息</span>
              </div>
            </div>
          <div class="flight-stats">
            <div>
              <div class="data-label">机长 <svg class="coordinate-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M367.936 600a32 32 0 0 1 26.112 13.504l104.96 148.16a16 16 0 0 0 26.048 0.128l106.496-148.48a32 32 0 0 1 25.984-13.312h68.48A169.984 169.984 0 0 1 896 769.984v110.016c0 44.16-35.84 80-80 80h-608C163.84 960 128 924.16 128 880v-110.016a169.984 169.984 0 0 1 169.984-169.984H368z m-106.88-418.56c-1.088-51.264 126.912-121.344 247.68-117.248 120.832 3.904 231.552 60.992 250.56 99.136 19.2 37.952-41.28 80.128-68.48 90.88v0.064c0.384 0.96 6.4 17.536 4.16 33.536 1.536 7.68 2.88 16.192 3.584 26.88 1.792 29.248 16.64 231.552-169.856 250.88 0 0-215.168-4.16-196.48-249.984-5.504-7.424-8.448-12.672-8.448-12.672s-0.512-12.096-0.384-24.384V277.12c0.128-9.28 0.64-18.432 1.984-22.592 0 0-63.36-22.08-64.384-73.216z m399.104 34.24H351.232v36.416h308.928V215.68zM518.592 101.568c-22.592 0-40.832 16.896-40.832 37.568 0 1.664 0.192 3.392 0.448 4.928-19.776-1.664-36.224 0.384-36.928 0.384l0.96 0.384c29.568 12.288 43.392 21.44 44.48 22.144 9.28 7.808 20.736 9.6 29.76 9.6 0.768 0 1.472 0.192 2.112 0.192a41.6 41.6 0 0 0 10.688-1.408 19.712 19.712 0 0 0 2.944-0.64c0.32-0.064 0.576-0.32 0.768-0.384a43.392 43.392 0 0 0 9.472-4.608c6.4-3.136 12.864-6.208 19.328-9.216l1.472-0.64 1.408-0.704 31.104-14.656a526.08 526.08 0 0 0-37.248 2.368 36.48 36.48 0 0 0 0.896-7.744c0-20.672-18.176-37.568-40.832-37.568z"></path></svg></div>
              <div class="data-value" style="margin-top: 8px;">${escapeHtml(pilot.cid || '--')}</div>
            </div>
            <div>
              <div class="data-label">机型 <svg class="coordinate-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M778.6 436.8l-47.9-3.4-279.5-327.3C429.2 78 407.9 64 387.4 64h-38.7l177 378.3-245.6 18.2-96-107.4h-74.4l98.4 150.5-98.2 165.3h74.3l95.9-107.4 245.6 18.2-177 380.3h38.7c20.5 0 41.8-14.1 63.8-42.1l279.4-327.1 47.9-3.4c11.4-1.5 21.9-2.9 31.4-3.9 9.5-1.2 21.9-3.6 37-7.5 15.2-3.7 30.2-11.7 45-23.9s22.3-25.5 22.3-39.9c0.1-42.8-45.2-67.8-135.6-75.4z"></path></svg></div>
              <div class="data-value" style="margin-top: 8px;">${escapeHtml(equipment)}</div>
            </div>
            <div>
              <div class="data-label">经纬度 <svg class="coordinate-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M738.924 336.716c0-124.538-108.555-225.474-242.446-225.474S254.033 212.179 254.033 336.716c0 150.316 242.445 413.37 242.445 413.37s242.446-263.054 242.446-413.37z m-343.463 0c0-51.875 45.24-93.948 101.019-93.948s101.018 42.073 101.018 93.948c0 51.855-45.24 93.948-101.018 93.948s-101.02-42.093-101.02-93.948zM334.85 787.665h323.26v75.158H334.85v-75.158z"></path></svg></div>
              <div class="data-value" style="margin-top: 8px;">${latDisplay} ${lonDisplay}</div>
            </div>
            <div>
              <div class="data-label">地速/高度 📈</div>
              <div class="data-value" style="margin-top: 8px;">${escapeHtml(groundSpeed)}kt / ${escapeHtml(altitudeFeet)}</div>
            </div>
          </div>
          <div class="flight-details">
            <div class="nd-column">
            <div class="nd-placeholder" aria-label="飞行姿态 ND">
              <div class="nd-display"><div class="nd-window">
                <div class="nd-roll-scale"><span></span><span></span><span></span><span></span><span></span><span></span></div>
                <div class="nd-attitude-mask"><div class="nd-attitude" style="transform: translateY(${(-pitch * 4.6).toFixed(1)}px) rotate(${bank.toFixed(1)}deg)">
                  <div class="nd-sky"></div><div class="nd-ground"></div><div class="nd-horizon"></div>${ndPitchMarks}
                </div></div>
                <div class="nd-aircraft"><i></i></div>
              </div></div>
            </div>
            <div class="aircraft-state-panel">
              <div class="aircraft-state-title">当前状态</div>
              <div class="aircraft-state-list">${aircraftStateHtml}</div>
              ${controllerStateHtml}
            </div>
            </div>
            <div class="flight-details-content"><div class="map-placeholder"><div id="flight-map"></div><div id="map-status">正在加载地图…</div></div>
            </div>
          </div>
        </div>
      </div>
      <script>
        const loadMapboxGl = async () => {
          if (window.mapboxgl) return
          const sources = [
            'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js',
            'https://cdn.jsdelivr.net/npm/mapbox-gl@3.12.0/dist/mapbox-gl.js',
            'https://unpkg.com/mapbox-gl@3.12.0/dist/mapbox-gl.js',
          ]
          for (const source of sources) {
            try {
              await new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = source
                script.async = true
                script.onload = () => window.mapboxgl ? resolve(undefined) : reject(new Error('Mapbox GL 脚本无效'))
                script.onerror = () => reject(new Error('脚本请求失败'))
                document.head.appendChild(script)
              })
              return
            } catch {}
          }
          throw new Error('所有 Mapbox GL CDN 均无法加载')
        }
        ;(async () => {
          const container = document.getElementById('flight-map')
          const status = document.getElementById('map-status')
          const flight = ${mapData}
          const token = ${mapToken}
          const icons = { departure: '${MAP_DEPARTURE_ICON}', arrival: '${MAP_ARRIVAL_ICON}', vor: '${MAP_VOR_ICON}', waypoint: '${MAP_WAYPOINT_ICON}', aircraft: '${MAP_AIRCRAFT_ICON}' }
          // 截图端只在此标记为 true 后再截图；不要把地图图层或标记的异步绘制遗漏掉。
          window.__flightMapReady = false
          const finish = (message) => { status.textContent = message || ''; window.__flightMapReady = true }
          if (!token) return finish('未配置 Mapbox access token')
          try {
            await loadMapboxGl()
          } catch (error) {
            return finish(error instanceof Error ? error.message : 'Mapbox GL 加载失败')
          }
          mapboxgl.accessToken = token
          const map = new mapboxgl.Map({ container, style: 'mapbox://styles/mapbox/dark-v11', center: [116.4, 39.9], zoom: 2, attributionControl: false, preserveDrawingBuffer: true })
          const addMarker = (icon, point, title, waypoint = false, rotation = 0) => {
            if (!point || !icons[icon]) return null
            const element = document.createElement(icon === 'aircraft' ? 'div' : 'img')
            if (icon === 'aircraft') {
              element.className = 'map-aircraft-marker'
              const image = document.createElement('img')
              image.src = icons[icon]
              image.className = 'map-aircraft-image'
              image.style.transform = 'rotate(' + rotation + 'deg)'
              element.appendChild(image)
            } else {
              element.src = icons[icon]
              element.className = 'map-marker' + (waypoint ? ' map-waypoint-marker' : '')
            }
            element.title = title || ''
            // 起降机场和航路点图标均为中心对称图形，须以中心锚定到航段端点。
            // 使用 bottom 会令图标中心与航线端点相差半个图标高度。
            new mapboxgl.Marker({ element, anchor: 'center' }).setLngLat([point.lon, point.lat]).addTo(map)
            return element
          }
          const waitForMarker = (element) => {
            if (!element || element.tagName !== 'IMG' || element.complete) return Promise.resolve()
            return new Promise(resolve => {
              element.addEventListener('load', resolve, { once: true })
              element.addEventListener('error', resolve, { once: true })
            })
          }
          const addWaypointLabel = (point) => {
            if (!point || !point.name) return null
            const routeIndex = flight.route.findIndex(routePoint => routePoint.lon === point.lon && routePoint.lat === point.lat)
            const previous = routeIndex > 0 ? flight.route[routeIndex - 1] : null
            const next = routeIndex >= 0 && routeIndex < flight.route.length - 1 ? flight.route[routeIndex + 1] : null
            const from = previous || point
            const to = next || point
            const dx = to.lon - from.lon
            const dy = to.lat - from.lat
            const length = Math.hypot(dx, dy)
            // 标签沿航段法线偏移，使其落在航线旁而不是压在航线上。
            const offset = length
              ? [Math.round(-dy / length * 38), Math.round(-dx / length * 38)]
              : [26, -26]
            const element = document.createElement('span')
            element.className = 'map-waypoint-label'
            element.textContent = point.name
            new mapboxgl.Marker({ element, anchor: 'center', offset }).setLngLat([point.lon, point.lat]).addTo(map)
            return element
          }
          map.on('load', () => {
            let mapIdle = false
            let markersReady = false
            let completed = false
            const completeWhenRendered = () => {
              if (completed || !mapIdle || !markersReady) return
              completed = true
              requestAnimationFrame(() => requestAnimationFrame(() => finish()))
            }
            // 必须在添加图层之前注册：否则地图很快进入 idle 时会错过事件并让截图一直等待。
            map.once('idle', () => {
              mapIdle = true
              completeWhenRendered()
            })
            if (flight.route.length >= 2) {
              // 每两个相邻航路点各自生成一个航段，确保航线严格按航路点顺序绘制。
              const segments = flight.route.slice(1).map((point, index) => ({
                type: 'Feature',
                properties: { segment: index },
                geometry: { type: 'LineString', coordinates: [[flight.route[index].lon, flight.route[index].lat], [point.lon, point.lat]] },
              }))
              map.addSource('flight-route', { type: 'geojson', data: { type: 'FeatureCollection', features: segments } })
              map.addLayer({ id: 'flight-route', type: 'line', source: 'flight-route', paint: { 'line-color': '#ff69b4', 'line-opacity': 0.3, 'line-width': 3 } })
            }
            const markers = [
              addMarker('departure', flight.departure, flight.departure && flight.departure.name),
              addMarker('arrival', flight.arrival, flight.arrival && flight.arrival.name),
              ...flight.waypoints.map(point => addMarker(point.isVor ? 'vor' : 'waypoint', point, point.name, true)),
              ...flight.waypoints.map(point => addWaypointLabel(point)),
              addMarker('aircraft', flight.aircraft, flight.aircraft && flight.aircraft.name, false, flight.aircraft ? flight.aircraft.heading - 45 : 0),
            ]
            // 截图边界必须同时覆盖计划起降机场及完整航路点；飞机实时位置
            // 不参与缩放，避免偏离航路时把地图不必要地拉远。
            if (flight.departure && flight.arrival) {
              const bounds = new mapboxgl.LngLatBounds()
              bounds.extend([flight.departure.lon, flight.departure.lat])
              bounds.extend([flight.arrival.lon, flight.arrival.lat])
              flight.route.forEach(point => bounds.extend([point.lon, point.lat]))
              map.fitBounds(bounds, { padding: 72, maxZoom: 7, duration: 0 })
            } else if (flight.route.length) {
              // 缺少任一机场坐标时才退回以可用航路点确定视野。
              const bounds = new mapboxgl.LngLatBounds()
              flight.route.forEach(point => bounds.extend([point.lon, point.lat]))
              map.fitBounds(bounds, { padding: 72, maxZoom: 7, duration: 0 })
            } else if (flight.aircraft) {
              map.flyTo({ center: [flight.aircraft.lon, flight.aircraft.lat], zoom: 4.5, duration: 0 })
            }
            Promise.all(markers.map(waitForMarker)).then(() => {
              markersReady = true
              completeWhenRendered()
              map.triggerRepaint()
            })
            // 个别 Mapbox 图块会持续重试而永不触发 idle；此时已加载的底图、航段和点位仍可安全截图。
            setTimeout(() => {
              mapIdle = true
              markersReady = true
              completeWhenRendered()
            }, 5000)
          })
          map.on('error', event => finish('地图加载失败：' + (event.error && event.error.message ? event.error.message : '未知错误')))
        })()
      </script>
    </body>
  </html>
  `
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('xflysim-online-list')

  ctx.command(config.command, '查询 XFLYSIM 在线列表')
    .alias(config.alias)
    .action(async () => {
      try {
        if (config.enableLog) logger.info('开始查询在线列表')
        const data = await fetchOnlineList(config)
        if (config.enableLog) logger.info(`获取到 ${data.pilots?.length || 0} 个飞行员，${data.controllers?.length || 0} 个管制员`)
        const enriched = {
          ...data,
          pilots: await enrichPilots(data.pilots || [], config.timeout, config.satoken),
        }
        if (config.enableLog) logger.info('开始生成截图')
        const page = await ctx.puppeteer.page()
        try {
          // 先以配置尺寸渲染，再根据实际内容调整宽度；截图高度由 fullPage 自动延展。
          await page.setViewport({ width: Math.max(320, config.viewportWidth), height: Math.max(320, config.viewportHeight) })
          await page.setContent(buildHtml(enriched, config), { waitUntil: 'load' })
          await page.evaluate(async () => {
            await document.fonts?.ready
            await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
          })
          const contentWidth = await page.evaluate(() => Math.ceil(Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth,
          )))
          if (contentWidth > 0) {
            await page.setViewport({
              width: Math.min(Math.max(320, contentWidth), 4096),
              height: Math.max(320, config.viewportHeight),
            })
          }
          await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
          if (config.enableLog) logger.info(`截图尺寸: ${contentWidth}px`)
          const buffer = await page.screenshot({ type: 'jpeg', quality: 92, fullPage: true })
          if (config.enableLog) logger.info('截图生成成功')
          return h.image(buffer, 'image/jpeg')
        } finally {
          await page.close()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        logger.error(message)
        if (config.enableLog) logger.error('查询失败', error)
        return `查询失败: ${message}`
      }
    })

  if (config.enableResume) {
    ctx.command('简历 <cid:string>', '查询 XFLYSIM 用户简历')
      .alias('查看简历')
      .option('v', '-v <money:number>')
      .action(async (argv, cid) => {
        const target = String(cid || '').trim()
        if (!target) return '请提供 CID，例如：简历 9981'
        try {
          if (config.enableLog) logger.info(`查询简历: ${target}`)
          const record = await fetchResume(target, config)
          if (!record) {
            if (config.enableLog) logger.warn(`未找到 CID ${target}`)
            return `未找到 CID ${target} 的用户信息`
          }
          if (config.enableLog) logger.info('开始生成简历截图')
          const page = await ctx.puppeteer.page()
          try {
            await page.setViewport({ width: Math.max(320, config.viewportWidth), height: 320 })
            const resumeData = buildResumeRecord(record as Record<string, any>)
            const virtualMoney = Number((argv as any).options?.v)
            if (Number.isFinite(virtualMoney)) resumeData.money = `¥${virtualMoney.toFixed(2)}`
            await page.setContent(buildResumeHtml(resumeData), { waitUntil: 'load' })
            await page.evaluate(async () => {
              await document.fonts?.ready
              await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            })
            const buffer = await page.screenshot({ type: 'jpeg', quality: 92, fullPage: true })
            if (config.enableLog) logger.info('简历截图生成成功')
            return h.image(buffer, 'image/jpeg')
          } finally { await page.close() }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          logger.error(message)
          if (config.enableLog) logger.error('查询简历失败', error)
          return `查询简历失败: ${message}`
        }
      })
  }

  if (config.enableFlight) {
    ctx.command(`${config.flightCommand} <callsign:string>`, '查询指定呼号的航班信息')
      .action(async (_, callsign) => {
        const target = String(callsign || '').trim().toUpperCase()
        if (!target) return '请提供呼号，例如：航班 XFS5867'
        try {
          if (config.enableLog) logger.info(`查询航班: ${target}`)
          const data = await fetchOnlineList(config)
          const pilot = (data.pilots || []).find(p => (p.callsign || '').toUpperCase() === target)
          if (!pilot) {
            if (config.enableLog) logger.warn(`未找到呼号 ${target}`)
            return `未找到呼号 ${target} 的航班`
          }
          if (config.enableLog) logger.info(`找到航班: ${pilot.callsign}, 机型: ${pilot.aircraft?.equipment || pilot.flightPlan?.aircraft}`)
          const enriched = (await enrichPilots([pilot], config.timeout, config.satoken))[0]
          if (config.enableLog) logger.info('开始生成航班截图')
          const page = await ctx.puppeteer.page()
          try {
            await page.setViewport({ width: Math.max(320, config.viewportWidth), height: Math.max(320, config.viewportHeight) })
            await page.setContent(buildFlightHtml(enriched, config), { waitUntil: 'load' })
            const contentWidth = await page.evaluate(() => Math.ceil(Math.max(
              document.documentElement.scrollWidth,
              document.body.scrollWidth,
            )))
            if (contentWidth > 0) {
              await page.setViewport({
                width: Math.min(Math.max(320, contentWidth), 4096),
                height: Math.max(320, config.viewportHeight),
              })
            }
            // 最终视口会触发地图重排，因此需在其后等待底图、所有点位图标和各航段全部绘制。
            await page.evaluate(() => window.dispatchEvent(new Event('resize')))
            await page.waitForFunction(() => (window as any).__flightMapReady === true, { timeout: config.timeout })
            await new Promise(resolve => setTimeout(resolve, 250))
            if (config.enableLog) logger.info(`航班截图尺寸: ${contentWidth}px`)
            const buffer = await page.screenshot({ type: 'jpeg', quality: 92, fullPage: true })
            if (config.enableLog) logger.info('航班截图生成成功')
            return h.image(buffer, 'image/jpeg')
          } finally {
            await page.close()
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          logger.error(message)
          if (config.enableLog) logger.error('查询航班失败', error)
          return `查询航班失败: ${message}`
        }
      })
  }
}
