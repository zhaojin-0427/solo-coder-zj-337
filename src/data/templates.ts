import type { CeremonyTemplate, MaterialItem, RehearsalRole, StepCommand } from '@/types'
import { generateId } from '@/utils/id'
import { DEFAULT_ROLE_COLORS } from '@/types'

export const materialItems: MaterialItem[] = [
  { type: 'seat-main', category: 'seat', name: '主位', defaultWidth: 80, defaultHeight: 80, icon: 'crown' },
  { type: 'seat-host', category: 'seat', name: '主人位', defaultWidth: 70, defaultHeight: 70, icon: 'user' },
  { type: 'seat-guest', category: 'seat', name: '宾位', defaultWidth: 70, defaultHeight: 70, icon: 'user-circle' },
  { type: 'seat-secondary', category: 'seat', name: '次宾位', defaultWidth: 60, defaultHeight: 60, icon: 'users' },
  { type: 'table', category: 'table', name: '案几', defaultWidth: 120, defaultHeight: 60, icon: 'table' },
  { type: 'table-low', category: 'table', name: '矮几', defaultWidth: 100, defaultHeight: 50, icon: 'minus' },
  { type: 'mat', category: 'mat', name: '主席', defaultWidth: 90, defaultHeight: 90, icon: 'square' },
  { type: 'mat-guest', category: 'mat', name: '客席', defaultWidth: 80, defaultHeight: 80, icon: 'square-dashed' },
  { type: 'vessel-tea', category: 'vessel', name: '茶盏', defaultWidth: 30, defaultHeight: 30, icon: 'coffee' },
  { type: 'vessel-wine', category: 'vessel', name: '酒爵', defaultWidth: 35, defaultHeight: 35, icon: 'wine' },
  { type: 'vessel-water', category: 'vessel', name: '沃盥器', defaultWidth: 40, defaultHeight: 40, icon: 'droplets' },
  { type: 'vessel-fruit', category: 'vessel', name: '果盘', defaultWidth: 45, defaultHeight: 35, icon: 'apple' },
  { type: 'incense', category: 'decor', name: '香炉', defaultWidth: 35, defaultHeight: 40, icon: 'flame' },
  { type: 'candle', category: 'decor', name: '烛台', defaultWidth: 25, defaultHeight: 45, icon: 'lamp' },
  { type: 'scroll', category: 'decor', name: '卷轴', defaultWidth: 50, defaultHeight: 30, icon: 'scroll' },
  { type: 'flower', category: 'decor', name: '花艺', defaultWidth: 40, defaultHeight: 50, icon: 'flower' },
]

const welcomeRoles: RehearsalRole[] = [
  { id: 'role-welcome-1', name: '主人', description: '仪式主持者，迎宾行礼', color: DEFAULT_ROLE_COLORS[0], order: 1 },
  { id: 'role-welcome-2', name: '宾客', description: '受邀来宾', color: DEFAULT_ROLE_COLORS[1], order: 2 },
  { id: 'role-welcome-3', name: '赞礼', description: '唱赞司仪', color: DEFAULT_ROLE_COLORS[2], order: 3 },
  { id: 'role-welcome-4', name: '引宾', description: '引导宾客入内', color: DEFAULT_ROLE_COLORS[3], order: 4 },
]

const welcomeSteps = [
  { id: 'w1', order: 1, title: '主人迎宾', description: '主人立于门内，宾客至，主人出迎。主人在东，宾客在西，相对而立。', direction: '东', involvedElements: ['host-seat', 'guest-seat'], gesture: '揖礼', duration: '三揖三让' },
  { id: 'w2', order: 2, title: '三揖三让', description: '主人与宾客互行揖礼，三次谦让后，主人引宾客入内。每揖一步，每让一退。', direction: '东西相向', involvedElements: ['host-seat', 'guest-seat', 'main-table'], gesture: '揖礼', duration: '三揖' },
  { id: 'w3', order: 3, title: '升堂就位', description: '主人引宾客升堂，宾客从西阶上，主人从东阶上。各就其位，正立。', direction: '东西对坐', involvedElements: ['host-seat', 'guest-seat', 'main-table'], gesture: '正立', duration: '—' },
  { id: 'w4', order: 4, title: '宾主再拜', description: '宾主坐定后，互行再拜之礼。先宾拜主，后主答拜。', direction: '对拜', involvedElements: ['host-seat', 'guest-seat'], gesture: '再拜', duration: '两拜' },
  { id: 'w5', order: 5, title: '礼毕送宾', description: '礼毕，主人送宾客于门外，再拜而别。宾客不答拜，主人返。', direction: '西出', involvedElements: ['host-seat', 'guest-seat'], gesture: '再拜', duration: '—' },
]

const welcomeElements = [
  { id: 'host-seat', type: 'seat-host' as const, x: 420, y: 150, width: 70, height: 70, rotation: 0, label: '主人', role: '主人', roleId: 'role-welcome-1', zIndex: 2 },
  { id: 'guest-seat', type: 'seat-guest' as const, x: 180, y: 150, width: 70, height: 70, rotation: 0, label: '宾客', role: '宾客', roleId: 'role-welcome-2', zIndex: 2 },
  { id: 'main-table', type: 'table' as const, x: 290, y: 230, width: 120, height: 60, rotation: 0, label: '案几', zIndex: 1 },
  { id: 'mat-host', type: 'mat' as const, x: 410, y: 140, width: 90, height: 90, rotation: 0, label: '主席', role: '主人', roleId: 'role-welcome-1', zIndex: 0 },
  { id: 'mat-guest', type: 'mat-guest' as const, x: 170, y: 140, width: 90, height: 90, rotation: 0, label: '客席', role: '宾客', roleId: 'role-welcome-2', zIndex: 0 },
  { id: 'candle-l', type: 'candle' as const, x: 280, y: 80, width: 25, height: 45, rotation: 0, label: '烛台', role: '赞礼', roleId: 'role-welcome-3', zIndex: 1 },
  { id: 'candle-r', type: 'candle' as const, x: 395, y: 80, width: 25, height: 45, rotation: 0, label: '烛台', role: '赞礼', roleId: 'role-welcome-3', zIndex: 1 },
]

function createWelcomeCommands(roles: RehearsalRole[]): StepCommand[] {
  const hostRole = roles[0]?.id
  const guestRole = roles[1]?.id
  const zanliRole = roles[2]?.id
  const yinbinRole = roles[3]?.id
  return [
    { id: generateId('cmd'), stepId: 'w1', commandText: '宾至，请主人出迎', executorRoleId: zanliRole || '', beatType: 'instant', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'w1', commandText: '出迎', executorRoleId: hostRole || '', beatType: 'signal', beatValue: '赞礼唱毕', waitConditions: [{ type: 'signal', description: '听赞礼唱毕' }] },
    { id: generateId('cmd'), stepId: 'w2', commandText: '请行三揖三让之礼', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'w2', commandText: '一揖、再揖、三揖', executorRoleId: hostRole || '', beatType: 'countdown', beatCountdown: 3, waitConditions: [] },
    { id: generateId('cmd'), stepId: 'w2', commandText: '一让、再让、三让', executorRoleId: guestRole || '', beatType: 'countdown', beatCountdown: 3, waitConditions: [{ type: 'previous-finish', description: '主人三揖毕' }] },
    { id: generateId('cmd'), stepId: 'w3', commandText: '引宾升堂', executorRoleId: yinbinRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'w3', commandText: '各就各位，正立', executorRoleId: zanliRole || '', beatType: 'signal', waitConditions: [{ type: 'signal', description: '宾客到位' }] },
    { id: generateId('cmd'), stepId: 'w4', commandText: '请宾主再拜', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'w4', commandText: '再拜', executorRoleId: guestRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'w4', commandText: '答拜', executorRoleId: hostRole || '', beatType: 'signal', waitConditions: [{ type: 'signal', description: '宾客拜毕' }] },
    { id: generateId('cmd'), stepId: 'w5', commandText: '礼毕，送宾', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'w5', commandText: '送宾至门外', executorRoleId: hostRole || '', beatType: 'instant', waitConditions: [] },
  ]
}

const teaRoles: RehearsalRole[] = [
  { id: 'role-tea-1', name: '主人', description: '奉茶者', color: DEFAULT_ROLE_COLORS[0], order: 1 },
  { id: 'role-tea-2', name: '宾客', description: '品茶者', color: DEFAULT_ROLE_COLORS[1], order: 2 },
  { id: 'role-tea-3', name: '奉茶人', description: '递送茶盏', color: DEFAULT_ROLE_COLORS[2], order: 3 },
  { id: 'role-tea-4', name: '赞礼', description: '唱赞司仪', color: DEFAULT_ROLE_COLORS[3], order: 4 },
]

const teaSteps = [
  { id: 't1', order: 1, title: '备茶', description: '主人先行净手，备好茶具。茶盏置于案几右侧，茶壶置于左侧。', direction: '东向', involvedElements: ['host-seat', 'main-table', 'tea-pot', 'tea-cup'], gesture: '净手', duration: '—' },
  { id: 't2', order: 2, title: '投茶', description: '取茶入盏，量宜适中。茶末轻投入盏，不可扬起。', direction: '—', involvedElements: ['tea-pot', 'tea-cup'], deliveryRoute: { from: 'tea-pot', to: 'tea-cup', item: '茶末' }, gesture: '投茶', duration: '一次' },
  { id: 't3', order: 3, title: '注水', description: '沸水注入盏中，先注少许温润，再注至七分满。水流宜缓，不可溅出。', direction: '—', involvedElements: ['water-vessel', 'tea-cup'], deliveryRoute: { from: 'water-vessel', to: 'tea-cup', item: '沸水' }, gesture: '注水', duration: '三注' },
  { id: 't4', order: 4, title: '奉茶', description: '主人双手奉茶盏，齐眉而进。宾客起身答礼，双手接盏。', direction: '西向奉茶', involvedElements: ['host-seat', 'guest-seat', 'tea-cup'], deliveryRoute: { from: 'host-seat', to: 'guest-seat', item: '茶盏' }, gesture: '奉茶礼', duration: '—' },
  { id: 't5', order: 5, title: '品茗', description: '宾客接盏后，先谢茶，再观色、闻香、品味。三口为品。', direction: '—', involvedElements: ['guest-seat', 'tea-cup'], gesture: '品茗', duration: '三口' },
  { id: 't6', order: 6, title: '谢茶', description: '品毕，宾客致谢，主人答礼。茶礼完成。', direction: '对拜', involvedElements: ['host-seat', 'guest-seat'], gesture: '再拜', duration: '—' },
]

const teaElements = [
  { id: 'host-seat', type: 'seat-host' as const, x: 420, y: 160, width: 70, height: 70, rotation: 0, label: '主人', role: '主人', roleId: 'role-tea-1', zIndex: 2 },
  { id: 'guest-seat', type: 'seat-guest' as const, x: 180, y: 160, width: 70, height: 70, rotation: 0, label: '宾客', role: '宾客', roleId: 'role-tea-2', zIndex: 2 },
  { id: 'main-table', type: 'table' as const, x: 270, y: 240, width: 160, height: 70, rotation: 0, label: '茶案', role: '奉茶人', roleId: 'role-tea-3', zIndex: 1 },
  { id: 'tea-pot', type: 'vessel-tea' as const, x: 290, y: 255, width: 35, height: 35, rotation: 0, label: '茶壶', role: '奉茶人', roleId: 'role-tea-3', zIndex: 2 },
  { id: 'tea-cup', type: 'vessel-tea' as const, x: 370, y: 255, width: 30, height: 30, rotation: 0, label: '茶盏', role: '奉茶人', roleId: 'role-tea-3', zIndex: 2 },
  { id: 'water-vessel', type: 'vessel-water' as const, x: 335, y: 250, width: 40, height: 40, rotation: 0, label: '水盂', role: '奉茶人', roleId: 'role-tea-3', zIndex: 2 },
  { id: 'incense', type: 'incense' as const, x: 420, y: 250, width: 35, height: 40, rotation: 0, label: '香炉', role: '赞礼', roleId: 'role-tea-4', zIndex: 2 },
  { id: 'flower', type: 'flower' as const, x: 275, y: 245, width: 35, height: 45, rotation: 0, label: '插花', role: '赞礼', roleId: 'role-tea-4', zIndex: 2 },
]

function createTeaCommands(roles: RehearsalRole[]): StepCommand[] {
  const hostRole = roles[0]?.id
  const guestRole = roles[1]?.id
  const fengchaRole = roles[2]?.id
  const zanliRole = roles[3]?.id
  return [
    { id: generateId('cmd'), stepId: 't1', commandText: '茶礼始，请备茶', executorRoleId: zanliRole || '', beatType: 'instant', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't1', commandText: '净手、陈设茶具', executorRoleId: hostRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't2', commandText: '投茶入盏', executorRoleId: fengchaRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't2', commandText: '投茶一次', executorRoleId: fengchaRole || '', beatType: 'countdown', beatCountdown: 1, waitConditions: [] },
    { id: generateId('cmd'), stepId: 't3', commandText: '注水，先温润再七分满', executorRoleId: fengchaRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't3', commandText: '一注、二注、三注', executorRoleId: fengchaRole || '', beatType: 'countdown', beatCountdown: 3, waitConditions: [] },
    { id: generateId('cmd'), stepId: 't4', commandText: '请奉茶', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't4', commandText: '双手奉茶，齐眉而进', executorRoleId: hostRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't4', commandText: '起身答礼，双手接盏', executorRoleId: guestRole || '', beatType: 'signal', waitConditions: [{ type: 'signal', description: '主人奉茶至前' }] },
    { id: generateId('cmd'), stepId: 't5', commandText: '谢茶、观色、闻香、品茗', executorRoleId: guestRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't5', commandText: '一口、二口、三口', executorRoleId: guestRole || '', beatType: 'countdown', beatCountdown: 3, waitConditions: [] },
    { id: generateId('cmd'), stepId: 't6', commandText: '茶礼毕，宾主互谢', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't6', commandText: '谢茶', executorRoleId: guestRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 't6', commandText: '答礼', executorRoleId: hostRole || '', beatType: 'signal', waitConditions: [{ type: 'signal', description: '宾客谢毕' }] },
  ]
}

const cappingRoles: RehearsalRole[] = [
  { id: 'role-cap-1', name: '主人', description: '冠者之父', color: DEFAULT_ROLE_COLORS[0], order: 1 },
  { id: 'role-cap-2', name: '正宾', description: '行冠礼者', color: DEFAULT_ROLE_COLORS[1], order: 2 },
  { id: 'role-cap-3', name: '冠者', description: '受冠者', color: DEFAULT_ROLE_COLORS[2], order: 3 },
  { id: 'role-cap-4', name: '赞礼', description: '唱赞司仪', color: DEFAULT_ROLE_COLORS[3], order: 4 },
  { id: 'role-cap-5', name: '执事', description: '捧冠执事', color: DEFAULT_ROLE_COLORS[4], order: 5 },
]

const cappingSteps = [
  { id: 'c1', order: 1, title: '筮日戒宾', description: '行冠礼前三日，卜筮吉日，遍告宾朋。宾客至，主人迎于门外。', direction: '南向北立', involvedElements: ['host-seat', 'guest-seat', 'main-table'], gesture: '迎宾礼', duration: '—' },
  { id: 'c2', order: 2, title: '三加之礼', description: '依次加缁布冠、皮弁、爵弁。每加一次，正宾致祝辞。', direction: '东向', involvedElements: ['candidate-seat', 'guest-seat', 'crown-1', 'crown-2', 'crown-3'], deliveryRoute: { from: 'guest-seat', to: 'candidate-seat', item: '冠' }, gesture: '加冠', duration: '三加' },
  { id: 'c3', order: 3, title: '宾字之', description: '冠礼毕，正宾为冠者取字。冠者拜谢，正宾答拜。', direction: '北向拜', involvedElements: ['candidate-seat', 'guest-seat'], gesture: '再拜', duration: '—' },
  { id: 'c4', order: 4, title: '拜见尊长', description: '冠者入内拜见母、兄及诸尊长。各致礼，尊长答拜。', direction: '四向拜', involvedElements: ['candidate-seat', 'mother-seat'], gesture: '拜见礼', duration: '—' },
  { id: 'c5', order: 5, title: '礼毕酬宾', description: '主人设宴酬谢正宾。献酒、荐脯醢，宾受祭卒爵。', direction: '东西对坐', involvedElements: ['host-seat', 'guest-seat', 'main-table', 'wine-vessel'], gesture: '酬宾礼', duration: '—' },
]

const cappingElements = [
  { id: 'host-seat', type: 'seat-main' as const, x: 420, y: 120, width: 80, height: 80, rotation: 0, label: '主人', role: '主人', roleId: 'role-cap-1', zIndex: 2 },
  { id: 'guest-seat', type: 'seat-guest' as const, x: 180, y: 120, width: 70, height: 70, rotation: 0, label: '正宾', role: '正宾', roleId: 'role-cap-2', zIndex: 2 },
  { id: 'candidate-seat', type: 'seat-secondary' as const, x: 300, y: 280, width: 70, height: 70, rotation: 0, label: '冠者', role: '冠者', roleId: 'role-cap-3', zIndex: 2 },
  { id: 'mother-seat', type: 'seat-secondary' as const, x: 80, y: 280, width: 60, height: 60, rotation: 0, label: '母', zIndex: 2 },
  { id: 'main-table', type: 'table' as const, x: 270, y: 190, width: 140, height: 65, rotation: 0, label: '礼案', role: '执事', roleId: 'role-cap-5', zIndex: 1 },
  { id: 'crown-1', type: 'scroll' as const, x: 290, y: 205, width: 40, height: 25, rotation: 0, label: '缁布冠', role: '执事', roleId: 'role-cap-5', zIndex: 2 },
  { id: 'crown-2', type: 'scroll' as const, x: 335, y: 205, width: 40, height: 25, rotation: 0, label: '皮弁', role: '执事', roleId: 'role-cap-5', zIndex: 2 },
  { id: 'crown-3', type: 'scroll' as const, x: 380, y: 205, width: 40, height: 25, rotation: 0, label: '爵弁', role: '执事', roleId: 'role-cap-5', zIndex: 2 },
  { id: 'wine-vessel', type: 'vessel-wine' as const, x: 355, y: 235, width: 35, height: 35, rotation: 0, label: '酒爵', role: '执事', roleId: 'role-cap-5', zIndex: 2 },
  { id: 'incense', type: 'incense' as const, x: 275, y: 230, width: 30, height: 35, rotation: 0, label: '香炉', role: '赞礼', roleId: 'role-cap-4', zIndex: 2 },
]

function createCappingCommands(roles: RehearsalRole[]): StepCommand[] {
  const hostRole = roles[0]?.id
  const zhengbinRole = roles[1]?.id
  const guanzheRole = roles[2]?.id
  const zanliRole = roles[3]?.id
  const zhishiRole = roles[4]?.id
  return [
    { id: generateId('cmd'), stepId: 'c1', commandText: '冠礼始，请主人迎宾', executorRoleId: zanliRole || '', beatType: 'instant', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c1', commandText: '迎正宾入内', executorRoleId: hostRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '行三加之礼，初加缁布冠', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '捧缁布冠进', executorRoleId: zhishiRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '加冠', executorRoleId: zhengbinRole || '', beatType: 'signal', waitConditions: [{ type: 'signal', description: '执事捧冠至' }] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '再加皮弁', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '捧皮弁进', executorRoleId: zhishiRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '加冠', executorRoleId: zhengbinRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '三加爵弁', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '捧爵弁进', executorRoleId: zhishiRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c2', commandText: '加冠', executorRoleId: zhengbinRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c3', commandText: '请正宾为冠者取字', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c3', commandText: '致字辞', executorRoleId: zhengbinRole || '', beatType: 'instant', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c3', commandText: '拜谢正宾', executorRoleId: guanzheRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c4', commandText: '冠者拜见尊长', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c4', commandText: '拜见母及诸尊长', executorRoleId: guanzheRole || '', beatType: 'instant', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c5', commandText: '礼毕，酬谢正宾', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 'c5', commandText: '献酒荐馔', executorRoleId: hostRole || '', beatType: 'instant', waitConditions: [] },
  ]
}

const sacrificeRoles: RehearsalRole[] = [
  { id: 'role-sac-1', name: '主祭', description: '主祭者', color: DEFAULT_ROLE_COLORS[0], order: 1 },
  { id: 'role-sac-2', name: '亚献', description: '亚献者', color: DEFAULT_ROLE_COLORS[1], order: 2 },
  { id: 'role-sac-3', name: '终献', description: '终献者', color: DEFAULT_ROLE_COLORS[2], order: 3 },
  { id: 'role-sac-4', name: '赞礼', description: '唱赞司仪', color: DEFAULT_ROLE_COLORS[3], order: 4 },
  { id: 'role-sac-5', name: '执礼', description: '陈设祭品', color: DEFAULT_ROLE_COLORS[4], order: 5 },
  { id: 'role-sac-6', name: '奉茶', description: '奉茶者', color: DEFAULT_ROLE_COLORS[5], order: 6 },
]

const sacrificeSteps = [
  { id: 's1', order: 1, title: '斋戒沐浴', description: '祭前三日，主祭者斋戒。前一日，沐浴更衣，入斋宫。', direction: '—', involvedElements: ['main-seat', 'water-vessel'], gesture: '沃盥', duration: '三日' },
  { id: 's2', order: 2, title: '陈设祭品', description: '设祭器、陈鼎俎、列笾豆。祭品摆放有序，不可错乱。', direction: '南向', involvedElements: ['altar-table', 'fruit-plate', 'wine-vessel', 'incense'], gesture: '陈设', duration: '—' },
  { id: 's3', order: 3, title: '迎神', description: '主祭者率众人迎神。乐作，再拜。神降，享用祭品。', direction: '北向拜', involvedElements: ['main-seat', 'altar-table'], gesture: '再拜', duration: '三跪九叩' },
  { id: 's4', order: 4, title: '初献', description: '主祭者初献爵，奠酒于地。读祝文，致祭告之意。', direction: '北向', involvedElements: ['main-seat', 'wine-vessel'], deliveryRoute: { from: 'main-seat', to: 'altar-table', item: '酒爵' }, gesture: '献爵', duration: '一献' },
  { id: 's5', order: 5, title: '亚献', description: '亚献者再献爵，荐俎豆。礼如初献。', direction: '北向', involvedElements: ['secondary-seat', 'wine-vessel'], deliveryRoute: { from: 'secondary-seat', to: 'altar-table', item: '酒爵' }, gesture: '献爵', duration: '二献' },
  { id: 's6', order: 6, title: '终献', description: '终献者三献爵，荐馔食。三献礼成。', direction: '北向', involvedElements: ['third-seat', 'wine-vessel'], deliveryRoute: { from: 'third-seat', to: 'altar-table', item: '酒爵' }, gesture: '献爵', duration: '三献' },
  { id: 's7', order: 7, title: '送神', description: '祭毕，送神。乐作，再拜。望燎焚祝文。礼成。', direction: '北向拜', involvedElements: ['main-seat', 'altar-table', 'incense'], gesture: '再拜', duration: '—' },
]

const sacrificeElements = [
  { id: 'altar-table', type: 'table' as const, x: 290, y: 80, width: 160, height: 80, rotation: 0, label: '祭案', role: '执礼', roleId: 'role-sac-5', zIndex: 1 },
  { id: 'main-seat', type: 'seat-main' as const, x: 330, y: 260, width: 80, height: 80, rotation: 0, label: '主祭', role: '主祭', roleId: 'role-sac-1', zIndex: 2 },
  { id: 'secondary-seat', type: 'seat-guest' as const, x: 200, y: 260, width: 70, height: 70, rotation: 0, label: '亚献', role: '亚献', roleId: 'role-sac-2', zIndex: 2 },
  { id: 'third-seat', type: 'seat-secondary' as const, x: 460, y: 260, width: 60, height: 60, rotation: 0, label: '终献', role: '终献', roleId: 'role-sac-3', zIndex: 2 },
  { id: 'wine-vessel', type: 'vessel-wine' as const, x: 320, y: 100, width: 35, height: 35, rotation: 0, label: '酒爵', role: '执礼', roleId: 'role-sac-5', zIndex: 2 },
  { id: 'wine-vessel-2', type: 'vessel-wine' as const, x: 360, y: 100, width: 35, height: 35, rotation: 0, label: '酒爵', role: '执礼', roleId: 'role-sac-5', zIndex: 2 },
  { id: 'wine-vessel-3', type: 'vessel-wine' as const, x: 400, y: 100, width: 35, height: 35, rotation: 0, label: '酒爵', role: '执礼', roleId: 'role-sac-5', zIndex: 2 },
  { id: 'fruit-plate', type: 'vessel-fruit' as const, x: 285, y: 95, width: 40, height: 35, rotation: 0, label: '笾豆', role: '执礼', roleId: 'role-sac-5', zIndex: 2 },
  { id: 'incense', type: 'incense' as const, x: 355, y: 140, width: 35, height: 40, rotation: 0, label: '香炉', role: '赞礼', roleId: 'role-sac-4', zIndex: 2 },
  { id: 'candle-l', type: 'candle' as const, x: 260, y: 50, width: 25, height: 45, rotation: 0, label: '烛台', role: '执礼', roleId: 'role-sac-5', zIndex: 1 },
  { id: 'candle-r', type: 'candle' as const, x: 490, y: 50, width: 25, height: 45, rotation: 0, label: '烛台', role: '执礼', roleId: 'role-sac-5', zIndex: 1 },
  { id: 'scroll', type: 'scroll' as const, x: 340, y: 170, width: 50, height: 30, rotation: 0, label: '祝文', role: '赞礼', roleId: 'role-sac-4', zIndex: 2 },
]

function createSacrificeCommands(roles: RehearsalRole[]): StepCommand[] {
  const zhujiaoRole = roles[0]?.id
  const yaxianRole = roles[1]?.id
  const zhongxianRole = roles[2]?.id
  const zanliRole = roles[3]?.id
  const zhiliRole = roles[4]?.id
  return [
    { id: generateId('cmd'), stepId: 's1', commandText: '祭礼始，请斋戒沐浴', executorRoleId: zanliRole || '', beatType: 'instant', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's1', commandText: '沃盥净手', executorRoleId: zhujiaoRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's2', commandText: '陈设祭品', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's2', commandText: '设祭器、陈鼎俎、列笾豆', executorRoleId: zhiliRole || '', beatType: 'instant', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's3', commandText: '乐作，迎神', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's3', commandText: '率众再拜', executorRoleId: zhujiaoRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's3', commandText: '一跪、二跪、三跪，九叩首', executorRoleId: zhujiaoRole || '', beatType: 'countdown', beatCountdown: 3, waitConditions: [] },
    { id: generateId('cmd'), stepId: 's4', commandText: '初献', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's4', commandText: '捧爵进', executorRoleId: zhiliRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's4', commandText: '献爵、奠酒、读祝文', executorRoleId: zhujiaoRole || '', beatType: 'signal', waitConditions: [{ type: 'signal', description: '爵至' }] },
    { id: generateId('cmd'), stepId: 's5', commandText: '亚献', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's5', commandText: '捧爵进', executorRoleId: zhiliRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's5', commandText: '亚献爵，荐俎豆', executorRoleId: yaxianRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's6', commandText: '终献', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's6', commandText: '捧爵进', executorRoleId: zhiliRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's6', commandText: '终献爵，荐馔食', executorRoleId: zhongxianRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's7', commandText: '三献礼成，送神', executorRoleId: zanliRole || '', beatType: 'previous-finish', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's7', commandText: '乐作，再拜', executorRoleId: zhujiaoRole || '', beatType: 'signal', waitConditions: [] },
    { id: generateId('cmd'), stepId: 's7', commandText: '望燎，焚祝文', executorRoleId: zanliRole || '', beatType: 'signal', waitConditions: [] },
  ]
}

export const ceremonyTemplates: CeremonyTemplate[] = [
  {
    scene: 'welcome',
    name: '迎宾礼',
    description: '传统迎宾礼仪，包含三揖三让、升堂就位等仪节。适用于正式场合接待宾客。',
    icon: 'handshake',
    steps: welcomeSteps,
    defaultElements: welcomeElements,
    defaultRoles: welcomeRoles,
    defaultStepCommands: createWelcomeCommands(welcomeRoles),
  },
  {
    scene: 'tea',
    name: '敬茶礼',
    description: '茶道敬茶仪式，包含备茶、投茶、注水、奉茶、品茗等步骤。',
    icon: 'coffee',
    steps: teaSteps,
    defaultElements: teaElements,
    defaultRoles: teaRoles,
    defaultStepCommands: createTeaCommands(teaRoles),
  },
  {
    scene: 'capping',
    name: '冠礼展示',
    description: '古代男子成人礼——冠礼，三加之礼、宾字之、拜见尊长等完整仪节。',
    icon: 'crown',
    steps: cappingSteps,
    defaultElements: cappingElements,
    defaultRoles: cappingRoles,
    defaultStepCommands: createCappingCommands(cappingRoles),
  },
  {
    scene: 'sacrifice',
    name: '祭礼讲解',
    description: '传统祭祀礼仪，含斋戒、陈设、迎神、三献、送神等完整祭仪流程。',
    icon: 'flame',
    steps: sacrificeSteps,
    defaultElements: sacrificeElements,
    defaultRoles: sacrificeRoles,
    defaultStepCommands: createSacrificeCommands(sacrificeRoles),
  },
]

export function getTemplateByScene(scene: string): CeremonyTemplate | undefined {
  return ceremonyTemplates.find(t => t.scene === scene)
}

export function createDefaultElements(scene: string) {
  const template = getTemplateByScene(scene)
  if (!template) return []
  return JSON.parse(JSON.stringify(template.defaultElements))
}

export function createDefaultRoles(scene: string): RehearsalRole[] {
  const template = getTemplateByScene(scene)
  if (!template) return []
  return JSON.parse(JSON.stringify(template.defaultRoles))
}

export function createDefaultStepCommands(scene: string): StepCommand[] {
  const template = getTemplateByScene(scene)
  if (!template || !template.defaultStepCommands) return []
  return JSON.parse(JSON.stringify(template.defaultStepCommands))
}
