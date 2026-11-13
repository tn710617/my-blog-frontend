import {getContacts} from '../aboutData'

// 頂部 Email 是需求方 2026-11-13 指定公開的信箱(票 10 拷問)。改回 null 頁上的 Email 連結就會消失,這條會紅。
test('頂部聯絡方式的 Email 是需求方指定的信箱', () => {
    expect(getContacts().email).toBe('tn710617@gmail.com')
})
