// Import all message files
import enMessages from "./en.json"
import arMessages from "./ar.json"
import { Locale } from "../config"

const messages: Record<Locale, Record<string, any>> = {
  en: enMessages,
  ar: arMessages,
}

export default messages
