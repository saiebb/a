import { Locale } from "../config"

const dashboardTranslations: Record<Locale, Record<string, string>> = {
  en: {
    "dashboard.welcome": "Welcome back, {name}",
    "dashboard.newVacation": "New Vacation",
    "dashboard.upcoming": "Upcoming",
    "dashboard.pending": "Pending",
    "dashboard.past": "Past",
    "dashboard.noVacations": "No vacations found",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.quickActionsDescription": "Common tasks you might want to do",
    "dashboard.requestVacation": "Request new vacation",
    "dashboard.viewCalendar": "View calendar"
  },
  ar: {
    "dashboard.welcome": "مرحباً بعودتك، {name}",
    "dashboard.newVacation": "إجازة جديدة",
    "dashboard.upcoming": "القادمة",
    "dashboard.pending": "قيد الانتظار",
    "dashboard.past": "السابقة",
    "dashboard.noVacations": "لم يتم العثور على إجازات",
    "dashboard.quickActions": "إجراءات سريعة",
    "dashboard.quickActionsDescription": "المهام الشائعة التي قد ترغب في القيام بها",
    "dashboard.requestVacation": "طلب إجازة جديدة",
    "dashboard.viewCalendar": "عرض التقويم"
  }
}

export default dashboardTranslations
