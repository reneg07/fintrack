import {
  Briefcase,
  Car,
  Film,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  ShoppingBag,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIconKey } from "@/types/domain";

export const CATEGORY_ICON_MAP: Record<
  CategoryIconKey,
  { icon: LucideIcon; label: string }
> = {
  briefcase: { icon: Briefcase, label: "Trabajo" },
  laptop: { icon: Laptop, label: "Freelance" },
  "trending-up": { icon: TrendingUp, label: "Inversiones" },
  wallet: { icon: Wallet, label: "Cartera" },
  utensils: { icon: Utensils, label: "Alimentación" },
  home: { icon: Home, label: "Vivienda" },
  car: { icon: Car, label: "Transporte" },
  zap: { icon: Zap, label: "Servicios" },
  "heart-pulse": { icon: HeartPulse, label: "Salud" },
  film: { icon: Film, label: "Entretenimiento" },
  "graduation-cap": { icon: GraduationCap, label: "Educación" },
  "shopping-bag": { icon: ShoppingBag, label: "Compras" },
  tag: { icon: Tag, label: "General" },
};

export const CATEGORY_COLOR_SWATCHES = [
  { hex: "#059669", label: "Esmeralda" },
  { hex: "#0D9488", label: "Verde azulado" },
  { hex: "#0284C7", label: "Azul océano" },
  { hex: "#4F46E5", label: "Índigo" },
  { hex: "#D97706", label: "Ámbar" },
  { hex: "#EA580C", label: "Naranja" },
  { hex: "#DC5656", label: "Coral" },
  { hex: "#DB2777", label: "Magenta" },
  { hex: "#475569", label: "Pizarra" },
] as const;
