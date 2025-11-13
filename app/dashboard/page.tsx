import Link from 'next/link';
import TopNav from '../../components/TopNav';

const pageStyle: React.CSSProperties = { padding: '16px 20px' };
const h1: React.CSSProperties = { fontSize: 32, fontWeight: 700, marginBottom: 16 };
const p: React.CSSProperties = { margin: '6px 0', fontSize: 16 };
const row: React.CSSProperties = { display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' };
const btn: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #111827',
  background: '#111827',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 600
};
const card: React.CSSProperties = {
  marginTop: 20,
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fafafa'
};

export default async function DashboardPage() {
  // Здесь оставляй существующую логику получения сотрудника/роли/стажа.
  // Разметку ниже можно безопасно врезать поверх текущего простого HTML.

  return (
    <>
      <TopNav />
      <main style={pageStyle}>
        <h1 style={h1}>Кабинет</h1>

        {/* Твой текущий блок данных о сотруднике */}
        <p style={p}><strong>Сотрудник:</strong> Синицина Анна Владимировна</p>
        <p style={p}><strong>Роль:</strong> Директор</p>
        <p style={p}><strong>Стаж:</strong> 9 лет 4 мес.</p>

        {/* Действия */}
        <div style={row}>
          <Link href="/rating" style={btn} aria-label="Перейти в рейтинг">
            Перейти в рейтинг
          </Link>
          <Link href="/motivation" style={{ ...btn, background: '#ffffff', color: '#111827' }}>
            Правила мотивации
          </Link>
        </div>

        {/* Краткая подсказка по мотивации */}
        <section style={card} aria-labelledby="motivation-brief">
          <h2 id="motivation-brief" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            Мотивация сети — кратко
          </h2>
          <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: '22px' }}>
            <li>Все начисления идут по «правилам мотивации» (код правила → сумма баллов).</li>
            <li>Подробная таблица и статусы активных правил — на странице «Мотивация».</li>
            <li>Историю собственных начислений смотри на странице «Рейтинг».</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            Нужна корректировка правил? Пиши администратору салона или директору филиала.
          </p>
        </section>
      </main>
    </>
  );
}


