import {
  Armchair,
  Gamepad2,
  Headphones,
  Keyboard,
  Mic,
  Monitor,
  Mouse,
  Square,
  Webcam,
  type LucideProps,
  Boxes,
} from "lucide-react";
import type { ComponentType } from "react";

const MAP: Record<string, ComponentType<LucideProps>> = {
  Keyboard,
  Mouse,
  Headphones,
  Monitor,
  Square,
  Gamepad2,
  Mic,
  Webcam,
  Armchair,
};

export function CategoryIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = MAP[name] ?? Boxes;
  return <Icon {...props} />;
}
