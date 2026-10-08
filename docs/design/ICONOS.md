# Iconos — Material Symbols → Lucide

La app usa [`lucide-react`](https://lucide.dev/icons/). Las exportaciones de Stitch (`design/stitch/*`) usan Material Symbols; al pasar una pantalla a React, cambia cada icono por su equivalente de esta tabla.

```jsx
// Stitch
<span className="material-symbols-outlined">calendar_today</span>

// React
import { Calendar } from 'lucide-react'
<Calendar size={18} strokeWidth={1.75} />
```

Tamaño estándar: `size={18}` (navegación, botones, tablas). Usa `size={16}` dentro de insignias y textos pequeños, y `size={24}` en estados vacíos. El color se hereda del texto (`currentColor`), así que se controla con las clases `text-*` de Tailwind.

Tabla ordenada de más a menos usado en las pantallas exportadas:

| Material Symbols | Lucide |
|---|---|
| more_vert | EllipsisVertical |
| check | Check |
| check_circle | CircleCheck |
| content_cut | Scissors |
| chevron_right | ChevronRight |
| person | User |
| schedule | Clock |
| star | Star |
| add | Plus |
| event_available | CalendarCheck |
| search | Search |
| close | X |
| calendar_today | Calendar |
| expand_more | ChevronDown |
| badge | IdCard |
| arrow_forward | ArrowRight |
| group | Users |
| call | Phone |
| payments | Banknote |
| notifications | Bell |
| logout | LogOut |
| unfold_more | ChevronsUpDown |
| timer | Timer |
| location_on | MapPin |
| edit | Pencil |
| content_copy | Copy |
| chat | MessageCircle |
| drag_handle | GripHorizontal |
| calendar_clock | CalendarClock |
| verified | BadgeCheck |
| trending_up | TrendingUp |
| settings | Settings |
| event_note | CalendarDays |
| dashboard | LayoutDashboard |
| chevron_left | ChevronLeft |
| category | Shapes |
| bar_chart | ChartColumn |
| verified_user | ShieldCheck |
| picture_as_pdf | FileText |
| lock | Lock |
| event_repeat | CalendarSync |
| calendar_month | CalendarDays |
| storefront | Store |
| language | Globe |
| event_busy | CalendarX |
| event | Calendar |
| code | Code |
| visibility | Eye |
| tune | SlidersHorizontal |
| support_agent | Headset |
| store | Store |
| receipt_long | Receipt |
| point_of_sale | CreditCard |
| pending | CircleEllipsis |
| open_in_new | ExternalLink |
| login | LogIn |
| edit_note | NotebookPen |
| download | Download |
| delete | Trash2 |
| credit_card | CreditCard |
| brush | Brush |
| arrow_upward | ArrowUp |
| arrow_back | ArrowLeft |
| wb_sunny | Sun |
| warning | TriangleAlert |
| task_alt | CircleCheckBig |
| spa | Flower2 |
| progress_activity | LoaderCircle |
| mail | Mail |
| lock_clock | LockKeyhole |
| info | Info |
| file_download | Download |
| cancel | CircleX |
| calendar_add_on | CalendarPlus |
| workspace_premium | Award |
| wb_twilight | Sunset |
| trending_down | TrendingDown |
| timelapse | Hourglass |
| table_view | Table |
| sync_alt | ArrowLeftRight |
| swap_vert | ArrowUpDown |
| swap_horiz | ArrowLeftRight |
| sticky_note_2 | StickyNote |
| shield | Shield |
| school | GraduationCap |
| savings | PiggyBank |
| save | Save |
| redeem | Gift |
| query_stats | ChartLine |
| published_with_changes | RefreshCcw |
| public | Globe |
| play_circle | CirclePlay |
| pin_drop | MapPinned |
| photo_camera | Camera |
| person_pin | UserRound |
| person_off | UserX |
| person_add | UserPlus |
| palette | Palette |
| notifications_none | Bell |
| notifications_active | BellRing |
| notes | NotebookText |
| note_alt | NotepadText |
| nest_clock_farsight_analog | Clock |
| mark_email_read | MailCheck |
| mark_chat_read | MessageCircleMore |
| map | Map |
| lock_reset | RotateCcwKey |
| local_parking | SquareParking |
| local_offer | Tag |
| local_fire_department | Flame |
| light_mode | Sun |
| last_page | ChevronsRight |
| key | Key |
| history_edu | ScrollText |
| history | History |
| help_outline | CircleHelp |
| gesture | Signature |
| flare | Sparkles |
| first_page | ChevronsLeft |
| filter_list | ListFilter |
| filter_alt_off | FunnelX |
| file_upload | Upload |
| face_retouching_natural | Smile |
| face | Smile |
| error | CircleAlert |
| edit_calendar | CalendarCog |
| dry | Wind |
| drag_indicator | GripVertical |
| done | Check |
| delete_forever | Trash2 |
| cloud_upload | CloudUpload |
| cloud_off | CloudOff |
| chair | Armchair |
| celebration | PartyPopper |
| calendar_view_day | CalendarRange |
| cake | Cake |
| bolt | Zap |
| block | Ban |
| bedtime | Moon |
| arrow_drop_down | ChevronDown |
| arrow_downward | ArrowDown |
