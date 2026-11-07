Edge-функции NEXUS живут в Supabase (Dashboard → Edge Functions):
- `steam` — данные игры по ссылке Steam.
- `kino` — данные фильма по ссылке Кинопоиска. Для стабильной работы нужен секрет `KP_API_KEY`
  (бесплатный ключ с kinopoiskapiunofficial.tech). Без ключа функция пробует саму страницу Кинопоиска.
