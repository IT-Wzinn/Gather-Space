// characters.js - Cấu hình danh sách nhân vật cho Quán Cafe Văn Phòng
const CHARACTERS = [
  {
    id: 'char_1',
    name: 'Nam Lập trình viên (IT Dev)',
    role: 'Engineering & Tech',
    outfit: 'Áo hoodie xám kéo khóa, áo thun đen in logo code, quần jeans xanh sẫm, giày sneaker trắng, tai nghe chụp tai quanh cổ.',
    sprite: 'assets/characters/char_1_dev.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#3b82f6',
    avatarIcon: '💻'
  },
  {
    id: 'char_2',
    name: 'Nữ Quản lý dự án (PM)',
    role: 'Product & Marketing',
    outfit: 'Áo blazer be thanh lịch, sơ mi lụa trắng, quần âu đứng dáng, giày loafer, thẻ nhân viên dây xanh.',
    sprite: 'assets/characters/char_2_pm.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#ec4899',
    avatarIcon: '📊'
  },
  {
    id: 'char_3',
    name: 'Nam Founder / Team Lead',
    role: 'Leadership & Strategy',
    outfit: 'Áo polo xanh navy có cổ, quần chinos xám, giày da nâu lịch sự, đồng hồ thông minh.',
    sprite: 'assets/characters/char_3_lead.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#8b5cf6',
    avatarIcon: '👔'
  },
  {
    id: 'char_4',
    name: 'Nữ UI/UX Designer',
    role: 'Design & Creative',
    outfit: 'Áo gile len dệt kim xanh bơ, sơ mi trắng, kính cận gọng tròn, chân váy midi, túi tote canvas.',
    sprite: 'assets/characters/char_4_designer.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#10b981',
    avatarIcon: '🎨'
  },
  {
    id: 'char_5',
    name: 'Nam Barista Quán Cafe',
    role: 'Cafe & Beverage',
    outfit: 'Tạp dề denim nâu có túi da, áo thun đen tay lỡ xắn cao, khăn vắt thắt lưng, ghim cài barista.',
    sprite: 'assets/characters/char_5_barista_m.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#d97706',
    avatarIcon: '☕'
  },
  {
    id: 'char_6',
    name: 'Nữ Thu ngân / Phục vụ Cafe',
    role: 'Cafe & Hospitality',
    outfit: 'Tạp dề màu be, áo sơ mi kẻ sọc ngắn tay, tóc búi cao gọn gàng, kẹp order nhỏ.',
    sprite: 'assets/characters/char_6_barista_f.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#f59e0b',
    avatarIcon: '🥐'
  },
  {
    id: 'char_7',
    name: 'Nữ Chuyên viên HR',
    role: 'Human Resources & People',
    outfit: 'Váy liền công sở màu xanh mint thanh lịch, thắt lưng mảnh, giày búp bê, cặp hồ sơ mỏng.',
    sprite: 'assets/characters/char_7_hr.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#06b6d4',
    avatarIcon: '📋'
  },
  {
    id: 'char_8',
    name: 'Nam Nhân viên Sales',
    role: 'Business & Sales',
    outfit: 'Áo sơ mi xanh nhạt sơ vin quần tây đen, cà vạt nới lỏng trẻ trung, cặp xách da công sở.',
    sprite: 'assets/characters/char_8_sales.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#2563eb',
    avatarIcon: '💼'
  },
  {
    id: 'char_9',
    name: 'Nam Freelancer / Creator',
    role: 'Content & Freelance',
    outfit: 'Áo sơ mi flannel caro khoác ngoài áo thun trắng, mũ len beanie, quần kaki, ôm laptop nhỏ.',
    sprite: 'assets/characters/char_9_creator.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#ef4444',
    avatarIcon: '🎧'
  },
  {
    id: 'char_10',
    name: 'Nữ Thực tập sinh (Intern)',
    role: 'Student & Intern',
    outfit: 'Áo sweater oversize màu vàng bơ, quần jeans xanh nhạt, balo mini nhỏ nhắn sau lưng.',
    sprite: 'assets/characters/char_10_intern.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#eab308',
    avatarIcon: '🎒'
  },
  {
    id: 'char_default',
    name: 'Hiệp sĩ Phiêu lưu (Mặc định)',
    role: 'Classic RPG Hero',
    outfit: 'Giáp đỏ viền vàng, tóc xanh phong cách anime JRPG cổ điển.',
    sprite: 'assets/player_spritesheet.png',
    fallbackSprite: 'assets/player_spritesheet.png',
    themeColor: '#dc2626',
    avatarIcon: '⚔️'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CHARACTERS };
}
