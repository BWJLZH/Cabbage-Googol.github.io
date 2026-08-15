// ============ SCHOOL DATA ============
export const SCHOOLS = [
  {
    slug: "tsinghua-university", name: "清华大学", type: "985", province: "北京", city: "北京",
    lat: 40.0075, lng: 116.317,
    admit_line: 690,
    tags: ["空调宿舍", "地铁站", "985", "211", "双一流", "独立卫浴", "上床下桌"],
    _bg: "#E8E0D5", _emoji: "🏛",
    scores: { 综合: 4.6, 宿舍: 4.2, 食堂: 4.5, 教学: 4.8, 环境: 4.3, 社交: 3.9 },
    dormitory: {
      has_ac: true, ac_type: "中央空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网", curfew: "23:30", note: "部分老宿舍楼为6人间上下铺", confirmed_by: 128
    },
    profile: "🏆 顶尖985 · 学术氛围浓厚 · 食堂全国闻名 · 宿舍空调全覆盖",
    intro: "清华大学是中国最著名的高等学府之一，坐落于北京西北郊的清华园，始建于1911年。以工科见长，文理医管法多学科协调发展。",
    reviews: [
      { id: "r1", source: "用户原创", content: "清华的食堂真的是一绝，紫荆园和桃李园各有特色，价格也很良心。学术氛围没得说，图书馆永远一座难求。", rating: { 综合: 5, 宿舍: 4, 食堂: 5, 教学: 5, 环境: 4, 社交: 4 }, author: "清华学长", helpful: 42, created_at: "2026-06-15" },
      { id: "r2", source: "知乎", content: "在清华，你会发现周围全是各省的状元和竞赛金牌。压力是真的大，但成长也是真的快。宿舍条件中等偏上。", rating: { 综合: 5, 宿舍: 3, 食堂: 5, 教学: 5, 环境: 4, 社交: 3 }, author: "匿名用户", helpful: 28, created_at: "2025-03-10" },
      { id: "r3", source: "小红书", content: "清华的校园真的太美了！春天有樱花，秋天有银杏，荷塘月色不是传说。不过冬天骑车真的冷。", rating: { 综合: 4, 宿舍: 4, 食堂: 4, 教学: 5, 环境: 5, 社交: 4 }, author: "小红薯学姐", helpful: 15, created_at: "2026-04-22" }
    ]
  },
  {
    slug: "peking-university", name: "北京大学", type: "985", province: "北京", city: "北京",
    lat: 39.9869, lng: 116.3059,
    admit_line: 688,
    tags: ["空调宿舍", "地铁站", "985", "211", "双一流", "独立卫浴"],
    _bg: "#D5E0E0", _emoji: "🏫",
    scores: { 综合: 4.5, 宿舍: 4.0, 食堂: 4.3, 教学: 4.7, 环境: 4.5, 社交: 4.1 },
    dormitory: {
      has_ac: true, ac_type: "独立空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网", curfew: "无", note: "部分宿舍楼较老，新楼条件很好", confirmed_by: 98
    },
    profile: "🏆 顶尖985 · 人文底蕴深厚 · 未名湖畔读书 · 学术自由包容",
    intro: "北京大学是中国第一所国立综合性大学，成立于1898年。以文理医见长，未名湖与博雅塔是校园标志。",
    reviews: [{ id: "r4", source: "用户原创", content: "北大的美是那种骨子里的美。春天未名湖边读书，秋天银杏叶铺满小径。食堂不如清华多，但学一食堂的早餐很棒。", rating: { 综合: 5, 宿舍: 4, 食堂: 4, 教学: 5, 环境: 5, 社交: 4 }, author: "北大学姐", helpful: 35, created_at: "2026-05-20" }]
  },
  {
    slug: "zhejiang-university", name: "浙江大学", type: "985", province: "浙江", city: "杭州",
    lat: 30.2637, lng: 120.1236,
    admit_line: 672,
    tags: ["空调宿舍", "独卫", "985", "211", "双一流", "上床下桌", "杭州"],
    _bg: "#D5E5D5", _emoji: "🏯",
    scores: { 综合: 4.4, 宿舍: 4.4, 食堂: 4.3, 教学: 4.5, 环境: 4.6, 社交: 4.2 },
    dormitory: {
      has_ac: true, ac_type: "独立空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网+自办宽带", curfew: "无", note: "紫金港校区新宿舍条件很好", confirmed_by: 76
    },
    profile: "🏆 顶尖985 · 杭州人间天堂 · 7大校区各具特色 · 紫金港新宿舍一流",
    intro: "浙江大学坐落于杭州，前身求是书院创立于1897年。拥有紫金港、玉泉等7个校区，学科门类齐全。",
    reviews: [{ id: "r5", source: "用户原创", content: "在浙大最幸福的事就是在西湖边骑车。紫金港校区超大，有专门的校内公交。食堂选择很多。", rating: { 综合: 4, 宿舍: 5, 食堂: 4, 教学: 4, 环境: 5, 社交: 4 }, author: "ZJUer", helpful: 22, created_at: "2026-06-01" }]
  },
  {
    slug: "wuhan-university", name: "武汉大学", type: "985", province: "湖北", city: "武汉",
    lat: 30.5377, lng: 114.3596,
    admit_line: 638,
    tags: ["985", "211", "双一流", "最美校园", "樱花", "空调宿舍", "独卫"],
    _bg: "#E8D5DF", _emoji: "🌸",
    scores: { 综合: 4.3, 宿舍: 3.8, 食堂: 4.0, 教学: 4.4, 环境: 4.9, 社交: 4.3 },
    dormitory: {
      has_ac: true, ac_type: "独立空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网", curfew: "23:00", note: "部分老斋舍条件老旧但很有历史感", confirmed_by: 65
    },
    profile: "🏆 顶尖985 · 中国最美大学 · 樱花城堡闻名全国 · 珞珈山麓读书",
    intro: "武汉大学溯源于1893年，环绕东湖水，坐拥珞珈山，被誉为中国最美大学。",
    reviews: [{ id: "r6", source: "小红书", content: "武大真的美哭了！樱花季的时候整个校园都是粉色的。食堂中规中矩，但周边珞珈山路上好吃的特别多。", rating: { 综合: 4, 宿舍: 3, 食堂: 3, 教学: 4, 环境: 5, 社交: 5 }, author: "樱花少女", helpful: 19, created_at: "2026-03-25" }]
  },
  {
    slug: "shenzhen-university", name: "深圳大学", type: "普通本科", province: "广东", city: "深圳",
    lat: 22.5309, lng: 113.9386,
    admit_line: 575,
    tags: ["空调宿舍", "独卫", "上床下桌", "一线城市", "就业强", "网红食堂"],
    _bg: "#D5E0EB", _emoji: "🌆",
    scores: { 综合: 4.2, 宿舍: 4.5, 食堂: 4.4, 教学: 3.9, 环境: 4.3, 社交: 4.4 },
    dormitory: {
      has_ac: true, ac_type: "中央空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网+自办宽带", curfew: "无", note: "新宿舍楼条件一流，有电梯", confirmed_by: 54
    },
    profile: "🌆 一线城市 · 就业资源丰富 · 网红食堂 · 上床下桌4人间",
    intro: "深圳大学坐落在深圳南山中心区，与腾讯、大疆等科技巨头为邻，创新创业氛围浓厚。",
    reviews: [{ id: "r7", source: "用户原创", content: "深大最爽的是地理位置，就在南山科技园旁边，实习太方便了。宿舍条件在全国排前列，大部分都有独卫空调。", rating: { 综合: 4, 宿舍: 5, 食堂: 5, 教学: 3, 环境: 4, 社交: 5 }, author: "SZUer", helpful: 31, created_at: "2026-05-10" }]
  },
  {
    slug: "fudan-university", name: "复旦大学", type: "985", province: "上海", city: "上海",
    lat: 31.2989, lng: 121.4997,
    admit_line: 677,
    tags: ["985", "211", "双一流", "上海", "独立卫浴", "空调宿舍"],
    _bg: "#D5D8E8", _emoji: "📚",
    scores: { 综合: 4.5, 宿舍: 3.8, 食堂: 4.1, 教学: 4.7, 环境: 4.2, 社交: 4.0 },
    dormitory: {
      has_ac: true, ac_type: "独立空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: false,
      internet: "校园网", curfew: "24:00", note: "邯郸校区老宿舍条件一般，新校区不错", confirmed_by: 71
    },
    profile: "🏆 顶尖985 · 上海魔都 · 文理医管全面 · 日月光华",
    intro: "复旦大学创建于1905年，是中国最著名的高等学府之一。以文理医管见长，新闻、经济、医学等学科全国领先。",
    reviews: [{ id: "r8", source: "知乎", content: "复旦最吸引我的是自由的学术氛围和上海的区位优势。食堂说实话一般，但五角场就在旁边，吃饭选择太多了。", rating: { 综合: 4, 宿舍: 3, 食堂: 3, 教学: 5, 环境: 4, 社交: 4 }, author: "复旦学子", helpful: 24, created_at: "2025-11-08" }]
  },
  {
    slug: "sichuan-university", name: "四川大学", type: "985", province: "四川", city: "成都",
    lat: 30.6352, lng: 104.0825,
    admit_line: 632,
    tags: ["985", "211", "双一流", "成都", "美食之都", "空调宿舍"],
    _bg: "#E8DDD5", _emoji: "🐼",
    scores: { 综合: 4.1, 宿舍: 3.9, 食堂: 4.5, 教学: 4.3, 环境: 4.1, 社交: 4.5 },
    dormitory: {
      has_ac: true, ac_type: "独立空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网", curfew: "23:30", note: "江安校区新宿舍条件好，望江老校区条件参差不齐", confirmed_by: 58
    },
    profile: "🏆 顶尖985 · 美食之都成都 · 华西口腔亚洲第一 · 生活巴适",
    intro: "四川大学是西南地区历史最悠久、规模最大的综合性大学，口腔医学亚洲第一。",
    reviews: [{ id: "r9", source: "用户原创", content: "在川大读书最大的福利就是成都的美食！学校周边火锅串串随便吃。江安校区的宿舍很新，条件不错。", rating: { 综合: 4, 宿舍: 4, 食堂: 5, 教学: 4, 环境: 4, 社交: 5 }, author: "川大学长", helpful: 18, created_at: "2026-04-15" }]
  },
  {
    slug: "sun-yat-sen-university", name: "中山大学", type: "985", province: "广东", city: "广州",
    lat: 23.0985, lng: 113.2939,
    admit_line: 645,
    tags: ["985", "211", "双一流", "广州", "空调宿舍", "独立卫浴"],
    _bg: "#D5E0D8", _emoji: "🌴",
    scores: { 综合: 4.3, 宿舍: 4.1, 食堂: 4.2, 教学: 4.4, 环境: 4.4, 社交: 4.1 },
    dormitory: {
      has_ac: true, ac_type: "中央空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网", curfew: "无", note: "东校区（大学城）宿舍条件最好", confirmed_by: 62
    },
    profile: "🏆 顶尖985 · 华南第一学府 · 医学商学见长 · 广深珠三地校区",
    intro: "中山大学由孙中山先生于1924年创办，广州、珠海、深圳三地五校区，华南地区综合实力最强。",
    reviews: [{ id: "r10", source: "小红书", content: "中大南校区的红砖绿瓦太美了！东校区的食堂选择很多，大学城生活也很方便。广州冬天太舒服了。", rating: { 综合: 4, 宿舍: 4, 食堂: 4, 教学: 4, 环境: 5, 社交: 4 }, author: "中大学姐", helpful: 20, created_at: "2026-02-18" }]
  },
  {
    slug: "nanjing-university", name: "南京大学", type: "985", province: "江苏", city: "南京",
    lat: 32.1182, lng: 118.9567,
    admit_line: 666,
    tags: ["985", "211", "双一流", "南京", "空调宿舍", "独立卫浴", "上床下桌"],
    _bg: "#D8D5E8", _emoji: "🔭",
    scores: { 综合: 4.4, 宿舍: 4.2, 食堂: 4.0, 教学: 4.6, 环境: 4.3, 社交: 3.8 },
    dormitory: {
      has_ac: true, ac_type: "独立空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网", curfew: "23:30", note: "仙林校区新宿舍条件好，鼓楼老校区条件一般", confirmed_by: 55
    },
    profile: "🏆 顶尖985 · 六朝古都南京 · 天文地质全国第一 · 学术底蕴深厚",
    intro: "南京大学肇始于1902年，天文、地质、物理等学科全国顶尖，鼓楼、仙林两大校区。",
    reviews: [{ id: "r11", source: "知乎", content: "南大很低调但实力很强。仙林校区很新很大，宿舍条件不错都有独卫空调。学术氛围真的很纯粹。", rating: { 综合: 4, 宿舍: 4, 食堂: 3, 教学: 5, 环境: 4, 社交: 3 }, author: "NJUer", helpful: 26, created_at: "2026-01-30" }]
  },
  {
    slug: "xidian-university", name: "西安电子科技大学", type: "211", province: "陕西", city: "西安",
    lat: 34.1234, lng: 108.8369,
    admit_line: 610,
    tags: ["211", "双一流", "IT强校", "西安", "空调宿舍"],
    _bg: "#E8E0D0", _emoji: "📡",
    scores: { 综合: 3.9, 宿舍: 4.0, 食堂: 3.7, 教学: 4.2, 环境: 3.8, 社交: 3.6 },
    dormitory: {
      has_ac: true, ac_type: "独立空调", has_private_bath: true, bed_type: "上床下桌",
      room_size: 4, has_balcony: true, has_water_heater: true, has_washing_machine: true,
      internet: "校园网", curfew: "23:00", note: "长安校区新宿舍条件不错", confirmed_by: 41
    },
    profile: "📡 211强校 · IT行业敲门砖 · 华为人才基地 · 通信电子王牌",
    intro: "西安电子科技大学以电子信息、计算机、通信为特色，是两电一邮成员，华为重要人才基地。",
    reviews: [{ id: "r12", source: "用户原创", content: "西电虽然综合排名不算顶尖，但在IT行业的认可度很高。每年去华为、中兴、BAT的特别多。", rating: { 综合: 4, 宿舍: 4, 食堂: 3, 教学: 4, 环境: 3, 社交: 3 }, author: "西电学长", helpful: 16, created_at: "2026-05-28" }]
  }
]

// ============ 模拟数据：2025 参考录取线省份调整值 ============
// 正值 = 该省竞争激烈，录取线高于全国参考值；负值 = 低于。
// 仅用于演示分档逻辑，填报请以官方数据为准。
export const PROVINCE_OFFSETS = {
  河南: 10, 山东: 8, 河北: 8, 江西: 7, 安徽: 7,
  广东: 6, 四川: 6, 湖南: 6, 广西: 5, 云南: 5,
  贵州: 5, 山西: 5, 湖北: 3, 江苏: 3, 浙江: 3,
  福建: 3, 重庆: 2, 陕西: 2, 甘肃: 1, 海南: 0,
  辽宁: -2, 吉林: -2, 黑龙江: -2, 内蒙古: -2, 北京: -5,
  天津: -5, 新疆: -6, 上海: -8, 宁夏: -8, 青海: -10, 西藏: -10
}
